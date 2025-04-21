
import React, { createContext, useContext, useState, useEffect } from "react";
import { Group } from "@/types";
import { mockUsers } from "@/data/mockData";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GroupsContextType {
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  activeGroup: Group | null;
  setActiveGroup: (group: Group | null) => void;
  loadingGroups: boolean;
  setLoadingGroups: React.Dispatch<React.SetStateAction<boolean>>;
  fetchGroups: () => Promise<void>;
}

const GroupsContext = createContext<GroupsContextType | undefined>(undefined);

export const GroupsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [loadingGroups, setLoadingGroups] = useState<boolean>(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const fetchGroups = async () => {
    if (!currentUser) {
      setGroups([]);
      setLoadingGroups(false);
      return;
    }

    setLoadingGroups(true);
    
    try {
      // 1. First get all the groups this user is a member of
      const { data: membershipData, error: membershipError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', currentUser.id);

      if (membershipError) {
        console.error('Error fetching group memberships:', membershipError);
        toast({
          title: "Error",
          description: "Could not load your groups",
          variant: "destructive",
        });
        setLoadingGroups(false);
        return;
      }

      if (!membershipData || membershipData.length === 0) {
        console.log('User has no group memberships');
        setGroups([]);
        setLoadingGroups(false);
        return;
      }

      const groupIds = membershipData.map(m => m.group_id);
      
      // 2. Then get the details of those groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .in('id', groupIds);

      if (groupsError) {
        console.error('Error fetching groups:', groupsError);
        toast({
          title: "Error",
          description: "Could not load your groups",
          variant: "destructive",
        });
        setLoadingGroups(false);
        return;
      }

      if (!groupsData || groupsData.length === 0) {
        console.log('No groups found');
        setGroups([]);
        setLoadingGroups(false);
        return;
      }

      // 3. Get all users for each group
      const fetchedGroups: Group[] = [];
      
      for (const group of groupsData) {
        const { data: membersData, error: membersError } = await supabase
          .from('group_members')
          .select('user_id')
          .eq('group_id', group.id);

        if (membersError) {
          console.error(`Error fetching members for group ${group.id}:`, membersError);
          continue;
        }

        const memberIds = membersData.map(m => m.user_id);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', memberIds);

        if (profilesError) {
          console.error(`Error fetching profiles for group ${group.id}:`, profilesError);
          continue;
        }

        // Convert profiles to the format expected by the application
        const members = profilesData.map(profile => ({
          id: profile.id,
          name: profile.username || 'Anonymous User',
          username: profile.username || 'anonymous',
          avatar: profile.avatar_url || 'https://via.placeholder.com/150',
        }));

        fetchedGroups.push({
          id: group.id,
          name: group.name,
          description: group.description,
          icon: group.icon,
          inviteCode: group.invite_code,
          members: members,
        });
      }

      console.log('Fetched groups:', fetchedGroups);
      setGroups(fetchedGroups);
    } catch (error) {
      console.error('Unexpected error fetching groups:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading your groups",
        variant: "destructive",
      });
    } finally {
      setLoadingGroups(false);
    }
  };

  // Fetch groups when the component mounts and when currentUser changes
  useEffect(() => {
    fetchGroups();
  }, [currentUser?.id]);

  return (
    <GroupsContext.Provider value={{
      groups, setGroups, activeGroup, setActiveGroup, loadingGroups, setLoadingGroups, fetchGroups
    }}>
      {children}
    </GroupsContext.Provider>
  );
};

export const useGroups = (): GroupsContextType => {
  const ctx = useContext(GroupsContext);
  if (!ctx) throw new Error("useGroups must be used within a GroupsProvider");
  return ctx;
};
