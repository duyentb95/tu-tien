export type LocationType =
  | 'city' // Thành thị
  | 'sect' // Tông môn
  | 'wilderness' // Hoang dã
  | 'secret_realm' // Bí cảnh
  | 'cave_abode' // Động phủ
  | 'mountain' // Sơn mạch
  | 'ruins' // Phế tích
  | 'special'; // Khác

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  description: string;
  levelRange?: [number, number]; // gợi ý cho encounter
  factionId?: string;
  discoveredByPlayer?: boolean;
  visitedByPlayer?: boolean;
  neighbors: string[]; // location ids — graph edges
  travelCost?: number; // hours
}

export interface Faction {
  id: string;
  name: string;
  type: 'sect' | 'nation' | 'clan' | 'demonic' | 'righteous' | 'neutral';
  description?: string;
}

export interface SecretRealm {
  id: string;
  name: string;
  rooms: SecretRealmRoom[];
  bossId: string;
  lootPoolIds: string[];
  expiresAt: number; // game timestamp
}

export interface SecretRealmRoom {
  id: string;
  description: string;
  encounters?: string[];
  isBossRoom?: boolean;
  connections: string[]; // room ids
}

/** Thời gian trong game */
export interface GameTime {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number; // 0-23
  phase: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'night' | 'midnight';
  weather: 'clear' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'fog' | 'mystical';
}
