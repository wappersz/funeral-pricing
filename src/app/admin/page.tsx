"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Signup {
  id: number;
  email: string;
  created_at: string;
}

export default function AdminPage() {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/signups")
      .then((res) => res.json())
      .then((data) => {
        setSignups(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-navy">
          funeralpricing.co.uk
        </Link>
        <span className="text-sm text-gray">Admin</span>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-navy">Email Signups</h1>
            <p className="mt-1 text-sm text-gray">
              {loading ? "Loading..." : `${signups.length} signup${signups.length !== 1 ? "s" : ""} so far`}
            </p>
          </div>
          <button
            onClick={() => {
              const csv = "Email,Signed Up\n" + signups.map((s) => `${s.email},${s.created_at}`).join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = "signups.csv";
              a.click();
            }}
            disabled={signups.length === 0}
            className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Export CSV
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray">Loading signups...</div>
        ) : signups.length === 0 ? (
          <div className="rounded-lg border border-border py-20 text-center text-gray">
            No signups yet. They&rsquo;ll appear here once people sign up.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-navy/5">
                <tr>
                  <th className="px-4 py-3 font-medium text-navy">#</th>
                  <th className="px-4 py-3 font-medium text-navy">Email</th>
                  <th className="px-4 py-3 font-medium text-navy">Signed Up</th>
                </tr>
              </thead>
              <tbody>
                {signups.map((signup, i) => (
                  <tr key={signup.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-gray">{signups.length - i}</td>
                    <td className="px-4 py-3 text-foreground">{signup.email}</td>
                    <td className="px-4 py-3 text-gray">
                      {new Date(signup.created_at + "Z").toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
