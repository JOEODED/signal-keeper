# 🚨 Beacon — Offline-First Emergency Mesh Network

Beacon is an emergency communication app for the moments when the internet is gone: a storm, an outage, a disaster zone, a remote area with no coverage. Instead of depending on a server, it stores everything on the device and relays messages between nearby devices, then syncs automatically the moment a connection returns.

**Live demo:** _add your published URL here_

---

## Why it exists

In a real emergency the network is the first thing to fail — exactly when communication matters most. Beacon is built on the assumption that there is **no server, no signal and no second chance**: every action works offline first, and connectivity is treated as an optional bonus rather than a requirement.

---

## Features

| Feature | What it does |
| --- | --- |
| **Emergency profile** | Blood type, allergies, medications and responder notes stored on the device and attached to every SOS |
| **SOS message** | One tap writes an SOS to local storage and starts relaying it across nearby devices |
| **Nearby users / devices** | Live view of nodes in radio range with signal strength, distance, battery and status (OK / needs help / responder) |
| **Emergency contacts** | Priority contact list kept offline, notified first when connectivity returns |
| **Offline maps** | Pre-downloaded area map with shelters, clinics, water points and last known position |
| **Emergency instructions** | Bleeding, CPR, fire, flood, earthquake and water purification guides that open with zero signal |
| **Local message queue** | Store-and-forward queue showing each message as *stored → relayed → synced*, with hop count and relaying node |
| **Automatic sync** | Detects when the connection returns and uploads the whole queue without user action |

---

## Offline-first architecture

```text
┌─────────────────────────────────────────────────────────┐
│  UI (routes: command, nearby, queue, map, profile…)     │
├─────────────────────────────────────────────────────────┤
│  Mesh store  —  pub/sub state, actions, sync engine     │
├──────────────────────┬──────────────────────────────────┤
│  Local storage       │  Peer transport (mesh relay)     │
│  profile, contacts,  │  discovery, hop-by-hop           │
│  queued messages     │  store-and-forward delivery      │
├──────────────────────┴──────────────────────────────────┤
│  Sync layer  —  drains the queue when a link appears    │
└─────────────────────────────────────────────────────────┘
```

Design rules the app follows:

1. **Write locally first.** Every action is persisted before anything touches a network.
2. **Never block on connectivity.** No spinner ever waits for a server.
3. **Store and forward.** Undelivered messages hop between nodes until one reaches the outside world.
4. **Converge later.** When a link appears, the queue drains and each message is marked synced.

---

## Tech

- **React 19 + TanStack Start** (file-based routing, SSR-capable)
- **TypeScript** end to end
- **Tailwind CSS v4** with a semantic, token-driven design system
- **Local storage persistence** with a small `useSyncExternalStore` pub/sub store
- **Simulated peer mesh** — browsers cannot open raw Bluetooth/Wi-Fi Direct links, so peer discovery and relaying are modelled faithfully in the client. The queue, persistence and sync logic are real and transport-agnostic: swapping the simulated transport for BLE, Wi-Fi Aware or LoRa on a native shell requires no change to the queue or sync layers.

### Backend roadmap (Java / Spring Boot)

The sync endpoint is intentionally kept behind a single interface so it can be served by a Spring Boot service:

- `POST /api/v1/sync` — bulk upload of queued messages, idempotent by message ID
- `GET  /api/v1/alerts` — authority broadcasts pulled on reconnect
- `POST /api/v1/sos` — SOS fan-out to emergency contacts (SMS/email workers)
- Conflict resolution: last-write-wins per message ID, server-side deduplication by `(deviceId, messageId)`

---

## Running locally

```bash
bun install      # or npm install
bun run dev      # http://localhost:8080
```

### Try the offline behaviour

1. Open the app and send an SOS.
2. Turn off your network (or use DevTools → Network → Offline).
3. Keep sending messages and browsing maps, guides and profile — everything still works.
4. Turn the network back on and watch the queue drain to **synced**.

---

## Project structure

```text
src/
  components/StatusBar.tsx   # connection + mesh status strip
  hooks/use-mesh.ts          # React binding for the store
  lib/mesh-store.ts          # persistence, peer mesh, queue, sync engine
  routes/                    # index, nearby, queue, map, profile, contacts, guides
  styles.css                 # design tokens (night-ops palette)
```

---

## License

MIT
