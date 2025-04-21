
import React, { createContext, useContext, useState } from "react";
import { Group } from "@/types";
import { mockUsers } from "@/data/mockData";
import { useAuth } from "./AuthContext";

interface GroupsContextType {
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  activeGroup: Group | null;
  setActiveGroup: (group: Group | null) => void;
  loadingGroups: boolean;
  setLoadingGroups: React.Dispatch<React.SetStateAction<boolean>>;
}

const GroupsContext = createContext<GroupsContextType | undefined>(undefined);

export const GroupsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [loadingGroups, setLoadingGroups] = useState<boolean>(true);

  return (
    <GroupsContext.Provider value={{
      groups, setGroups, activeGroup, setActiveGroup, loadingGroups, setLoadingGroups
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
