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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user?.uid);
      setUser(user);
      setIsLoading(false);
      if (user) {
         queryClient.invalidateQueries();
      }
    }, (error) => {
      console.error("Auth state error:", error);
      setIsLoading(false);
    });

    // Check for redirect result on mount
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        console.log("Redirect success:", result.user.uid);
        setUser(result.user);
        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });
      }
    }).catch((error) => {
      console.error("Redirect error:", error);
      // Only show error if it's not a common expected one
      if (error.code !== 'auth/internal-error') {
        toast({
          title: "Login Error",
          description: error.message,
          variant: "destructive",
        });
      }
    });

    return () => unsubscribe();
  }, [queryClient, toast]);

  const loginMutation = useMutation({
    mutationFn: async () => {
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ 
          prompt: 'select_account'
        });
        
        // Use popup by default, with redirect fallback
        try {
          await signInWithPopup(auth, provider);
        } catch (popupError: any) {
          if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/cancelled-popup-request') {
            await signInWithRedirect(auth, provider);
          } else {
            throw popupError;
          }
        }
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
