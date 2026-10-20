import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../../src/api';
import { colors, fonts } from '../../src/theme';
import { FocusCard } from '../../src/FocusCard';
import { useAsync } from '../../src/useAsync';
import { useTVBack } from '../../src/useTVBack';

export default function Detail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  useTVBack();
  const { data } = useAsync(async () => {
    const content = await api.content(id);
    const episodes = content.kind === 'series' ? await api.episodes(id) : [];
    return { content, episodes };
  }, [id]);

  if (!data) return <ActivityIndicator style={{ flex: 1 }} color={colors.text} />;
  const { content, episodes } = data;
  const playId = content.kind === 'series' ? episodes[0]?.id : content.id;
  const meta = [content.year, content.genres.join(' · '), content.durationSec && `${Math.round(content.durationSec / 60)} min`]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <ScrollView style={styles.screen}>
      <Image source={content.artwork.landscape} style={styles.backdrop} contentFit="cover" />
      <View style={styles.body}>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.meta}>{meta}</Text>
        {playId && (
          <FocusCard style={styles.play} onPress={() => router.push(`/player/${playId}`)} hasTVPreferredFocus>
            <Text style={styles.playText}>▶  Ver ahora</Text>
          </FocusCard>
        )}
        <Text style={styles.desc}>{content.description}</Text>

        {episodes.length > 0 && <Text style={styles.section}>Episodios</Text>}
        {episodes.map((ep) => (
          <FocusCard key={ep.id} style={styles.episode} onPress={() => router.push(`/player/${ep.id}`)}>
            <Image source={ep.artwork.landscape} style={styles.episodeImage} contentFit="cover" />
            <View style={{ flex: 1 }}>
              <Text style={styles.episodeTitle}>
                {ep.episode}. {ep.title}
              </Text>
              <Text style={styles.episodeDesc} numberOfLines={2}>
                {ep.description}
              </Text>
            </View>
          </FocusCard>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  backdrop: { width: '100%', aspectRatio: 16 / 9 },
  body: { padding: 16 },
  title: { color: colors.text, fontSize: 32, fontFamily: fonts.title, textTransform: 'uppercase' },
  meta: { color: colors.muted, marginTop: 6, fontFamily: fonts.body },
  play: { backgroundColor: colors.yellow, borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  playText: { color: colors.bg, fontFamily: fonts.title, fontSize: 18, textTransform: 'uppercase' },
  desc: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, marginTop: 16, lineHeight: 22 },
  section: { color: colors.text, fontSize: 20, fontFamily: fonts.subtitle, textTransform: 'uppercase', marginTop: 28, marginBottom: 8 },
  episode: { flexDirection: 'row', gap: 12, marginVertical: 8 },
  episodeImage: { width: 140, aspectRatio: 16 / 9, borderRadius: 6 },
  episodeTitle: { color: colors.text, fontFamily: fonts.bodyBold },
  episodeDesc: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, marginTop: 4 },
});
