// src/firebase/viewStorage.ts
import { doc, setDoc, getDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from './firebase';

// Save user view preference to Firestore
export const saveUserView = async (uid: string, view: 'list' | 'grid') => {
  const userRef = doc(db, 'users', uid);
  const settingsRef = collection(userRef, 'settings');
  const docRef = doc(settingsRef, 'view');

  try {
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      await updateDoc(docRef, { view });
    } else {
      await setDoc(docRef, { view });
    }
    console.log('User view preference saved successfully');
  } catch (error) {
    console.error('Error saving view preference:', error);
  }
};

// Retrieve user view preference from Firestore
export const getUserView = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  const settingsRef = collection(userRef, 'settings');
  const docRef = doc(settingsRef, 'view');

  try {
    const docSnapshot = await getDoc(docRef);
    if (docSnapshot.exists()) {
      return docSnapshot.data().view;
    }
    return null;
  } catch (error) {
    console.error('Error retrieving view preference:', error);
    return null;
  }
};
