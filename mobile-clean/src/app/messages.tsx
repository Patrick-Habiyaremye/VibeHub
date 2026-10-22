import FeatureScreen from '@/features/FeatureScreen';

export default function MessagesScreen() {
  return (
    <FeatureScreen
      eyebrow="Connect"
      title="Your Vibes"
      description="A space for private conversations, shared moments, and meaningful connections."
      icon="💬"
      items={[
        { icon: '✉️', title: 'Conversations', description: 'A home for your one-to-one messages.' },
        { icon: '🖼️', title: 'Share moments', description: 'Build conversations around photos and content.' },
        { icon: '🔒', title: 'Private by design', description: 'Your conversations should be accessible only to authorized participants.' },
      ]}
    />
  );
}
