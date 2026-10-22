import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  getSmileMoments,
  groupMomentsByUser,
  type MomentGroup,
} from './momentsApi';

const COLORS = {
  primary: '#6558E8',
  primaryLight: '#EEECFF',
  text: '#202139',
  muted: '#777A91',
  border: '#E9EAF2',
  surface: '#FFFFFF',
};

export default function SmileMomentsRow() {
  const [groups, setGroups] = useState<MomentGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadMoments = useCallback(async () => {
    setLoadError(null);

    try {
      const moments = await getSmileMoments();
      setGroups(groupMomentsByUser(moments));
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'Could not load Smile Moments.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMoments();
  }, [loadMoments]);

  const openMoment = (group: MomentGroup) => {
    const moment = group.latestMoment;
    const caption = moment.caption?.trim();

    Alert.alert(
      group.username,
      caption || `Smile Moment · ${moment.media_type || 'moment'}`,
      [{ text: 'Close' }],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <View>
          <Text style={styles.heading}>Smile Moments</Text>
          <Text style={styles.subtitle}>
            Little moments, shared together
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => void loadMoments()}
          style={styles.refreshButton}
        >
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.status}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.statusText}>Loading moments…</Text>
        </View>
      ) : loadError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{loadError}</Text>
          <Pressable onPress={() => void loadMoments()}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.emptyBox}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyEmoji}>☺</Text>
          </View>
          <View style={styles.emptyCopy}>
            <Text style={styles.emptyTitle}>Your community starts here</Text>
            <Text style={styles.emptyText}>
              No active moments yet. Check back when your community shares.
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {groups.map((group) => {
            const latest = group.latestMoment;
            const isTextMoment =
              latest.media_type?.toLowerCase() === 'text';

            return (
              <Pressable
                key={group.userId}
                accessibilityRole="button"
                accessibilityLabel={`Open ${group.username}'s latest Smile Moment`}
                onPress={() => openMoment(group)}
                style={styles.item}
              >
                <View style={styles.ring}>
                  {latest.media_url && !isTextMoment ? (
                    <Image
                      source={{ uri: latest.media_url }}
                      style={styles.avatarImage}
                    />
                  ) : group.avatarUrl ? (
                    <Image
                      source={{ uri: group.avatarUrl }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarInitial}>
                        {group.username.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}

                  {group.moments.length > 1 ? (
                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>
                        {group.moments.length}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <Text numberOfLines={1} style={styles.username}>
                  {group.username}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    paddingVertical: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headingRow: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heading: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 3,
  },
  refreshButton: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  refreshText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  list: {
    paddingHorizontal: 14,
    gap: 16,
  },
  item: {
    width: 76,
    alignItems: 'center',
  },
  ring: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 3,
    borderColor: COLORS.primary,
    padding: 3,
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: COLORS.primaryLight,
  },
  avatarFallback: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 23,
    fontWeight: '800',
    color: COLORS.primary,
  },
  countBadge: {
    position: 'absolute',
    right: -4,
    bottom: -3,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  username: {
    marginTop: 7,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    maxWidth: 76,
  },
  status: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  statusText: {
    color: COLORS.muted,
    fontSize: 13,
  },
  errorBox: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  errorText: {
    color: '#C43D4D',
    fontSize: 13,
  },
  retryText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  emptyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    minHeight: 78,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEmoji: {
    color: COLORS.primary,
    fontSize: 27,
    fontWeight: '700',
  },
  emptyCopy: {
    flex: 1,
    gap: 4,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
  },
});