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
import { t } from '@/lib/i18n';
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
    Alert.alert(t('screen.settings.alertTitle'), t('screen.settings.resyncDone'));
  };

  const handleRequest = async () => {
    const ok = await ensurePermissions();
    setGranted(ok);
    if (ok) await syncBirthdayNotifications();
  };

  const handleExport = async (format: 'json' | 'csv') => {
    if (family.length === 0 && friends.length === 0) {
      Alert.alert(t('screen.settings.nothingToExport'), t('screen.settings.nothingToExportBody'));
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
        Alert.alert(
          t('screen.settings.exportSavedTitle'),
          t('screen.settings.exportSavedBody', { uri: file.uri })
        );
        return;
      }
      await Sharing.shareAsync(file.uri, {
        mimeType: format === 'json' ? 'application/json' : 'text/csv',
        dialogTitle: t('screen.settings.exportShareTitle'),
        UTI: format === 'json' ? 'public.json' : 'public.comma-separated-values-text',
      });
    } catch (err) {
      Alert.alert(t('screen.settings.exportFailedTitle'), String(err));
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>
        <View style={styles.heroBox}>
          <Birdie size={120} />
          <Text style={[styles.title, { color: colors.text }]}>{t('screen.upcoming.title')}</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {t('screen.settings.stats', { family: family.length, friends: friends.length })}
          </Text>
        </View>

        <Section title={t('screen.settings.notificationsHeader')} colors={colors}>
          <Text style={[styles.body, { color: colors.text }]}>
            {t('screen.settings.notificationsBody', {
              start: pad(DEFAULT_WINDOW.startHour),
              end: pad(DEFAULT_WINDOW.endHour),
            })}{' '}
            <Text style={{ fontWeight: '700' }}>{t('screen.settings.notificationsBodyEmphasis')}</Text>{' '}
            {t('screen.settings.notificationsBodySuffix')}
          </Text>
          <Text style={[styles.bodySmall, { color: colors.textMuted }]}>
            {granted === null
              ? t('screen.settings.permissionChecking')
              : granted
                ? t('screen.settings.permissionGranted')
                : t('screen.settings.permissionDenied')}
          </Text>
          {!granted && granted !== null && (
            <PrimaryButton title={t('screen.settings.enableCta')} onPress={handleRequest} />
          )}
          {granted && (
            <PrimaryButton variant="secondary" title={t('screen.settings.resyncCta')} onPress={handleResync} />
          )}
        </Section>

        <Section title={t('screen.settings.exportHeader')} colors={colors}>
          <Text style={[styles.body, { color: colors.text }]}>
            {t('screen.settings.exportBody')}
          </Text>
          <PrimaryButton title={t('screen.settings.exportJsonCta')} onPress={() => handleExport('json')} />
          <PrimaryButton variant="secondary" title={t('screen.settings.exportCsvCta')} onPress={() => handleExport('csv')} />
        </Section>

        <Section title={t('screen.settings.dataHeader')} colors={colors}>
          <Text style={[styles.body, { color: colors.text }]}>
            {t('screen.settings.dataBody')}
          </Text>
          <PrimaryButton variant="ghost" title={t('screen.settings.refreshCta')} onPress={() => refresh()} />
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
