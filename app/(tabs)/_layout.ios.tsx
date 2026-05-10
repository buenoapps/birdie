import { Host, RNHostView, TabView } from '@expo/ui/swift-ui';
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
          <RNHostView>
            <View style={styles.page}>
              <UpcomingScreen />
            </View>
          </RNHostView>
        </TabView.Tab>
        <TabView.Tab value="family" label={t('nav.family')} systemImage="person.2.fill">
          <RNHostView>
            <View style={styles.page}>
              <FamilyScreen />
            </View>
          </RNHostView>
        </TabView.Tab>
        <TabView.Tab value="friends" label={t('nav.friends')} systemImage="person.3.fill">
          <RNHostView>
            <View style={styles.page}>
              <FriendsScreen />
            </View>
          </RNHostView>
        </TabView.Tab>
        <TabView.Tab value="settings" label={t('nav.settings')} systemImage="gear">
          <RNHostView>
            <View style={styles.page}>
              <SettingsScreen />
            </View>
          </RNHostView>
        </TabView.Tab>
      </TabView>
    </Host>
  );
}

const styles = StyleSheet.create({
  // Outer Host bridges SwiftUI ↔ RN; flex:1 gives the SwiftUI tree the screen height.
  host: { flex: 1 },
  // Each Tab's RN children render inside an RNHostView, which by default
  // takes the size of the parent SwiftUI page. flex:1 on this wrapper makes
  // the screen component fill that page rather than collapsing to its
  // intrinsic content height.
  page: { flex: 1 },
});

