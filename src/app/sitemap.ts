import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap { const base = process.env.APP_URL ?? "http://localhost:3000"; return ["", "/history", "/terms", "/privacy", "/copyright"].map((route) => ({ url: `${base}${route}`, lastModified: new Date(), changeFrequency: route ? "monthly" : "weekly", priority: route ? 0.6 : 1 })); }
