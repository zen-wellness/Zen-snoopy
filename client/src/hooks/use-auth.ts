import { auth } from "@/lib/firebase";
import { 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  type User as FirebaseUser 
} from "firebase/auth";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check for redirect result on mount
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        setUser(result.user);
      }
    }).catch((error) => {
      console.error("Redirect result error:", error);
    });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
      // Invalidate queries when auth state changes
      if (user) {
         queryClient.invalidateQueries();
      }
    });
    return () => unsubscribe();
  }, [queryClient]);

  const loginMutation = useMutation({
    mutationFn: async () => {
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ 
          prompt: 'select_account'
        });
        
        // Force redirect to avoid popup blockers and "stuck" states in iframes
        await signInWithRedirect(auth, provider);
      } catch (error: any) {
        console.error("Firebase Sign-in error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Welcome back!",
        description: "Successfully signed in.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred during login.",
        variant: "destructive",
      });
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await signOut(auth);
    },
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
      toast({
        title: "Signed out",
        description: "See you next time!",
      });
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
