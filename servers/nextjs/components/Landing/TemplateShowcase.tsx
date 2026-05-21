"use client";

import Link from "next/link";
import RealSlidePreview from "./RealSlidePreview";

// Real built-in template covers — one per template family.
// These are the actual React components used in the app's template gallery.
import PitchDeckCover, { Schema as PitchDeckSchema } from "@/app/presentation-templates/pitch-deck/CenteredCoverWithFooterMeta";
import EducationCover, { Schema as EducationSchema } from "@/app/presentation-templates/Education/EducationCoverSlide";
import CodeCover, { Schema as CodeSchema } from "@/app/presentation-templates/Code/CoverSlide";
import ReportCover, { Schema as ReportSchema } from "@/app/presentation-templates/Report/IntroCoverSlide";
import ProductCover, { Schema as ProductSchema } from "@/app/presentation-templates/ProductOverview/CoverSlide";
import ModernIntro, { Schema as ModernSchema } from "@/app/presentation-templates/modern/IntroSlideLayout";
import GeneralIntro, { Schema as GeneralSchema } from "@/app/presentation-templates/general/IntroSlideLayout";
import SwiftIntro, { Schema as SwiftSchema } from "@/app/presentation-templates/swift/IntroSlideLayout";

type Template = {
  slug: string;
  name: string;
  description: string;
  Component: any;
  schema: any;
};

const TEMPLATES: Template[] = [
  {
    slug: "pitch-deck",
    name: "Pitch Deck",
    description: "Title, team, and product slides for fundraises.",
    Component: PitchDeckCover,
    schema: PitchDeckSchema,
  },
  {
    slug: "modern",
    name: "Modern",
    description: "Clean white & blue business pitch design.",
    Component: ModernIntro,
    schema: ModernSchema,
  },
  {
    slug: "Education",
    name: "Education",
    description: "Covers, outlines, timelines, visual storytelling.",
    Component: EducationCover,
    schema: EducationSchema,
  },
  {
    slug: "Code",
    name: "Code",
    description: "Roadmaps, APIs, technical metrics for devs.",
    Component: CodeCover,
    schema: CodeSchema,
  },
  {
    slug: "Report",
    name: "Report",
    description: "Data, analysis charts, dashboards, closings.",
    Component: ReportCover,
    schema: ReportSchema,
  },
  {
    slug: "ProductOverview",
    name: "Product Overview",
    description: "Cover, narrative, KPIs, pricing, team.",
    Component: ProductCover,
    schema: ProductSchema,
  },
  {
    slug: "general",
    name: "General",
    description: "Balanced, versatile layouts for everyday decks.",
    Component: GeneralIntro,
    schema: GeneralSchema,
  },
  {
    slug: "swift",
    name: "Swift",
    description: "Sharp, fast-moving layouts for sales decks.",
    Component: SwiftIntro,
    schema: SwiftSchema,
  },
];

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
          Every template is hand-crafted. Mix layouts, edit anything, or upload
          your own brand design.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {TEMPLATES.map((t) => (
          <div key={t.slug} className="group">
            <div className="aspect-[16/9] rounded-2xl border border-white/80 bg-white shadow-md group-hover:shadow-xl transition-all duration-300 overflow-hidden">
              <RealSlidePreview Component={t.Component} schema={t.schema} />
            </div>
            <div className="mt-3 px-1">
              <h3 className="font-bold text-slate-900">{t.name}</h3>
              <p className="text-sm text-slate-600 mt-1 leading-snug">
                {t.description}
              </p>
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
