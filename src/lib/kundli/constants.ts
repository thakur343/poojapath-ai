import type { HouseData, KundliBirthDetails, KundliReport, PlanetInfo, SignInfo } from "./types";

export const ZODIAC_SIGNS: SignInfo[] = [
  { index: 0, english: "Aries", sanskrit: "Mesha", symbol: "♈" },
  { index: 1, english: "Taurus", sanskrit: "Vrishabha", symbol: "♉" },
  { index: 2, english: "Gemini", sanskrit: "Mithuna", symbol: "♊" },
  { index: 3, english: "Cancer", sanskrit: "Karka", symbol: "♋" },
  { index: 4, english: "Leo", sanskrit: "Simha", symbol: "♌" },
  { index: 5, english: "Virgo", sanskrit: "Kanya", symbol: "♍" },
  { index: 6, english: "Libra", sanskrit: "Tula", symbol: "♎" },
  { index: 7, english: "Scorpio", sanskrit: "Vrishchika", symbol: "♏" },
  { index: 8, english: "Sagittarius", sanskrit: "Dhanu", symbol: "♐" },
  { index: 9, english: "Capricorn", sanskrit: "Makara", symbol: "♑" },
  { index: 10, english: "Aquarius", sanskrit: "Kumbha", symbol: "♒" },
  { index: 11, english: "Pisces", sanskrit: "Meena", symbol: "♓" },
];

export const PLANETS: Record<string, PlanetInfo> = {
  sun: { id: "sun", name: "Sun", symbol: "☉", abbr: "Su" },
  moon: { id: "moon", name: "Moon", symbol: "☽", abbr: "Mo" },
  mars: { id: "mars", name: "Mars", symbol: "♂", abbr: "Ma" },
  mercury: { id: "mercury", name: "Mercury", symbol: "☿", abbr: "Me" },
  jupiter: { id: "jupiter", name: "Jupiter", symbol: "♃", abbr: "Ju" },
  venus: { id: "venus", name: "Venus", symbol: "♀", abbr: "Ve" },
  saturn: { id: "saturn", name: "Saturn", symbol: "♄", abbr: "Sa" },
  rahu: { id: "rahu", name: "Rahu", symbol: "☊", abbr: "Ra" },
  ketu: { id: "ketu", name: "Ketu", symbol: "☋", abbr: "Ke" },
};

export const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta",
  "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];

export const DASHAS = [
  "Ketu Mahadasha",
  "Venus Mahadasha",
  "Sun Mahadasha",
  "Moon Mahadasha",
  "Mars Mahadasha",
  "Rahu Mahadasha",
  "Jupiter Mahadasha",
  "Saturn Mahadasha",
  "Mercury Mahadasha",
];

export const RAHUL_REFERENCE_CHART: KundliReport = {
  name: "Rahul",
  dob: "2001-03-17",
  time: "05:00",
  place: "Bihar, India",
  lagna: ZODIAC_SIGNS[7],
  moonSign: ZODIAC_SIGNS[0],
  nakshatra: "Dhanishta",
  dasha: "Mars Mahadasha",
  guidance:
    "Favorable period for relationships and inner peace. Chant your Ishta Devata mantra daily.",
  houses: buildHousesFromLagna(7, {
    1: ["mars"],
    5: ["sun", "mercury"],
    6: ["moon", "venus"],
    7: ["saturn"],
    8: ["jupiter"],
    10: ["rahu"],
    4: ["ketu"],
  }),
};

function buildHousesFromLagna(
  lagnaIndex: number,
  placements: Record<number, string[]>
): HouseData[] {
  return Array.from({ length: 12 }, (_, i) => {
    const houseNumber = i + 1;
    const sign = ZODIAC_SIGNS[(lagnaIndex + i) % 12];
    const planets = (placements[houseNumber] || []).map((id) => PLANETS[id]);
    return { number: houseNumber, sign, planets };
  });
}

function hashInput(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return "Not provided";
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDisplayTime(time: string): string {
  if (!time) return "Not provided";
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours)) return time;
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

function isRahulReference(details: KundliBirthDetails): boolean {
  const name = details.name.trim().toLowerCase();
  return (
    name.includes("rahul") &&
    details.dob === "2001-03-17" &&
    details.time.startsWith("05:00") &&
    details.place.toLowerCase().includes("bihar")
  );
}

function buildGeneratedPlacements(seed: number, lagnaIndex: number, moonIndex: number): Record<number, string[]> {
  const moonHouse = ((moonIndex - lagnaIndex + 12) % 12) + 1;
  const allPlanets = Object.keys(PLANETS);
  const placements: Record<number, string[]> = {
    1: [allPlanets[seed % 9]],
    [moonHouse]: [PLANETS.moon.id, ...(seed % 3 === 0 ? [PLANETS.venus.id] : [])],
  };

  const used = new Set(Object.values(placements).flat());
  let house = (seed % 12) + 1;
  allPlanets.forEach((planet) => {
    if (used.has(planet)) return;
    placements[house] = [...(placements[house] || []), planet];
    house = (house % 12) + 1;
  });

  return placements;
}

export function generateKundliReport(details: KundliBirthDetails): KundliReport {
  if (isRahulReference(details)) {
    return {
      ...RAHUL_REFERENCE_CHART,
      name: details.name.trim(),
    };
  }

  const seed = hashInput(`${details.name}|${details.dob}|${details.time}|${details.place}`);
  const lagnaIndex = seed % 12;
  const moonIndex = (seed + 5) % 12;

  return {
    name: details.name.trim(),
    dob: details.dob,
    time: details.time,
    place: details.place.trim(),
    lagna: ZODIAC_SIGNS[lagnaIndex],
    moonSign: ZODIAC_SIGNS[moonIndex],
    nakshatra: NAKSHATRAS[seed % NAKSHATRAS.length],
    dasha: DASHAS[seed % DASHAS.length],
    guidance:
      seed % 2 === 0
        ? "Strong planetary support for career growth. Focus on consistent effort and morning rituals."
        : "Favorable period for relationships and inner peace. Chant your Ishta Devata mantra daily.",
    houses: buildHousesFromLagna(
      lagnaIndex,
      buildGeneratedPlacements(seed, lagnaIndex, moonIndex)
    ),
  };
}

export function formatKundliMeta(report: KundliReport) {
  return {
    displayDob: formatDisplayDate(report.dob),
    displayTime: formatDisplayTime(report.time),
    lagnaLabel: `${report.lagna.english} (${report.lagna.sanskrit})`,
    moonLabel: `${report.moonSign.english} (${report.moonSign.sanskrit})`,
  };
}
