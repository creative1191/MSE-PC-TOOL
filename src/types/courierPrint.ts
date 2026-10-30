export type EnvelopePresetType =
  | 'DL'
  | 'C6'
  | 'C5'
  | 'C4'
  | 'A4'
  | 'CUSTOM'
  | 'A4_LABELS_2'
  | 'A4_LABELS_4'
  | 'A4_LABELS_6';

export type EnvelopeOrientation = 'LANDSCAPE' | 'PORTRAIT';

export type FromPosition = 'BOTTOM_RIGHT' | 'BOTTOM_LEFT';

export type MarginPreset = 'COMPACT' | 'NORMAL' | 'WIDE' | 'CUSTOM';

export type TypographyPreset = 'SEGOE' | 'DEVANAGARI' | 'SERIF' | 'MONO';

export type PostalBadgeType =
  | 'NONE'
  | 'SPEED_POST'
  | 'REGISTERED_POST'
  | 'BOOK_POST'
  | 'FRAGILE'
  | 'CASH_ON_DELIVERY'
  | 'AIRMAIL'
  | 'EXPRESS_PARCEL'
  | 'DOCUMENT';

export interface CourierAddress {
  id: string;
  name: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pinCode: string;
  mobile?: string;
  isBoldName?: boolean;
  isDefaultSender?: boolean;
  category?: 'CUSTOMER' | 'VENDOR' | 'BRANCH' | 'PERSONAL' | 'OTHER';
  createdAt?: string;
}

export interface EnvelopePresetConfig {
  id: EnvelopePresetType;
  name: string;
  shortLabel: string;
  widthMm: number;
  heightMm: number;
  description: string;
  aspectRatio: number;
  isMultiLabel?: boolean;
  labelsCount?: number;
}

export interface CourierPrintSettings {
  preset: EnvelopePresetType;
  customWidthMm: number;
  customHeightMm: number;
  orientation: EnvelopeOrientation;
  fromPosition: FromPosition;
  marginPreset: MarginPreset;
  customMarginMm: number;
  typography: TypographyPreset;
  fontScale: number; // 0.8 to 1.3 (80% to 130%)
  boldNames: boolean;
  boxedContainers: boolean;
  showBarcode: boolean;
  barcodeValue: string;
  postalBadge: PostalBadgeType;
  senderPrefix: string; // "FROM:"
  receiverPrefix: string; // "TO:"
  includePhoneIcon: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'hi';
}

export interface PrintLogItem {
  id: string;
  timestamp: string;
  recipientName: string;
  recipientCity: string;
  senderName: string;
  preset: EnvelopePresetType;
  trackingNo?: string;
  envelopeData: {
    to: CourierAddress;
    from: CourierAddress;
    settings: CourierPrintSettings;
  };
}

export interface DualOcrResult {
  rawText: string;
  sender: Partial<CourierAddress>;
  receiver: Partial<CourierAddress>;
  isSplitDual: boolean;
  confidence: number;
  previewImageUrl?: string;
  leftImageUrl?: string;
  rightImageUrl?: string;
}
