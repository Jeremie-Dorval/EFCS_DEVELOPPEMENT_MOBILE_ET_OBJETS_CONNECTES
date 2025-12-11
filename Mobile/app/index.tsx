import { useAuth } from "@/app/_context/AuthContext";
import { getAllUsers } from "@/app/_services/firestore";
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
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderActions from "@/app/_components/HeaderActions";

interface UserCardProps {
  user: User;
  currentUserId: string | undefined;
  isAuthenticated: boolean;
  onChallenge: (user: User) => void;
}

const UserCard = ({ user, currentUserId, isAuthenticated, onChallenge }: UserCardProps) => {
  const isCurrentUser = user.userId === currentUserId;

  return (
    <View style={styles.userCard}>
      <LinearGradient
        colors={GRADIENTS.CARD}
        style={styles.userCardGradient}
      >
        <LinearGradient
          colors={isCurrentUser ? GRADIENTS.BUTTON_SUCCESS : GRADIENTS.BUTTON}
          style={styles.userAvatar}
        >
          <Text style={styles.userAvatarText}>
            {user.pseudonyme?.charAt(0).toUpperCase() || "?"}
          </Text>
        </LinearGradient>

        <View style={styles.userInfo}>
          <Text style={styles.userPseudo}>
            {user.pseudonyme}
            {isCurrentUser && <Text style={styles.youTag}> (vous)</Text>}
          </Text>
          <Text style={styles.userName}>
            {user.firstName} {user.lastName}
          </Text>
          <View style={styles.userStats}>
            <Ionicons name="trophy" size={14} color={COLORS.WARNING} />
            <Text style={styles.userPoints}>{user.points} pts</Text>
          </View>
        </View>

        {isAuthenticated && !isCurrentUser && (
          <TouchableOpacity
            style={styles.challengeButton}
            onPress={() => onChallenge(user)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={GRADIENTS.BUTTON}
              style={styles.challengeButtonGradient}
            >
              <Ionicons name="flash" size={18} color={COLORS.TEXT_PRIMARY} />
              <Text style={styles.challengeButtonText}>Défier</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  );
};

export default function Home() {
  const { isAuthenticated, appUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const allUsers = await getAllUsers();
      const sorted = allUsers.sort((a, b) => b.points - a.points);
      setUsers(sorted);
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
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

  const renderUser = ({ item }: { item: User }) => (
    <UserCard
      user={item}
      currentUserId={appUser?.userId}
      isAuthenticated={isAuthenticated === true}
      onChallenge={handleChallenge}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color={COLORS.TEXT_MUTED} />
      <Text style={styles.emptyText}>Aucun utilisateur inscrit</Text>
      <Text style={styles.emptySubtext}>Soyez le premier à rejoindre le jeu!</Text>
    </View>
  );

  return (
    <LinearGradient colors={[COLORS.BACKGROUND, '#1a1a2e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <LinearGradient colors={GRADIENTS.BUTTON} style={styles.headerIcon}>
              <Ionicons name="game-controller" size={28} color={COLORS.TEXT_PRIMARY} />
            </LinearGradient>
            <View>
              <Text style={styles.headerTitle}>Jeu de Mémoire</Text>
              <Text style={styles.headerSubtitle}>{users.length} joueurs inscrits</Text>
            </View>
          </View>
          <HeaderActions />
        </View>

        {!isAuthenticated && (
          <View style={styles.loginBanner}>
            <Ionicons name="information-circle" size={20} color={COLORS.PRIMARY} />
            <Text style={styles.loginBannerText}>
              Connectez-vous pour défier les autres joueurs
            </Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            <Text style={styles.loadingText}>Chargement des joueurs...</Text>
          </View>
        ) : (
          <FlatList
            data={users}
            renderItem={renderUser}
            keyExtractor={(item) => item.userId}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
    paddingTop: SPACING.LG,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.MD,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.MD,
  },
  headerTitle: {
    fontSize: FONT_SIZE.XXL,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  loginBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${COLORS.PRIMARY}15`,
    marginHorizontal: SPACING.MD,
    marginBottom: SPACING.MD,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    gap: SPACING.SM,
  },
  loginBannerText: {
    flex: 1,
    fontSize: FONT_SIZE.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  loginLink: {
    fontSize: FONT_SIZE.SM,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.PRIMARY,
  },
  listContent: {
    padding: SPACING.MD,
    paddingBottom: 100,
  },
  userCard: {
    marginBottom: SPACING.MD,
    borderRadius: BORDER_RADIUS.LG,
    overflow: "hidden",
    ...SHADOWS.MD,
  },
  userCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.MD,
    gap: SPACING.MD,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.FULL,
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: {
    fontSize: FONT_SIZE.XXL,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  userInfo: {
    flex: 1,
  },
  userPseudo: {
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  youTag: {
    fontSize: FONT_SIZE.SM,
    fontWeight: FONT_WEIGHT.MEDIUM,
    color: COLORS.SUCCESS,
  },
  userName: {
    fontSize: FONT_SIZE.SM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  userStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.XS,
    marginTop: SPACING.XS,
  },
  userPoints: {
    fontSize: FONT_SIZE.SM,
    fontWeight: FONT_WEIGHT.MEDIUM,
    color: COLORS.WARNING,
  },
  challengeButton: {
    borderRadius: BORDER_RADIUS.MD,
    overflow: "hidden",
  },
  challengeButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.XS,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
  },
  challengeButtonText: {
    fontSize: FONT_SIZE.SM,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
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
  },
});
