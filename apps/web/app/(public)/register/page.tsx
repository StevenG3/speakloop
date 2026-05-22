import { getRequestLocale } from "@/lib/locale";
import { RegisterPageView } from "./RegisterPageView";

export default async function RegisterPage() {
  return <RegisterPageView locale={await getRequestLocale()} />;
}
