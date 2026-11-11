import { permanentRedirect } from "next/navigation";
import { DEFAULT_LOCALE, HOME_PATHS } from "@/config/locales";

export default function RootPage() {
  permanentRedirect(HOME_PATHS[DEFAULT_LOCALE]);
}
