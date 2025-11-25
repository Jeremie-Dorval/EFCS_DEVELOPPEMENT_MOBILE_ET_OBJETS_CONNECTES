import { auth, db } from "@/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

export interface AppUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt?: any;
}

type Ok = { ok: true };
type Err = { ok: false; error?: string };
export type Result = Ok | Err;

type AuthCtx = {
  firebaseUser: FirebaseUser | null;
  appUser: AppUser | null;
  isAuthenticated: boolean | undefined;
  avatarUri: string | null;
  login: (email: string, password: string) => Promise<Result>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<Result>;
  logout: () => Promise<void>;
  loadAvatar: () => Promise<void>;
  setAvatar: (uri: string | null) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<Result>;
};

const Ctx = createContext<AuthCtx | null>(null);

const avatarKey = (uid: string) => `avatar:${uid}`;

export const AuthContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => { //PropsWithChildren in React Native (and React in general) is a utility type provided by TypeScript that simplifies the typing of components that accept children. https://www.dhiwise.com/post/understanding-react-propswithchildren-a-comprehensive-guide
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);

  const loadAvatar = async () => {
    if (!auth.currentUser) return;
    const uri = await AsyncStorage.getItem(avatarKey(auth.currentUser.uid));
    setAvatarUri(uri);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (!fbUser) {
        setAppUser(null);
        setAvatarUri(null);
        setIsAuthenticated(false);
        return;
      }
      try {
        const ref = doc(db, "users", fbUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setAppUser(snap.data() as AppUser);
        } else {
          const minimal: AppUser = {
            id: fbUser.uid,
            firstName: "",
            lastName: "",
            email: fbUser.email ?? "",
            createdAt: serverTimestamp(),
          };
          await setDoc(ref, minimal);
          setAppUser(minimal);
        }
        await loadAvatar();
        setIsAuthenticated(true);
      } catch (e) {
        console.error(e);
        Alert.alert("Erreur", "Impossible de charger le profil utilisateur.");
        setIsAuthenticated(true);
      }
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string): Promise<Result> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "Login échoué" };
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<Result> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const u: AppUser = {
        id: cred.user.uid,
        firstName,
        lastName,
        email,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, "users", u.id), u);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "Inscription échouée" };
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const setAvatar = async (uri: string | null) => {
    if (!auth.currentUser) return;
    if (uri === null) {
      await AsyncStorage.removeItem(avatarKey(auth.currentUser.uid));
      setAvatarUri(null);
    } else {
      await AsyncStorage.setItem(avatarKey(auth.currentUser.uid), uri);
      setAvatarUri(uri);
    }
  };

  const changePassword = async (current: string, next: string): Promise<Result> => {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) return { ok: false, error: "Utilisateur non connecté" };
      const cred = EmailAuthProvider.credential(user.email, current);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, next);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "Changement de mot de passe échoué" };
    }
  };

  const value = useMemo<AuthCtx>(
    () => ({
      firebaseUser,
      appUser,
      isAuthenticated,
      avatarUri,
      login,
      register,
      logout,
      loadAvatar,
      setAvatar,
      changePassword,
    }),
    [firebaseUser, appUser, isAuthenticated, avatarUri]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthContextProvider />");
  return ctx;
};
