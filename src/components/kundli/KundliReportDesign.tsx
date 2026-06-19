import type { HouseData, KundliReport } from "@/lib/kundli/types";
import { formatKundliMeta } from "@/lib/kundli/constants";

interface Props {
  report: KundliReport;
  id?: string;
}

const CHART = {
  x: 150,
  y: 430,
  size: 520,
};

const houseCenters: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: -185 },
  2: { x: 145, y: -145 },
  3: { x: 185, y: -20 },
  4: { x: 145, y: 145 },
  5: { x: 40, y: 185 },
  6: { x: 55, y: 35 },
  7: { x: 0, y: 185 },
  8: { x: -145, y: 145 },
  9: { x: -185, y: 20 },
  10: { x: -145, y: -145 },
  11: { x: -40, y: -185 },
  12: { x: -55, y: -35 },
};

function HouseCell({ house, cx, cy }: { house: HouseData; cx: number; cy: number }) {
  const center = houseCenters[house.number];
  const x = cx + center.x;
  const y = cy + center.y;

  return (
    <g>
      <text
        x={x}
        y={y - 18}
        textAnchor="middle"
        fill="#F2C96E"
        fontSize="11"
        fontWeight="600"
        opacity="0.55"
      >
        {house.number}
      </text>
      <text x={x} y={y} textAnchor="middle" fill="#FFD700" fontSize="24">
        {house.sign.symbol}
      </text>
      <text x={x} y={y + 16} textAnchor="middle" fill="#C9922B" fontSize="10">
        {house.sign.sanskrit}
      </text>
      <text x={x} y={y + 28} textAnchor="middle" fill="#8FA8C8" fontSize="9" opacity="0.85">
        {house.sign.english}
      </text>
      {house.planets.length > 0 && (
        <text x={x} y={y + 46} textAnchor="middle" fill="#FDF0DC" fontSize="13">
          {house.planets.map((planet) => planet.symbol).join(" ")}
        </text>
      )}
      {house.planets.length > 0 && (
        <text x={x} y={y + 58} textAnchor="middle" fill="#E8600A" fontSize="8" opacity="0.9">
          {house.planets.map((planet) => planet.abbr).join(" · ")}
        </text>
      )}
    </g>
  );
}

function NorthIndianChart({ houses }: { houses: HouseData[] }) {
  const { x, y, size } = CHART;
  const x1 = x + size;
  const y1 = y + size;
  const cx = x + size / 2;
  const cy = y + size / 2;

  return (
    <g>
      <rect
        x={x - 8}
        y={y - 8}
        width={size + 16}
        height={size + 16}
        fill="none"
        stroke="url(#goldStroke)"
        strokeWidth="2.5"
        rx="4"
      />

      <rect x={x} y={y} width={size} height={size} fill="rgba(8,18,42,0.72)" stroke="#C9922B" strokeWidth="1.5" />

      <line x1={x} y1={y} x2={x1} y2={y1} stroke="#C9922B" strokeWidth="1.2" opacity="0.85" />
      <line x1={x1} y1={y} x2={x} y2={y1} stroke="#C9922B" strokeWidth="1.2" opacity="0.85" />
      <line x1={cx} y1={y} x2={cx} y2={cy} stroke="#C9922B" strokeWidth="1.2" opacity="0.85" />
      <line x1={x1} y1={cy} x2={cx} y2={cy} stroke="#C9922B" strokeWidth="1.2" opacity="0.85" />
      <line x1={cx} y1={y1} x2={cx} y2={cy} stroke="#C9922B" strokeWidth="1.2" opacity="0.85" />
      <line x1={x} y1={cy} x2={cx} y2={cy} stroke="#C9922B" strokeWidth="1.2" opacity="0.85" />

      <polygon
        points={`${cx},${cy - 28} ${cx + 28},${cy} ${cx},${cy + 28} ${cx - 28},${cy}`}
        fill="rgba(232,96,10,0.12)"
        stroke="#E8600A"
        strokeWidth="1"
      />
      <text x={cx} y={cy + 5} textAnchor="middle" fill="#F5841F" fontSize="22" opacity="0.8">
        ॐ
      </text>

      {houses.map((house) => (
        <HouseCell key={house.number} house={house} cx={cx} cy={cy} />
      ))}

      <text x={cx} y={y - 18} textAnchor="middle" fill="#F2C96E" fontSize="12" letterSpacing="3">
        EAST
      </text>
      <text x={cx} y={y1 + 34} textAnchor="middle" fill="#F2C96E" fontSize="12" letterSpacing="3">
        WEST
      </text>
      <text x={x - 28} y={cy + 4} textAnchor="middle" fill="#F2C96E" fontSize="12" letterSpacing="2">
        N
      </text>
      <text x={x1 + 28} y={cy + 4} textAnchor="middle" fill="#F2C96E" fontSize="12" letterSpacing="2">
        S
      </text>
    </g>
  );
}

