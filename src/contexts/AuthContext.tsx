
import React, { createContext, useContext, useState, useEffect } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { User } from "@/types";

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { user: authUser, signOut: supabaseSignOut } = useSupabaseAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (authUser) {
      const username = authUser.user_metadata?.username || authUser.email?.split("@")[0] || "User";
      const avatar_url = authUser.user_metadata?.avatar_url || "https://source.unsplash.com/random/100x100/?avatar";
      setCurrentUser({
        id: authUser.id,
        name: username,
        username,
        avatar: avatar_url,
      });
    } else {
      setCurrentUser(null);
    }
  }, [authUser]);

  const login = async (_username: string, _password: string): Promise<boolean> => true;

  const logout = async () => {
    await supabaseSignOut();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
