"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { getApiUrl } from "@/utils/api";
import { toast } from "sonner";
import TemplateShowcase from "./TemplateShowcase";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(getApiUrl("/api/v1/waitlist"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "landing" }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail || "Something went wrong");
      }

      setSubmitted(true);
      setEmail("");
      toast.success("You're on the list! 🎉", {
        description: "We'll email you the moment Sliddify launches.",
      });
    } catch (err: any) {
      toast.error("Couldn't add you to the list", {
        description: err?.message || "Try again in a moment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-amber-50 to-violet-50 text-slate-900">
      {/* Soft floating blobs in the background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -left-32 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply blur-3xl opacity-50 animate-pulse" />
        <div className="absolute top-1/3 -right-20 w-[28rem] h-[28rem] bg-violet-200 rounded-full mix-blend-multiply blur-3xl opacity-50 animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-0 left-1/3 w-[26rem] h-[26rem] bg-amber-200 rounded-full mix-blend-multiply blur-3xl opacity-50 animate-pulse" style={{ animationDelay: "4s" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/sliddify-logo.svg" alt="Sliddify" className="h-8 w-auto" />
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <a href="#how" className="text-slate-700 hover:text-slate-900 hidden md:block">How it works</a>
          <a href="#templates" className="text-slate-700 hover:text-slate-900 hidden md:block">Templates</a>
          <a href="#features" className="text-slate-700 hover:text-slate-900 hidden md:block">Features</a>
          <a href="#faq" className="text-slate-700 hover:text-slate-900 hidden md:block">FAQ</a>
          <Link
            href="/app"
            className="rounded-full bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 transition"
          >
            Sign in
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-white/80 rounded-full px-4 py-1.5 text-sm font-medium text-slate-700 mb-8 shadow-sm">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Now in private beta · Powered by Claude
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-balance mb-6 leading-[1.05]">
          Turn a paragraph<br />
          into a <span className="bg-gradient-to-r from-pink-500 via-violet-500 to-amber-500 bg-clip-text text-transparent">stunning deck</span>.
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 text-balance">
          Sliddify is the AI presentation tool for people tired of staring at blank slides.
          Type your idea, pick a vibe, and get an editable, exportable deck in 30 seconds.
        </p>

        {/* Waitlist form */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="flex-1 px-5 py-3.5 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent text-slate-900 placeholder-slate-400 shadow-sm"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3.5 rounded-full bg-gradient-to-r from-pink-500 via-violet-500 to-amber-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
            >
              {isSubmitting ? "Adding you…" : "Join the waitlist  →"}
            </button>
          </form>
        ) : (
          <div className="max-w-md mx-auto px-6 py-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-emerald-200 shadow-sm mb-4">
            <p className="font-semibold text-slate-900">You're on the list! 🎉</p>
            <p className="text-sm text-slate-600 mt-1">We'll email you the moment Sliddify launches.</p>
          </div>
        )}
        <p className="text-xs text-slate-500">Free to try · No credit card · Cancel anytime</p>
      </section>

      {/* Demo strip */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/80 p-6 shadow-lg">
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-3">You type</div>
            <p className="text-slate-800 italic">
              "5-slide pitch for our climate-tech startup, aimed at Series A investors,
              focus on traction in EU markets"
            </p>
          </div>
          <div className="text-center text-3xl">→</div>
          <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/80 p-6 shadow-lg md:col-span-2">
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-3">You get</div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className="aspect-[4/3] rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center text-xs text-slate-400 font-medium"
                >
                  Slide {n}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-4 text-center">
              Exported as editable .pptx · Open in PowerPoint, Keynote, or Google Slides
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl sm:text-5xl font-bold text-center mb-4">
          Three steps. One deck. 🎯
        </h2>
        <p className="text-slate-600 text-center max-w-xl mx-auto mb-16">
          No design skills needed. No empty slide staring. No more "I'll fix it later."
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              emoji: "💭",
              title: "Describe it",
              body: "Type a topic, paste an outline, or upload a PDF. The more context, the better.",
            },
            {
              emoji: "✨",
              title: "Pick a vibe",
              body: "Professional, casual, sales pitch, educational. Sliddify adapts the tone, visuals, and structure.",
            },
            {
              emoji: "🚀",
              title: "Get your deck",
              body: "Editable .pptx in your hands in 30 seconds. Or export to PDF. Or hand it off via API.",
            },
          ].map((step, i) => (
            <div key={i} className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/80 shadow-sm hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{step.emoji}</div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-slate-600">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl sm:text-5xl font-bold text-center mb-4">
          Tiny features that compound 📦
        </h2>
        <p className="text-slate-600 text-center max-w-xl mx-auto mb-16">
          The boring stuff most AI deck tools skip — done right.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { e: "🎨", t: "Custom templates", b: "Built-in layouts plus your own brand templates. Set them up once, never touch design again." },
            { e: "🧠", t: "Multiple AI models", b: "Claude, GPT, Gemini, or run it locally. Pick the model, you pay the bill." },
            { e: "📎", t: "Upload your sources", b: "PDFs, CSVs, Word docs. Sliddify reads them so you don't have to summarize." },
            { e: "📤", t: "Real .pptx exports", b: "Editable in PowerPoint, Keynote, Google Slides. Not screenshots. Not images." },
            { e: "🔌", t: "API + MCP server", b: "Plug it into n8n, Zapier, your CRM, or any AI agent. Decks on demand." },
            { e: "🔒", t: "Your data, your control", b: "Generated decks live on your account. We don't train on your content, ever." },
          ].map((f, i) => (
            <div key={i} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{f.e}</div>
              <h3 className="font-bold mb-2">{f.t}</h3>
              <p className="text-sm text-slate-600">{f.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Templates showcase */}
      <TemplateShowcase />

      {/* Built for */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl sm:text-5xl font-bold text-center mb-4">
          Built for the deck-tired 😩
        </h2>
        <p className="text-slate-600 text-center max-w-xl mx-auto mb-16">
          If you've ever rewritten a slide five times at 2am — this is for you.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { e: "🧑‍💼", t: "Founders", b: "Pitch decks that don't look like 2014." },
            { e: "🧑‍🏫", t: "Educators", b: "Lessons your students actually pay attention to." },
            { e: "📈", t: "Sales teams", b: "One template, infinite custom decks." },
            { e: "📊", t: "Analysts", b: "Reports without the formatting tax." },
          ].map((p, i) => (
            <div key={i} className="text-center px-4 py-6">
              <div className="text-5xl mb-3">{p.e}</div>
              <h3 className="font-bold mb-2">{p.t}</h3>
              <p className="text-sm text-slate-600">{p.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-4xl sm:text-5xl font-bold text-center mb-12">
          Questions, answered. 💬
        </h2>
        <div className="space-y-4">
          {[
            {
              q: "Is it really free?",
              a: "During the beta, yes. After launch there'll be a free tier and a paid plan for power users. Waitlist members get founder pricing locked in.",
            },
            {
              q: "Who owns the decks I create?",
              a: "You do. Every presentation lives on your account. We don't share, resell, or train on your content.",
            },
            {
              q: "Can I use my own ChatGPT / Claude key?",
              a: "Yes. Sliddify works with OpenAI, Anthropic, Google, Vertex, Azure, Ollama, or any OpenAI-compatible endpoint. Pick the model, you pay the bill.",
            },
            {
              q: "Are the exports actually editable?",
              a: "Yes, real .pptx files with editable text, layouts, and images. Open in PowerPoint, Keynote, or Google Slides and tweak away.",
            },
          ].map((item, i) => (
            <details
              key={i}
              className="group bg-white/60 backdrop-blur-sm rounded-2xl border border-white/80 p-6 shadow-sm"
            >
              <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
                <span>{item.q}</span>
                <span className="text-slate-400 group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <p className="mt-3 text-slate-600">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-10 border border-white/80 shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Stop staring at blank slides. ✋
          </h2>
          <p className="text-slate-600 mb-8">
            Join the waitlist. We'll email you the moment it's ready.
          </p>
          {!submitted && (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="flex-1 px-5 py-3.5 rounded-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent text-slate-900 placeholder-slate-400 shadow-sm"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-pink-500 via-violet-500 to-amber-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] disabled:opacity-60"
              >
                {isSubmitting ? "Adding…" : "I'm in  →"}
              </button>
            </form>
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
            <Link href="/app" className="hover:text-slate-900">Sign in</Link>
            <a href="#how" className="hover:text-slate-900">How it works</a>
            <a href="#templates" className="hover:text-slate-900">Templates</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
