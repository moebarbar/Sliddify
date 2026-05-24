"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { getApiUrl } from "@/utils/api";
import { toast } from "sonner";

type Tier = {
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  highlight?: boolean;
  cta: string;
  features: string[];
  badge?: string;
};

const TIERS: Tier[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    tagline: "Try Sliddify with your own API key. No card required.",
    cta: "Start free",
    features: [
      "5 decks per month",
      "All built-in templates",
      "PDF + PPTX export",
      "Bring your own AI key (OpenAI, Claude, Gemini)",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: "$19",
    cadence: "per month",
    tagline: "For founders, creators, and freelancers shipping decks weekly.",
    highlight: true,
    badge: "Most popular",
    cta: "Join the waitlist",
    features: [
      "Unlimited decks",
      "Included AI credits (no separate key needed)",
      "Upload PDFs, CSVs, Docs as source material",
      "Custom brand template (1 upload)",
      "Priority generation queue",
      "Email support",
    ],
  },
  {
    name: "Team",
    price: "$49",
    cadence: "per user / month",
    tagline: "For teams that need shared templates and on-brand decks.",
    cta: "Talk to us",
    features: [
      "Everything in Pro, for everyone",
      "Unlimited custom brand templates",
      "Shared template library",
      "API + MCP access",
      "Single sign-on (SSO)",
      "Dedicated support",
    ],
  },
];

