"use client";

import Link from "next/link";

type Preview = {
  slug: string;
  name: string;
  description: string;
  bg: string;        // tailwind classes for the card surface
  accent: string;    // accent color for title bar / decorative elements
  textTone: "light" | "dark";
};

// Curated subset of the built-in templates — skip near-duplicate "neo-*" twins
// in favor of the strongest representative from each style family.
const TEMPLATES: Preview[] = [
  {
    slug: "general",
    name: "General",
    description: "Balanced, versatile layouts for everyday decks.",
    bg: "bg-gradient-to-br from-slate-50 to-slate-100",
    accent: "bg-slate-900",
    textTone: "dark",
  },
  {
    slug: "modern",
    name: "Modern",
    description: "Clean white & blue business pitch design.",
    bg: "bg-gradient-to-br from-sky-50 to-blue-100",
    accent: "bg-blue-600",
    textTone: "dark",
  },
  {
    slug: "pitch-deck",
    name: "Pitch Deck",
    description: "Title, team, and product slides for fundraises.",
    bg: "bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500",
    accent: "bg-white/30",
    textTone: "light",
  },
  {
    slug: "Education",
    name: "Education",
    description: "Covers, outlines, timelines, visual storytelling.",
    bg: "bg-gradient-to-br from-amber-100 to-orange-200",
    accent: "bg-orange-500",
    textTone: "dark",
  },
  {
    slug: "Code",
    name: "Code",
    description: "Roadmaps, APIs, technical metrics for devs.",
    bg: "bg-gradient-to-br from-slate-900 to-slate-800",
    accent: "bg-emerald-400",
    textTone: "light",
  },
  {
    slug: "Report",
    name: "Report",
    description: "Data, analysis charts, dashboards, closings.",
    bg: "bg-gradient-to-br from-emerald-50 to-teal-100",
    accent: "bg-teal-600",
    textTone: "dark",
  },
  {
    slug: "ProductOverview",
    name: "Product Overview",
    description: "Cover, narrative, KPIs, pricing, team.",
    bg: "bg-gradient-to-br from-rose-50 to-pink-100",
    accent: "bg-pink-600",
    textTone: "dark",
  },
  {
    slug: "neo-modern",
    name: "Neo Modern",
    description: "Bolder, more contemporary take on Modern.",
    bg: "bg-gradient-to-br from-zinc-900 via-slate-900 to-indigo-950",
    accent: "bg-violet-400",
    textTone: "light",
  },
];

function MiniSlide({ template }: { template: Preview }) {
  const isLight = template.textTone === "light";
  const titleColor = isLight ? "bg-white/90" : "bg-slate-900";
  const bodyColor = isLight ? "bg-white/30" : "bg-slate-300";
  const bodyColor2 = isLight ? "bg-white/20" : "bg-slate-200";

  return (
    <div
      className={`relative aspect-[16/10] rounded-2xl overflow-hidden border ${
        isLight ? "border-white/20" : "border-slate-200"
      } ${template.bg} p-5 shadow-md group-hover:shadow-xl transition-all duration-300`}
    >
      {/* corner accent */}
      <div className={`absolute top-0 left-0 h-1.5 w-16 ${template.accent} rounded-br-full`} />

      {/* title row */}
      <div className={`h-2.5 w-2/3 rounded-full ${titleColor} mb-3`} />
      <div className={`h-2 w-1/3 rounded-full ${bodyColor} mb-5`} />

      {/* content variants by template family */}
      {template.slug === "Code" ? (
        // Code template: monospace-like blocks
        <div className="space-y-1.5">
          <div className={`h-1.5 w-5/6 rounded-sm ${bodyColor}`} />
          <div className={`h-1.5 w-4/6 rounded-sm ${bodyColor}`} />
          <div className={`h-1.5 w-5/6 rounded-sm ${bodyColor2}`} />
          <div className={`h-1.5 w-3/6 rounded-sm ${bodyColor2}`} />
          <div className={`h-1.5 w-4/6 rounded-sm ${bodyColor}`} />
        </div>
      ) : template.slug === "Report" ? (
        // Report template: bar-chart hint
        <div className="flex items-end gap-2 h-12 mt-2">
          <div className={`w-3 h-1/3 rounded-sm ${template.accent}`} />
          <div className={`w-3 h-2/3 rounded-sm ${template.accent}`} />
          <div className={`w-3 h-1/2 rounded-sm ${template.accent}`} />
          <div className={`w-3 h-full rounded-sm ${template.accent}`} />
          <div className={`w-3 h-3/4 rounded-sm ${template.accent}`} />
        </div>
      ) : template.slug === "pitch-deck" || template.slug === "neo-modern" ? (
        // Pitch / Neo-Modern: big hero block + small caption
        <div className="space-y-2">
          <div className={`h-10 w-full rounded-lg ${bodyColor}`} />
          <div className={`h-1.5 w-2/3 rounded-full ${bodyColor2}`} />
        </div>
      ) : template.slug === "ProductOverview" ? (
        // Product Overview: image + 3 feature dots
        <div className="flex gap-2 mt-2">
          <div className={`h-12 w-12 rounded-lg ${bodyColor}`} />
          <div className="flex flex-col gap-1.5 flex-1 justify-center">
            <div className={`h-1.5 w-5/6 rounded-full ${bodyColor}`} />
            <div className={`h-1.5 w-4/6 rounded-full ${bodyColor2}`} />
            <div className={`h-1.5 w-3/6 rounded-full ${bodyColor2}`} />
          </div>
        </div>
      ) : template.slug === "Education" ? (
        // Education: 3 icon-circle grid
        <div className="flex justify-around items-center mt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`h-6 w-6 rounded-full ${template.accent}`} />
              <div className={`h-1 w-6 rounded-full ${bodyColor}`} />
            </div>
          ))}
        </div>
      ) : (
        // Default: paragraph + bullet
        <div className="space-y-1.5">
          <div className={`h-1.5 w-5/6 rounded-full ${bodyColor}`} />
          <div className={`h-1.5 w-4/6 rounded-full ${bodyColor}`} />
          <div className={`h-1.5 w-5/6 rounded-full ${bodyColor2}`} />
        </div>
      )}

      {/* footer slide number */}
      <div className={`absolute bottom-3 right-4 text-[10px] font-mono ${isLight ? "text-white/50" : "text-slate-400"}`}>
        01
      </div>
    </div>
  );
}

export default function TemplateShowcase() {
  return (
    <section id="templates" className="relative z-10 max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-14">
        <div className="inline-block px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/80 text-sm font-medium text-slate-700 mb-4">
          📚 Built-in templates
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold mb-4">
          Pick a vibe.<br />Sliddify takes it from there.
        </h2>
        <p className="text-slate-600 max-w-xl mx-auto">
          Every template is hand-crafted with HTML + Tailwind. Mix layouts, edit
          anything, or upload your own design.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {TEMPLATES.map((t) => (
          <div key={t.slug} className="group">
            <MiniSlide template={t} />
            <div className="mt-3 px-1">
              <h3 className="font-bold text-slate-900">{t.name}</h3>
              <p className="text-sm text-slate-600 mt-1 leading-snug">{t.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link
          href="/app"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/70 backdrop-blur-sm border border-white/80 text-slate-900 font-medium shadow-sm hover:shadow-md transition-all hover:scale-[1.02]"
        >
          See all 13 templates  →
        </Link>
      </div>
    </section>
  );
}
