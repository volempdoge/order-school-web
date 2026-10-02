import { pageMetadata } from "@/lib/metadata";
import { getTimeline, hasOpenModules } from "@/lib/modules";

import OnboardingForm from "./OnboardingForm";

export const metadata = pageMetadata({
  title: "Реєстрація на гурток",
  description:
    "Заявка на Гурток політичних студій KSE для учнів 8–11 класів. Залиште контакти — ми звʼяжемось протягом одного-двох днів і розповімо про модулі, розклад та умови участі.",
  path: "/onboarding",
});

// Same schedule as the home page: while nothing is running or announced, the form is a pre-registration
export const revalidate = 60;

export default async function OnboardingPage() {
  const { modules } = await getTimeline();
  return (
    <main>
      <OnboardingForm preRegistration={!hasOpenModules(modules)} />
    </main>
  );
}
