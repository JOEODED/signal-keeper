import { createFileRoute } from "@tanstack/react-router";
import { Phone, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { useMesh } from "@/hooks/use-mesh";
import { addContact, removeContact } from "@/lib/mesh-store";

export const Route = createFileRoute("/contacts")({
  head: () => ({
    meta: [
      { title: "Emergency Contacts — Beacon Emergency Mesh" },
      {
        name: "description",
        content:
          "Keep the people who must be reached in a crisis saved on the device, ready to be notified the moment any connection returns.",
      },
      { property: "og:title", content: "Emergency Contacts — Beacon Emergency Mesh" },
      {
        property: "og:description",
        content: "Offline contact list that is notified automatically when connectivity returns.",
      },
    ],
  }),
  component: ContactsPage,
});

const EMPTY = { name: "", relation: "", phone: "", priority: false };

function ContactsPage() {
  const { contacts } = useMesh();
  const [draft, setDraft] = useState(EMPTY);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="label-mono">Who to reach</p>
        <h1 className="text-3xl font-bold">Emergency contacts</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Saved on the device. Priority contacts are alerted first when a connection returns.
        </p>
      </div>

      <form
        className="panel grid gap-3 p-5 sm:grid-cols-[1fr_1fr_1fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.name.trim()) return;
          addContact(draft);
          setDraft(EMPTY);
        }}
      >
        <input
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="Name"
          className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-signal"
        />
        <input
          value={draft.relation}
          onChange={(e) => setDraft({ ...draft, relation: e.target.value })}
          placeholder="Relation"
          className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-signal"
        />
        <input
          value={draft.phone}
          onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
          placeholder="Phone"
          className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-signal"
        />
        <button className="inline-flex items-center justify-center gap-2 rounded-md bg-signal px-4 py-2 text-sm font-medium text-signal-foreground">
          <Plus className="h-4 w-4" /> Add
        </button>
        <label className="flex items-center gap-2 text-xs text-muted-foreground sm:col-span-4">
          <input
            type="checkbox"
            checked={draft.priority}
            onChange={(e) => setDraft({ ...draft, priority: e.target.checked })}
          />
          Mark as priority contact
        </label>
      </form>

      <div className="space-y-3">
        {contacts.length === 0 && (
          <div className="panel p-10 text-center text-sm text-muted-foreground">
            No contacts saved yet.
          </div>
        )}
        {contacts.map((c) => (
          <article key={c.id} className="panel flex items-center gap-4 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <Phone className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <p className="flex items-center gap-2 font-medium">
                {c.name}
                {c.priority && <Star className="h-3.5 w-3.5 fill-signal text-signal" />}
              </p>
              <p className="label-mono mt-1">
                {c.relation || "contact"} · {c.phone || "no number"}
              </p>
            </div>
            <button
              onClick={() => removeContact(c.id)}
              aria-label={`Remove ${c.name}`}
              className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
