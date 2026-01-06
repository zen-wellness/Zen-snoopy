import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
      if (firebaseUser) {
        queryClient.invalidateQueries();
      }
    });
    return () => unsubscribe();
  }, [queryClient]);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password, rememberMe }: any) => {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      return signInWithEmailAndPassword(auth, email, password);
    },
    onSuccess: () => {
      toast({
        title: "Welcome back!",
        description: "Successfully signed in.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const registerMutation = useMutation({
    mutationFn: async ({ email, password }: any) => {
      return createUserWithEmailAndPassword(auth, email, password);
    },
    onSuccess: () => {
      toast({
        title: "Welcome!",
        description: "Your account has been created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return signOut(auth);
    },
    onSuccess: () => {
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      queryClient.clear();
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
