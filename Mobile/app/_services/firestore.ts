// Service Firestore pour le jeu de mémoire
// Structure compatible avec la librairie FirestoreChallenges de l'Arduino
import { db } from "@/firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";
import {
  User,
  Challenge,
  EnrichedChallenge,
  calculatePointsFromSequence,
} from "@/app/_types/game";

export type { User, Challenge, EnrichedChallenge };

const usersCollection = collection(db, "users");

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const snapshot = await getDocs(usersCollection);
    return snapshot.docs.map((d) => d.data() as User);
  } catch (error) {
    console.error("Erreur getAllUsers:", error);
    return [];
  }
};

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const docRef = doc(db, "users", userId);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? (snapshot.data() as User) : null;
  } catch (error) {
    console.error("Erreur getUserById:", error);
    return null;
  }
};

// Structure Firestore: challenges/{targetUserId}/challenges[]
export const createChallenge = async (
  targetUserId: string,
  challengerUserId: string,
  sequence: string,
  difficulty: number
): Promise<boolean> => {
  try {
    const challenge: Challenge = {
      challenger: challengerUserId,
      pointsObtained: 0,
      sequence,
      status: "pending",
      difficulty,
    };

    const docRef = doc(db, "challenges", targetUserId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await updateDoc(docRef, { challenges: arrayUnion(challenge) });
    } else {
      await setDoc(docRef, { challenges: [challenge] });
    }
    return true;
  } catch (error) {
    console.error("Erreur createChallenge:", error);
    return false;
  }
};

export const getChallenges = async (userId: string): Promise<Challenge[]> => {
  try {
    const docRef = doc(db, "challenges", userId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return [];
    return docSnap.data().challenges || [];
  } catch (error) {
    console.error("Erreur getChallenges:", error);
    return [];
  }
};

export const getPendingChallenges = async (userId: string): Promise<Challenge[]> => {
  const challenges = await getChallenges(userId);
  return challenges.filter((c) => c.status === "pending" || c.status === "accepted");
};

// Change status "pending" → "accepted" pour que l'IoT puisse le jouer
export const acceptChallenge = async (userId: string, challengeIndex: number): Promise<boolean> => {
  try {
    const docRef = doc(db, "challenges", userId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return false;

    const challenges = docSnap.data().challenges || [];
    const pendingChallenges = challenges.filter((c: Challenge) => c.status === "pending");
    if (challengeIndex >= pendingChallenges.length) return false;

    const targetChallenge = pendingChallenges[challengeIndex];
    const realIndex = challenges.findIndex(
      (c: Challenge) =>
        c.challenger === targetChallenge.challenger &&
        c.sequence === targetChallenge.sequence &&
        c.status === "pending"
    );

    if (realIndex === -1) return false;
    challenges[realIndex].status = "accepted";

    await updateDoc(docRef, { challenges });
    return true;
  } catch (error) {
    console.error("Erreur acceptChallenge:", error);
    return false;
  }
};

export const getCompletedChallenges = async (userId: string): Promise<Challenge[]> => {
  const challenges = await getChallenges(userId);
  return challenges.filter((c) => c.status === "completed");
};

export const getLeaderboard = async (limitCount: number = 50): Promise<User[]> => {
  try {
    const q = query(usersCollection, orderBy("points", "desc"), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as User);
  } catch (error) {
    console.error("Erreur getLeaderboard:", error);
    return [];
  }
};

export const getUserRank = async (userId: string): Promise<number> => {
  try {
    const leaderboard = await getLeaderboard(1000);
    const index = leaderboard.findIndex((u) => u.userId === userId);
    return index >= 0 ? index + 1 : -1;
  } catch (error) {
    console.error("Erreur getUserRank:", error);
    return -1;
  }
};

export const subscribeToChallenges = (
  userId: string,
  callback: (challenges: Challenge[]) => void
): (() => void) => {
  const docRef = doc(db, "challenges", userId);
  return onSnapshot(docRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.data().challenges || [] : []);
  });
};

export const subscribeToLeaderboard = (
  callback: (users: User[]) => void,
  limitCount: number = 50
): (() => void) => {
  const q = query(usersCollection, orderBy("points", "desc"), limit(limitCount));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => d.data() as User));
  });
};

const enrichChallenge = async (challenge: Challenge, index: number): Promise<EnrichedChallenge> => {
  const challenger = await getUserById(challenge.challenger);
  const difficulty = challenge.difficulty || 5;
  const sequenceLength = challenge.sequence.length;
  const { pointsToWin, pointsToLose } = calculatePointsFromSequence(sequenceLength, difficulty);
  const potentialPoints = {
    maxWin: pointsToWin,
    maxLose: pointsToLose,
    challengerMaxWin: pointsToLose,
    challengerMaxLose: pointsToWin,
  };

  let result: EnrichedChallenge["result"] | undefined;
  if (challenge.status === "completed") {
    const stepsCompleted = challenge.stepsCompleted || 0;
    result = {
      stepsCompleted,
      totalSteps: sequenceLength,
      success: stepsCompleted === sequenceLength,
      challengerPoints: challenge.challengerPointsObtained || 0,
    };
  }

  return {
    ...challenge,
    index,
    challengerPseudo: challenger?.pseudonyme || "Inconnu",
    challengerName: challenger ? `${challenger.firstName} ${challenger.lastName}` : "Inconnu",
    sequenceLength,
    potentialPoints,
    result,
  };
};

export const getEnrichedPendingChallenges = async (userId: string): Promise<EnrichedChallenge[]> => {
  try {
    const challenges = await getPendingChallenges(userId);
    return Promise.all(challenges.map((c, i) => enrichChallenge(c, i)));
  } catch (error) {
    console.error("Erreur getEnrichedPendingChallenges:", error);
    return [];
  }
};

export const getEnrichedCompletedChallenges = async (userId: string): Promise<EnrichedChallenge[]> => {
  try {
    const challenges = await getCompletedChallenges(userId);
    return Promise.all(challenges.map((c, i) => enrichChallenge(c, i)));
  } catch (error) {
    console.error("Erreur getEnrichedCompletedChallenges:", error);
    return [];
  }
};
