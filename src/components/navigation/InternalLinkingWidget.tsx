import Link from "next/link";
import { getLocalizedPath } from "@/lib/seo/metadata";
import { getLocalizedRoutesForLocale, type LocalizedRoute } from "@/config/i18n.config";

export function InternalLinkingWidget({ route }: { route: LocalizedRoute }) {
  const related = getLocalizedRoutesForLocale(route.locale)
    .filter((candidate) => candidate.page.id !== route.page.id)
    .sort((left, right) =>
      Number(right.page.relatedGroup === route.page.relatedGroup) - Number(left.page.relatedGroup === route.page.relatedGroup) ||
      Number(right.page.category === route.page.category) - Number(left.page.category === route.page.category),
    )
    .slice(0, 8);

  return (
    <nav className="seo-related" aria-labelledby="seo-related-title">
      <h2 id="seo-related-title">{{
        en: "Explore related tools",
        vi: "Có thể bạn cần",
        es: "También te puede servir",
        ja: "あわせて読みたい",
        fr: "Outils associés",
        pt: "Ferramentas relacionadas",
        ko: "관련 도구",
      }[route.locale]}</h2>
      <ul>
        {related.map((item) => (
          <li key={item.page.id}>
            <Link href={getLocalizedPath(item)}>{item.content.title}</Link>
            <p>{item.content.description}</p>
          </li>
        ))}
      </ul>
    </nav>
  );
}
