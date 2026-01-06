import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const [user, setUser] = useState<any>({
    uid: "test-user-id",
    email: "test@example.com",
    displayName: "Test User",
    photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=test",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Mock user is always logged in
    queryClient.invalidateQueries();
  }, [queryClient]);

  const loginMutation = useMutation({
    mutationFn: async () => {
      // Mock login always succeeds
      return;
    },
    onSuccess: () => {
      toast({
        title: "Welcome back!",
        description: "Successfully signed in (Mock Auth).",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Mock logout (just for UI)
      return;
    },
    onSuccess: () => {
      toast({
        title: "Signed out",
        description: "Mock sign out successful.",
      });
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: true,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
