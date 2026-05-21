"use client";

import {
  Component as ReactComponent,
  ComponentType,
  ReactNode,
  useState,
} from "react";
import * as z from "zod";

type Props = {
  Component: ComponentType<{ data: any }>;
  schema: z.ZodTypeAny;
  fallbackBg?: string;
};

/**
 * Renders one of the real built-in slide templates at a scaled-down size.
 *
 * Templates render at 1280×720 (or wider) and use CSS variables for theming.
 * We wrap them in a container with the same aspect ratio, then scale the inner
 * 1280-wide layer down to the container's width using a container query unit.
 */
export default function RealSlidePreview({
  Component,
  schema,
  fallbackBg = "bg-slate-100",
}: Props) {
  const [errored, setErrored] = useState(false);

  let data: any = {};
  try {
    const parsed = (schema as any).safeParse({});
    if (parsed?.success) data = parsed.data;
  } catch {
    /* swallow; template will render with whatever defaults its component has */
  }

  if (errored) {
    return <div className={`w-full h-full ${fallbackBg}`} />;
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-white"
      style={{ containerType: "inline-size" } as any}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width: 1280,
          height: 720,
          transform: "scale(calc(100cqi / 1280))",
        }}
      >
        <ErrorBoundary onError={() => setErrored(true)}>
          <Component data={data} />
        </ErrorBoundary>
      </div>
    </div>
  );
}

class ErrorBoundary extends ReactComponent<
  { children: ReactNode; onError: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
