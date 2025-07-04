import { useState } from "react";

export function useAuth() {
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);

  const handleAuthSuccess = (userData: { email: string; name: string }) => {
    setUser(userData);
    // TODO: In the future, sync todos from server when user signs in
  };

  const handleSignOut = () => {
    setUser(null);
    // TODO: In the future, clear synced data and keep only local data
  };

  return {
    user,
    handleAuthSuccess,
    handleSignOut
  };
}