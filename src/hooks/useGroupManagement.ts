
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { Group, User } from '@/types';

export const useGroupManagement = (currentUser: User | null, fetchGroups: () => Promise<void>) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  
  const createGroup = async (name: string, icon: string, description: string = "") => {
    if (!currentUser) return null;
    
    try {
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      // Make sure icon is not null or undefined before proceeding
      const finalIcon = icon || `https://source.unsplash.com/random/100x100/?${encodeURIComponent(name.toLowerCase())}`;
      
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name,
          icon: finalIcon,
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
        members: [currentUser],
        createdAt: groupData.created_at
      };
    } catch (error) {
      console.error("Error creating group:", error);
      return null;
    }
  };
  
  const joinGroup = async (inviteCode: string) => {
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
    joinGroup,
    isCreating,
    isJoining,
    setIsCreating,
    setIsJoining
  };
};
