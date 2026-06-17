import { supabase, Member } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";

async function getMember(id: string): Promise<Member | null> {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("reg_number", id)
    .single();

  if (error || !data) return null;
  return data as Member;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const member = await getMember(id);
  if (!member) return { title: "Member not found" };
  return {
    title: `${member.name} — Uswatul Hasanat`,
    description: `Verified member of Uswatul Hasanat Society. Reg: ${member.reg_number}`,
  };
}

export default async function MemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getMember(id);

  if (!member) notFound();

  return (
    <main className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Green header */}
          <div className="bg-gradient-to-br from-green-700 via-green-600 to-green-500 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-white text-lg">
                ☪
              </div>
              <div>
                <h1 className="text-white font-semibold text-lg">
                  Uswatul Hasanat
                </h1>
                <p className="text-white/80 text-xs mt-0.5">
                  Verified member
                </p>
              </div>
            </div>
          </div>

          {/* Photo + Name */}
          <div className="px-6 pt-6 text-center">
            {member.photo_url ? (
              <div className="w-28 h-28 rounded-full mx-auto mb-4 overflow-hidden border-4 border-green-100">
                <Image
                  src={member.photo_url}
                  alt={member.name}
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-28 h-28 rounded-full mx-auto mb-4 bg-green-50 border-4 border-green-100 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-green-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </div>
            )}

            <h2 className="text-2xl font-bold text-gray-900">{member.name}</h2>
            <span className="inline-block mt-2 text-xs font-semibold text-green-700 bg-green-50 px-4 py-1.5 rounded-full">
              {member.gender === "F" ? "Female" : "Male"}
            </span>
          </div>

          {/* Details */}
          <div className="px-6 pt-5 pb-2 space-y-3">
            <div className="bg-gray-50 rounded-xl px-5 py-4">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Registration number
              </p>
              <p className="text-2xl font-bold text-green-700 font-mono tracking-widest">
                {member.reg_number}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl px-5 py-4">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Society
              </p>
              <p className="text-base font-medium text-gray-700">
                {member.group_name}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-5 text-center">
            <div className="inline-flex items-center gap-2 text-green-600 text-sm font-medium">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              Verified member of Uswatul Hasanat
            </div>
          </div>
        </div>

        {/* Powered by footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Uswatul Hasanat Member Verification System
        </p>
      </div>
    </main>
  );
}
