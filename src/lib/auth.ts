import { supabase } from './supabase';
import { User } from '@/lib/types';

const HELLO_WORLD_CODE = `;; A simple Hello World smart contract for Stacks
;; Learn more at https://docs.stacks.co/clarity

;; Define a data variable for the greeting
(define-data-var greeting (string-utf8 100) u"Hello")

;; Public read-only function to get the current greeting
(define-read-only (get-greeting)
  (ok (var-get greeting))
)

;; Public function to set a new greeting
(define-public (set-greeting (new-greeting (string-utf8 100)))
  (begin
    (var-set greeting new-greeting)
    (ok true)
  )
)`;

const COUNTER_CODE = `;; A basic counter smart contract for Stacks
;; Demonstrates state management with Clarity

;; Define a data variable for the counter
(define-data-var counter int 0)

;; Read-only function: Returns the counter value
(define-read-only (get-counter)
  (ok (var-get counter))
)

;; Public function: Increment the counter
(define-public (increment)
  (begin
    (var-set counter (+ (var-get counter) 1))
    (ok (var-get counter))
  )
)

;; Public function: Decrement the counter
(define-public (decrement)
  (begin
    (var-set counter (- (var-get counter) 1))
    (ok (var-get counter))
  )
)

;; Public function: Reset the counter to zero
(define-public (reset)
  (begin
    (var-set counter 0)
    (ok true)
  )
)`;

export async function createInitialProjects(userId: string) {
  try {
    console.log('Creating initial projects for user:', userId);

    // Check if user already has projects to avoid duplicates
    const { data: existingProjects, error: checkError } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (checkError) {
      console.error('Error checking existing projects:', checkError);
      // Continue anyway - better to try creating than fail completely
    }

    if (existingProjects && existingProjects.length > 0) {
      console.log('User already has projects, skipping initial project creation');
      return;
    }

    // Create both projects in a single batch operation
    const { error } = await supabase
      .from('projects')
      .insert([
        {
          user_id: userId,
          name: 'Hello World',
          description: 'A simple Hello World smart contract to get started with Clarity on Stacks',
          code: HELLO_WORLD_CODE,
        },
        {
          user_id: userId,
          name: 'Counter',
          description: 'A basic counter smart contract demonstrating Clarity state management',
          code: COUNTER_CODE,
        }
      ]);

    if (error) throw error;

    console.log('Initial projects created successfully for user:', userId);
  } catch (error) {
    console.error('Error creating initial projects:', error);
    throw error;
  }
}


export async function signInWithMagicLink(email: string) {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/projects`,
      },
    });

    if (error) throw error;

    return {
      data,
      error: null,
      status: 'magic_link_sent'
    };
  } catch (error) {
    console.error('Magic link error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to send magic link'),
      status: 'error'
    };
  }
}

export async function signInWithGitHub() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/projects`,
      },
    });

    if (error) throw error;

    return {
      data,
      error: null,
      status: 'oauth_redirect'
    };
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to sign in with GitHub'),
      status: 'error'
    };
  }
}

export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/projects`,
      },
    });

    if (error) throw error;

    return {
      data,
      error: null,
      status: 'oauth_redirect'
    };
  } catch (error) {
    console.error('Google OAuth error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to sign in with Google'),
      status: 'error'
    };
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Identity Linking Functions
export async function linkGitHubIdentity() {
  const { data, error } = await supabase.auth.linkIdentity({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/projects`,
    },
  });
  if (error) throw error;
  return data;
}

export async function linkGoogleIdentity() {
  const { data, error } = await supabase.auth.linkIdentity({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/projects`,
    },
  });
  if (error) throw error;
  return data;
}

export async function getUserIdentities() {
  const { data, error } = await supabase.auth.getUserIdentities();
  if (error) throw error;
  return data?.identities || [];
}

export async function unlinkIdentity(identityId: string) {
  const { data: { identities } } = await supabase.auth.getUserIdentities();
  const identity = identities?.find(i => i.id === identityId);
  if (!identity) throw new Error('Identity not found');

  const { error } = await supabase.auth.unlinkIdentity(identity);
  if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get user data from users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;

    // If user record doesn't exist in users table, create it
    if (!data) {
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return newUser;
    }

    return data;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
