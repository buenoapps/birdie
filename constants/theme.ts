/**
 * Birdie brand palette. Sunshine yellow + party pink anchor the playful feel,
 * with mint and sky as supporting accents and a soft cream background.
 */

import { Platform } from 'react-native';

export const Brand = {
  sunshine: '#FFD43B',
  sunshineDeep: '#F5B700',
  partyPink: '#FF5C8A',
  partyPinkDeep: '#E63E70',
  sky: '#5EC8F8',
  mint: '#7BE0AD',
  cream: '#FFF8E7',
  ink: '#2A2438',
  inkSoft: '#5C5470',
  cloud: '#F5F1F8',
};

const tintColorLight = Brand.partyPinkDeep;
const tintColorDark = Brand.sunshine;

export const Colors = {
  light: {
    text: Brand.ink,
    textMuted: Brand.inkSoft,
    background: Brand.cream,
    surface: '#FFFFFF',
    tint: tintColorLight,
    icon: Brand.inkSoft,
    border: '#EFE6CF',
    tabIconDefault: Brand.inkSoft,
    tabIconSelected: tintColorLight,
    accent: Brand.partyPink,
    accentSoft: '#FFD9E4',
    success: '#2BA84A',
  },
  dark: {
    text: '#F4ECFF',
    textMuted: '#B8AED1',
    background: '#1B1626',
    surface: '#2A2438',
    tint: tintColorDark,
    icon: '#B8AED1',
    border: '#3A3450',
    tabIconDefault: '#B8AED1',
    tabIconSelected: tintColorDark,
    accent: Brand.partyPink,
    accentSoft: '#4A2A3A',
    success: '#5BD476',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
