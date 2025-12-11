import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

function createAuth() {
  if (Platform.OS === "web") {
    return getAuth(app);
  }

  let getRNPersist: ((storage: any) => any) | undefined;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    getRNPersist =
      require("firebase/auth/react-native").getReactNativePersistence;
  } catch (_) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      getRNPersist = require("firebase/auth").getReactNativePersistence;
    } catch (_) {}
  }

  if (!getRNPersist) {
    console.warn(
      "[firebase] getReactNativePersistence introuvable — persistance mémoire utilisée (session non conservée entre redémarrages)."
    );
    return initializeAuth(app);
  }

  return initializeAuth(app, {
    persistence: getRNPersist(AsyncStorage),
  });
}

export const auth = createAuth();
export const db = getFirestore(app);
