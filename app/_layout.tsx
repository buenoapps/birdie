import * as Notifications from 'expo-notifications';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import 'react-native-reanimated';

import { BirdieDataProvider } from '@/hooks/use-birdie-data';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { t } from '@/lib/i18n';
import {
  ensurePermissions,
  installNotificationHandler,
  syncBirthdayNotifications,
} from '@/lib/notifications';

export const unstable_settings = {
  anchor: '(tabs)',
};

installNotificationHandler();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await ensurePermissions().catch(() => false);
      if (cancelled) return;
      await syncBirthdayNotifications().catch((err) =>
        console.warn('Initial notification sync failed', err)
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        syncBirthdayNotifications().catch((err) =>
          console.warn('Foreground notification sync failed', err)
        );
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as
        | { personType?: string; personId?: number }
        | undefined;
      if (data?.personType && typeof data.personId === 'number') {
        router.navigate('/');
        router.push(`/birthday/${data.personType}/${data.personId}` as never);
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <BirdieDataProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="family/new" options={{ presentation: 'modal', title: t('modal.stackAddFamily') }} />
          <Stack.Screen name="family/[id]" options={{ presentation: 'modal', title: t('modal.stackEditFamily') }} />
          <Stack.Screen name="friends/new" options={{ presentation: 'modal', title: t('modal.stackAddFriend') }} />
          <Stack.Screen name="friends/[id]" options={{ presentation: 'modal', title: t('modal.stackEditFriend') }} />
          <Stack.Screen
            name="birthday/[type]/[id]"
            options={{ presentation: 'modal', title: t('modal.stackBirthday') }}
          />
          <Stack.Screen
            name="import/text"
            options={{ presentation: 'modal', title: t('modal.stackImportText') }}
          />
          <Stack.Screen
            name="import/review"
            options={{ presentation: 'modal', title: t('modal.stackImportReview') }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </BirdieDataProvider>
  );
}
