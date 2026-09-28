// Layered shadow for device frames: a tight contact shadow, a mid-range
// key shadow and a wide ambient one. `drop-shadow` follows the frame's
// rounded outline, unlike `box-shadow`, which would trace the host's box.
export const deviceShadow = [
  'drop-shadow(0 0.3cqmin 0.6cqmin rgba(15, 20, 30, 0.28))',
  'drop-shadow(0 1.6cqmin 3cqmin rgba(15, 20, 30, 0.2))',
  'drop-shadow(0 6cqmin 9cqmin rgba(15, 20, 30, 0.18))',
].join(' ');
