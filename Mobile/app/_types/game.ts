// Types et calculs du jeu de mémoire (cohérent avec l'IoT)
export interface User {
  userId: string;
  pseudonyme: string;
  firstName: string;
  lastName: string;
  email: string;
  points: number;
  winStreak: number;
  createdAt?: any;
}

// Structure d'un défi
export interface Challenge {
  challenger: string;      // userId de celui qui défie
  pointsObtained: number;  // Points obtenus par le défié (0 si pending)
  sequence: string;        // Séquence de LEDs (caractères 1, 2, 3)
  status: 'pending' | 'accepted' | 'completed';
  difficulty: number;      // Niveau de difficulté (1-10)
  // Champs remplis par l'Arduino après complétion:
  stepsCompleted?: number;           // Coups réussis
  totalSteps?: number;               // Total de coups (= sequence.length)
  challengerPointsObtained?: number; // Points obtenus par le challenger
}

export interface ChallengeDocument {
  challenges: Challenge[];
}

export interface EnrichedChallenge extends Challenge {
  index: number;              // Index dans le tableau pour identification
  challengerPseudo: string;   // Pseudonyme du challenger
  challengerName: string;     // Nom complet du challenger
  sequenceLength: number;     // Longueur de la séquence
  potentialPoints: {
    maxWin: number;
    maxLose: number;
    challengerMaxWin: number;
    challengerMaxLose: number;
  };
  // Résultats après complétion (si status === 'completed')
  result?: {
    stepsCompleted: number;
    totalSteps: number;
    success: boolean;         // true si 100% réussi
    challengerPoints: number; // Points du challenger
  };
}

export interface ChallengeResult {
  success: boolean;           // Défi réussi complètement ou non
  successRatio: number;       // Ratio de réussite (0-1)
  stepsCompleted: number;     // Nombre de coups réussis
  totalSteps: number;         // Nombre total de coups
  pointsEarned: number;       // Points gagnés/perdus par le défié
  challengerPointsEarned: number; // Points gagnés/perdus par le challenger
  mode: 'normal' | 'expert';  // Mode de jeu
}

export type LEDValue = '1' | '2' | '3';

export const LED_COLORS: Record<LEDValue, { name: string; color: string; gradient: readonly [string, string] }> = {
  '1': { name: 'Rouge', color: '#DC2626', gradient: ['#DC2626', '#991B1B'] },
  '2': { name: 'Vert', color: '#16A34A', gradient: ['#16A34A', '#166534'] },
  '3': { name: 'Jaune', color: '#CA8A04', gradient: ['#CA8A04', '#A16207'] },
};

export const GAME_CONSTANTS = {
  MIN_SEQUENCE_LENGTH: 5,
  MAX_SEQUENCE_LENGTH: 15,
  MAX_PENDING_CHALLENGES: 5,  // Maximum de défis non complétés récupérés
  MIN_DIFFICULTY: 1,
  MAX_DIFFICULTY: 10,
  DEFAULT_DIFFICULTY: 5,
};

// Calcul des points: formule exponentielle 2 × (1.5^n - 1) avec bonus difficulté
// Séquence courte = risqué (peu à gagner, beaucoup à perdre)
// Séquence longue = avantageux (beaucoup à gagner, peu à perdre)
// Faites avec l'aide de claude code pour équilibrer les valeurs. pompt: ajuste les valeurs pour que ce soit exponentielle et équilibré
export const calculatePointsFromSequence = (sequenceLength: number, difficulty: number) => {
  const MIN_SEQUENCE = 5;
  const MAX_SEQUENCE = 15;
  const BASE_POINTS = 1;
  const MULTIPLIER = 1.5;
  const MIN_LOSS_PERCENT = 0.10;

  const calcWin = (len: number) => 2 * BASE_POINTS * (Math.pow(MULTIPLIER, len) - 1);
  const difficultyBonus = 1 + ((difficulty - 1) * 0.10);

  const baseWin = calcWin(sequenceLength);
  const pointsToWin = Math.round(baseWin * difficultyBonus);

  let baseLose: number;
  if (sequenceLength >= MIN_SEQUENCE) {
    const maxPossibleWin = calcWin(MAX_SEQUENCE);
    const minLoss = maxPossibleWin * MIN_LOSS_PERCENT;
    const mirrorLength = MIN_SEQUENCE + MAX_SEQUENCE - sequenceLength;
    const mirrorLoss = calcWin(mirrorLength);
    baseLose = Math.max(minLoss, mirrorLoss);
  } else {
    baseLose = baseWin;
  }

  const pointsToLose = Math.round(baseLose / difficultyBonus);

  return { pointsToWin, pointsToLose };
};

// Calcul final: interpolation linéaire entre perte max (0%) et gain max (100%)
export const calculateFinalPoints = (
  sequenceLength: number,
  difficulty: number,
  stepsCompleted: number,
  totalSteps: number
) => {
  const { pointsToWin, pointsToLose } = calculatePointsFromSequence(sequenceLength, difficulty);
  const ratio = totalSteps > 0 ? stepsCompleted / totalSteps : 0;

  const points = Math.round(-pointsToLose + (pointsToWin + pointsToLose) * ratio);
  const success = stepsCompleted === totalSteps;
  const challengerPoints = -points;

  return { points, challengerPoints, success, ratio };
};

export interface CreateChallengeParams {
  targetUserId: string;
  targetUserName: string;
  targetUserPseudo: string;
}

export interface ChallengeCreationState {
  sequence: LEDValue[];
  targetUser: {
    userId: string;
    name: string;
    pseudo: string;
  } | null;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  isCurrentUser: boolean;
}
