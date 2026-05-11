import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Brand } from '@/constants/theme';
import { t } from '@/lib/i18n';

export default function TabLayoutIOS() {
  return (
    <NativeTabs tintColor={Brand.partyPink}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="gift.fill" />
        <NativeTabs.Trigger.Label>{t('nav.upcoming')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="family">
        <NativeTabs.Trigger.Icon sf="person.2.fill" />
        <NativeTabs.Trigger.Label>{t('nav.family')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="friends">
        <NativeTabs.Trigger.Icon sf="person.3.fill" />
        <NativeTabs.Trigger.Label>{t('nav.friends')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon sf="gear" />
        <NativeTabs.Trigger.Label>{t('nav.settings')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
