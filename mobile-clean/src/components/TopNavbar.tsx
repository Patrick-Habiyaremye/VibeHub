import { useRouter } from 'expo-router';
import {
  Bell,
  Plus,
  Search,
} from 'lucide-react-native';
import type { ReactNode } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  background: '#0D1428',
  border: '#252E45',
  yellow: '#FFD21F',
  white: '#FFFFFF',
  muted: '#C4CCDE',
  notification: '#FF354F',
  avatarBackground: '#24213F',
};

export default function TopNavbar() {
  const router = useRouter();

  const handleSearch = () => {
    router.navigate('/explore');
  };

  const handleNotifications = () => {
    Alert.alert(
      'Notifications',
      'Notifications will be connected to your VibeHub notification service.',
    );
  };

  const handleCreate = () => {
    Alert.alert(
      'Create a Vibe',
      'The mobile create screen has not been implemented yet.',
    );
  };

  const handleProfile = () => {
    router.navigate('/profile');
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Brand: reuse the actual VibeHub logo */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="VibeHub home"
          onPress={() => router.navigate('/')}
          style={({ pressed }) => [
            styles.brand,
            pressed && styles.pressed,
          ]}
        >
          <Image
            source={require('../../assets/images/kesh.png')}
            resizeMode="contain"
            style={styles.logoImage}
            accessibilityLabel="VibeHub logo"
          />

          <Text numberOfLines={1} style={styles.brandName}>
            VibeHub
          </Text>
        </Pressable>

        {/* Header actions */}
        <View style={styles.actions}>
          <HeaderAction
            label="Search VibeHub"
            onPress={handleSearch}
          >
            <Search
              size={22}
              color={COLORS.muted}
              strokeWidth={2}
            />
          </HeaderAction>

          <HeaderAction
            label="Notifications"
            onPress={handleNotifications}
          >
            <Bell
              size={22}
              color={COLORS.muted}
              strokeWidth={2}
            />
          </HeaderAction>

          <HeaderAction
            label="Create a Vibe"
            onPress={handleCreate}
          >
            <Plus
              size={24}
              color={COLORS.yellow}
              strokeWidth={2.5}
            />
          </HeaderAction>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            hitSlop={8}
            onPress={handleProfile}
            style={({ pressed }) => [
              styles.profileButton,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitial}>U</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

type HeaderActionProps = {
  label: string;
  onPress: () => void;
  children: ReactNode;
};

function HeaderAction({
  label,
  onPress,
  children,
}: HeaderActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        pressed && styles.pressed,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
  },

  container: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: COLORS.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    gap: 8,
  },

  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
    minWidth: 0,
  },

  logoImage: {
    width: 39,
    height: 39,
  },

  brandName: {
    color: COLORS.yellow,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
    flexShrink: 1,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 0,
  },

  actionButton: {
    width: 36,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },

  profileButton: {
    marginLeft: 2,
    padding: 2,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.yellow,
  },

  profileAvatar: {
    width: 30,
    height: 30,
    borderRadius: 16,
    backgroundColor: COLORS.avatarBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileInitial: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.65,
  },
});