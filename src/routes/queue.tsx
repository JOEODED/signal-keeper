import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, CloudUpload, Clock, Share2, Trash2 } from "lucide-react";
import { useMesh } from "@/hooks/use-mesh";
import { clearSynced, syncNow } from "@/lib/mesh-store";

export const Route = createFileRoute("/queue")({
  head: () => ({
    meta: [
      { title: "Message Queue — Beacon Emergency Mesh" },
      {
        name: "description",
        content:
          "Every SOS, check-in and broadcast is stored locally, relayed across nearby devices, and uploaded automatically once a connection returns.",
      },
      { property: "og:title", content: "Message Queue — Beacon Emergency Mesh" },
      {
        property: "og:description",
        content: "Local store-and-forward queue with automatic sync when internet returns.",
      },
    ],
  }),
  component: QueuePage,
});

const statusMeta = {
  queued: { label: "Stored locally", Icon: Clock, className: "text-muted-foreground" },
  relayed: { label: "Relayed via mesh", Icon: Share2, className: "text-signal" },
  synced: { label: "Synced to server", Icon: CheckCircle2, className: "text-mesh" },
} as const;

function QueuePage() {
  const state = useMesh();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-mono">Store and forward</p>
          <h1 className="text-3xl font-bold">Local message queue</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Nothing is ever lost. Messages are written to the device first, passed between nearby
            devices, and uploaded the moment a connection is available.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void syncNow()}
            disabled={!state.online || state.syncing}
            className="inline-flex items-center gap-2 rounded-md bg-signal px-4 py-2 text-sm font-medium text-signal-foreground disabled:opacity-40"
          >
            <CloudUpload className="h-4 w-4" /> Sync now
          </button>
          <button
            onClick={clearSynced}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary"
          >
            <Trash2 className="h-4 w-4" /> Clear synced
          </button>
        </div>
      </div>

      <p className="label-mono">
        Last sync:{" "}
        {state.lastSync ? new Date(state.lastSync).toLocaleString() : "never — running offline"}
      </p>

      <div className="space-y-3">
        {state.messages.length === 0 && (
          <div className="panel p-10 text-center text-sm text-muted-foreground">
            The queue is empty. Send an SOS or a check-in from the command screen.
          </div>
        )}
        {state.messages.map((m) => {
          const meta = statusMeta[m.status];
          return (
            <article key={m.id} className="panel flex flex-wrap items-center gap-4 p-4">
              <span
                className={`rounded-md px-2 py-1 font-mono text-[0.6rem] tracking-widest uppercase ${
                  m.kind === "sos"
                    ? "bg-destructive/15 text-destructive"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {m.kind}
              </span>
              <div className="min-w-[12rem] flex-1">
                <p className="text-sm">{m.body}</p>
                <p className="label-mono mt-1">
                  {new Date(m.createdAt).toLocaleTimeString()} · {m.hops} hop
                  {m.hops === 1 ? "" : "s"}
                  {m.relayedBy ? ` · via ${m.relayedBy}` : ""}
                </p>
              </div>
              <span className={`flex items-center gap-2 text-xs ${meta.className}`}>
                <meta.Icon className="h-4 w-4" />
                {meta.label}
              </span>
            </article>
          );
        })}
      </div>
    </div>
  );
}
