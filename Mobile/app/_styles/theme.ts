export const COLORS = {
  PRIMARY: '#6366F1',
  SECONDARY: '#8B5CF6',
  SUCCESS: '#10B981',
  DANGER: '#EF4444',
  WARNING: '#F59E0B',

  BACKGROUND: '#0F172A',
  SURFACE: '#1E293B',
  SURFACE_LIGHT: '#334155',

  TEXT_PRIMARY: '#F8FAFC',
  TEXT_SECONDARY: '#94A3B8',
  TEXT_MUTED: '#64748B',

  LED_RED: '#DC2626',
  LED_GREEN: '#16A34A',
  LED_YELLOW: '#CA8A04',

  BORDER: '#334155',
  BORDER_LIGHT: '#475569',

  OVERLAY: 'rgba(0, 0, 0, 0.5)',
  GLASS: 'rgba(30, 41, 59, 0.8)',
};

export const GRADIENTS = {
  HEADER: ['#4F46E5', '#7C3AED'] as const,
  TAB: ['#1E293B', '#334155'] as const,
  CARD: ['#1E293B', '#0F172A'] as const,
  BUTTON: ['#6366F1', '#8B5CF6'] as const,
  BUTTON_SUCCESS: ['#10B981', '#059669'] as const,
  BUTTON_DANGER: ['#EF4444', '#DC2626'] as const,
  LED_RED: ['#DC2626', '#991B1B'] as const,
  LED_GREEN: ['#16A34A', '#166534'] as const,
  LED_YELLOW: ['#CA8A04', '#A16207'] as const,
};

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
};

export const BORDER_RADIUS = {
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 24,
  FULL: 9999,
};

export const FONT_SIZE = {
  XS: 10,
  SM: 12,
  MD: 14,
  LG: 16,
  XL: 18,
  XXL: 20,
  TITLE: 24,
  HERO: 32,
};

export const FONT_WEIGHT = {
  REGULAR: '400' as const,
  MEDIUM: '500' as const,
  SEMIBOLD: '600' as const,
  BOLD: '700' as const,
};

export const SHADOWS = {
  SM: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  MD: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  LG: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  GLOW: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  }),
};

export const COMMON_STYLES = {
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  card: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.MD,
    ...SHADOWS.MD,
  },
  title: {
    fontSize: FONT_SIZE.TITLE,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  subtitle: {
    fontSize: FONT_SIZE.XL,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  text: {
    fontSize: FONT_SIZE.MD,
    color: COLORS.TEXT_PRIMARY,
  },
  textSecondary: {
    fontSize: FONT_SIZE.MD,
    color: COLORS.TEXT_SECONDARY,
  },
  input: {
    backgroundColor: COLORS.SURFACE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.MD,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM + 4,
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONT_SIZE.MD,
  },
  button: {
    borderRadius: BORDER_RADIUS.MD,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  buttonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.BOLD,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  center: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
};

// Système de pointage - Constantes
// Note: Les fonctions de calcul sont dans _types/game.ts et _services/firestore.ts
//
// FORMULE EXPONENTIELLE:
// - Chaque coup vaut: BASE_POINTS × MULTIPLIER^(coup-1)
// - Coup 1 = 1, Coup 2 = 1.5, Coup 3 = 2.25, etc.
// - Points à GAGNER = somme cumulative = 2 × (1.5^n - 1)
// - Points à PERDRE = max(gain_miroir, 10% × gain_max)
//   → Longueur miroir = 20 - n
//   → Minimum = 10% du gain max (87 pts pour difficulté 1)
// - Bonus difficulté: niveau 1 = 1.0, niveau 10 = 1.9
//   → GAINS: multipliés par le bonus (plus de difficulté = plus de gains)
//   → PERTES: divisées par le bonus (plus de difficulté = moins de pertes)
//
// EXEMPLES (difficulté 1):
// ┌─────────┬──────────┬──────────┬─────────────────────┐
// │ Coups   │ À gagner │ À perdre │ Risque              │
// ├─────────┼──────────┼──────────┼─────────────────────┤
// │ 5       │ 13 pts   │ 874 pts  │ Très risqué (1:67)  │
// │ 7       │ 31 pts   │ 307 pts  │ Risqué (1:10)       │
// │ 10      │ 113 pts  │ 113 pts  │ Équilibré (1:1)     │
// │ 12      │ 256 pts  │ 87 pts   │ Avantageux (3:1)    │
// │ 15      │ 874 pts  │ 87 pts   │ Très avantageux     │
// └─────────┴──────────┴──────────┴─────────────────────┘
//
export const SCORING = {
  MIN_SEQUENCE_LENGTH: 5,
  MAX_SEQUENCE_LENGTH: 15,
  MIN_DIFFICULTY: 1,
  MAX_DIFFICULTY: 10,
  // Valeurs exponentielles
  BASE_POINTS: 1,           // Valeur du premier coup
  MULTIPLIER: 1.5,          // Multiplicateur par coup supplémentaire
  MIN_LOSS_PERCENT: 0.10,   // Perte minimum = 10% du gain max
  // Bonus de difficulté par niveau (niveau 1 = 0%, niveau 10 = 90%)
  DIFFICULTY_BONUS_PER_LEVEL: 0.10,
};
