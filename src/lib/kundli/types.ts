export interface SignInfo {
  index: number;
  english: string;
  sanskrit: string;
  symbol: string;
}

export interface PlanetInfo {
  id: string;
  name: string;
  symbol: string;
  abbr: string;
}

export interface HouseData {
  number: number;
  sign: SignInfo;
  planets: PlanetInfo[];
}

export interface KundliBirthDetails {
  name: string;
  dob: string;
  time: string;
  place: string;
}

export interface KundliReport extends KundliBirthDetails {
  lagna: SignInfo;
  moonSign: SignInfo;
  nakshatra: string;
  dasha: string;
  guidance: string;
  houses: HouseData[];
}
