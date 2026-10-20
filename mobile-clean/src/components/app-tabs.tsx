import { Tabs } from 'expo-router';
import { Text } from 'react-native';

const COLORS = {
  background: '#05091A',
  border: '#252E45',
  active: '#FFD21F',
  inactive: '#9CA8C2',
};

const TAB_ICONS: Record<string, string> = {
  index: '🏠',
  reels: '🎬',
  challenges: '🌈',
  messages: '💬',
  profile: '👤',
};

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,

        sceneStyle: {
          backgroundColor: COLORS.background,
        },

        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 76,
          paddingTop: 8,
          paddingBottom: 10,
          elevation: 0,
        },

        tabBarActiveTintColor: COLORS.active,
        tabBarInactiveTintColor: COLORS.inactive,

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 3,
        },

        tabBarIcon: ({ focused }) => (
          <Text
            style={{
              fontSize: 22,
              opacity: focused ? 1 : 0.72,
              transform: [{ scale: focused ? 1.08 : 1 }],
            }}
          >
            {TAB_ICONS[route.name] ?? '•'}
          </Text>
        ),

        tabBarHideOnKeyboard: true,
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
        }}
      />

      <Tabs.Screen
        name="reels"
        options={{
          title: 'Smile Reels',
        }}
      />

      <Tabs.Screen
        name="challenges"
        options={{
          title: 'Challenges',
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
