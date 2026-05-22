import { getRequestLocale } from "@/lib/locale";
import { LandingPageView } from "./LandingPageView";

export default async function LandingPage() {
  return <LandingPageView locale={await getRequestLocale()} />;
}
