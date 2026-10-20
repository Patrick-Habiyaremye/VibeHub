
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ flex: 1, paddingBottom: 76 }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="feed" href="/" asChild>
            <TabButton>Feed</TabButton>
          </TabTrigger>
          <TabTrigger name="reels" href="/reels" asChild>
            <TabButton>Smile Reels</TabButton>
          </TabTrigger>
          <TabTrigger name="challenges" href="/challenges" asChild>
            <TabButton>Challenges</TabButton>
          </TabTrigger>
          <TabTrigger name="messages" href="/messages" asChild>
            <TabButton>Messages</TabButton>
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton>Profile</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

function TabButton({
  children,
  isFocused,
  ...props
}: TabTriggerSlotProps) {
  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      style={({ pressed }) => [
        styles.tabButton,
        isFocused && styles.selectedTab,
        pressed && styles.pressed,
      ]}
    >
      <ThemedView
        type="backgroundElement"
        style={styles.tabButtonInner}
      >
        <ThemedText
          type="small"
          style={isFocused ? styles.selectedText : styles.tabText}
        >
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        {props.children}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    backgroundColor: Colors.light.background,
  },
  innerContainer: {
    width: '100%',
    maxWidth: MaxContentWidth,
    borderRadius: 18,
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
  },
  tabButton: {
    flex: 1,
    minWidth: 0,
    borderRadius: 13,
    overflow: 'hidden',
  },
  tabButtonInner: {
    minHeight: 46,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  selectedTab: {
    backgroundColor: '#EEECFF',
  },
  tabText: {
    fontSize: 10,
    textAlign: 'center',
  },
  selectedText: {
    color: '#6558E8',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
