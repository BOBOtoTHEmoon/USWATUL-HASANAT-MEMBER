"use client";

import { useState, useEffect, useRef } from "react";
import { supabase, Member } from "@/lib/supabase";
import QRCode from "react-qr-code";

const SOCIETY = "Uswatul Hasanat";

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

/* ─── QR DOWNLOAD HELPER ─── */
function downloadQR(member: Member) {
  const base = getBaseUrl();
  const url = `${base}/member/${member.reg_number}`;
  const svg = document.createElement("div");
  svg.innerHTML = `<svg viewBox="0 0 256 256" width="512" height="512" xmlns="http://www.w3.org/2000/svg"></svg>`;

  // Create a temporary container to render the QR
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  document.body.appendChild(container);

  // Use the QR API to generate a downloadable PNG
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 580;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Find the QR SVG element by data attribute
  const qrSvg = document.querySelector(`[data-qr="${member.reg_number}"]`) as SVGSVGElement | null;
  if (!qrSvg) return;

  const svgData = new XMLSerializer().serializeToString(qrSvg);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  const img = new window.Image();
  img.onload = () => {
    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 512, 580);

    // Draw QR code centered
    ctx.drawImage(img, 56, 24, 400, 400);

    // Draw name below
    ctx.fillStyle = "#111827";
    ctx.font = "bold 22px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(member.name, 256, 460);

    // Draw reg number
    ctx.fillStyle = "#6b7280";
    ctx.font = "16px monospace";
    ctx.fillText(member.reg_number, 256, 490);

    // Draw society
    ctx.fillStyle = "#15803d";
    ctx.font = "14px Inter, system-ui, sans-serif";
    ctx.fillText(SOCIETY, 256, 520);

    // Trigger download
    const link = document.createElement("a");
    link.download = `${member.name.replace(/\s+/g, "-")}-${member.reg_number}-QR.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    URL.revokeObjectURL(svgUrl);
    document.body.removeChild(container);
  };
  img.src = svgUrl;
}

/* ─── ADD MEMBER FORM ─── */
function AddMemberForm({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [gender, setGender] = useState<"M" | "F">("F");
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !regNumber.trim()) {
      setError("Name and registration number are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let photo_url: string | null = null;

      if (photo) {
        const ext = photo.name.split(".").pop();
        const fileName = `${regNumber}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("member-photos")
          .upload(fileName, photo, { upsert: true });

        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage
          .from("member-photos")
          .getPublicUrl(fileName);

        photo_url = urlData.publicUrl;
      }

      const { error: insertErr } = await supabase.from("members").insert({
        name: name.trim(),
        reg_number: regNumber.trim(),
        gender,
        group_name: SOCIETY,
        photo_url,
      });

      if (insertErr) throw insertErr;

      setName("");
      setRegNumber("");
      setGender("F");
      setPhoto(null);
      if (fileRef.current) fileRef.current.value = "";
      onAdded();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add member";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Add new member</h3>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Full name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rafiu Mulikat"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Registration number</label>
          <input type="text" value={regNumber} onChange={(e) => setRegNumber(e.target.value)}
            placeholder="e.g. 002476"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Gender</label>
          <div className="flex gap-3">
            {(["F", "M"] as const).map((g) => (
              <button key={g} type="button" onClick={() => setGender(g)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all ${
                  gender === g ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                }`}>
                {g === "F" ? "Female" : "Male"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Photo (optional)</label>
          <input ref={fileRef} type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
        </div>

        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white font-medium py-3 rounded-xl hover:from-green-800 hover:to-green-700 transition-all disabled:opacity-50 text-sm">
          {loading ? "Adding..." : "Add member"}
        </button>
      </div>
    </div>
  );
}

/* ─── MEMBER ROW ─── */
function MemberRow({ member, onSelect, onDelete, onEdit }: { member: Member; onSelect: (m: Member) => void; onDelete: (m: Member) => void; onEdit: (m: Member) => void }) {
  const initials = member.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="bg-white rounded-xl border border-gray-100 px-4 py-3.5 flex items-center gap-3 hover:border-gray-200 transition-colors">
      {member.photo_url ? (
        <img src={member.photo_url} alt={member.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
      ) : (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
          member.gender === "F" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
        }`}>{initials}</div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-900 truncate">{member.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{member.reg_number} · {member.gender === "F" ? "Female" : "Male"}</p>
      </div>
      <button onClick={() => onEdit(member)} className="text-xs text-blue-500 font-medium hover:text-blue-700 px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">Edit</button>
      <button onClick={() => onSelect(member)} className="text-xs text-green-600 font-medium hover:text-green-800 px-2 py-1.5 rounded-lg hover:bg-green-50 transition-colors">QR</button>
      <button onClick={() => onDelete(member)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors">✕</button>
    </div>
  );
}

/* ─── QR MODAL ─── */
function QRModal({ member, onClose }: { member: Member; onClose: () => void }) {
  const base = getBaseUrl();
  const url = `${base}/member/${member.reg_number}`;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold text-gray-900">{member.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="bg-white p-4 inline-block rounded-xl border border-gray-100">
          <QRCode value={url} size={200} fgColor="#15803d" data-qr={member.reg_number} />
        </div>
        <p className="text-xs text-gray-400 mt-3 font-mono break-all">{url}</p>
        <button onClick={() => downloadQR(member)}
          className="mt-4 w-full bg-green-50 text-green-700 font-medium text-sm py-2.5 rounded-xl hover:bg-green-100 transition-colors">
          Download QR code
        </button>
      </div>
    </div>
  );
}

/* ─── QR PRINT GRID ─── */
function QRPrintGrid({ members }: { members: Member[] }) {
  const base = getBaseUrl();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{members.length} QR codes ready</p>
        <button onClick={() => window.print()}
          className="text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-xl transition-colors">
          Print all
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {members.map((m) => (
          <div key={m.id} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="inline-block">
              <QRCode value={`${base}/member/${m.reg_number}`} size={110} fgColor="#15803d" data-qr={m.reg_number} />
            </div>
            <p className="text-xs font-medium text-gray-900 mt-2 truncate">{m.name}</p>
            <p className="text-[10px] text-gray-400 font-mono">{m.reg_number}</p>
            <button onClick={() => downloadQR(m)}
              className="mt-2 text-[11px] text-green-600 font-medium hover:text-green-800 hover:bg-green-50 px-3 py-1 rounded-lg transition-colors">
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── EDIT MEMBER MODAL ─── */
function EditMemberModal({ member, onClose, onSaved }: { member: Member; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(member.name);
  const [regNumber, setRegNumber] = useState(member.reg_number);
  const [gender, setGender] = useState<"M" | "F">(member.gender);
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSave() {
    if (!name.trim() || !regNumber.trim()) {
      setError("Name and registration number are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let photo_url = member.photo_url;

      if (photo) {
        const ext = photo.name.split(".").pop();
        const fileName = `${regNumber.trim()}.${ext}`;

        // Delete old photo if exists
        if (member.photo_url) {
          const oldName = member.photo_url.split("/").pop();
          if (oldName) await supabase.storage.from("member-photos").remove([oldName]);
        }

        const { error: uploadErr } = await supabase.storage
          .from("member-photos")
          .upload(fileName, photo, { upsert: true });

        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage
          .from("member-photos")
          .getPublicUrl(fileName);

        photo_url = urlData.publicUrl;
      }

      const { error: updateErr } = await supabase
        .from("members")
        .update({
          name: name.trim(),
          reg_number: regNumber.trim(),
          gender,
          photo_url,
        })
        .eq("id", member.id);

      if (updateErr) throw updateErr;

      onSaved();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update member";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-5">
          <h3 className="font-semibold text-gray-900">Edit member</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
        )}

        {/* Current photo preview */}
        {member.photo_url && !photo && (
          <div className="mb-4 text-center">
            <img src={member.photo_url} alt={member.name} className="w-20 h-20 rounded-xl object-cover mx-auto" />
            <p className="text-xs text-gray-400 mt-1">Current photo</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Full name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Registration number</label>
            <input type="text" value={regNumber} onChange={(e) => setRegNumber(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Gender</label>
            <div className="flex gap-3">
              {(["F", "M"] as const).map((g) => (
                <button key={g} type="button" onClick={() => setGender(g)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all ${
                    gender === g ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}>
                  {g === "F" ? "Female" : "Male"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              {member.photo_url ? "Replace photo" : "Add photo"}
            </label>
            <input ref={fileRef} type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button onClick={handleSave} disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-700 to-green-600 text-white font-medium py-3 rounded-xl hover:from-green-800 hover:to-green-700 transition-all disabled:opacity-50 text-sm">
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN ADMIN PAGE ─── */
type Tab = "members" | "add" | "qrcodes";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("members");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [qrMember, setQrMember] = useState<Member | null>(null);
  const [editMember, setEditMember] = useState<Member | null>(null);

  async function fetchMembers() {
    setLoading(true);
    const { data, error } = await supabase.from("members").select("*").order("name");
    if (!error && data) setMembers(data as Member[]);
    setLoading(false);
  }

  async function deleteMember(member: Member) {
    if (!confirm(`Remove ${member.name}?`)) return;
    await supabase.from("members").delete().eq("id", member.id);
    if (member.photo_url) {
      const fileName = member.photo_url.split("/").pop();
      if (fileName) await supabase.storage.from("member-photos").remove([fileName]);
    }
    fetchMembers();
  }

  useEffect(() => { fetchMembers(); }, []);

  const filtered = members.filter(
    (m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.reg_number.includes(search)
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: "members", label: "Members" },
    { key: "add", label: "Add new" },
    { key: "qrcodes", label: "QR codes" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-gray-100">
          <img src="/logo.png" alt="Arikoserere" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{SOCIETY}</h1>
          <p className="text-xs text-gray-400">Admin · {members.length} members</p>
        </div>
      </div>

      <div className="flex gap-1.5 bg-white rounded-xl p-1 border border-gray-100 mb-5">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${
              tab === t.key ? "bg-green-50 text-green-700 border border-green-200" : "text-gray-400 border border-transparent hover:text-gray-600"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "members" && (
        <>
          <input type="text" placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-12">Loading members...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-400">{members.length === 0 ? "No members yet. Add your first member!" : "No members match your search."}</p>
            </div>
          ) : (
            <div className="space-y-2">{filtered.map((m) => <MemberRow key={m.id} member={m} onSelect={setQrMember} onDelete={deleteMember} onEdit={setEditMember} />)}</div>
          )}
        </>
      )}

      {tab === "add" && <AddMemberForm onAdded={() => { fetchMembers(); setTab("members"); }} />}
      {tab === "qrcodes" && <QRPrintGrid members={members} />}
      {qrMember && <QRModal member={qrMember} onClose={() => setQrMember(null)} />}
      {editMember && <EditMemberModal member={editMember} onClose={() => setEditMember(null)} onSaved={fetchMembers} />}
    </main>
  );
}