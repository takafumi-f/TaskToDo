"use client";

import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { getFirebaseAuth } from "./firebase";

const provider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<void> {
  await signInWithPopup(getFirebaseAuth(), provider);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getFirebaseAuth());
}
