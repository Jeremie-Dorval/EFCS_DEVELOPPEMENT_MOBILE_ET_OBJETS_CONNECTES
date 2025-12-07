import { useAuth } from "@/app/_context/AuthContext";
import { COLORS, GRADIENTS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from "@/app/_styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface MenuItemProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
  danger?: boolean;
}

const MenuItem = ({ icon, label, onPress, danger }: MenuItemProps) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Ionicons
      name={icon}
      size={22}
      color={danger ? COLORS.DANGER : COLORS.TEXT_PRIMARY}
    />
    <Text style={[styles.menuItemText, danger && styles.menuItemTextDanger]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default function HeaderActions() {
  const { isAuthenticated, appUser, avatarUri, logout } = useAuth();
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  const navigateToHome = () => {
    router.push("/");
  };

  const navigateTo = (route: string) => {
    setMenuVisible(false);
    router.push(route as any);
  };

  const handleLogout = async () => {
    setMenuVisible(false);
    await logout();
    router.replace("/login");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.homeButton}
        onPress={navigateToHome}
        activeOpacity={0.7}
      >
        <Ionicons name="home" size={24} color={COLORS.TEXT_PRIMARY} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.avatarButton}
        onPress={() => setMenuVisible(true)}
        activeOpacity={0.8}
      >
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
        ) : (
          <LinearGradient colors={GRADIENTS.BUTTON} style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {appUser?.pseudonyme?.charAt(0).toUpperCase() || "?"}
            </Text>
          </LinearGradient>
        )}
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.menuAvatarImage} />
              ) : (
                <LinearGradient colors={GRADIENTS.BUTTON} style={styles.menuAvatarPlaceholder}>
                  <Text style={styles.menuAvatarInitial}>
                    {appUser?.pseudonyme?.charAt(0).toUpperCase() || "?"}
                  </Text>
                </LinearGradient>
              )}
              <View style={styles.menuHeaderInfo}>
                <Text style={styles.menuHeaderName}>{appUser?.pseudonyme || "Utilisateur"}</Text>
                <Text style={styles.menuHeaderPoints}>{appUser?.points || 0} points</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <MenuItem
              icon="mail-unread"
              label="Défis reçus"
              onPress={() => navigateTo("/challenges-received")}
            />
            <MenuItem
              icon="checkmark-done-circle"
              label="Défis complétés"
              onPress={() => navigateTo("/challenges-completed")}
            />
            <MenuItem
              icon="trophy"
              label="Classement"
              onPress={() => navigateTo("/leaderboard")}
            />
            <MenuItem
              icon="person-circle"
              label="Mon profil"
              onPress={() => navigateTo("/profil")}
            />

            <View style={styles.separator} />

            <MenuItem
              icon="log-out"
              label="Déconnexion"
              onPress={handleLogout}
              danger
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.MD,
  },
  homeButton: {
    padding: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
    backgroundColor: `${COLORS.PRIMARY}20`,
  },
  avatarButton: {
    borderRadius: BORDER_RADIUS.FULL,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    ...SHADOWS.SM,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.FULL,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.FULL,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.BOLD,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.OVERLAY,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 80,
    paddingRight: SPACING.MD,
  },
  menuContainer: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.SM,
    minWidth: 220,
    ...SHADOWS.LG,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.MD,
    gap: SPACING.MD,
  },
  menuAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.FULL,
  },
  menuAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.FULL,
    alignItems: "center",
    justifyContent: "center",
  },
  menuAvatarInitial: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONT_SIZE.XXL,
    fontWeight: FONT_WEIGHT.BOLD,
  },
  menuHeaderInfo: {
    flex: 1,
  },
  menuHeaderName: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.BOLD,
  },
  menuHeaderPoints: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZE.SM,
    fontWeight: FONT_WEIGHT.MEDIUM,
  },

  separator: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginVertical: SPACING.SM,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.MD,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
  },
  menuItemText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONT_SIZE.MD,
    fontWeight: FONT_WEIGHT.MEDIUM,
  },
  menuItemTextDanger: {
    color: COLORS.DANGER,
  },
});
