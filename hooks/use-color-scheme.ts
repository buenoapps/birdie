import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * Normalises React Native's useColorScheme — which since RN 0.83 can return
 * 'light' | 'dark' | 'unspecified' | null — down to 'light' | 'dark' so callers
 * can index Colors[scheme] without a TS error.
 */
export function useColorScheme(): 'light' | 'dark' {
  return useRNColorScheme() === 'dark' ? 'dark' : 'light';
}