export default function PricingPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleWaitlistSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(getApiUrl("/api/v1/waitlist"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "pricing" }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail || "Something went wrong");
      }
      setSubmitted(true);
      setEmail("");
      toast.success("You're on the list! 🎉");
    } catch (err: any) {
      toast.error("Couldn't add you to the list", {
        description: err?.message || "Try again in a moment.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-amber-50 to-violet-50 text-slate-900">
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -left-32 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply blur-3xl opacity-50" />
        <div className="absolute top-1/3 -right-20 w-[28rem] h-[28rem] bg-violet-200 rounded-full mix-blend-multiply blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-1/3 w-[26rem] h-[26rem] bg-amber-200 rounded-full mix-blend-multiply blur-3xl opacity-50" />
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/sliddify-logo.svg" alt="Sliddify" className="h-8 w-auto" />
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/#how" className="text-slate-700 hover:text-slate-900 hidden md:block">How it works</Link>
          <Link href="/#templates" className="text-slate-700 hover:text-slate-900 hidden md:block">Templates</Link>
          <Link href="/pricing" className="text-slate-900 font-semibold hidden md:block">Pricing</Link>
          <Link href="/app" className="rounded-full bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 transition">
            Sign in
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-12 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-white/80 rounded-full px-4 py-1.5 text-sm font-medium text-slate-700 mb-6 shadow-sm">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Private beta · Waitlist pricing locked for founders
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-5 leading-[1.05]">
          Simple, honest pricing.
        </h1>
        <p className="text-lg text-slate-600 max-w-xl mx-auto">
          Start free with your own API key. Upgrade when you ship more decks
          than you have hours.
        </p>
      </section>

      {/* Tiers */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-3xl p-8 backdrop-blur-md border shadow-lg flex flex-col ${
                tier.highlight
                  ? "bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 text-white border-white/20 scale-[1.02]"
                  : "bg-white/70 text-slate-900 border-white/80"
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-300 text-amber-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  {tier.badge}
                </div>
              )}

              <h3 className={`text-2xl font-bold mb-2 ${tier.highlight ? "text-white" : "text-slate-900"}`}>
                {tier.name}
              </h3>
              <p className={`text-sm mb-6 ${tier.highlight ? "text-white/80" : "text-slate-600"}`}>
                {tier.tagline}
              </p>

              <div className="mb-6">
                <span className="text-5xl font-bold">{tier.price}</span>
                <span className={`ml-2 text-sm ${tier.highlight ? "text-white/70" : "text-slate-500"}`}>
                  {tier.cadence}
                </span>
              </div>

              <ul className={`space-y-3 mb-8 flex-1 ${tier.highlight ? "text-white/95" : "text-slate-700"}`}>
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span className={`mt-0.5 ${tier.highlight ? "text-amber-200" : "text-emerald-500"}`}>✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {tier.name === "Team" ? (
                <a
                  href="mailto:hello@sliddify.app?subject=Sliddify%20Team%20plan"
                  className={`block text-center py-3 rounded-full font-semibold transition ${
                    tier.highlight
                      ? "bg-white text-slate-900 hover:bg-slate-100"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {tier.cta}
                </a>
              ) : tier.name === "Free" ? (
                <Link
                  href="/app"
                  className={`block text-center py-3 rounded-full font-semibold transition ${
                    tier.highlight
                      ? "bg-white text-slate-900 hover:bg-slate-100"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {tier.cta}
                </Link>
              ) : (
                <a
                  href="#waitlist"
                  className="block text-center py-3 rounded-full font-semibold bg-white text-slate-900 hover:bg-slate-100 transition"
                >
                  {tier.cta}
                </a>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-slate-500 mt-8">
          All prices in USD. Cancel anytime, no hard feelings.
        </p>
      </section>

      {/* Comparison */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          What's in each plan? 📋
        </h2>
        <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/80 shadow-md overflow-hidden">
          <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-slate-200 font-semibold text-sm">
            <div className="text-slate-600">Feature</div>
            <div className="text-center text-slate-700">Free</div>
            <div className="text-center text-violet-700">Pro</div>
            <div className="text-center text-slate-700">Team</div>
          </div>
          {[
            ["Decks per month", "5", "Unlimited", "Unlimited"],
            ["AI credits included", "—", "✓", "✓"],
            ["Built-in templates", "✓", "✓", "✓"],
            ["Custom brand templates", "—", "1", "Unlimited"],
            ["Document uploads", "—", "✓", "✓"],
            ["API + MCP access", "—", "—", "✓"],
            ["Shared library", "—", "—", "✓"],
            ["SSO", "—", "—", "✓"],
            ["Support", "Community", "Email", "Dedicated"],
          ].map(([feature, free, pro, team], i) => (
            <div key={i} className="grid grid-cols-4 gap-4 px-6 py-3 border-b border-slate-100 last:border-0 text-sm">
              <div className="text-slate-700 font-medium">{feature}</div>
              <div className="text-center text-slate-600">{free}</div>
              <div className="text-center text-violet-700 font-medium">{pro}</div>
              <div className="text-center text-slate-600">{team}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing FAQ */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          Pricing questions 💬
        </h2>
        <div className="space-y-4">
          {[
            {
              q: "Can I switch plans or cancel anytime?",
              a: "Yes. Upgrade, downgrade, or cancel from your account settings. Cancellation takes effect at the end of your billing period.",
            },
            {
              q: "What counts as a 'deck' on the Free plan?",
              a: "Each presentation you generate uses one deck. Editing an existing deck or re-exporting it doesn't count.",
            },
            {
              q: "Do I need an OpenAI / Claude API key?",
              a: "On the Free plan, yes — you bring your own. On Pro and Team, AI credits are included so you can skip key management entirely.",
            },
            {
              q: "Is there a discount for annual billing?",
              a: "Yes, 20% off when you pay yearly. The discount will appear at checkout once we open paid plans.",
            },
            {
              q: "Do you offer a discount for students or non-profits?",
              a: "Yes — email hello@sliddify.app with proof of status and we'll set you up.",
            },
          ].map((item, i) => (
            <details key={i} className="group bg-white/60 backdrop-blur-sm rounded-2xl border border-white/80 p-6 shadow-sm">
              <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
                <span>{item.q}</span>
                <span className="text-slate-400 group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <p className="mt-3 text-slate-600">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Waitlist CTA */}
      <section id="waitlist" className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-10 border border-white/80 shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Founder pricing, locked in. 🔒
          </h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Join the waitlist and you'll get launch pricing forever, even after
            we raise prices.
          </p>
          {!submitted ? (
            <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                className="flex-1 px-5 py-3.5 rounded-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent text-slate-900 placeholder-slate-400 shadow-sm"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-pink-500 via-violet-500 to-amber-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] disabled:opacity-60"
              >
                {submitting ? "Adding…" : "Lock my price  →"}
              </button>
            </form>
          ) : (
            <div className="px-6 py-5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <p className="font-semibold text-slate-900">You're in! 🎉</p>
              <p className="text-sm text-slate-600 mt-1">
                Founder pricing reserved. We'll email you the moment Pro plans open.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/40 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <img src="/sliddify-mark.svg" alt="" className="h-6 w-auto" />
            <span>© {new Date().getFullYear()} Sliddify</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <Link href="/pricing" className="hover:text-slate-900">Pricing</Link>
            <Link href="/app" className="hover:text-slate-900">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
