export type FrequencyHoverPayload = {
  source: string;
  language: string;
  frequency: number;
  level: 1 | 2 | 3;
  // False when the frequency exists but isn't shown to the user.
  isAvailable: boolean;
};
