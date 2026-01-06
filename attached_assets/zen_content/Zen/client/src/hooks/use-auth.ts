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
import { useMutation } from "@tanstack/react-query";

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for redirect result on mount in case the popup fell back to redirect
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        console.log("Redirect sign-in result found:", result.user.uid);
        setUser(result.user);
      }
    }).catch((error) => {
      console.error("Redirect result error:", error);
      // Suppress alert for common redirect initialization noise
    });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user?.uid);
      setUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginMutation = useMutation({
    mutationFn: async () => {
      try {
        console.log("Initiating Google Sign-In with Redirect...");
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ 
          prompt: 'select_account'
        });
        
        console.log("Current Hostname:", window.location.hostname);
        
        // Use redirect directly because popup is being blocked
        await signInWithRedirect(auth, provider);
        return null as any;
      } catch (error: any) {
        console.error("Firebase Sign-in error:", error);
        
        // Silent logging, don't alert the user as it might be a transient state during redirect
        if (error.code === 'auth/unauthorized-domain') {
          console.error("Firebase Unauthorized Domain error. Check Firebase Console Settings.");
        }
        throw error;
      }
    },
    onSuccess: (user) => {
      if (user) setUser(user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await signOut(auth);
    },
    onSuccess: () => {
      setUser(null);
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
