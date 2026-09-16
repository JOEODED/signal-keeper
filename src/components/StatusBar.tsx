import { Radio, RefreshCw, Signal, WifiOff } from "lucide-react";
import { useMesh } from "@/hooks/use-mesh";
import { pendingCount, syncNow } from "@/lib/mesh-store";

export function StatusBar() {
  const state = useMesh();
  const pending = pendingCount(state);

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border bg-surface/70 px-4 py-2 text-xs backdrop-blur md:px-8">
      <span className="flex items-center gap-2 font-mono">
        {state.online ? (
          <>
            <Signal className="h-3.5 w-3.5 text-mesh" />
            <span className="text-mesh">ONLINE</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3.5 w-3.5 text-destructive" />
            <span className="text-destructive">OFFLINE — MESH ONLY</span>
          </>
        )}
      </span>
      <span className="flex items-center gap-2 font-mono text-muted-foreground">
        <Radio className="h-3.5 w-3.5 text-signal" />
        {state.peers.length} NODES IN RANGE
      </span>
      <span className="font-mono text-muted-foreground">{pending} QUEUED</span>
      <button
        onClick={() => void syncNow()}
        disabled={!state.online || state.syncing}
        className="ml-auto inline-flex items-center gap-2 rounded-md border border-border px-3 py-1 font-mono text-[0.68rem] tracking-widest uppercase transition-colors hover:bg-accent disabled:opacity-40"
      >
        <RefreshCw className={`h-3 w-3 ${state.syncing ? "animate-spin" : ""}`} />
        {state.syncing ? "Syncing" : "Sync"}
      </button>
    </div>
  );
}
