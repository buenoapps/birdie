import { Host, RNHostView, TabView } from '@expo/ui/swift-ui';
import { ignoreSafeArea, tint } from '@expo/ui/swift-ui/modifiers';
import { StyleSheet } from 'react-native';

import { Brand } from '@/constants/theme';
import { useTabSelection, type TabName } from '@/hooks/use-tab-selection';
import { t } from '@/lib/i18n';

import FamilyScreen from './family';
import FriendsScreen from './friends';
import UpcomingScreen from './index';
import SettingsScreen from './settings';

// SwiftUI's Tab content area applies its own safe-area inset by default;
// each Birdie screen *also* roots in <SafeAreaView edges={['top']}> to paint
// the inset with the page background. The two stack and leave a colourless
// gap at the top and bottom of every tab. Apply ignoreSafeArea on the
// SwiftUI side so the RN tree owns the safe-area layout end-to-end.
const fillTab = [ignoreSafeArea({ edges: 'all' })];

// Match the active tab indicator to the PrimaryButton primary background.
const tabViewModifiers = [tint(Brand.partyPink)];

export default function TabLayoutIOS() {
  const { activeTab, setActiveTab } = useTabSelection();

  return (
    <Host style={styles.host}>
      <TabView
        selection={activeTab}
        onSelectionChange={(v) => setActiveTab(v as TabName)}
        modifiers={tabViewModifiers}
      >
        <TabView.Tab value="upcoming" label={t('nav.upcoming')} systemImage="gift.fill" modifiers={fillTab}>
          <RNHostView>
            <UpcomingScreen />
          </RNHostView>
        </TabView.Tab>
        <TabView.Tab value="family" label={t('nav.family')} systemImage="person.2.fill" modifiers={fillTab}>
          <RNHostView>
            <FamilyScreen />
          </RNHostView>
        </TabView.Tab>
        <TabView.Tab value="friends" label={t('nav.friends')} systemImage="person.3.fill" modifiers={fillTab}>
          <RNHostView>
            <FriendsScreen />
          </RNHostView>
        </TabView.Tab>
        <TabView.Tab value="settings" label={t('nav.settings')} systemImage="gear" modifiers={fillTab}>
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
