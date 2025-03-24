import { createContext, useState, useContext, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "../supabase/client";

export interface UserContextType {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  signOut: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}
