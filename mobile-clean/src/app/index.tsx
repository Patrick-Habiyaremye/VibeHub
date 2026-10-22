import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import TopNavbar from '../components/TopNavbar';
import SmileMomentsRow from '../features/moments/SmileMomentsRow';
import {
  getFeedPosts,
  type FeedPost,
} from '../features/feed/feedApi';
import { supabase } from '../lib/supabase';

const COLORS = {
  background: '#05091A',
  header: '#0D1428',
  surface: '#0E1529',
  surfaceRaised: '#151D33',
  primary: '#FFD21F',
  pink: '#F33BA8',
  purple: '#8D61D6',
  blue: '#328BCB',
  text: '#FFFFFF',
  muted: '#9CA8C2',
  border: '#252E45',
  green: '#36D399',
  error: '#FF6677',
};

type PostMedia = {
  kind?: string;
  url?: string;
  path?: string;
  type?: string;
};

export default function HomeScreen() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const result = await getFeedPosts();
      setPosts(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while loading the feed.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const getMediaUrl = (media: PostMedia | null): string | null => {
    if (!media) return null;

    if (media.url) return media.url;

    if (media.path) {
      const { data } = supabase.storage
        .from('posts')
        .getPublicUrl(media.path);

      return data.publicUrl;
    }

    return null;
  };

  const formatPostDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Recently';
    }

    return parsedDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year:
        parsedDate.getFullYear() === new Date().getFullYear()
          ? undefined
          : 'numeric',
    });
  };

  const renderPost = (post: FeedPost) => {
    const profile = Array.isArray(post.profiles)
      ? post.profiles[0]
      : post.profiles;

    const username = profile?.username || 'VibeHub member';
    const media = post.media as PostMedia | null;
    const mediaKind = (media?.kind || media?.type || '').toLowerCase();
    const mediaUrl = getMediaUrl(media);

    const isQuote = mediaKind === 'quote';
    const isVideo = mediaKind === 'video';
    const avatarUrl = profile?.avatar_url;

    return (
      <View key={post.id} style={styles.postCard}>
        {/* Author information */}
        <View style={styles.postHeader}>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.postAvatarImage}
              accessibilityLabel={`${username}'s profile picture`}
            />
          ) : (
            <View style={styles.postAvatar}>
              <Text style={styles.postAvatarText}>
                {username.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.postAuthor}>
            <Text style={styles.authorName} numberOfLines={1}>
              {username}
            </Text>
            <Text style={styles.postTime}>
              {formatPostDate(post.created_at)}
            </Text>
          </View>

          <View style={styles.memberBadge}>
            <Text style={styles.memberBadgeText}>VIBE</Text>
          </View>
        </View>

        {/* Post content */}
        {isQuote ? (
          <View style={styles.quoteCard}>
            <View style={styles.quoteAccent} />
            <View style={styles.quoteInner}>
              <Text style={styles.quoteEyebrow}>
                A THOUGHT TO SHARE
              </Text>
              <Text style={styles.quoteMark}>“</Text>
              <Text style={styles.quoteText}>
                {post.content || 'A thought worth sharing.'}
              </Text>
              <View style={styles.quoteFooter}>
                <View style={styles.quoteFooterDot} />
                <Text style={styles.quoteCaption}>
                  KEEP GROWING · KEEP CONNECTING
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <>
            {post.content ? (
              <Text style={styles.postContent}>
                {post.content}
              </Text>
            ) : null}

            {mediaUrl && !isVideo ? (
              <Image
                source={{ uri: mediaUrl }}
                style={styles.postMedia}
                resizeMode="cover"
                accessibilityLabel="Post image"
              />
            ) : null}

            {isVideo ? (
              <View style={styles.videoPlaceholder}>
                <View style={styles.videoPlayButton}>
                  <Text style={styles.videoIcon}>▶</Text>
                </View>
                <Text style={styles.videoText}>Video moment</Text>
                <Text style={styles.videoHint}>
                  Video playback will be added in a later step.
                </Text>
              </View>
            ) : null}
          </>
        )}

        {/* Support summary */}
        <View style={styles.postFooter}>
          <View style={styles.reactionSummary}>
            <View style={styles.emojiBubble}>
              <Text style={styles.reactionEmoji}>😊</Text>
            </View>
            <View style={styles.emojiBubble}>
              <Text style={styles.reactionEmoji}>💛</Text>
            </View>
            <Text style={styles.reactionCount}>
              Send some good vibes
            </Text>
          </View>
        </View>

        <View style={styles.postDivider} />

        {/* These actions are visual until reaction/comment/share logic is connected. */}
        <View style={styles.postActions}>
          <Pressable
            accessibilityRole="button"
            style={styles.postActionButton}
            onPress={() =>
              Alert.alert(
                'Support this post',
                'Post reactions will be connected in a later step.',
              )
            }
          >
            <Text style={styles.postActionIcon}>♡</Text>
            <Text style={styles.postAction}>Support</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            style={styles.postActionButton}
            onPress={() =>
              Alert.alert(
                'Comments',
                'Comments will be connected in a later step.',
              )
            }
          >
            <Text style={styles.postActionIcon}>▢</Text>
            <Text style={styles.postAction}>Comment</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            style={styles.postActionButton}
            onPress={() =>
              Alert.alert(
                'Share',
                'Post sharing will be connected in a later step.',
              )
            }
          >
            <Text style={styles.postActionIcon}>↗</Text>
            <Text style={styles.postAction}>Share</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />

      {/* Fixed header: it does not scroll with the feed. */}
      <View style={styles.fixedHeader}>
        <TopNavbar />
      </View>

      {/* Scrollable content starts underneath the header. */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadPosts(true)}
            tintColor={COLORS.primary}
            colors={[COLORS.pink, COLORS.primary]}
            progressBackgroundColor={COLORS.surfaceRaised}
          />
        }
      >
        {/* Smile Moments */}
        <View style={styles.momentsSection}>
          <View style={styles.sectionHeadingRow}>
            <View>
              <Text style={styles.sectionTitle}>Smile Moments</Text>
              <Text style={styles.sectionSubtitle}>
                Little moments, lasting connections
              </Text>
            </View>

            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>MOMENTS</Text>
            </View>
          </View>

          <SmileMomentsRow />
        </View>

        {/* VibeHub introduction */}
        <View style={styles.welcome}>
          <Text style={styles.eyebrow}>
            YOUR COMMUNITY · YOUR VIBE
          </Text>

          <Text style={styles.heading}>
            What's your vibe{' '}
            <Text style={styles.headingAccent}>today?</Text>
          </Text>

          <Text style={styles.description}>
            Share your world, encourage someone, and celebrate
            the moments that matter.
          </Text>
        </View>

        {/* Create-post composer */}
        <View style={styles.composer}>
          <View style={styles.composerTop}>
            <View style={styles.composerAvatar}>
              <Text style={styles.composerAvatarText}>V</Text>
            </View>

            <View style={styles.composerPromptWrap}>
              <Text style={styles.composerTitle}>
                Create something meaningful
              </Text>
              <Text style={styles.composerPrompt}>
                What's happening in your world?
              </Text>
            </View>
          </View>

          <View style={styles.composerDivider} />

          <View style={styles.composerActions}>
            <View style={styles.composerActionGroup}>
              <View style={styles.composerAction}>
                <Text style={styles.actionEmoji}>▧</Text>
                <Text style={styles.actionText}>Photo</Text>
              </View>

              <View style={styles.composerAction}>
                <Text style={styles.actionEmoji}>▷</Text>
                <Text style={styles.actionText}>Video</Text>
              </View>

              <View style={styles.composerAction}>
                <Text style={styles.actionEmoji}>✦</Text>
                <Text style={styles.actionText}>Quote</Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.createButton,
                pressed && styles.pressed,
              ]}
              onPress={() =>
                Alert.alert(
                  'Create a post',
                  'The native post creation screen is the next feature to connect.',
                )
              }
            >
              <Text style={styles.createButtonText}>Create</Text>
              <Text style={styles.createButtonPlus}>＋</Text>
            </Pressable>
          </View>
        </View>

        {/* Feed section heading */}
        <View style={styles.feedHeading}>
          <View>
            <Text style={styles.feedTitle}>Your feed</Text>
            <Text style={styles.sectionSubtitle}>
              Discover what's happening in your community
            </Text>
          </View>

          <View style={styles.communityPill}>
            <View style={styles.liveDot} />
            <Text style={styles.communityText}>Community</Text>
          </View>
        </View>

        {/* Loading, error, empty, and real post states */}
        {loading ? (
          <View style={styles.feedState}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.feedStateText}>
              Loading your community...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.feedState}>
            <Text style={styles.stateIcon}>!</Text>
            <Text style={styles.stateTitle}>
              Couldn't load your feed
            </Text>
            <Text style={styles.feedStateText}>{error}</Text>

            <Pressable
              accessibilityRole="button"
              style={styles.retryButton}
              onPress={() => void loadPosts()}
            >
              <Text style={styles.retryButtonText}>Try again</Text>
            </Pressable>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.feedState}>
            <Text style={styles.stateIcon}>✦</Text>
            <Text style={styles.stateTitle}>
              Your feed is waiting
            </Text>
            <Text style={styles.feedStateText}>
              No posts are available yet. Your first post could
              inspire someone today.
            </Text>
          </View>
        ) : (
          posts.map(renderPost)
        )}

        <View style={styles.bottomMessage}>
          <Text style={styles.bottomMessageTitle}>
            Make your next moment meaningful.
          </Text>
          <Text style={styles.bottomMessageText}>
            Express yourself. Connect with others. Take action.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  fixedHeader: {
    backgroundColor: COLORS.header,
    zIndex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 32,
  },

  momentsSection: {
    marginBottom: 25,
  },

  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  newBadge: {
    backgroundColor: '#211A35',
    borderColor: '#5C397C',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  newBadgeText: {
    color: '#E5B4FF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
  },

  welcome: {
    marginBottom: 21,
  },

  eyebrow: {
    color: COLORS.pink,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 9,
  },

  heading: {
    color: COLORS.text,
    fontSize: 28,
    lineHeight: 35,
    fontWeight: '900',
    letterSpacing: -0.9,
  },

  headingAccent: {
    color: COLORS.primary,
  },

  description: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 9,
  },

  composer: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#35304E',
    marginBottom: 29,
    overflow: 'hidden',
  },

  composerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  composerAvatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#2C2140',
    borderWidth: 1,
    borderColor: COLORS.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },

  composerAvatarText: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: '900',
  },

  composerPromptWrap: {
    flex: 1,
  },

  composerTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
  },

  composerPrompt: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5,
  },

  composerDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 16,
    marginBottom: 14,
  },

  composerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  composerActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    flexShrink: 1,
  },

  composerAction: {
    alignItems: 'center',
    gap: 5,
  },

  actionEmoji: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: '700',
  },

  actionText: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '600',
  },

  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: COLORS.pink,
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },

  createButtonText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
  },

  createButtonPlus: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
    marginTop: -1,
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

  feedHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 15,
  },

  feedTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  communityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#102C2B',
    borderWidth: 1,
    borderColor: '#20514A',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.green,
  },

  communityText: {
    color: COLORS.green,
    fontSize: 10,
    fontWeight: '800',
  },

  postCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 21,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },

  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  postAvatar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: '#342340',
    borderWidth: 1,
    borderColor: '#76508C',
    alignItems: 'center',
    justifyContent: 'center',
  },

  postAvatarImage: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceRaised,
  },

  postAvatarText: {
    color: '#F4B8FF',
    fontSize: 17,
    fontWeight: '900',
  },

  postAuthor: {
    flex: 1,
    minWidth: 0,
  },

  authorName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
  },

  postTime: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 4,
  },

  memberBadge: {
    backgroundColor: '#28213B',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  memberBadgeText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  postContent: {
    color: '#F0F2FA',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 15,
  },

  postMedia: {
    width: '100%',
    height: 280,
    borderRadius: 15,
    marginTop: 14,
    backgroundColor: COLORS.surfaceRaised,
  },

  quoteCard: {
    marginTop: 16,
    borderRadius: 17,
    overflow: 'hidden',
    backgroundColor: '#19152F',
    borderWidth: 1,
    borderColor: '#4E326E',
    flexDirection: 'row',
  },

  quoteAccent: {
    width: 5,
    backgroundColor: COLORS.pink,
  },

  quoteInner: {
    flex: 1,
    padding: 17,
    paddingBottom: 16,
  },

  quoteEyebrow: {
    color: '#D7A4F9',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  quoteMark: {
    color: COLORS.pink,
    fontSize: 42,
    lineHeight: 44,
    fontWeight: '900',
    marginTop: 5,
  },

  quoteText: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 29,
    fontWeight: '800',
  },

  quoteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 20,
  },

  quoteFooterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },

  quoteCaption: {
    color: '#B8A9D9',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    flexShrink: 1,
  },

  videoPlaceholder: {
    marginTop: 14,
    minHeight: 180,
    borderRadius: 16,
    backgroundColor: '#17172F',
    borderWidth: 1,
    borderColor: '#383256',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },

  videoPlayButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },

  videoIcon: {
    color: COLORS.text,
    fontSize: 19,
    marginLeft: 3,
  },

  videoText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 12,
  },

  videoHint: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 5,
  },

  postFooter: {
    marginTop: 16,
    marginBottom: 13,
  },

  reactionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  emojiBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },

  reactionEmoji: {
    fontSize: 13,
  },

  reactionCount: {
    color: COLORS.muted,
    fontSize: 10,
    marginLeft: 5,
  },

  postDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    gap: 5,
  },

  postActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: 10,
  },

  postActionIcon: {
    color: COLORS.pink,
    fontSize: 17,
    fontWeight: '700',
  },

  postAction: {
    color: '#D0D6E7',
    fontSize: 10,
    fontWeight: '700',
  },

  feedState: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 25,
    alignItems: 'center',
    gap: 12,
  },

  stateIcon: {
    color: COLORS.primary,
    fontSize: 30,
    fontWeight: '900',
  },

  stateTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },

  feedStateText: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
  },

  retryButton: {
    backgroundColor: COLORS.pink,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 11,
    marginTop: 3,
  },

  retryButtonText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
  },

  bottomMessage: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 14,
  },

  bottomMessageTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },

  bottomMessageText: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 6,
  },
});
