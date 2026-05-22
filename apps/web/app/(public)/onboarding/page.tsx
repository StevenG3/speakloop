import { getRequestLocale } from "@/lib/locale";
import { OnboardingPageView } from "./OnboardingPageView";

export default async function OnboardingPage() {
  return <OnboardingPageView locale={await getRequestLocale()} />;
}
