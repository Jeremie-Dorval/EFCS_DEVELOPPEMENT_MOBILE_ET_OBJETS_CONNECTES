import { DifficultySlider } from "@/app/_components/DifficultyBar";
import { useAuth } from "@/app/_context/AuthContext";
import { createChallenge } from "@/app/_services/firestore";
import { COLORS, GRADIENTS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from "@/app/_styles/theme";
import { LEDValue, LED_COLORS, GAME_CONSTANTS } from "@/app/_types/game";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface LEDButtonProps {
  value: LEDValue;
  onPress: () => void;
  disabled: boolean;
}

const LEDButton = ({ value, onPress, disabled }: LEDButtonProps) => {
  const ledInfo = LED_COLORS[value];

  return (
    <TouchableOpacity
      style={[styles.ledButton, disabled && styles.ledButtonDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={ledInfo.gradient}
        style={styles.ledButtonGradient}
      >
        <View style={[styles.ledBulb, { backgroundColor: ledInfo.color }]}>
          <View style={styles.ledGlow} />
        </View>
        <Text style={styles.ledButtonText}>{value}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

interface SequenceItemProps {
  value: LEDValue;
  index: number;
}

const SequenceItem = ({ value, index }: SequenceItemProps) => {
  const ledInfo = LED_COLORS[value];

  return (
    <View style={[styles.sequenceItem, { backgroundColor: ledInfo.color }]}>
      <Text style={styles.sequenceItemText}>{value}</Text>
    </View>
  );
};

export default function CreateChallenge() {
  const { appUser } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{
    targetUserId: string;
    targetUserName: string;
    targetUserPseudo: string;
  }>();

  const [sequence, setSequence] = useState<LEDValue[]>([]);
  const [difficulty, setDifficulty] = useState(GAME_CONSTANTS.DEFAULT_DIFFICULTY);
  const [loading, setLoading] = useState(false);

  const canAddMore = sequence.length < GAME_CONSTANTS.MAX_SEQUENCE_LENGTH;
  const canSubmit = sequence.length >= GAME_CONSTANTS.MIN_SEQUENCE_LENGTH;

  const addToSequence = (value: LEDValue) => {
    if (canAddMore) {
      setSequence([...sequence, value]);
    }
  };

  const removeLastFromSequence = () => {
    if (sequence.length > 0) {
      setSequence(sequence.slice(0, -1));
    }
  };

  const clearSequence = () => {
    setSequence([]);
  };

  const handleSubmit = async () => {
    if (!canSubmit || !appUser || !params.targetUserId) return;

    setLoading(true);
    try {
      const sequenceString = sequence.join("");
      const success = await createChallenge(
        params.targetUserId,
        appUser.userId,
        sequenceString,
        difficulty
      );

      if (success) {
        Alert.alert(
          "Défi envoyé!",
          `Votre défi de ${sequence.length} coups (difficulté ${difficulty}/10) a été envoyé à ${params.targetUserPseudo}`,
          [{ text: "OK", onPress: () => router.back() }]
        );
      } else {
        Alert.alert("Erreur", "Impossible d'envoyer le défi. Réessayez.");
      }
    } catch (error) {
      console.error("Erreur envoi défi:", error);
      Alert.alert("Erreur", "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[COLORS.BACKGROUND, '#1a1a2e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Créer un défi</Text>
            <Text style={styles.headerSubtitle}>Pour: {params.targetUserPseudo}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.counterCard}>
            <Text style={styles.counterLabel}>Séquence</Text>
            <Text style={styles.counterValue}>
              {sequence.length}/{GAME_CONSTANTS.MAX_SEQUENCE_LENGTH}
            </Text>
            <Text style={styles.counterHint}>
              Minimum {GAME_CONSTANTS.MIN_SEQUENCE_LENGTH} coups
            </Text>
          </View>

          <View style={styles.sequenceCard}>
            <Text style={styles.sequenceCardTitle}>Votre séquence</Text>
            <View style={styles.sequenceContainer}>
              {sequence.length === 0 ? (
                <Text style={styles.sequenceEmpty}>
                  Appuyez sur les LEDs pour créer votre séquence
                </Text>
              ) : (
                <View style={styles.sequenceGrid}>
                  {sequence.map((value, index) => (
                    <SequenceItem key={index} value={value} index={index} />
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={styles.ledSection}>
            <Text style={styles.ledSectionTitle}>Sélectionner les LEDs</Text>
            <View style={styles.ledButtons}>
              <LEDButton value="1" onPress={() => addToSequence("1")} disabled={!canAddMore} />
              <LEDButton value="2" onPress={() => addToSequence("2")} disabled={!canAddMore} />
              <LEDButton value="3" onPress={() => addToSequence("3")} disabled={!canAddMore} />
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonDanger]}
              onPress={removeLastFromSequence}
              disabled={sequence.length === 0}
            >
              <Ionicons name="backspace" size={20} color={COLORS.TEXT_PRIMARY} />
              <Text style={styles.actionButtonText}>Retirer dernier</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonWarning]}
              onPress={clearSequence}
              disabled={sequence.length === 0}
            >
              <Ionicons name="trash" size={20} color={COLORS.TEXT_PRIMARY} />
              <Text style={styles.actionButtonText}>Effacer tout</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.difficultySection}>
            <DifficultySlider
              value={difficulty}
              onChange={setDifficulty}
              sequenceLength={sequence.length}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit || loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={canSubmit ? GRADIENTS.BUTTON_SUCCESS : GRADIENTS.TAB}
              style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
            >
              {loading ? (
                <Text style={styles.submitButtonText}>Envoi en cours...</Text>
              ) : (
                <>
                  <Ionicons name="send" size={20} color={COLORS.TEXT_PRIMARY} />
                  <Text style={styles.submitButtonText}>Envoyer le défi</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {!canSubmit && (
            <Text style={styles.submitHint}>
              La séquence doit contenir entre {GAME_CONSTANTS.MIN_SEQUENCE_LENGTH} et{" "}
              {GAME_CONSTANTS.MAX_SEQUENCE_LENGTH} coups
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
  },
  backButton: {
    padding: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
    backgroundColor: COLORS.SURFACE,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: FONT_SIZE.XL,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.SM,
    color: COLORS.PRIMARY,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.MD,
    paddingBottom: SPACING.XXL,
  },
  counterCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.LG,
    alignItems: "center",
    marginBottom: SPACING.MD,
    ...SHADOWS.MD,
  },
  counterLabel: {
    fontSize: FONT_SIZE.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  counterValue: {
    fontSize: FONT_SIZE.HERO,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.PRIMARY,
    marginVertical: SPACING.XS,
  },
  counterHint: {
    fontSize: FONT_SIZE.XS,
    color: COLORS.TEXT_MUTED,
  },
  sequenceCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    ...SHADOWS.MD,
  },
  sequenceCardTitle: {
    fontSize: FONT_SIZE.MD,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  sequenceContainer: {
    minHeight: 80,
    justifyContent: "center",
  },
  sequenceEmpty: {
    textAlign: "center",
    color: COLORS.TEXT_MUTED,
    fontSize: FONT_SIZE.SM,
  },
  sequenceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.SM,
  },
  sequenceItem: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.SM,
  },
  sequenceItemText: {
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  ledSection: {
    marginBottom: SPACING.MD,
  },
  ledSectionTitle: {
    fontSize: FONT_SIZE.MD,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
    textAlign: "center",
  },
  ledButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: SPACING.MD,
  },
  ledButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.LG,
    overflow: "hidden",
    ...SHADOWS.MD,
  },
  ledButtonDisabled: {
    opacity: 0.5,
  },
  ledButtonGradient: {
    alignItems: "center",
    paddingVertical: SPACING.LG,
    paddingHorizontal: SPACING.MD,
  },
  ledBulb: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.FULL,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.SM,
  },
  ledGlow: {
    width: 20,
    height: 20,
    borderRadius: BORDER_RADIUS.FULL,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  ledButtonText: {
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  actionButtons: {
    flexDirection: "row",
    gap: SPACING.MD,
    marginBottom: SPACING.MD,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.SM,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
  },
  actionButtonDanger: {
    backgroundColor: COLORS.DANGER,
  },
  actionButtonWarning: {
    backgroundColor: COLORS.WARNING,
  },
  actionButtonText: {
    fontSize: FONT_SIZE.SM,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  difficultySection: {
    marginBottom: SPACING.MD,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.SM,
    paddingVertical: SPACING.MD + 4,
    borderRadius: BORDER_RADIUS.MD,
    ...SHADOWS.MD,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  submitHint: {
    fontSize: FONT_SIZE.SM,
    color: COLORS.TEXT_MUTED,
    textAlign: "center",
    marginTop: SPACING.SM,
  },
});
