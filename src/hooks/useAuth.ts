// src/hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auth, provider, db } from '../firebase/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

// Save user data to Firestore
const saveUserData = async (user: User) => {
  const userRef = doc(db, 'users', user.uid);
  const userData = {
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  };

  const docSnapshot = await getDoc(userRef);
  if (!docSnapshot.exists()) {
    await setDoc(userRef, userData);
  }
};

export function useAuth() {
  const queryClient = useQueryClient();

  // Query for current user
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth'],
    queryFn: () => {
      return new Promise<User | null>((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            resolve({
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
            });
          } else {
            resolve(null);
          }
          unsubscribe();
        });
      });
    },
  });

  // Sign in mutation
  const signInMutation = useMutation({
    mutationFn: async () => {
      const result = await signInWithPopup(auth, provider);
      const user = result.user as User;
      await saveUserData(user);
      return user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['auth'], user);
    },
  });

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: async () => {
      await signOut(auth);
      queryClient.setQueryData(['auth'], null);
    },
  });

  return {
    user,
    isLoading,
    signIn: signInMutation.mutate,
    signOut: signOutMutation.mutate,
    isSigningIn: signInMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    error: signInMutation.error || signOutMutation.error,
  };
}
