export const SETTINGS_DEFAULTS = {
  platformFee: 10,
  depositAmount: 1000,
  waitlistAdvance: 500,
  termsAndConditions: '',
  pickupLocations: [] as string[],
  totpEnabled: false,
};

export type SettingsKey = keyof typeof SETTINGS_DEFAULTS;
