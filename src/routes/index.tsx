import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Radar, Send, ShieldQuestion } from "lucide-react";
import { useState } from "react";
import { useMesh } from "@/hooks/use-mesh";
import { pendingCount, queueMessage } from "@/lib/mesh-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Beacon — Offline-First Emergency Mesh Network" },
      {
        name: "description",
        content:
          "Send an SOS, find nearby devices and read emergency instructions with no internet. Beacon stores everything on your device and syncs automatically when a connection returns.",
      },
      { property: "og:title", content: "Beacon — Offline-First Emergency Mesh Network" },
      {
        property: "og:description",
        content: "Emergency communication that keeps working when the network does not.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const state = useMesh();
  const [sent, setSent] = useState<string | null>(null);
  const pending = pendingCount(state);

  function send(kind: "sos" | "checkin", body: string) {
    queueMessage(kind, body);
    setSent(kind === "sos" ? "SOS stored and relaying across nearby devices." : "Check-in stored.");
    window.setTimeout(() => setSent(null), 3500);
  }

  const stats = [
    { label: "Nodes in range", value: state.peers.length },
    { label: "Messages queued", value: pending },
    { label: "Contacts saved", value: state.contacts.length },
    {
      label: "Connection",
      value: state.online ? "Online" : "Offline",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <section className="panel grid-field relative overflow-hidden p-8 md:p-12">
        <div className="relative max-w-2xl">
          <p className="label-mono">Offline-first emergency network</p>
          <h1 className="mt-3 text-4xl leading-tight font-bold md:text-5xl">
            When the network fails,
            <span className="text-signal"> your neighbours are the network.</span>
          </h1>
          <p className="mt-4 text-sm text-muted-foreground md:text-base">
            Beacon works with no internet at all. Your SOS is written to the device, passed between
            nearby devices, and uploaded the moment any of them finds a connection.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() =>
                send(
                  "sos",
                  `SOS from ${state.profile.callSign}${state.profile.fullName ? ` (${state.profile.fullName})` : ""} — immediate assistance needed.`,
                )
              }
              className="group inline-flex items-center gap-3 rounded-lg bg-destructive px-6 py-4 text-base font-semibold text-destructive-foreground shadow-glow transition-transform hover:scale-[1.02]"
            >
              <AlertTriangle className="h-5 w-5" />
              Send SOS
            </button>
            <button
              onClick={() => send("checkin", `${state.profile.callSign} is safe.`)}
              className="inline-flex items-center gap-3 rounded-lg border border-border px-6 py-4 text-base font-medium hover:bg-secondary"
            >
              <CheckCircle2 className="h-5 w-5 text-mesh" />
              Mark me safe
            </button>
          </div>

          {sent && (
            <p className="mt-4 flex items-center gap-2 text-sm text-mesh">
              <Send className="h-4 w-4" /> {sent}
            </p>
          )}
        </div>

        <span className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full border border-signal/20">
          <span className="absolute inset-8 rounded-full border border-signal/20" />
          <span className="absolute inset-20 rounded-full border border-signal/30" />
          <span className="absolute top-1/2 left-1/2 h-40 w-0.5 origin-top bg-gradient-to-b from-signal/70 to-transparent animate-sweep" />
        </span>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="panel p-5">
            <p className="label-mono">{s.label}</p>
            <p className="mt-2 font-mono text-3xl">{s.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link to="/nearby" className="panel group p-6 transition-colors hover:border-signal">
          <Radar className="h-6 w-6 text-signal" />
          <h2 className="mt-4 text-lg font-semibold">Nearby devices</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            See who is in radio range, how strong their signal is, and who needs help.
          </p>
        </Link>
        <Link to="/guides" className="panel group p-6 transition-colors hover:border-signal">
          <ShieldQuestion className="h-6 w-6 text-signal" />
          <h2 className="mt-4 text-lg font-semibold">Emergency instructions</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            First aid, fire, flood and clean water steps, stored on the device.
          </p>
        </Link>
        <Link to="/queue" className="panel group p-6 transition-colors hover:border-signal">
          <Send className="h-6 w-6 text-signal" />
          <h2 className="mt-4 text-lg font-semibold">Message queue</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Everything you send is kept safely and uploaded automatically later.
          </p>
        </Link>
      </section>
    </div>
  );
}
