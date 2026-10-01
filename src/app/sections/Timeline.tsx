import Link from "next/link";

import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Disclosure } from "@/components/ui/disclosure";
import { site } from "@/content/site";
import { kyivISODate, type ModuleStatus, type TimelineModule } from "@/lib/modules";

const badgeBase =
  "font-body font-bold uppercase text-xs px-2 py-0.5 rounded-sm tracking-wider border border-primary";

const badges: Record<Exclude<ModuleStatus, null>, { text: string; className: string }> = {
  триває: { text: "Триває", className: `bg-primary text-white ${badgeBase}` },
  наступний: { text: "Наступний", className: `text-primary border-dashed ${badgeBase}` },
  "незабаром початок": { text: "Незабаром початок", className: `bg-primary text-white ${badgeBase}` },
};

function StatusBadge({ status }: { status: ModuleStatus }) {
  if (!status) return null;
  const badge = badges[status];
  return <span className={badge.className}>{badge.text}</span>;
}

export default function Timeline({
  id = "timeline",
  modules,
  unavailable = false,
}: {
  id?: string;
  modules: TimelineModule[];
  /** Notion could not be reached */
  unavailable?: boolean;
}) {
  // The active (or the nearest upcoming) module is expanded by default
  const openId = modules.find((m) => m.status === "триває" || m.status === "незабаром початок")?.id;

  return (
    <section id={id} className="relative w-full py-12 md:py-20">
      <div data-reveal="up" className="mx-auto max-w-6xl px-6 text-center md:px-4">
        <SectionHeading>Навчальні модулі</SectionHeading>
        <p className="mt-8 type-lead">Ви можете обирати будь-який модуль або повну річну програму</p>
      </div>

      <div className="mx-auto my-12 max-w-7xl px-6 md:my-16 md:px-8">
        {unavailable && (
          <div
            role="status"
            className="mb-6 rounded-lg border-2 border-dashed border-primary bg-card px-6 py-5 type-body"
          >
            <p className="font-bold">Розклад модулів тимчасово не завантажився.</p>
            <p className="mt-2">
              Напишіть нам у{" "}
              <a
                href={site.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-primary underline underline-offset-2"
              >
                Telegram
              </a>{" "}
              або на{" "}
              <a
                href={`mailto:${site.email}`}
                className="font-bold text-primary underline underline-offset-2"
              >
                {site.email}
              </a>{" "}
              — розповімо про найближчі модулі та дати.
            </p>
          </div>
        )}

        {modules.map((module) => (
          <Disclosure
            key={module.id}
            name="timeline"
            open={module.id === openId}
            className="border-dashed"
            summary={
              <span className="flex flex-col gap-1.5 text-left">
                <span className="flex flex-wrap items-center gap-2 type-small font-bold text-muted-foreground">
                  <time dateTime={kyivISODate(module.startDate)}>{module.dateRange}</time>
                  <StatusBadge status={module.status} />
                </span>
                <span className="font-display font-bold tracking-[0.02em]">
                  Модуль {module.moduleId}: {module.title}
                </span>
              </span>
            }
          >
            <p>{module.description}</p>
          </Disclosure>
        ))}

        <Disclosure
          name="timeline"
          className="border-dashed"
          summary={<span className="font-display font-bold tracking-[0.02em]">Інші модулі у розробці</span>}
        >
          <p>
            Ми прагнемо зробити навчальні модулі захопливими і практичними. Для цього ми ретельно готуємо
            кожен модуль і залучаємо досвідчених експертів та лекторів. Тому точна інформація про нові модулі
            зʼявлятиметься поступово.
          </p>
        </Disclosure>
      </div>

      <div className="flex justify-center px-6">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/onboarding">Хочу на курс</Link>
        </Button>
      </div>
    </section>
  );
}
