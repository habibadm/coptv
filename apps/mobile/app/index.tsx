import type { Content, Rail } from '@coptv/shared';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../src/api';
import { colors } from '../src/theme';
import { useAsync } from '../src/useAsync';

function open(item: Content) {
  router.push(item.kind === 'live' ? `/player/${item.id}` : `/content/${item.id}`);
}

export default function Home() {
  const { data, error } = useAsync(() => api.home(), []);

  if (error) return <Text style={styles.message}>No se pudo cargar la portada.</Text>;
  if (!data) return <ActivityIndicator style={styles.loading} color={colors.text} />;

  const [heroRail, ...rails] = data.rails;
  const hero = heroRail?.items[0];

  return (
    <ScrollView style={styles.screen}>
      {hero && (
        <Pressable onPress={() => open(hero)}>
          <Image source={hero.artwork.landscape} style={styles.hero} contentFit="cover" />
          <SafeAreaView edges={['top']} style={styles.brandBar}>
            <Text style={styles.brand}>
              COP<Text style={{ color: colors.accent }}>TV</Text>
            </Text>
          </SafeAreaView>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>{hero.title}</Text>
            <Text style={styles.heroDesc} numberOfLines={2}>
              {hero.description}
            </Text>
          </View>
        </Pressable>
      )}
      {rails.map((rail) => (
        <RailRow key={rail.id} rail={rail} />
      ))}
    </ScrollView>
  );
}

function RailRow({ rail }: { rail: Rail }) {
  const poster = rail.style === 'poster';
  return (
    <View style={styles.rail}>
      <Text style={styles.railTitle}>{rail.title}</Text>
      <FlatList
        horizontal
        data={rail.items}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => open(item)} style={poster ? styles.posterCard : styles.card}>
            <Image
              source={poster ? (item.artwork.poster ?? item.artwork.landscape) : item.artwork.landscape}
              style={poster ? styles.posterImage : styles.cardImage}
              contentFit="cover"
            />
            {rail.style === 'live' && <Text style={styles.live}>EN VIVO</Text>}
            {!poster && <Text style={styles.cardTitle}>{item.title}</Text>}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  loading: { flex: 1 },
  message: { color: colors.muted, textAlign: 'center', marginTop: 120, fontSize: 18 },
  hero: { width: '100%', aspectRatio: 4 / 5 },
  brandBar: { position: 'absolute', top: 0, left: 16 },
  brand: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: 8 },
  heroText: { position: 'absolute', bottom: 24, left: 16, right: 16 },
  heroTitle: { color: colors.text, fontSize: 32, fontWeight: '700' },
  heroDesc: { color: colors.muted, fontSize: 16, marginTop: 4 },
  rail: { marginTop: 24 },
  railTitle: { color: colors.text, fontSize: 18, fontWeight: '600', marginLeft: 16, marginBottom: 10 },
  card: { width: 240, borderRadius: 10, overflow: 'hidden', backgroundColor: colors.surface },
  cardImage: { width: 240, aspectRatio: 16 / 9 },
  cardTitle: { color: colors.text, padding: 10, fontSize: 14 },
  posterCard: { width: 130, borderRadius: 10, overflow: 'hidden' },
  posterImage: { width: 130, aspectRatio: 2 / 3 },
  live: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.live,
    color: colors.text,
    fontWeight: '700',
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
});
