import { useScrollToTop } from '@react-navigation/native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Birdie } from '@/components/mascot/Birdie';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Colors } from '@/constants/theme';
import { useBirdieData } from '@/hooks/use-birdie-data';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { buildCsvExport, buildJsonExport, exportFilename } from '@/lib/export';
import {
  ensurePermissions,
  syncBirthdayNotifications,
} from '@/lib/notifications';
import { DEFAULT_WINDOW } from '@/lib/scheduler';

export default function SettingsTab() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { family, friends, refresh } = useBirdieData();
  const [granted, setGranted] = useState<boolean | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);

  useEffect(() => {
    ensurePermissions().then(setGranted).catch(() => setGranted(false));
  }, []);

  const handleResync = async () => {
    await syncBirthdayNotifications();
    Alert.alert('Birdie', 'Notifications re-synced.');
  };

  const handleRequest = async () => {
    const ok = await ensurePermissions();
    setGranted(ok);
    if (ok) await syncBirthdayNotifications();
  };

  const handleExport = async (format: 'json' | 'csv') => {
    if (family.length === 0 && friends.length === 0) {
      Alert.alert('Nothing to export', 'Add some family or friends first.');
      return;
    }
    try {
      const content =
        format === 'json' ? buildJsonExport(family, friends) : buildCsvExport(family, friends);
      const filename = exportFilename(format);
      const file = new File(Paths.cache, filename);
      if (file.exists) file.delete();
      file.create();
      file.write(content);

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Saved', `Export written to ${file.uri}`);
        return;
      }
      await Sharing.shareAsync(file.uri, {
        mimeType: format === 'json' ? 'application/json' : 'text/csv',
        dialogTitle: 'Export Birdie data',
        UTI: format === 'json' ? 'public.json' : 'public.comma-separated-values-text',
      });
    } catch (err) {
      Alert.alert('Export failed', String(err));
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>
        <View style={styles.heroBox}>
          <Birdie size={120} />
          <Text style={[styles.title, { color: colors.text }]}>Birdie</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {family.length} family · {friends.length} friends
          </Text>
        </View>

        <Section title="Notifications" colors={colors}>
          <Text style={[styles.body, { color: colors.text }]}>
            Birdie pings you every full hour from {pad(DEFAULT_WINDOW.startHour)}:00 to{' '}
            {pad(DEFAULT_WINDOW.endHour)}:00 on a birthday — until you tap{' '}
            <Text style={{ fontWeight: '700' }}>I sent a message!</Text> on the birthday screen.
          </Text>
          <Text style={[styles.bodySmall, { color: colors.textMuted }]}>
            Permission: {granted === null ? 'checking…' : granted ? 'granted ✓' : 'not granted'}
          </Text>
          {!granted && granted !== null && (
            <PrimaryButton title="Enable notifications" onPress={handleRequest} />
          )}
          {granted && (
            <PrimaryButton variant="secondary" title="Re-sync schedule" onPress={handleResync} />
          )}
        </Section>

        <Section title="Export" colors={colors}>
          <Text style={[styles.body, { color: colors.text }]}>
            Save a backup of all family members and friends. The share sheet lets you send the
            file to email, files, or another app.
          </Text>
          <PrimaryButton title="Export as JSON" onPress={() => handleExport('json')} />
          <PrimaryButton variant="secondary" title="Export as CSV" onPress={() => handleExport('csv')} />
        </Section>

        <Section title="Data" colors={colors}>
          <Text style={[styles.body, { color: colors.text }]}>
            All data stays on this device (SQLite). Reinstalling the app will erase it.
          </Text>
          <PrimaryButton variant="ghost" title="Refresh data" onPress={() => refresh()} />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  colors,
  children,
}: {
  title: string;
  colors: typeof Colors.light;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{title}</Text>
      <View style={{ gap: 12 }}>{children}</View>
    </View>
  );
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, gap: 16 },
  heroBox: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 14 },
  section: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  body: { fontSize: 15, lineHeight: 22 },
  bodySmall: { fontSize: 13 },
});
