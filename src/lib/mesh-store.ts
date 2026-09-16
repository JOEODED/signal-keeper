// Offline-first local store for the emergency mesh network.
// Everything lives in localStorage so the app keeps working with no network.
// A lightweight pub/sub store powers React via useSyncExternalStore.

export type Profile = {
  callSign: string;
  fullName: string;
  bloodType: string;
  allergies: string;
  medications: string;
  notes: string;
  deviceId: string;
};

export type Contact = {
  id: string;
  name: string;
  relation: string;
  phone: string;
  priority: boolean;
};

export type MessageKind = "sos" | "checkin" | "broadcast";
export type MessageStatus = "queued" | "relayed" | "synced";

export type QueuedMessage = {
  id: string;
  kind: MessageKind;
  body: string;
  createdAt: number;
  status: MessageStatus;
  hops: number;
  relayedBy?: string;
};

export type Peer = {
  id: string;
  callSign: string;
  signal: number; // 0-100
  distance: number; // meters
  battery: number;
  status: "ok" | "needs-help" | "responder";
  lastSeen: number;
};

export type MeshState = {
  profile: Profile;
  contacts: Contact[];
  messages: QueuedMessage[];
  peers: Peer[];
  online: boolean;
  lastSync: number | null;
  syncing: boolean;
};

const STORAGE_KEY = "beacon.mesh.v1";

const defaultProfile: Profile = {
  callSign: "UNIT-07",
  fullName: "",
  bloodType: "",
  allergies: "",
  medications: "",
  notes: "",
  deviceId: "node-local",
};

const defaultState: MeshState = {
  profile: defaultProfile,
  contacts: [],
  messages: [],
  peers: [],
  online: true,
  lastSync: null,
  syncing: false,
};

let state: MeshState = defaultState;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  if (typeof window === "undefined") return;
  const { profile, contacts, messages, lastSync } = state;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile, contacts, messages, lastSync }));
}

function setState(patch: Partial<MeshState>) {
  state = { ...state, ...patch };
  persist();
  emit();
}

const CALL_SIGNS = [
  "ASH-12",
  "RIVER-04",
  "KITE-89",
  "NORTH-21",
  "EMBER-56",
  "PILOT-33",
  "STONE-77",
  "LARK-08",
];

function rnd(min: number, max: number) {
  return Math.round(min + Math.random() * (max - min));
}

function makePeers(): Peer[] {
  const count = rnd(3, 6);
  return Array.from({ length: count }, (_, i) => ({
    id: `peer-${i}-${rnd(1000, 9999)}`,
    callSign: CALL_SIGNS[(i + rnd(0, 7)) % CALL_SIGNS.length],
    signal: rnd(25, 99),
    distance: rnd(8, 480),
    battery: rnd(11, 98),
    status: (["ok", "ok", "needs-help", "responder"] as const)[rnd(0, 3)],
    lastSeen: Date.now() - rnd(0, 240) * 1000,
  }));
}

export function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const saved = raw ? JSON.parse(raw) : {};
    state = {
      ...defaultState,
      ...saved,
      profile: { ...defaultProfile, ...(saved.profile ?? {}) },
      contacts: saved.contacts ?? [],
      messages: saved.messages ?? [],
      peers: makePeers(),
      online: window.navigator.onLine,
    };
  } catch {
    state = { ...defaultState, peers: makePeers(), online: window.navigator.onLine };
  }
  emit();

  window.addEventListener("online", () => setState({ online: true }));
  window.addEventListener("offline", () => setState({ online: false }));

  // Mesh discovery loop: peers drift in and out of radio range.
  window.setInterval(() => {
    setState({
      peers: state.peers.map((p) => ({
        ...p,
        signal: Math.max(6, Math.min(99, p.signal + rnd(-9, 9))),
        distance: Math.max(4, p.distance + rnd(-25, 25)),
        lastSeen: Math.random() > 0.6 ? Date.now() : p.lastSeen,
      })),
    });
  }, 4000);

  // Store-and-forward: queued messages get relayed by nearby nodes.
  window.setInterval(() => {
    const queued = state.messages.find((m) => m.status === "queued");
    if (!queued || state.peers.length === 0) return;
    const relay = state.peers[rnd(0, state.peers.length - 1)];
    setState({
      messages: state.messages.map((m) =>
        m.id === queued.id
          ? { ...m, status: "relayed" as MessageStatus, hops: m.hops + 1, relayedBy: relay.callSign }
          : m,
      ),
    });
  }, 6000);
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot() {
  return state;
}

export function getServerSnapshot() {
  return defaultState;
}

// ---- actions ----

export function saveProfile(profile: Partial<Profile>) {
  setState({ profile: { ...state.profile, ...profile } });
}

export function addContact(contact: Omit<Contact, "id">) {
  setState({ contacts: [...state.contacts, { ...contact, id: `c-${Date.now()}` }] });
}

export function removeContact(id: string) {
  setState({ contacts: state.contacts.filter((c) => c.id !== id) });
}

export function queueMessage(kind: MessageKind, body: string) {
  const message: QueuedMessage = {
    id: `m-${Date.now()}`,
    kind,
    body,
    createdAt: Date.now(),
    status: "queued",
    hops: 0,
  };
  setState({ messages: [message, ...state.messages] });
  return message;
}

export function clearSynced() {
  setState({ messages: state.messages.filter((m) => m.status !== "synced") });
}

export async function syncNow() {
  if (!state.online || state.syncing) return;
  setState({ syncing: true });
  await new Promise((r) => setTimeout(r, 1200));
  setState({
    syncing: false,
    lastSync: Date.now(),
    messages: state.messages.map((m) => ({ ...m, status: "synced" as MessageStatus })),
  });
}

export function pendingCount(s: MeshState) {
  return s.messages.filter((m) => m.status !== "synced").length;
}
