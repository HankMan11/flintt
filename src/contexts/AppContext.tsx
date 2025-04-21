import React from "react";
import { AuthProvider } from "./AuthContext";
import { GroupsProvider } from "./GroupsContext";
import { PostsProvider } from "./PostsContext";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    <GroupsProvider>
      <PostsProvider>
        {children}
      </PostsProvider>
    </GroupsProvider>
  </AuthProvider>
);
