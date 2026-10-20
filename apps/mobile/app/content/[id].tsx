import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../../src/api';
import { colors } from '../../src/theme';
import { useAsync } from '../../src/useAsync';

export default function Detail() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
          <Pressable style={styles.play} onPress={() => router.push(`/player/${playId}`)}>
            <Text style={styles.playText}>▶  Ver ahora</Text>
          </Pressable>
        )}
        <Text style={styles.desc}>{content.description}</Text>

        {episodes.length > 0 && <Text style={styles.section}>Episodios</Text>}
        {episodes.map((ep) => (
          <Pressable key={ep.id} style={styles.episode} onPress={() => router.push(`/player/${ep.id}`)}>
            <Image source={ep.artwork.landscape} style={styles.episodeImage} contentFit="cover" />
            <View style={{ flex: 1 }}>
              <Text style={styles.episodeTitle}>
                {ep.episode}. {ep.title}
              </Text>
              <Text style={styles.episodeDesc} numberOfLines={2}>
                {ep.description}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  backdrop: { width: '100%', aspectRatio: 16 / 9 },
  body: { padding: 16 },
  title: { color: colors.text, fontSize: 28, fontWeight: '700' },
  meta: { color: colors.muted, marginTop: 6 },
  play: { backgroundColor: colors.text, borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  playText: { color: colors.bg, fontWeight: '700', fontSize: 16 },
  desc: { color: colors.muted, fontSize: 15, marginTop: 16, lineHeight: 22 },
  section: { color: colors.text, fontSize: 18, fontWeight: '600', marginTop: 28, marginBottom: 8 },
  episode: { flexDirection: 'row', gap: 12, marginVertical: 8 },
  episodeImage: { width: 140, aspectRatio: 16 / 9, borderRadius: 6 },
  episodeTitle: { color: colors.text, fontWeight: '600' },
  episodeDesc: { color: colors.muted, fontSize: 13, marginTop: 4 },
});
