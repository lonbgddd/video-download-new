"use client";
import { useCallback, useEffect, useState } from "react";

export interface HistoryItem { id: string; mediaId: string; title: string; thumbnail?: string; platform: string; downloadType: string; quality: string; timestamp: number }
const KEY = "video-downloader-history-v1";
export function useDownloadHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setItems(JSON.parse(localStorage.getItem(KEY) ?? "[]")); } catch { setItems([]); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const save = useCallback((next: HistoryItem[]) => { setItems(next); localStorage.setItem(KEY, JSON.stringify(next.slice(0, 50))); }, []);
  const add = useCallback((item: HistoryItem) => save([item, ...items.filter((entry) => entry.id !== item.id)]), [items, save]);
  const remove = useCallback((id: string) => save(items.filter((entry) => entry.id !== id)), [items, save]);
  const clear = useCallback(() => save([]), [save]);
  return { items, add, remove, clear };
}
