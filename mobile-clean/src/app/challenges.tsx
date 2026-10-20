import FeatureScreen from '@/features/FeatureScreen';

export default function ChallengesScreen() {
  return (
    <FeatureScreen
      eyebrow="Act"
      title="Challenges"
      description="Turn good intentions into consistent actions, one achievable step at a time."
      icon="🎯"
      items={[
        { icon: '🌱', title: 'Daily challenges', description: 'Build positive habits through small actions.' },
        { icon: '🔥', title: 'Track your streaks', description: 'Keep track of your consistency over time.' },
        { icon: '🤝', title: 'Grow together', description: 'Encourage others and celebrate shared progress.' },
      ]}
    />
  );
}
