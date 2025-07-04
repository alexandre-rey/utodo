import { useAuth as useAuthContext } from "@/contexts/AuthContext";

export function useAuth() {
  const { user, logout } = useAuthContext();

  const handleAuthSuccess = () => {
    // Authentication is handled by the AuthContext now
    // This function kept for compatibility with existing components
  };

  const handleSignOut = async () => {
    await logout();
  };

  // Transform user data to match existing interface
  const transformedUser = user ? {
    email: user.email,
    name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email.split('@')[0]
  } : null;

  return {
    user: transformedUser,
    handleAuthSuccess,
    handleSignOut
  };
}