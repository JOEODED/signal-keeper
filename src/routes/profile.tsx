import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useMesh } from "@/hooks/use-mesh";
import { saveProfile, type Profile } from "@/lib/mesh-store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Emergency Profile — Beacon Emergency Mesh" },
      {
        name: "description",
        content:
          "Store the medical details rescuers need — blood type, allergies, medications — directly on the device so they are readable with no internet connection.",
      },
      { property: "og:title", content: "Emergency Profile — Beacon Emergency Mesh" },
      {
        property: "og:description",
        content: "Your offline medical card, stored on the device and attached to every SOS.",
      },
    ],
  }),
  component: ProfilePage,
});

const FIELDS: { key: keyof Profile; label: string; placeholder: string; long?: boolean }[] = [
  { key: "callSign", label: "Call sign", placeholder: "UNIT-07" },
  { key: "fullName", label: "Full name", placeholder: "Jane Okafor" },
  { key: "bloodType", label: "Blood type", placeholder: "O+" },
  { key: "allergies", label: "Allergies", placeholder: "Penicillin" },
  { key: "medications", label: "Medications", placeholder: "Insulin, twice daily" },
  { key: "notes", label: "Notes for responders", placeholder: "Deaf in left ear", long: true },
];

function ProfilePage() {
  const { profile } = useMesh();
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false);

  useEffect(() => setForm(profile), [profile]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="label-mono">Identity</p>
        <h1 className="text-3xl font-bold">Emergency profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This card is stored on your device and attached to every SOS you send, so responders can
          read it even with no connection.
        </p>
      </div>

      <form
        className="panel space-y-5 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          saveProfile(form);
          setSaved(true);
          window.setTimeout(() => setSaved(false), 2000);
        }}
      >
        {FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="label-mono">{f.label}</span>
            {f.long ? (
              <textarea
                rows={3}
                value={form[f.key]}
                placeholder={f.placeholder}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-signal"
              />
            ) : (
              <input
                value={form[f.key]}
                placeholder={f.placeholder}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-signal"
              />
            )}
          </label>
        ))}

        <button className="inline-flex items-center gap-2 rounded-md bg-signal px-4 py-2 text-sm font-medium text-signal-foreground">
          <Save className="h-4 w-4" /> {saved ? "Saved to device" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
