import { Brand } from '@/constants/theme';
import { View, type ViewStyle } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Polygon } from 'react-native-svg';

export type BirdieProps = {
  size?: number;
  withConfetti?: boolean;
  style?: ViewStyle;
};

const CONFETTI_DOTS: { cx: number; cy: number; r: number; fill: string }[] = [
  { cx: 18, cy: 28, r: 3, fill: Brand.partyPink },
  { cx: 174, cy: 22, r: 3.5, fill: Brand.sky },
  { cx: 162, cy: 60, r: 2.5, fill: Brand.mint },
  { cx: 30, cy: 76, r: 2.8, fill: Brand.sunshineDeep },
  { cx: 8, cy: 110, r: 3, fill: Brand.partyPink },
  { cx: 184, cy: 128, r: 3, fill: Brand.sky },
  { cx: 160, cy: 168, r: 3.2, fill: Brand.mint },
  { cx: 22, cy: 158, r: 2.6, fill: Brand.partyPinkDeep },
  { cx: 100, cy: 12, r: 2.4, fill: Brand.mint },
];

export function Birdie({ size = 180, withConfetti = true, style }: BirdieProps) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        {/* Confetti background */}
        {withConfetti && (
          <G>
            {CONFETTI_DOTS.map((dot, i) => (
              <Circle key={i} cx={dot.cx} cy={dot.cy} r={dot.r} fill={dot.fill} />
            ))}
          </G>
        )}

        {/* Body — chubby teardrop */}
        <Ellipse cx={100} cy={128} rx={62} ry={55} fill={Brand.sunshine} />

        {/* Belly highlight */}
        <Ellipse cx={100} cy={144} rx={42} ry={32} fill="#FFE680" />

        {/* Wing */}
        <Path
          d="M62 122 Q 50 138, 70 162 Q 92 158, 90 134 Z"
          fill={Brand.sunshineDeep}
        />

        {/* Head — slightly overlapping body for the chubby silhouette */}
        <Circle cx={100} cy={86} r={48} fill={Brand.sunshine} />

        {/* Cheek blush */}
        <Circle cx={74} cy={100} r={7} fill={Brand.partyPink} opacity={0.55} />
        <Circle cx={126} cy={100} r={7} fill={Brand.partyPink} opacity={0.55} />

        {/* Eyes */}
        <Circle cx={86} cy={84} r={6} fill={Brand.ink} />
        <Circle cx={114} cy={84} r={6} fill={Brand.ink} />
        <Circle cx={88} cy={82} r={2} fill="#FFFFFF" />
        <Circle cx={116} cy={82} r={2} fill="#FFFFFF" />

        {/* Beak */}
        <Polygon points="100,96 92,108 108,108" fill={Brand.sunshineDeep} />

        {/* Party hat — the brand-defining piece */}
        <G>
          <Polygon
            points="100,12 78,62 122,62"
            fill={Brand.partyPink}
          />
          <Polygon
            points="100,12 78,62 100,62"
            fill={Brand.partyPinkDeep}
            opacity={0.35}
          />
          {/* Hat band */}
          <Path
            d="M80 58 Q 100 68, 120 58 L 122 62 Q 100 72, 78 62 Z"
            fill={Brand.sunshineDeep}
          />
          {/* Pom-pom */}
          <Circle cx={100} cy={10} r={7} fill={Brand.sunshine} />
          <Circle cx={100} cy={10} r={3.5} fill={Brand.sunshineDeep} />
          {/* Hat polka dots */}
          <Circle cx={94} cy={32} r={2.5} fill={Brand.cream} />
          <Circle cx={108} cy={44} r={2.5} fill={Brand.cream} />
          <Circle cx={92} cy={52} r={2} fill={Brand.cream} />
        </G>

        {/* Feet */}
        <Path d="M84 178 L 78 188 L 92 188 Z" fill={Brand.sunshineDeep} />
        <Path d="M116 178 L 110 188 L 124 188 Z" fill={Brand.sunshineDeep} />
      </Svg>
    </View>
  );
}

export default Birdie;
