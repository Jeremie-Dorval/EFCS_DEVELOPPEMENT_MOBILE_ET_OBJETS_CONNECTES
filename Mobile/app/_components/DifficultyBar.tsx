import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from "@/app/_styles/theme";
import { GAME_CONSTANTS, calculatePointsFromSequence } from "@/app/_types/game";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const DEFAULT_SEQUENCE_LENGTH = 10;

interface DifficultyBarProps {
  difficulty: number;
  sequenceLength?: number;
  showLabel?: boolean;
  showPoints?: boolean;
  size?: "small" | "medium" | "large";
  onPress?: () => void;
}

export default function DifficultyBar({
  difficulty,
  sequenceLength = DEFAULT_SEQUENCE_LENGTH,
  showLabel = true,
  showPoints = false,
  size = "medium",
  onPress,
}: DifficultyBarProps) {
  const maxDifficulty = GAME_CONSTANTS.MAX_DIFFICULTY;
  const skulls = Math.min(Math.max(difficulty, 1), maxDifficulty);
  const emptySlots = maxDifficulty - skulls;

  const iconSize = size === "small" ? 14 : size === "large" ? 22 : 18;
  const { pointsToWin, pointsToLose } = calculatePointsFromSequence(sequenceLength, difficulty);

  const content = (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, size === "small" && styles.labelSmall]}>
            Difficulté
          </Text>
          <Text style={[styles.levelText, size === "small" && styles.levelTextSmall]}>
            {difficulty}/{maxDifficulty}
          </Text>
        </View>
      )}

      <View style={styles.barContainer}>
        {Array.from({ length: skulls }).map((_, index) => (
          <Ionicons
            key={`skull-${index}`}
            name="skull"
            size={iconSize}
            color={getDifficultyColor(difficulty)}
            style={styles.icon}
          />
        ))}

        {Array.from({ length: emptySlots }).map((_, index) => (
          <Ionicons
            key={`empty-${index}`}
            name="ellipse"
            size={iconSize}
            color={COLORS.SURFACE_LIGHT}
            style={styles.icon}
          />
        ))}
      </View>

      {showPoints && (
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsWin}>+{pointsToWin}</Text>
          <Text style={styles.pointsSeparator}>/</Text>
          <Text style={styles.pointsLose}>{pointsToLose}</Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

function getDifficultyColor(difficulty: number): string {
  if (difficulty <= 3) return COLORS.SUCCESS;      // Facile - Vert
  if (difficulty <= 6) return COLORS.WARNING;      // Moyen - Orange
  if (difficulty <= 8) return "#F97316";           // Difficile - Orange foncé
  return COLORS.DANGER;                            // Très difficile - Rouge
}

interface DifficultySliderProps {
  value: number;
  onChange: (value: number) => void;
  sequenceLength?: number;
}

export function DifficultySlider({ value, onChange, sequenceLength = 0 }: DifficultySliderProps) {
  const hasSequence = sequenceLength > 0;
  const { pointsToWin, pointsToLose } = hasSequence
    ? calculatePointsFromSequence(sequenceLength, value)
    : { pointsToWin: 0, pointsToLose: 0 };

  return (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderLabel}>Niveau de difficulté</Text>
        <Text style={[styles.sliderValue, { color: getDifficultyColor(value) }]}>
          {value}/10
        </Text>
      </View>

      <View style={styles.sliderBar}>
        {Array.from({ length: GAME_CONSTANTS.MAX_DIFFICULTY }).map((_, index) => {
          const level = index + 1;
          const isSelected = level <= value;
          return (
            <TouchableOpacity
              key={level}
              onPress={() => onChange(level)}
              style={[
                styles.sliderButton,
                isSelected && { backgroundColor: getDifficultyColor(value) + "30" },
              ]}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isSelected ? "skull" : "ellipse-outline"}
                size={24}
                color={isSelected ? getDifficultyColor(value) : COLORS.TEXT_MUTED}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.pointsRow}>
        <View style={styles.pointsBox}>
          <Text style={styles.pointsLabel}>Si réussi</Text>
          <Text style={[styles.pointsValue, styles.pointsWinLarge]}>
            +{pointsToWin} pts
          </Text>
        </View>
        <View style={styles.pointsBox}>
          <Text style={styles.pointsLabel}>Si échoué</Text>
          <Text style={[styles.pointsValue, styles.pointsLoseLarge]}>
            {pointsToLose} pts
          </Text>
        </View>
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.SUCCESS }]} />
          <Text style={styles.legendText}>Facile</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.WARNING }]} />
          <Text style={styles.legendText}>Moyen</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.DANGER }]} />
          <Text style={styles.legendText}>Difficile</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.XS,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: FONT_SIZE.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  labelSmall: {
    fontSize: FONT_SIZE.XS,
  },
  levelText: {
    fontSize: FONT_SIZE.SM,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  levelTextSmall: {
    fontSize: FONT_SIZE.XS,
  },
  barContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  icon: {
    marginHorizontal: 1,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.XS,
  },
  pointsWin: {
    fontSize: FONT_SIZE.SM,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.SUCCESS,
  },
  pointsSeparator: {
    fontSize: FONT_SIZE.SM,
    color: COLORS.TEXT_MUTED,
    marginHorizontal: SPACING.XS,
  },
  pointsLose: {
    fontSize: FONT_SIZE.SM,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.DANGER,
  },
  sliderContainer: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 16,
    padding: SPACING.MD,
    gap: SPACING.MD,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sliderLabel: {
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  sliderValue: {
    fontSize: FONT_SIZE.XL,
    fontWeight: FONT_WEIGHT.BOLD,
  },
  sliderBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    padding: SPACING.SM,
  },
  sliderButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  pointsRow: {
    flexDirection: "row",
    gap: SPACING.MD,
  },
  pointsBox: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    padding: SPACING.MD,
    alignItems: "center",
  },
  pointsLabel: {
    fontSize: FONT_SIZE.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XS,
  },
  pointsValue: {
    fontSize: FONT_SIZE.XL,
    fontWeight: FONT_WEIGHT.BOLD,
  },
  pointsWinLarge: {
    color: COLORS.SUCCESS,
  },
  pointsLoseLarge: {
    color: COLORS.DANGER,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING.LG,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.XS,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: FONT_SIZE.XS,
    color: COLORS.TEXT_MUTED,
  },
});
