export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

// Redirect to login with a toast notification
export function redirectToLogin(toast?: (options: { title: string; description: string; variant: string }) => void) {
  if (toast) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
  }
  // In Firebase auth, we typically show the landing page rather than redirecting to a specific /api/login route
  // But we can redirect to root which should handle the auth check
  setTimeout(() => {
    window.location.href = "/";
  }, 500);
}
