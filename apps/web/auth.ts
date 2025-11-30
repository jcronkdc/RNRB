// Re-export the full-featured auth configuration from @cronkwaters/auth package
// This includes Google OAuth, Email Magic Links, and Apple Sign In
export { auth, handlers, signIn, signOut } from '@cronkwaters/auth';

// Compatibility export for NextAuth v4 style authOptions
// Some legacy code might still reference this
export const authOptions = {
  // This is a compatibility shim - prefer using the auth() function directly
};
