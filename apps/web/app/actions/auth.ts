'use server';

import { prisma } from '@cronkwaters/db';
import { signIn } from '@cronkwaters/auth';
import { AuthError } from 'next-auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

export async function signInWithCredentials(formData: {
  email: string;
  password: string;
  isNewUser?: boolean;
  redirectTo?: string;
}) {
  console.log('[AUTH ACTION] signInWithCredentials called');
  console.log('[AUTH ACTION] formData:', {
    email: formData.email,
    emailLength: formData.email?.length,
    hasPassword: !!formData.password,
    passwordLength: formData.password?.length,
    isNewUser: formData.isNewUser,
    redirectTo: formData.redirectTo,
  });

  try {
    // Check if user needs profile setup
    // Note: redirectTo is already URL-decoded if it came from Next.js searchParams
    let redirectTo = formData.redirectTo || '/dashboard';

    // If this is a new user signup, check profile completion status
    // (profile setup takes precedence over custom redirect, but we preserve the original destination)
    if (formData.isNewUser) {
      const user = await prisma.user.findUnique({
        where: { email: formData.email },
        select: { profileCompleted: true },
      });

      // Redirect to profile setup if profile not completed
      // Pass the original redirectTo as a query param so we can redirect there after setup
      if (user && !user.profileCompleted) {
        // Only pass redirectTo param if it's not the default dashboard
        if (redirectTo !== '/dashboard') {
          redirectTo = `/settings/profile?setup=true&redirect=${encodeURIComponent(redirectTo)}`;
        } else {
          redirectTo = '/settings/profile?setup=true';
        }
      }
    }

    // Security: Validate redirect URL to prevent open redirect attacks
    // Only allow relative paths starting with /
    if (redirectTo && (!redirectTo.startsWith('/') || redirectTo.startsWith('//'))) {
      redirectTo = '/dashboard';
    }

    // NextAuth v5: signIn with credentials must redirect
    // The redirect: false option doesn't work with credentials in v5
    console.log('[AUTH ACTION] Calling signIn with:', {
      email: formData.email,
      hasPassword: !!formData.password,
      redirectTo,
    });

    await signIn('credentials', {
      email: formData.email,
      password: formData.password,
      redirectTo,
    });

    console.log('[AUTH ACTION] signIn completed without throwing');

    // If we get here, sign-in was successful (redirect will happen automatically)
    return { success: true };
  } catch (error: unknown) {
    // NextAuth v5 throws redirect error on successful auth
    // Use Next.js's official redirect error check
    if (isRedirectError(error)) {
      // This is actually a successful redirect, rethrow it
      throw error;
    }

    if (error instanceof AuthError) {
      console.error('[AUTH ACTION] AuthError caught:', {
        type: error.type,
        message: error.message,
        cause: error.cause,
        stack: error.stack?.substring(0, 500),
      });
      switch (error.type) {
        case 'CredentialsSignin':
          return { success: false, error: 'Invalid email or password' };
        case 'CallbackRouteError':
          return { success: false, error: 'Invalid email or password' };
        default:
          console.error('[AUTH] AuthError:', error.type, error.message);
          return { success: false, error: 'Something went wrong' };
      }
    }

    console.error('[AUTH] Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function signInWithGoogle() {
  try {
    // Note: We'll handle new Google users via middleware check
    await signIn('google', { redirectTo: '/dashboard' });

    // If we get here, sign-in was successful (redirect will happen automatically)
    return { success: true };
  } catch (error: unknown) {
    // Use Next.js's official redirect error check
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof AuthError) {
      return { success: false, error: 'Google sign-in failed' };
    }

    console.error('[AUTH] Unexpected error during Google sign-in:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
