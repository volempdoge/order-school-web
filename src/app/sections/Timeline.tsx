import Link from "next/link";

import SectionHeading from "@/components/SectionHeading";
import SocialLinks from "@/components/SocialLinks";
import { Button } from "@/components/ui/button";
import { Disclosure } from "@/components/ui/disclosure";
import { courseAnnouncement } from "@/content/site";
import { hasOpenModules, kyivISODate, type ModuleStatus, type TimelineModule } from "@/lib/modules";

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

// Nothing running or announced (or Notion is unreachable): invite to pre-register instead of a schedule
function CourseAnnouncement() {
  return (
    <div
      data-reveal="up"
      className="mx-auto mt-12 max-w-4xl rounded-lg bg-primary px-6 py-8 text-white md:mt-16 md:px-12 md:py-10"
    >
      <div className="space-y-4 font-body text-[1.1875rem] leading-snug font-bold md:text-xl">
        <p>{courseAnnouncement.lead}</p>
        <p>{courseAnnouncement.text}</p>
      </div>
      <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        {/* The label is long: on phones it wraps instead of running out of the button.
            The white border keeps it visible on the red card when hovered (it turns red too). */}
        <Button
          asChild
          variant="light"
          size="lg"
          className="h-auto min-h-14 w-full border-2 border-white py-3 text-center leading-tight text-balance whitespace-normal sm:w-auto sm:whitespace-nowrap"
        >
          <Link href="/onboarding">{courseAnnouncement.cta}</Link>
        </Button>
        <SocialLinks className="flex justify-center gap-4 text-white" />
      </div>
    </div>
  );
}

export default function Timeline({ id = "timeline", modules }: { id?: string; modules: TimelineModule[] }) {
  if (!hasOpenModules(modules)) {
    return (
      <section id={id} className="relative w-full px-6 py-12 md:py-20">
        <div data-reveal="up" className="mx-auto max-w-6xl text-center">
          <SectionHeading>Навчальні модулі</SectionHeading>
        </div>
        <CourseAnnouncement />
      </section>
    );
  }

  // The active (or the nearest upcoming) module is expanded by default
  const openId = modules.find((m) => m.status === "триває" || m.status === "незабаром початок")?.id;

  return (
    <section id={id} className="relative w-full py-12 md:py-20">
      <div data-reveal="up" className="mx-auto max-w-6xl px-6 text-center md:px-4">
        <SectionHeading>Навчальні модулі</SectionHeading>
        <p className="mt-8 type-lead">Ви можете обирати будь-який модуль або повну річну програму</p>
      </div>

      <div className="mx-auto my-12 max-w-7xl px-6 md:my-16 md:px-8">
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
