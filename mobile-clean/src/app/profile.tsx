import FeatureScreen from '@/features/FeatureScreen';

export default function ProfileScreen() {
  return (
    <FeatureScreen
      eyebrow="Your identity"
      title="Your profile"
      description="Show your interests, share your progress, and celebrate the positive impact you make."
      icon="👤"
      items={[
        { icon: '📝', title: 'Your posts', description: 'A home for the moments and ideas you share.' },
        { icon: '💛', title: 'Your impact', description: 'Highlight encouragement and meaningful connections.' },
        { icon: '⚙️', title: 'Your account', description: 'Account settings and profile management will live here.' },
      ]}
    />
  );
}
