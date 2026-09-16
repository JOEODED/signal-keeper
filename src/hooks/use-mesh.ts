import { useEffect, useSyncExternalStore } from "react";
import {
  getServerSnapshot,
  getSnapshot,
  hydrate,
  subscribe,
  type MeshState,
} from "@/lib/mesh-store";

export function useMesh(): MeshState {
  useEffect(() => {
    hydrate();
  }, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
