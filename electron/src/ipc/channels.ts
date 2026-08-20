export const CHANNELS = {
  credentialsSet: 'credentials:set',
  credentialsStatus: 'credentials:status',
  photosPick: 'photos:pick',
} as const;

export type ChannelName = (typeof CHANNELS)[keyof typeof CHANNELS];
