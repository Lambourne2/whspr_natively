export const audioAssets: { [key: string]: { asset: number; title: string } } = {
  '054hzDeltaWaves': {
    asset: require('./054hzDeltaWaves.mp3'),
    title: '5.4Hz Delta Waves',
  },
  '423hzEarthsNaturalFrequency': {
    asset: require('./423hzEarthsNaturalFrequency.mp3'),
    title: "423Hz Earth's Natural Frequency",
  },
  '48hzThetaWaves': {
    asset: require('./48hzThetaWaves.mp3'),
    title: '48Hz Theta Waves',
  },
  '528hzLoveFrequency': {
    asset: require('./528hzLoveFrequency.mp3'),
    title: '528Hz Love Frequency',
  },
  '813hzAlphaWaves': {
    asset: require('./813hzAlphaWaves.mp3'),
    title: '8.13Hz Alpha Waves',
  },
  '852hzThirdEyeChakra': {
    asset: require('./852hzThirdEyeChakra.mp3'),
    title: '852Hz Third Eye Chakra',
  },
};

export const audioTitles = Object.fromEntries(
  Object.entries(audioAssets).map(([key, { title }]) => [key, title])
);
