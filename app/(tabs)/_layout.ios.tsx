import { Host, TabView } from '@expo/ui/swift-ui';
import { frame, tabViewStyle } from '@expo/ui/swift-ui/modifiers';
import { StyleSheet, View } from 'react-native';

import { useTabSelection, type TabName } from '@/hooks/use-tab-selection';
import { t } from '@/lib/i18n';

import FamilyScreen from './family';
import FriendsScreen from './friends';
import UpcomingScreen from './index';
import SettingsScreen from './settings';

// SwiftUI's TabView has no intrinsic size — without an explicit fill modifier
// it collapses to zero height inside the RN Host bridge and the tab content
// disappears. Setting both axes to Infinity makes it claim every available
// point of the parent Host.
const fillFrame = frame({ maxWidth: Infinity, maxHeight: Infinity });

export default function TabLayoutIOS() {
  const { activeTab, setActiveTab } = useTabSelection();

  return (
    <Host style={styles.host}>
      <TabView
        selection={activeTab}
        onSelectionChange={(v) => setActiveTab(v as TabName)}
        modifiers={[fillFrame, tabViewStyle({ type: 'automatic' })]}
      >
        <TabView.Tab value="upcoming" label={t('nav.upcoming')} systemImage="gift.fill">
          <View style={styles.page}>
            <UpcomingScreen />
          </View>
        </TabView.Tab>
        <TabView.Tab value="family" label={t('nav.family')} systemImage="person.2.fill">
          <View style={styles.page}>
            <FamilyScreen />
          </View>
        </TabView.Tab>
        <TabView.Tab value="friends" label={t('nav.friends')} systemImage="person.3.fill">
          <View style={styles.page}>
            <FriendsScreen />
          </View>
        </TabView.Tab>
        <TabView.Tab value="settings" label={t('nav.settings')} systemImage="gear">
          <View style={styles.page}>
            <SettingsScreen />
          </View>
        </TabView.Tab>
      </TabView>
    </Host>
  );
}

const styles = StyleSheet.create({
  // Host bridges SwiftUI ↔ RN; flex:1 gives the SwiftUI tree the screen height.
  host: { flex: 1 },
  // Each Tab's RN children get rendered into the SwiftUI page area; flex:1
  // here means the wrapped screen component fills the page rather than
  // collapsing to its content's intrinsic height.
  page: { flex: 1 },
});
