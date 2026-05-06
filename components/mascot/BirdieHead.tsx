import { Brand } from '@/constants/theme';
import { View, type ViewStyle } from 'react-native';
import Svg, { Circle, G, Path, Polygon } from 'react-native-svg';

export type BirdieHeadProps = {
  size?: number;
  style?: ViewStyle;
};

export function BirdieHead({ size = 64, style }: BirdieHeadProps) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Circle cx={60} cy={70} r={42} fill={Brand.sunshine} />
        <Circle cx={46} cy={84} r={5} fill={Brand.partyPink} opacity={0.55} />
        <Circle cx={74} cy={84} r={5} fill={Brand.partyPink} opacity={0.55} />
        <Circle cx={50} cy={66} r={4.5} fill={Brand.ink} />
        <Circle cx={70} cy={66} r={4.5} fill={Brand.ink} />
        <Polygon points="60,76 53,86 67,86" fill={Brand.sunshineDeep} />
        <G>
          <Polygon points="60,8 42,52 78,52" fill={Brand.partyPink} />
          <Polygon points="60,8 42,52 60,52" fill={Brand.partyPinkDeep} opacity={0.35} />
          <Path
            d="M44 50 Q 60 58, 76 50 L 78 52 Q 60 60, 42 52 Z"
            fill={Brand.sunshineDeep}
          />
          <Circle cx={60} cy={6} r={5} fill={Brand.sunshine} />
        </G>
      </Svg>
    </View>
  );
}

export default BirdieHead;
