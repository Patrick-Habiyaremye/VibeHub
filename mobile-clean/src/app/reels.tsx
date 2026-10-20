import FeatureScreen from '@/features/FeatureScreen';

export default function ReelsScreen() {
  return (
    <FeatureScreen
      eyebrow="Express"
      title="Smile Reels"
      description="Short videos for sharing joy, creativity, encouragement, and everyday wins."
      icon="▶️"
      items={[
        { icon: '🎬', title: 'Watch moments', description: 'Discover short-form community videos.' },
        { icon: '✨', title: 'Share your vibe', description: 'Bring a story, skill, or positive idea to life.' },
        { icon: '💛', title: 'Spread encouragement', description: 'Support creators through meaningful reactions.' },
      ]}
    />
  );
}
