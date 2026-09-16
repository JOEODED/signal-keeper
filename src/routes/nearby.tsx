import { createFileRoute } from "@tanstack/react-router";
import { BatteryMedium, Radar, Send, ShieldCheck, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { useMesh } from "@/hooks/use-mesh";
import { queueMessage } from "@/lib/mesh-store";

export const Route = createFileRoute("/nearby")({
  head: () => ({
    meta: [
      { title: "Nearby Devices — Beacon Emergency Mesh" },
      {
        name: "description",
        content:
          "See every nearby device inside radio range, their signal strength, battery and status, and relay a message through the local mesh.",
      },
      { property: "og:title", content: "Nearby Devices — Beacon Emergency Mesh" },
      {
        property: "og:description",
        content: "Discover nearby nodes and relay emergency messages without internet.",
      },
    ],
  }),
  component: NearbyPage,
});

const statusStyles = {
  ok: { label: "OK", className: "text-mesh border-mesh/40 bg-mesh/10", Icon: ShieldCheck },
  "needs-help": {
    label: "NEEDS HELP",
    className: "text-destructive border-destructive/40 bg-destructive/10",
    Icon: TriangleAlert,
  },
  responder: {
    label: "RESPONDER",
    className: "text-signal border-signal/40 bg-signal/10",
    Icon: Radar,
  },
} as const;

function NearbyPage() {
  const { peers } = useMesh();
  const [broadcast, setBroadcast] = useState("");

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="label-mono">Discovery</p>
        <h1 className="text-3xl font-bold">Nearby devices</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Devices within local radio range are listed below. Messages hop from node to node until
          one of them finds a working connection.
        </p>
      </div>

      <div className="panel p-5">
        <p className="label-mono mb-3">Broadcast to the mesh</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={broadcast}
            onChange={(e) => setBroadcast(e.target.value)}
            placeholder="e.g. Water and blankets available at the school gym"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-signal"
          />
          <button
            onClick={() => {
              if (!broadcast.trim()) return;
              queueMessage("broadcast", broadcast.trim());
              setBroadcast("");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-signal px-4 py-2 text-sm font-medium text-signal-foreground transition-opacity hover:opacity-90"
          >
            <Send className="h-4 w-4" /> Relay
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {peers.map((peer) => {
          const s = statusStyles[peer.status];
          return (
            <article key={peer.id} className="panel p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-mono text-lg">{peer.callSign}</h2>
                  <p className="label-mono mt-1">
                    {peer.distance} m away · seen{" "}
                    {Math.max(0, Math.round((Date.now() - peer.lastSeen) / 1000))}s ago
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 font-mono text-[0.6rem] tracking-widest ${s.className}`}
                >
                  <s.Icon className="h-3 w-3" />
                  {s.label}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <div>
                  <div className="label-mono mb-1 flex justify-between">
                    <span>Signal</span>
                    <span>{peer.signal}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-signal transition-all duration-700"
                      style={{ width: `${peer.signal}%` }}
                    />
                  </div>
                </div>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BatteryMedium className="h-4 w-4" /> Battery {peer.battery}%
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
