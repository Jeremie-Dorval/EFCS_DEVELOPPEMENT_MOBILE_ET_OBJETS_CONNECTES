// Classement des joueurs par points - Cliquer sur un joueur pour le défier
import { useAuth } from "@/app/_context/AuthContext";
import { getLeaderboard, subscribeToLeaderboard } from "@/app/_services/firestore";
import { COLORS, GRADIENTS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from "@/app/_styles/theme";
import { User } from "@/app/_types/game";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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

interface LeaderboardItemProps {
  user: User;
  rank: number;
  isCurrentUser: boolean;
  onChallenge: (user: User) => void;
}

const LeaderboardItem = ({ user, rank, isCurrentUser, onChallenge }: LeaderboardItemProps) => {
  const isTopThree = rank <= 3;

  const getRankColor = () => {
    switch (rank) {
      case 1: return "#FFD700"; // Or
      case 2: return "#C0C0C0"; // Argent
      case 3: return "#CD7F32"; // Bronze
      default: return COLORS.TEXT_SECONDARY;
    }
  };

  const getRankIcon = () => { // demander a claude code les icones ionicons pour les 3 premiers
    switch (rank) {
      case 1: return "trophy";
      case 2: return "medal";
      case 3: return "ribbon";
      default: return null;
    }
  };

  return (
    <View style={[
      styles.leaderboardItem,
      isCurrentUser && styles.leaderboardItemCurrent
    ]}>
      <LinearGradient
        colors={isCurrentUser ? ['#1E293B', '#2D3A5C'] : GRADIENTS.CARD}
        style={styles.leaderboardItemGradient}
      >
        <View style={[styles.rankContainer, isTopThree && { backgroundColor: `${getRankColor()}20` }]}>
          {getRankIcon() ? (
            <Ionicons name={getRankIcon() as any} size={20} color={getRankColor()} />
          ) : (
            <Text style={[styles.rankText, { color: getRankColor() }]}>{rank}</Text>
          )}
        </View>

        <View style={styles.userContainer}>
          <LinearGradient
            colors={isCurrentUser ? GRADIENTS.BUTTON_SUCCESS : GRADIENTS.BUTTON}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>
              {user.pseudonyme?.charAt(0).toUpperCase() || "?"}
            </Text>
          </LinearGradient>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user.pseudonyme}
              {isCurrentUser && <Text style={styles.youTag}> (vous)</Text>}
            </Text>
            <Text style={styles.userFullName}>
              {user.firstName} {user.lastName}
            </Text>
          </View>
        </View>

        <View style={styles.pointsContainer}>
          <Text style={styles.pointsValue}>{user.points}</Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>

        {!isCurrentUser && (
          <TouchableOpacity
            style={styles.challengeButton}
            onPress={() => onChallenge(user)}
            activeOpacity={0.7}
          >
            <Ionicons name="flash" size={18} color={COLORS.PRIMARY} />
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  );
};

export default function Leaderboard() {
  const { appUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLeaderboard = useCallback(async () => {
    try {
      const data = await getLeaderboard(50);
      setUsers(data);
    } catch (error) {
      console.error("Erreur chargement classement:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  useEffect(() => {
    const unsubscribe = subscribeToLeaderboard((data) => {
      setUsers(data);
    });

    return () => unsubscribe();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadLeaderboard();
  };

  const handleChallenge = (user: User) => {
    router.push({
      pathname: "/challenge/create",
      params: {
        targetUserId: user.userId,
        targetUserName: `${user.firstName} ${user.lastName}`,
        targetUserPseudo: user.pseudonyme,
      },
    } as any);
  };

  const currentUserRank = users.findIndex(u => u.userId === appUser?.userId) + 1;

  const renderItem = ({ item, index }: { item: User; index: number }) => (
    <LeaderboardItem
      user={item}
      rank={index + 1}
      isCurrentUser={item.userId === appUser?.userId}
      onChallenge={handleChallenge}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerCard}>
      <LinearGradient colors={GRADIENTS.BUTTON} style={styles.headerGradient}>
        <Ionicons name="trophy" size={32} color={COLORS.TEXT_PRIMARY} />
        <Text style={styles.headerTitle}>Classement</Text>
        {currentUserRank > 0 && (
          <Text style={styles.headerSubtitle}>
            Votre position: #{currentUserRank}
          </Text>
        )}
      </LinearGradient>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="podium-outline" size={64} color={COLORS.TEXT_MUTED} />
      <Text style={styles.emptyText}>Classement vide</Text>
      <Text style={styles.emptySubtext}>
        Soyez le premier à marquer des points!
      </Text>
    </View>
  );

  return (
    <LinearGradient colors={[COLORS.BACKGROUND, '#1a1a2e']} style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Chargement du classement...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.PRIMARY}
              colors={[COLORS.PRIMARY]}
            />
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    marginBottom: SPACING.MD,
    borderRadius: BORDER_RADIUS.LG,
    overflow: "hidden",
    ...SHADOWS.MD,
  },
  headerGradient: {
    alignItems: "center",
    paddingVertical: SPACING.LG,
    gap: SPACING.SM,
  },
  headerTitle: {
    fontSize: FONT_SIZE.TITLE,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.MD,
    color: COLORS.TEXT_PRIMARY,
    opacity: 0.9,
  },
  listContent: {
    padding: SPACING.MD,
    paddingBottom: 100,
  },
  leaderboardItem: {
    marginBottom: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
    overflow: "hidden",
    ...SHADOWS.SM,
  },
  leaderboardItemCurrent: {
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  leaderboardItemGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.MD,
    gap: SPACING.MD,
  },
  rankContainer: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.SM,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.BACKGROUND,
  },
  rankText: {
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.BOLD,
  },
  userContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.MD,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.FULL,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZE.MD,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  youTag: {
    fontSize: FONT_SIZE.SM,
    fontWeight: FONT_WEIGHT.MEDIUM,
    color: COLORS.SUCCESS,
  },
  userFullName: {
    fontSize: FONT_SIZE.XS,
    color: COLORS.TEXT_SECONDARY,
  },
  pointsContainer: {
    alignItems: "center",
  },
  pointsValue: {
    fontSize: FONT_SIZE.XL,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.WARNING,
  },
  pointsLabel: {
    fontSize: FONT_SIZE.XS,
    color: COLORS.TEXT_MUTED,
  },
  challengeButton: {
    padding: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
    backgroundColor: `${COLORS.PRIMARY}20`,
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
