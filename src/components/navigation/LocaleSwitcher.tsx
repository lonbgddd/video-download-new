"use client";

import { useRouter } from "next/navigation";

interface LocaleOption {
  href: string;
  label: string;
}

export function LocaleSwitcher({
  ariaLabel,
  currentHref,
  options,
}: {
  ariaLabel: string;
  currentHref: string;
  options: LocaleOption[];
}) {
  const router = useRouter();

  return (
    <label className="locale-selector-label">
      <span className="sr-only">{ariaLabel}</span>
      <select aria-label={ariaLabel} value={currentHref} onChange={(event) => router.push(event.target.value)}>
        {options.map((option) => <option key={option.href} value={option.href}>{option.label}</option>)}
      </select>
    </label>
  );
}
