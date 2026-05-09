import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export const TAB_NAMES = ['upcoming', 'family', 'friends', 'settings'] as const;
export type TabName = (typeof TAB_NAMES)[number];

type Value = { activeTab: TabName; setActiveTab: (name: TabName) => void };

const TabSelectionContext = createContext<Value | null>(null);

export function TabSelectionProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabName>('upcoming');
  const value = useMemo(() => ({ activeTab, setActiveTab }), [activeTab]);
  return <TabSelectionContext.Provider value={value}>{children}</TabSelectionContext.Provider>;
}

export function useTabSelection(): Value {
  const ctx = useContext(TabSelectionContext);
  if (!ctx) throw new Error('useTabSelection must be used inside TabSelectionProvider');
  return ctx;
}
