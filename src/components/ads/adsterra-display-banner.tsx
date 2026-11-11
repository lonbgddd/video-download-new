"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { AdsterraDisplayUnit } from "@/config/ad-networks";

const subscribeToHydration = () => () => undefined;

function createBannerDocument(unit: AdsterraDisplayUnit): string {
  const options = JSON.stringify({
    key: unit.key,
    format: "iframe",
    height: unit.height,
    width: unit.width,
    params: {},
  }).replace(/</g, "\\u003c");
  const scriptUrl = JSON.stringify(unit.scriptUrl).slice(1, -1);

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="referrer" content="strict-origin-when-cross-origin"><style>html,body{width:${unit.width}px;height:${unit.height}px;margin:0;overflow:hidden;background:transparent}</style></head><body><script>window.atOptions=${options};<\/script><script src="${scriptUrl}"><\/script></body></html>`;
}

export function AdsterraDisplayBanner({
  unit,
  title,
}: {
  unit: AdsterraDisplayUnit;
  title: string;
}) {
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const sourceDocument = useMemo(() => createBannerDocument(unit), [unit]);

  if (!mounted) {
    return (
      <div
        className="adsterra-display-reserved"
        style={{ width: unit.width, height: unit.height }}
        aria-hidden="true"
      />
    );
  }

  return (
    <iframe
      className="adsterra-display-frame"
      title={title}
      width={unit.width}
      height={unit.height}
      srcDoc={sourceDocument}
      loading="eager"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}
