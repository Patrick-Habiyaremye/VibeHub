import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  background: '#F7F8FC',
  surface: '#FFFFFF',
  primary: '#6558E8',
  text: '#202139',
  muted: '#777A91',
  border: '#E9EAF2',
};

type FeatureScreenProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: string;
  items: { icon: string; title: string; description: string }[];
};

export default function FeatureScreen({
  eyebrow,
  title,
  description,
  icon,
  items,
}: FeatureScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>V</Text>
          </View>
          <View>
            <Text style={styles.brand}>VibeHub</Text>
            <Text style={styles.tagline}>Share your world</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroEmoji}>{icon}</Text>
          </View>
          <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        <Text style={styles.sectionTitle}>What's here for you</Text>

        {items.map((item) => (
          <View key={item.title} style={styles.item}>
            <View style={styles.itemIcon}>
              <Text style={styles.itemEmoji}>{item.icon}</Text>
            </View>
            <View style={styles.itemCopy}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
            </View>
          </View>
        ))}

        <View style={styles.note}>
          <Text style={styles.noteTitle}>Your VibeHub journey starts here.</Text>
          <Text style={styles.noteText}>
            This screen is ready for its feature implementation. Live community
            data and account actions will be connected in a later step.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 24,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#FFFFFF', fontSize: 25, fontWeight: '800' },
  brand: { color: COLORS.text, fontSize: 19, fontWeight: '800' },
  tagline: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  hero: { alignItems: 'flex-start', paddingTop: 34, paddingBottom: 28 },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 21,
    backgroundColor: '#EEECFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  heroEmoji: { fontSize: 30 },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 9,
  },
  title: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  description: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 14,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 17,
    padding: 15,
    marginBottom: 11,
    gap: 13,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F2F1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemEmoji: { fontSize: 21 },
  itemCopy: { flex: 1 },
  itemTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  itemDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  note: {
    marginTop: 8,
    borderRadius: 17,
    backgroundColor: '#EEECFF',
    padding: 16,
  },
  noteTitle: { color: COLORS.text, fontWeight: '800', fontSize: 14 },
  noteText: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 6,
  },
});
