import * as Haptics from 'expo-haptics';
import { PlatformPressable } from 'expo-router/react-navigation';
import type { ComponentProps } from 'react';

type Props = ComponentProps<typeof PlatformPressable>;

export function HapticTab(props: Props) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
