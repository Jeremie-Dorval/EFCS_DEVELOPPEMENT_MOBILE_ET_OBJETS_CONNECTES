import DifficultyBar from "@/app/_components/DifficultyBar";
import { useAuth } from "@/app/_context/AuthContext";
import { getEnrichedPendingChallenges, subscribeToChallenges, acceptChallenge, Challenge, EnrichedChallenge } from "@/app/_services/firestore";
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
  TouchableOpacity,
  View,
} from "react-native";

interface ChallengeCardProps {
  challenge: EnrichedChallenge;
  index: number;
  onAccept: () => void;
  isAccepting: boolean;
}

const ChallengeCard = ({ challenge, index, onAccept, isAccepting }: ChallengeCardProps) => {
  const isPending = challenge.status === "pending";
  const isAccepted = challenge.status === "accepted";

  return (
    <View style={styles.challengeCard}>
      <LinearGradient colors={GRADIENTS.CARD} style={styles.challengeCardGradient}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <LinearGradient colors={GRADIENTS.BUTTON} style={styles.challengerAvatar}>
              <Text style={styles.challengerAvatarText}>
                {challenge.challengerPseudo?.charAt(0).toUpperCase() || "?"}
              </Text>
            </LinearGradient>
            <View>
              <Text style={styles.challengerName}>Défi #{index + 1}</Text>
              <Text style={styles.challengerPseudo}>de {challenge.challengerPseudo}</Text>
            </View>
          </View>
          {isPending && (
            <View style={styles.statusBadge}>
              <Ionicons name="hourglass" size={14} color={COLORS.WARNING} />
              <Text style={styles.statusBadgeText}>En attente</Text>
            </View>
          )}
          {isAccepted && (
            <View style={[styles.statusBadge, styles.statusBadgeAccepted]}>
              <ActivityIndicator size="small" color={COLORS.PRIMARY} />
              <Text style={[styles.statusBadgeText, styles.statusBadgeTextAccepted]}>En cours</Text>
            </View>
          )}
        </View>

        <View style={styles.difficultyContainer}>
          <DifficultyBar
            difficulty={challenge.difficulty}
            sequenceLength={challenge.sequenceLength}
            size="medium"
            showLabel={true}
          />
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRowSingle}>
            <Ionicons name="layers" size={20} color={COLORS.PRIMARY} />
            <Text style={styles.infoValue}>{challenge.sequenceLength}</Text>
            <Text style={styles.infoLabel}>coups à reproduire</Text>
          </View>

          <View style={styles.transferInfo}>
            <Ionicons name="swap-horizontal" size={16} color={COLORS.TEXT_MUTED} />
            <Text style={styles.transferInfoText}>
              Les points sont transférés entre joueurs
            </Text>
          </View>

          <View style={styles.pointsSection}>
            <Text style={[styles.pointsSectionTitle, styles.successTitle]}>Si vous réussissez :</Text>
            <View style={styles.pointsRow}>
              <View style={styles.pointsItem}>
                <Text style={styles.pointsPlayerLabel}>Vous</Text>
                <Text style={[styles.pointsValue, styles.infoValueSuccess]}>
                  +{challenge.potentialPoints.maxWin}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color={COLORS.TEXT_MUTED} />
              <View style={styles.pointsItem}>
                <Text style={styles.pointsPlayerLabel}>{challenge.challengerPseudo}</Text>
                <Text style={[styles.pointsValue, styles.infoValueDanger]}>
                  -{challenge.potentialPoints.challengerMaxLose}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.pointsSection}>
            <Text style={[styles.pointsSectionTitle, styles.dangerTitle]}>Si vous échouez :</Text>
            <View style={styles.pointsRow}>
              <View style={styles.pointsItem}>
                <Text style={styles.pointsPlayerLabel}>Vous</Text>
                <Text style={[styles.pointsValue, styles.infoValueDanger]}>
                  -{challenge.potentialPoints.maxLose}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color={COLORS.TEXT_MUTED} />
              <View style={styles.pointsItem}>
                <Text style={styles.pointsPlayerLabel}>{challenge.challengerPseudo}</Text>
                <Text style={[styles.pointsValue, styles.infoValueSuccess]}>
                  +{challenge.potentialPoints.challengerMaxWin}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {isPending && (
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={onAccept}
            disabled={isAccepting}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={GRADIENTS.BUTTON_SUCCESS}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.acceptButtonGradient}
            >
              {isAccepting ? (
                <ActivityIndicator size="small" color={COLORS.TEXT_PRIMARY} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.TEXT_PRIMARY} />
                  <Text style={styles.acceptButtonText}>Accepter le défi</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={styles.cardFooter}>
          <Ionicons name="information-circle" size={16} color={COLORS.TEXT_MUTED} />
          <Text style={styles.footerText}>
            {isAccepted
              ? "Jouez ce défi sur votre montage IoT"
              : "Acceptez puis jouez sur votre montage IoT"}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

export default function ChallengesReceived() {
  const { appUser } = useAuth();
  const [challenges, setChallenges] = useState<EnrichedChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingIndex, setAcceptingIndex] = useState<number | null>(null);

  const loadChallenges = useCallback(async () => {
    if (!appUser?.userId) {
      setLoading(false);
      return;
    }

    try {
      const data = await getEnrichedPendingChallenges(appUser.userId);
      setChallenges(data);
    } catch (error) {
      console.error("Erreur chargement défis:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [appUser?.userId]);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  useEffect(() => {
    if (!appUser?.userId) return;

    const unsubscribe = subscribeToChallenges(appUser.userId, async (allChallenges: Challenge[]) => {
      loadChallenges();
    });

    return () => unsubscribe();
  }, [appUser?.userId, loadChallenges]);

  const onRefresh = () => {
    setRefreshing(true);
    loadChallenges();
  };

  const handleAcceptChallenge = async (index: number) => {
    if (!appUser?.userId) return;

    setAcceptingIndex(index);
    try {
      const success = await acceptChallenge(appUser.userId, index);
      if (success) {
        console.log("Défi accepté avec succès");
      } else {
        console.error("Erreur lors de l'acceptation du défi");
      }
    } catch (error) {
      console.error("Erreur acceptChallenge:", error);
    } finally {
      setAcceptingIndex(null);
    }
  };

  const renderChallenge = ({ item, index }: { item: EnrichedChallenge; index: number }) => (
    <ChallengeCard
      challenge={item}
      index={index}
      onAccept={() => handleAcceptChallenge(index)}
      isAccepting={acceptingIndex === index}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="mail-open-outline" size={64} color={COLORS.TEXT_MUTED} />
      <Text style={styles.emptyText}>Aucun défi en attente</Text>
      <Text style={styles.emptySubtext}>
        Attendez qu'un autre joueur vous envoie un défi
      </Text>
    </View>
  );

  return (
    <LinearGradient colors={[COLORS.BACKGROUND, '#1a1a2e']} style={styles.container}>
      <View style={styles.statsHeader}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{challenges.length}</Text>
          <Text style={styles.statLabel}>Défis en attente</Text>
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
          keyExtractor={(item, index) => `${item.challenger}-${index}`}
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
    justifyContent: "center",
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.MD,
    backgroundColor: COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: FONT_SIZE.TITLE,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.PRIMARY,
  },
  statLabel: {
    fontSize: FONT_SIZE.SM,
    color: COLORS.TEXT_SECONDARY,
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
  challengerAvatar: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.FULL,
    alignItems: "center",
    justifyContent: "center",
  },
  challengerAvatarText: {
    fontSize: FONT_SIZE.XL,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  challengerName: {
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  challengerPseudo: {
    fontSize: FONT_SIZE.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.XS,
    backgroundColor: `${COLORS.WARNING}20`,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  statusBadgeText: {
    fontSize: FONT_SIZE.XS,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.WARNING,
  },
  statusBadgeAccepted: {
    backgroundColor: `${COLORS.PRIMARY}20`,
  },
  statusBadgeTextAccepted: {
    color: COLORS.PRIMARY,
  },

  difficultyContainer: {
    marginBottom: SPACING.MD,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.SM,
  },

  cardBody: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  infoRowSingle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.SM,
    marginBottom: SPACING.MD,
    paddingBottom: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  infoItem: {
    alignItems: "center",
    gap: SPACING.XS,
  },
  infoValue: {
    fontSize: FONT_SIZE.XL,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  infoValueSuccess: {
    color: COLORS.SUCCESS,
  },
  infoValueDanger: {
    color: COLORS.DANGER,
  },
  infoLabel: {
    fontSize: FONT_SIZE.XS,
    color: COLORS.TEXT_MUTED,
  },
  pointsSection: {
    marginTop: SPACING.SM,
  },
  pointsSectionTitle: {
    fontSize: FONT_SIZE.SM,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XS,
  },
  pointsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  pointsItem: {
    alignItems: "center",
    gap: 2,
  },
  pointsValue: {
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.BOLD,
  },
  pointsLabel: {
    fontSize: FONT_SIZE.XS,
    color: COLORS.TEXT_MUTED,
  },
  pointsPlayerLabel: {
    fontSize: FONT_SIZE.XS,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 2,
  },
  successTitle: {
    color: COLORS.SUCCESS,
  },
  dangerTitle: {
    color: COLORS.DANGER,
  },
  transferInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.XS,
    marginBottom: SPACING.MD,
    paddingVertical: SPACING.XS,
    backgroundColor: `${COLORS.PRIMARY}10`,
    borderRadius: BORDER_RADIUS.SM,
  },
  transferInfoText: {
    fontSize: FONT_SIZE.XS,
    color: COLORS.TEXT_MUTED,
    fontStyle: "italic",
  },
  acceptButton: {
    marginBottom: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    overflow: "hidden",
  },
  acceptButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.SM,
    paddingVertical: SPACING.MD,
  },
  acceptButtonText: {
    fontSize: FONT_SIZE.MD,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.SM,
  },
  footerText: {
    fontSize: FONT_SIZE.SM,
    color: COLORS.TEXT_MUTED,
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
