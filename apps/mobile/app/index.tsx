import type { Content, Rail } from '@coptv/shared';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../src/api';
import { FocusCard } from '../src/FocusCard';
import { colors, fonts } from '../src/theme';
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
            <Image source={require('../assets/logo-blanco.png')} style={styles.logo} contentFit="contain" accessibilityLabel="COPTV" />
          </SafeAreaView>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>{hero.title}</Text>
            <Text style={styles.heroDesc} numberOfLines={2}>
              {hero.description}
            </Text>
          </View>
        </Pressable>
      )}
      {rails.map((rail, i) => (
        <RailRow key={rail.id} rail={rail} first={i === 0} />
      ))}
    </ScrollView>
  );
}

function RailRow({ rail, first }: { rail: Rail; first: boolean }) {
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
        renderItem={({ item, index }) => (
          <FocusCard
            onPress={() => open(item)}
            style={poster ? styles.posterCard : styles.card}
            hasTVPreferredFocus={first && index === 0}
          >
            <Image
              source={poster ? (item.artwork.poster ?? item.artwork.landscape) : item.artwork.landscape}
              style={poster ? styles.posterImage : styles.cardImage}
              contentFit="cover"
            />
            {rail.style === 'live' && <Text style={styles.live}>EN VIVO</Text>}
            {!poster && <Text style={styles.cardTitle}>{item.title}</Text>}
          </FocusCard>
        )}
      />
    </View>
  );
}

// En la TV todo se ve desde lejos: tarjetas más grandes y un banner más bajo.
const tv = Platform.isTV;
const CARD_W = tv ? 400 : 240;
const POSTER_W = tv ? 220 : 130;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  loading: { flex: 1 },
  message: { color: colors.muted, textAlign: 'center', marginTop: 120, fontSize: 18, fontFamily: fonts.body },
  hero: { width: '100%', aspectRatio: tv ? 21 / 9 : 4 / 5 },
  brandBar: { position: 'absolute', top: 0, left: 16 },
  logo: { width: tv ? 220 : 140, aspectRatio: 910 / 292, marginTop: 8 },
  heroText: { position: 'absolute', bottom: 24, left: 16, right: 16 },
  heroTitle: { color: colors.text, fontSize: tv ? 48 : 36, fontFamily: fonts.title, textTransform: 'uppercase' },
  heroDesc: { color: colors.muted, fontFamily: fonts.body, fontSize: 16, marginTop: 4 },
  rail: { marginTop: 24, paddingVertical: tv ? 12 : 0 },
  railTitle: { color: colors.text, fontSize: tv ? 30 : 20, fontFamily: fonts.subtitle, textTransform: 'uppercase', marginLeft: 16, marginBottom: 10 },
  card: { width: CARD_W, borderRadius: 10, overflow: 'hidden', backgroundColor: colors.surface },
  cardImage: { width: '100%', aspectRatio: 16 / 9 },
  cardTitle: { color: colors.text, fontFamily: fonts.body, padding: 10, fontSize: tv ? 22 : 14 },
  posterCard: { width: POSTER_W, borderRadius: 10, overflow: 'hidden' },
  posterImage: { width: '100%', aspectRatio: 2 / 3 },
  live: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.live,
    color: colors.text,
    fontFamily: fonts.title,
    letterSpacing: 1,
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
});
