'use server';

import { signIn } from '@cronkwaters/auth';
import { AuthError } from 'next-auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

export async function signInWithCredentials(formData: { email: string; password: string }) {
  try {
    // NextAuth v5: signIn with credentials must redirect
    // The redirect: false option doesn't work with credentials in v5
    await signIn('credentials', {
      email: formData.email,
      password: formData.password,
      redirectTo: '/dashboard',
    });

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