export default function KundliReportDesign({ report, id }: Props) {
  const meta = formatKundliMeta(report);

  return (
    <div id={id} className="kundli-report-wrap">
      <svg
        viewBox="0 0 820 1180"
        xmlns="http://www.w3.org/2000/svg"
        className="kundli-report-svg"
        role="img"
        aria-label={`Janam Kundli for ${report.name}`}
      >
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0A1628" />
            <stop offset="45%" stopColor="#0D1B2A" />
            <stop offset="100%" stopColor="#1C0A00" />
          </linearGradient>

          <linearGradient id="goldStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#C9922B" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>

          <linearGradient id="goldFoil" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF1B8" />
            <stop offset="35%" stopColor="#F2C96E" />
            <stop offset="70%" stopColor="#C9922B" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>

          <radialGradient id="mandalaGlow" cx="50%" cy="42%" r="55%">
            <stop offset="0%" stopColor="#E8600A" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#0A1628" stopOpacity="0" />
          </radialGradient>

          <pattern id="sanskritPattern" width="80" height="80" patternUnits="userSpaceOnUse">
            <rect width="80" height="80" fill="transparent" />
            <text x="20" y="28" fill="#C9922B" opacity="0.08" fontSize="16">
              ॐ
            </text>
            <text x="48" y="58" fill="#E8600A" opacity="0.06" fontSize="12">
              श्री
            </text>
          </pattern>

          <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="820" height="1180" fill="url(#bgGradient)" />
        <rect width="820" height="1180" fill="url(#sanskritPattern)" />
        <rect width="820" height="1180" fill="url(#mandalaGlow)" />

        {[120, 180, 240, 300, 360].map((radius) => (
          <circle
            key={radius}
            cx="410"
            cy="500"
            r={radius}
            fill="none"
            stroke="#C9922B"
            strokeWidth="0.6"
            opacity={0.08 + radius / 2000}
            strokeDasharray="4 8"
          />
        ))}

        <rect x="36" y="36" width="748" height="1108" fill="none" stroke="url(#goldStroke)" strokeWidth="3" rx="12" />
        <rect x="52" y="52" width="716" height="1076" fill="none" stroke="#C9922B" strokeWidth="1" opacity="0.45" rx="8" />

        {[
          [52, 52],
          [768, 52],
          [52, 1128],
          [768, 1128],
        ].map(([px, py], index) => (
          <g key={index}>
            <circle cx={px} cy={py} r="14" fill="rgba(232,96,10,0.15)" stroke="#F2C96E" strokeWidth="1.2" />
            <text x={px} y={py + 4} textAnchor="middle" fill="#FFD700" fontSize="10">
              卍
            </text>
          </g>
        ))}

        <text x="410" y="98" textAnchor="middle" fill="url(#goldFoil)" fontSize="34" filter="url(#goldGlow)">
          PoojaPath AI
        </text>
        <text x="410" y="128" textAnchor="middle" fill="#FDF0DC" fontSize="16" letterSpacing="4" opacity="0.9">
          JANAM KUNDLI · VEDIC BIRTH CHART
        </text>
        <line x1="180" y1="145" x2="640" y2="145" stroke="#C9922B" strokeWidth="1" opacity="0.5" />

        <text x="410" y="178" textAnchor="middle" fill="#F5841F" fontSize="13" letterSpacing="2">
          NORTH INDIAN DIAMOND CHART
        </text>

        <g fontSize="13" fill="#FDF0DC">
          <text x="90" y="220">
            <tspan fill="#C9922B">Name:</tspan> {report.name}
          </text>
          <text x="90" y="246">
            <tspan fill="#C9922B">Date of Birth:</tspan> {meta.displayDob}
          </text>
          <text x="90" y="272">
            <tspan fill="#C9922B">Time of Birth:</tspan> {meta.displayTime}
          </text>
          <text x="90" y="298">
            <tspan fill="#C9922B">Place of Birth:</tspan> {report.place}
          </text>

          <text x="430" y="220">
            <tspan fill="#C9922B">Lagna:</tspan> {meta.lagnaLabel}
          </text>
          <text x="430" y="246">
            <tspan fill="#C9922B">Moon Sign:</tspan> {meta.moonLabel}
          </text>
          <text x="430" y="272">
            <tspan fill="#C9922B">Nakshatra:</tspan> {report.nakshatra}
          </text>
          <text x="430" y="298">
            <tspan fill="#C9922B">Current Dasha:</tspan> {report.dasha}
          </text>
        </g>

        <rect x="70" y="318" width="680" height="56" rx="10" fill="rgba(232,96,10,0.08)" stroke="#C9922B" strokeWidth="0.8" opacity="0.9" />
        <text x="410" y="352" textAnchor="middle" fill="#F2C96E" fontSize="12" letterSpacing="1.5">
          ☉ ☽ ♂ ☿ ♃ ♀ ♄ ☊ ☋ — Vedic Planetary Positions
        </text>

        <NorthIndianChart houses={report.houses} />

        <rect x="70" y="980" width="680" height="110" rx="12" fill="rgba(8,18,42,0.55)" stroke="url(#goldStroke)" strokeWidth="1.2" />
        <text x="410" y="1010" textAnchor="middle" fill="#FFD700" fontSize="14" letterSpacing="2">
          SPIRITUAL GUIDANCE
        </text>
        <text x="410" y="1040" textAnchor="middle" fill="#FDF0DC" fontSize="13" opacity="0.92">
          {report.guidance}
        </text>

        <line x1="120" y1="1110" x2="700" y2="1110" stroke="#C9922B" strokeWidth="0.8" opacity="0.35" />
        <text x="410" y="1138" textAnchor="middle" fill="#8FA8C8" fontSize="11" letterSpacing="1">
          Generated by PoojaPath AI — For Spiritual Guidance Only
        </text>
        <text x="410" y="1158" textAnchor="middle" fill="#C9922B" fontSize="10" opacity="0.65">
          Sacred Geometry · Gold Foil · Premium Vedic Astrology Report
        </text>
      </svg>
    </div>
  );
}
