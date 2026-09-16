import { createFileRoute } from "@tanstack/react-router";
import { Download, Hospital, LifeBuoy, MapPin, Droplets } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Offline Map — Beacon Emergency Mesh" },
      {
        name: "description",
        content:
          "A downloaded area map with shelters, clinics, water points and safe routes that stays usable when there is no signal at all.",
      },
      { property: "og:title", content: "Offline Map — Beacon Emergency Mesh" },
      {
        property: "og:description",
        content: "Downloaded shelters, clinics and water points, usable with zero signal.",
      },
    ],
  }),
  component: MapPage,
});

type Poi = {
  id: string;
  name: string;
  kind: "shelter" | "clinic" | "water";
  x: number;
  y: number;
  detail: string;
};

const POIS: Poi[] = [
  { id: "p1", name: "Riverside School Gym", kind: "shelter", x: 22, y: 30, detail: "Capacity 240 · blankets, hot food" },
  { id: "p2", name: "St. Mary Clinic", kind: "clinic", x: 63, y: 22, detail: "Triage open 24h · generator power" },
  { id: "p3", name: "Central Water Point", kind: "water", x: 44, y: 61, detail: "Tanker refills every 6 hours" },
  { id: "p4", name: "Market Square Shelter", kind: "shelter", x: 76, y: 68, detail: "Capacity 90 · dry, no power" },
  { id: "p5", name: "North Ridge Aid Post", kind: "clinic", x: 33, y: 78, detail: "First aid and stretcher team" },
];

const KIND = {
  shelter: { Icon: LifeBuoy, className: "bg-signal text-signal-foreground", label: "Shelter" },
  clinic: { Icon: Hospital, className: "bg-destructive text-destructive-foreground", label: "Clinic" },
  water: { Icon: Droplets, className: "bg-mesh text-mesh-foreground", label: "Water" },
} as const;

function MapPage() {
  const [selected, setSelected] = useState<Poi | null>(POIS[0] ?? null);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-mono">Cached area · 12.4 MB stored</p>
          <h1 className="text-3xl font-bold">Offline map</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            This area was downloaded in advance. Shelters, clinics, water points and your last known
            position stay visible with no signal.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary">
          <Download className="h-4 w-4" /> Area downloaded
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="panel grid-field relative aspect-[4/3] overflow-hidden">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 55 C 25 45, 45 70, 100 58" className="stroke-mesh/40" strokeWidth="2.5" fill="none" />
            <path d="M18 0 L 26 100" className="stroke-border" strokeWidth="1.5" fill="none" />
            <path d="M0 24 L 100 32" className="stroke-border" strokeWidth="1.5" fill="none" />
            <path d="M70 0 L 62 100" className="stroke-border" strokeWidth="1.5" fill="none" />
          </svg>

          <span
            className="absolute flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            style={{ left: "50%", top: "48%" }}
          >
            <span className="absolute h-4 w-4 rounded-full bg-signal/50 animate-ping-slow" />
            <span className="h-2.5 w-2.5 rounded-full bg-signal ring-2 ring-background" />
          </span>

          {POIS.map((poi) => {
            const k = KIND[poi.kind];
            return (
              <button
                key={poi.id}
                onClick={() => setSelected(poi)}
                style={{ left: `${poi.x}%`, top: `${poi.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-2 transition-transform hover:scale-110 ${k.className} ${
                  selected?.id === poi.id ? "ring-2 ring-foreground" : ""
                }`}
                aria-label={poi.name}
              >
                <k.Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="panel p-5">
            <p className="label-mono">Selected</p>
            {selected ? (
              <>
                <h2 className="mt-2 text-lg font-semibold">{selected.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{selected.detail}</p>
                <p className="label-mono mt-4 flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" /> {KIND[selected.kind].label}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Pick a point on the map.</p>
            )}
          </div>

          <div className="panel p-5">
            <p className="label-mono mb-3">All saved points</p>
            <ul className="space-y-2">
              {POIS.map((poi) => (
                <li key={poi.id}>
                  <button
                    onClick={() => setSelected(poi)}
                    className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-secondary"
                  >
                    <span className={`rounded-md p-1.5 ${KIND[poi.kind].className}`}>
                      {(() => {
                        const I = KIND[poi.kind].Icon;
                        return <I className="h-3.5 w-3.5" />;
                      })()}
                    </span>
                    {poi.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
