import DifficultyBar from "@/app/_components/DifficultyBar";
import { useAuth } from "@/app/_context/AuthContext";
import { getEnrichedCompletedChallenges, EnrichedChallenge } from "@/app/_services/firestore";
import { COLORS, GRADIENTS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from "@/app/_styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface CompletedChallengeCardProps {
  challenge: EnrichedChallenge;
  index: number;
}

const CompletedChallengeCard = ({ challenge, index }: CompletedChallengeCardProps) => {
  const isSuccess = challenge.result?.success ?? challenge.pointsObtained > 0;
  const stepsCompleted = challenge.result?.stepsCompleted ?? 0;
  const totalSteps = challenge.result?.totalSteps ?? challenge.sequenceLength;
  const challengerPoints = challenge.result?.challengerPoints ?? 0;

  return (
    <View style={styles.challengeCard}>
      <LinearGradient
        colors={isSuccess ? ['#1E293B', '#134E2A'] : ['#1E293B', '#4A1E1E']}
        style={styles.challengeCardGradient}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[
              styles.statusIcon,
              isSuccess ? styles.statusIconSuccess : styles.statusIconFail
            ]}>
              <Ionicons
                name={isSuccess ? "checkmark-circle" : "close-circle"}
                size={24}
                color={isSuccess ? COLORS.SUCCESS : COLORS.DANGER}
              />
            </View>
            <View>
              <Text style={styles.challengeTitle}>Défi #{index + 1}</Text>
              <Text style={styles.challengerPseudo}>de {challenge.challengerPseudo}</Text>
            </View>
          </View>
          <View style={[
            styles.resultBadge,
            isSuccess ? styles.resultBadgeSuccess : styles.resultBadgeFail
          ]}>
            <Text style={[
              styles.resultBadgeText,
              isSuccess ? styles.resultBadgeTextSuccess : styles.resultBadgeTextFail
            ]}>
              {isSuccess ? "Réussi" : "Échoué"}
            </Text>
          </View>
        </View>

        <View style={styles.difficultyContainer}>
          <DifficultyBar
            difficulty={challenge.difficulty}
            sequenceLength={challenge.sequenceLength}
            size="small"
            showLabel={true}
          />
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progression</Text>
            <Text style={[
              styles.progressValue,
              isSuccess ? styles.progressValueSuccess : styles.progressValueDanger
            ]}>
              {stepsCompleted}/{totalSteps} coups
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(stepsCompleted / totalSteps) * 100}%`,
                  backgroundColor: isSuccess ? COLORS.SUCCESS : COLORS.DANGER
                }
              ]}
            />
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Vos points</Text>
            <Text style={[
              styles.statValue,
              challenge.pointsObtained >= 0 ? styles.statValueSuccess : styles.statValueDanger
            ]}>
              {challenge.pointsObtained >= 0 ? "+" : ""}{challenge.pointsObtained}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Points adversaire</Text>
            <Text style={[
              styles.statValue,
              challengerPoints >= 0 ? styles.statValueSuccess : styles.statValueDanger
            ]}>
              {challengerPoints >= 0 ? "+" : ""}{challengerPoints}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default function ChallengesCompleted() {
  const { appUser } = useAuth();
  const [challenges, setChallenges] = useState<EnrichedChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadChallenges = useCallback(async () => {
    if (!appUser?.userId) {
      setLoading(false);
      return;
    }

    try {
      const data = await getEnrichedCompletedChallenges(appUser.userId);
      setChallenges(data);
    } catch (error) {
      console.error("Erreur chargement défis complétés:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [appUser?.userId]);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const onRefresh = () => {
    setRefreshing(true);
    loadChallenges();
  };

  // Calculer les stats
  const totalChallenges = challenges.length;
  const successfulChallenges = challenges.filter(c => c.pointsObtained > 0).length;
  const totalPoints = challenges.reduce((sum, c) => sum + c.pointsObtained, 0);

  const renderChallenge = ({ item, index }: { item: EnrichedChallenge; index: number }) => (
    <CompletedChallengeCard challenge={item} index={index} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="checkmark-done-circle-outline" size={64} color={COLORS.TEXT_MUTED} />
      <Text style={styles.emptyText}>Aucun défi complété</Text>
      <Text style={styles.emptySubtext}>
        Vos défis terminés apparaîtront ici
      </Text>
    </View>
  );

  return (
    <LinearGradient colors={[COLORS.BACKGROUND, '#1a1a2e']} style={styles.container}>
      <View style={styles.statsHeader}>
        <View style={styles.statHeaderItem}>
          <Text style={styles.statHeaderValue}>{totalChallenges}</Text>
          <Text style={styles.statHeaderLabel}>Complétés</Text>
        </View>
        <View style={styles.statHeaderDivider} />
        <View style={styles.statHeaderItem}>
          <Text style={[styles.statHeaderValue, styles.statHeaderValueSuccess]}>
            {successfulChallenges}
          </Text>
          <Text style={styles.statHeaderLabel}>Réussis</Text>
        </View>
        <View style={styles.statHeaderDivider} />
        <View style={styles.statHeaderItem}>
          <Text style={[
            styles.statHeaderValue,
            totalPoints >= 0 ? styles.statHeaderValueSuccess : styles.statHeaderValueDanger
          ]}>
            {totalPoints >= 0 ? "+" : ""}{totalPoints}
          </Text>
          <Text style={styles.statHeaderLabel}>Points</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Chargement des défis...</Text>
        </View>
      ) : (
        <FlatList
          data={challenges}
          renderItem={renderChallenge}
          keyExtractor={(item, index) => `${item.challenger}-${item.sequence}-${index}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.PRIMARY}
              colors={[COLORS.PRIMARY]}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.MD,
    backgroundColor: COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  statHeaderItem: {
    alignItems: "center",
    flex: 1,
  },
  statHeaderValue: {
    fontSize: FONT_SIZE.TITLE,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  statHeaderValueSuccess: {
    color: COLORS.SUCCESS,
  },
  statHeaderValueDanger: {
    color: COLORS.DANGER,
  },
  statHeaderLabel: {
    fontSize: FONT_SIZE.XS,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  statHeaderDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.BORDER,
  },
  listContent: {
    padding: SPACING.MD,
    paddingBottom: 100,
  },
  challengeCard: {
    marginBottom: SPACING.MD,
    borderRadius: BORDER_RADIUS.LG,
    overflow: "hidden",
    ...SHADOWS.MD,
  },
  challengeCardGradient: {
    padding: SPACING.MD,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.MD,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.MD,
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.FULL,
    alignItems: "center",
    justifyContent: "center",
  },
  statusIconSuccess: {
    backgroundColor: `${COLORS.SUCCESS}20`,
  },
  statusIconFail: {
    backgroundColor: `${COLORS.DANGER}20`,
  },
  challengeTitle: {
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  challengerPseudo: {
    fontSize: FONT_SIZE.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  resultBadge: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  resultBadgeSuccess: {
    backgroundColor: `${COLORS.SUCCESS}20`,
  },
  resultBadgeFail: {
    backgroundColor: `${COLORS.DANGER}20`,
  },
  resultBadgeText: {
    fontSize: FONT_SIZE.SM,
    fontWeight: FONT_WEIGHT.BOLD,
  },
  resultBadgeTextSuccess: {
    color: COLORS.SUCCESS,
  },
  resultBadgeTextFail: {
    color: COLORS.DANGER,
  },

  difficultyContainer: {
    marginBottom: SPACING.MD,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.SM,
  },

  progressContainer: {
    marginBottom: SPACING.MD,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.SM,
  },
  progressLabel: {
    fontSize: FONT_SIZE.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  progressValue: {
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.BOLD,
  },
  progressValueSuccess: {
    color: COLORS.SUCCESS,
  },
  progressValueDanger: {
    color: COLORS.DANGER,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.SURFACE_LIGHT,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },

  statsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: FONT_SIZE.XS,
    color: COLORS.TEXT_MUTED,
    marginBottom: SPACING.XS,
  },
  statValue: {
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  statValueSuccess: {
    color: COLORS.SUCCESS,
  },
  statValueDanger: {
    color: COLORS.DANGER,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.BORDER,
    marginHorizontal: SPACING.MD,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.MD,
  },
  loadingText: {
    fontSize: FONT_SIZE.MD,
    color: COLORS.TEXT_SECONDARY,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.XXL * 2,
  },
  emptyText: {
    fontSize: FONT_SIZE.XL,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.MD,
  },
  emptySubtext: {
    fontSize: FONT_SIZE.MD,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.XS,
    textAlign: "center",
  },
});
