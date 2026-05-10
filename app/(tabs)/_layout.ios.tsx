import { Host, RNHostView, TabView } from '@expo/ui/swift-ui';
import { StyleSheet } from 'react-native';

import { useTabSelection, type TabName } from '@/hooks/use-tab-selection';
import { t } from '@/lib/i18n';

import FamilyScreen from './family';
import FriendsScreen from './friends';
import UpcomingScreen from './index';
import SettingsScreen from './settings';

export default function TabLayoutIOS() {
  const { activeTab, setActiveTab } = useTabSelection();

  return (
    <Host style={styles.host}>
      <TabView
        selection={activeTab}
        onSelectionChange={(v) => setActiveTab(v as TabName)}
      >
        <TabView.Tab value="upcoming" label={t('nav.upcoming')} systemImage="gift.fill">
          <RNHostView>
            <UpcomingScreen />
          </RNHostView>
        </TabView.Tab>
        <TabView.Tab value="family" label={t('nav.family')} systemImage="person.2.fill">
          <RNHostView>
            <FamilyScreen />
          </RNHostView>
        </TabView.Tab>
        <TabView.Tab value="friends" label={t('nav.friends')} systemImage="person.3.fill">
          <RNHostView>
            <FriendsScreen />
          </RNHostView>
        </TabView.Tab>
        <TabView.Tab value="settings" label={t('nav.settings')} systemImage="gear">
          <RNHostView>
            <SettingsScreen />
          </RNHostView>
        </TabView.Tab>
      </TabView>
    </Host>
  );
}

const styles = StyleSheet.create({
  host: { flex: 1 },
});

