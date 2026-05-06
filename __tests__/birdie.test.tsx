import { render } from '@testing-library/react-native';

import { Birdie } from '@/components/mascot/Birdie';
import { BirdieHead } from '@/components/mascot/BirdieHead';

describe('Birdie mascot', () => {
  it('renders the full mascot without throwing', () => {
    const { toJSON } = render(<Birdie size={100} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders without confetti when disabled', () => {
    const { toJSON } = render(<Birdie size={100} withConfetti={false} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the head-only variant', () => {
    const { toJSON } = render(<BirdieHead size={48} />);
    expect(toJSON()).toBeTruthy();
  });
});
