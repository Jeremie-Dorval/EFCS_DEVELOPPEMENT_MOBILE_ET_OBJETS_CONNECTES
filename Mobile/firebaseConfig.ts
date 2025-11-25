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
  // CHAT GPT -> PROMPT: CETTE PAGE ET L'ERREUR: [{ "resource": "/c:/Users/willi/OneDrive/Desktop/tp mobile/firebaseConfig.ts", "owner": "typescript", "code": "2307", "severity": 8, "message": "Cannot find module 'firebase/auth/react-native' or its corresponding type declarations.", "source": "ts", "startLineNumber": 4, "startColumn": 43, "endLineNumber": 4, "endColumn": 71, "origin": "extHost1" }]
  // Sur web: on laisse Firebase gérer la persistance navigateur
  if (Platform.OS === "web") {
    return getAuth(app);
  }

  // Sur mobile: on essaye d'obtenir getReactNativePersistence, peu importe l’endroit où il est exporté
  let getRNPersist: ((storage: any) => any) | undefined;

  try {
    // Certaines versions l’exportent ici
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    getRNPersist =
      require("firebase/auth/react-native").getReactNativePersistence;
  } catch (_) {
    try {
      // D’autres versions l’exportent directement depuis "firebase/auth"
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      getRNPersist = require("firebase/auth").getReactNativePersistence;
    } catch (_) {
      // pas dispo dans les types/exports -> on tombera en persistance mémoire
    }
  }

  if (!getRNPersist) {
    console.warn(
      "[firebase] getReactNativePersistence introuvable — persistance mémoire utilisée (session non conservée entre redémarrages)."
    );
    return initializeAuth(app); // memory persistence par défaut
  }

  return initializeAuth(app, {
    persistence: getRNPersist(AsyncStorage),
  });
}

export const auth = createAuth();
export const db = getFirestore(app);
