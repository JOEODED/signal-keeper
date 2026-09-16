import { createFileRoute } from "@tanstack/react-router";
import { Droplets, Flame, HeartPulse, Waves, Wind } from "lucide-react";

export const Route = createFileRoute("/guides")({
  head: () => ({
    meta: [
      { title: "Emergency Instructions — Beacon Emergency Mesh" },
      {
        name: "description",
        content:
          "Step-by-step first aid, fire, flood, earthquake and clean water instructions stored on the device so they are readable with no signal.",
      },
      { property: "og:title", content: "Emergency Instructions — Beacon Emergency Mesh" },
      {
        property: "og:description",
        content: "Critical first aid and disaster instructions, always available offline.",
      },
    ],
  }),
  component: GuidesPage,
});

const GUIDES = [
  {
    title: "Severe bleeding",
    Icon: HeartPulse,
    steps: [
      "Press firmly on the wound with cloth and keep pressing.",
      "Do not remove soaked cloth — add more on top.",
      "Raise the injured limb above the heart if you can.",
      "Keep the person warm and lying down until help arrives.",
    ],
  },
  {
    title: "CPR for adults",
    Icon: HeartPulse,
    steps: [
      "Check breathing. If absent, start immediately.",
      "Push hard and fast in the centre of the chest, 100–120 pushes a minute.",
      "Let the chest rise fully between pushes.",
      "Keep going until the person breathes or someone takes over.",
    ],
  },
  {
    title: "Fire in the building",
    Icon: Flame,
    steps: [
      "Stay low, under the smoke.",
      "Feel doors before opening — skip any that are hot.",
      "Never use lifts.",
      "Once outside, stay out and mark yourself safe on the mesh.",
    ],
  },
  {
    title: "Flood",
    Icon: Waves,
    steps: [
      "Move to the highest safe floor, not a sealed attic.",
      "Never walk or drive through moving water.",
      "Switch off electricity at the mains if it is safe to reach.",
      "Keep drinking water sealed and above the water line.",
    ],
  },
  {
    title: "Earthquake",
    Icon: Wind,
    steps: [
      "Drop, take cover under sturdy furniture, hold on.",
      "Stay away from windows and heavy shelves.",
      "After the shaking, expect aftershocks and leave calmly.",
      "Do not light matches — there may be a gas leak.",
    ],
  },
  {
    title: "Making water safe",
    Icon: Droplets,
    steps: [
      "Let cloudy water settle, then pour off the clear part.",
      "Filter through clean cloth.",
      "Boil for at least one full minute.",
      "If boiling is impossible, use purification tablets as directed.",
    ],
  },
];

function GuidesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="label-mono">Always available</p>
        <h1 className="text-3xl font-bold">Emergency instructions</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          These guides are stored on the device. They open instantly, with or without a connection.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {GUIDES.map(({ title, Icon, steps }) => (
          <article key={title} className="panel p-6">
            <h2 className="flex items-center gap-3 text-lg font-semibold">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-signal/15 text-signal">
                <Icon className="h-5 w-5" />
              </span>
              {title}
            </h2>
            <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
              {steps.map((s, i) => (
                <li key={s} className="flex gap-3">
                  <span className="font-mono text-signal">{String(i + 1).padStart(2, "0")}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </div>
  );
}
