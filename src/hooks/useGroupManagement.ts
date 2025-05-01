
import { useState } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for group creation and joining functionality
 */
export const useGroupManagement = (fetchGroups: () => Promise<void>) => {
  const createGroup = async (
    currentUser: User | null, 
    name: string, 
    icon: string | null, 
    description: string = "",
    uploadGroupImage: (file: File) => Promise<string | null>
  ) => {
    if (!currentUser) return null;
    
    try {
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      // Upload image if provided
      let imageUrl = icon;
      if (icon && typeof icon === 'string' && icon.startsWith('data:')) {
        // Handle base64 image
        console.log("Processing base64 image");
        // Implementation for base64 upload would go here
      } else if (icon && typeof File !== 'undefined' && icon instanceof File) {
        // Type check for File instance
        imageUrl = await uploadGroupImage(icon);
      }

      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name,
          icon: imageUrl || 'https://via.placeholder.com/150',
          description,
          invite_code: inviteCode
        })
        .select()
        .single();
      
      if (groupError) {
        console.error("Error creating group:", groupError);
        return null;
      }
      
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupData.id,
          user_id: currentUser.id
        });
      
      if (memberError) {
        console.error("Error adding user to group:", memberError);
        return null;
      }
      
      await fetchGroups();
      
      return {
        id: groupData.id,
        name: groupData.name,
        description: groupData.description,
        icon: groupData.icon,
        inviteCode: groupData.invite_code,
        members: [{
          id: `${groupData.id}-${currentUser.id}`,
          userId: currentUser.id,
          groupId: groupData.id,
          role: 'admin',
          user: currentUser
        }],
        createdAt: groupData.created_at
      };
    } catch (error) {
      console.error("Error creating group:", error);
      return null;
    }
  };
  
  const joinGroup = async (currentUser: User | null, inviteCode: string) => {
    if (!currentUser) return false;
    
    try {
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();
      
      if (groupError || !groupData) {
        console.error("Error finding group:", groupError);
        return false;
      }
      
      const { data: memberData, error: memberCheckError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupData.id)
        .eq('user_id', currentUser.id);
      
      if (memberCheckError) {
        console.error("Error checking membership:", memberCheckError);
        return false;
      }
      
      if (memberData && memberData.length > 0) {
        return true;
      }
      
      const { error: joinError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupData.id,
          user_id: currentUser.id
        });
      
      if (joinError) {
        console.error("Error joining group:", joinError);
        return false;
      }
      
      await fetchGroups();
      
      return true;
    } catch (error) {
      console.error("Error joining group:", error);
      return false;
    }
  };

  return {
    createGroup,
    joinGroup
  };
};
