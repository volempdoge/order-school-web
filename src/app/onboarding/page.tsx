import { pageMetadata } from "@/lib/metadata";

import OnboardingForm from "./OnboardingForm";

export const metadata = pageMetadata({
  title: "Реєстрація на гурток",
  description:
    "Заявка на Гурток політичних студій KSE для учнів 8–11 класів. Залиште контакти — ми звʼяжемось протягом одного-двох днів і розповімо про модулі, розклад та умови участі.",
  path: "/onboarding",
});

export default function OnboardingPage() {
  return (
    <main>
      <OnboardingForm />
    </main>
  );
}
