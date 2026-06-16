import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Visual height of the floating iOS tab bar chrome, *excluding* the
// home-indicator inset (that part is already reported by the safe-area
// bottom inset, so adding it here would double-count).
const IOS_TAB_BAR_HEIGHT = 49;

/**
 * Content insets for the four tab screens.
 *
 * The tab screens render full-bleed (their background paints behind the
 * status bar and the tab bar) and push the safe-area + tab-bar space into
 * the *content* instead of insetting the whole subtree. That lets scroll
 * content flow behind the translucent bars the way a native iOS app does,
 * while still leaving the last row reachable above the tab bar.
 *
 * - `top` is the status-bar / notch inset.
 * - `bottom` covers the home indicator plus the tab bar on iOS, where the
 *   SwiftUI `TabView` floats over full-bleed content (see
 *   `app/(tabs)/_layout.ios.tsx`). On Android / web the JS tab navigator
 *   reserves its own layout space, so screens add nothing there.
 */
export function useTabContentInsets() {
  const insets = useSafeAreaInsets();
  return {
    top: insets.top,
    bottom: Platform.OS === 'ios' ? insets.bottom + IOS_TAB_BAR_HEIGHT : 0,
  };
}
