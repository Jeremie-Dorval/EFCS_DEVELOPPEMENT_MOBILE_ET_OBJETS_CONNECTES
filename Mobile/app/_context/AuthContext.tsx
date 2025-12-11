// Contexte d'authentification Firebase
// Gère: connexion, inscription, déconnexion, avatar local, changement de mot de passe
import { auth, db } from "@/firebaseConfig";
import { User } from "@/app/_types/game";
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
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

// Alias pour compatibilité - utilise le type User centralisé de game.ts
export type AppUser = User;

type Ok = { ok: true };
type Err = { ok: false; error?: string };
export type Result = Ok | Err;

type AuthCtx = {
  firebaseUser: FirebaseUser | null;
  appUser: AppUser | null;
  isAuthenticated: boolean | undefined;
  avatarUri: string | null;
  login: (email: string, password: string) => Promise<Result>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    pseudonyme: string
  ) => Promise<Result>;
  logout: () => Promise<void>;
  loadAvatar: () => Promise<void>;
  setAvatar: (uri: string | null) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<Result>;
  refreshUser: () => Promise<void>;
  updateUserPoints: (newPoints: number) => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

const avatarKey = (uid: string) => `avatar:${uid}`;

export const AuthContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);

  const loadAvatar = async () => {
    if (!auth.currentUser) return;
    const uri = await AsyncStorage.getItem(avatarKey(auth.currentUser.uid));
    setAvatarUri(uri);
  };

  const loadUserData = async (uid: string, email: string | null) => {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      const user: AppUser = {
        userId: data.userId ?? uid,
        pseudonyme: data.pseudonyme ?? "",
        firstName: data.firstName ?? "",
        lastName: data.lastName ?? "",
        email: data.email ?? email ?? "",
        points: data.points ?? 0,
        winStreak: data.winStreak ?? 0,
        createdAt: data.createdAt,
      };
      setAppUser(user);
      return user;
    }
    return null;
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
        const user = await loadUserData(fbUser.uid, fbUser.email);
        if (!user) {
          const minimal: AppUser = {
            userId: fbUser.uid,
            pseudonyme: "",
            firstName: "",
            lastName: "",
            email: fbUser.email ?? "",
            points: 0,
            winStreak: 0,
            createdAt: serverTimestamp(),
          };
          await setDoc(doc(db, "users", fbUser.uid), minimal);
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
    lastName: string,
    pseudonyme: string
  ): Promise<Result> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const u: AppUser = {
        userId: cred.user.uid,
        pseudonyme,
        firstName,
        lastName,
        email,
        points: 0,
        winStreak: 0,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, "users", u.userId), u);
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

  const refreshUser = async () => {
    if (!auth.currentUser) return;
    await loadUserData(auth.currentUser.uid, auth.currentUser.email);
  };

  const updateUserPoints = async (newPoints: number) => {
    if (!auth.currentUser || !appUser) return;
    try {
      const ref = doc(db, "users", auth.currentUser.uid);
      await updateDoc(ref, { points: newPoints });
      setAppUser({ ...appUser, points: newPoints });
    } catch (e) {
      console.error("Erreur mise à jour des points:", e);
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
      refreshUser,
      updateUserPoints,
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
