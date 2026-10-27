import {
  audience,
  courseAnnouncement,
  knowledgeTopics,
  namedAfter,
  site,
  SITE_URL,
  structure,
  teachers,
} from "@/content/site";
import type { FaqItem } from "@/lib/faq";
import { hasOpenModules, type TimelineModule } from "@/lib/modules";

const list = (items: readonly string[]) => items.map((item) => `- ${item}`).join("\n");

// Markdown version of the home page for LLMs and other text-only clients (/index.md)
export function homeMarkdown(modules: TimelineModule[], faq: readonly FaqItem[]): string {
  const moduleList = hasOpenModules(modules)
    ? modules
        .map((m) => {
          const status = m.status ? ` — ${m.status}` : "";
          const description = m.description ? `\n\n  ${m.description}` : "";
          return `- **Модуль ${m.moduleId}: ${m.title}** (${m.dateRange})${status}${description}`;
        })
        .join("\n")
    : `${courseAnnouncement.lead} ${courseAnnouncement.text} Попередній запис: ${SITE_URL}/onboarding`;

  return `# ${site.fullName}

> ${site.description}

${site.shortDescription} Навчання відбувається офлайн у кампусі Інституту Томи Аквінського (${site.address.street}, ${site.address.city}) та на виїзних заняттях. Ви ознайомитеся з основами політичних наук і політичної філософії, вивчите історію політичних ідей та їхній вплив на сучасність. Без зайвих спрощень, легковажності й поверхневості. Лише поглиблене вивчення першоджерел і літератури, практичні кейси та власні дослідження.

- Реєстрація: ${SITE_URL}/onboarding
- Галерея (фото й відео за минулі роки): ${SITE_URL}/gallery
- Email: ${site.email}
- Telegram: ${site.telegram}
- Instagram: ${site.instagram}

## Навички і знання, які ви отримаєте

Ви розберетеся, як працює політика на різних рівнях — від ідей та історії до сучасних процесів:

${list(knowledgeTopics)}

Крім цього, на вас чекають візити до посольств, зустрічі з відомими експертами та дослідницькі завдання.

## Структура курсу

Річну програму гуртка поділено на тематичні модулі. Кожен навчальний модуль триває 2 тижні і складається з трьох логічно повʼязаних занять:

${structure.map((s, i) => `${i + 1}. **${s.title}.** ${s.text} Акцент — ${s.focus}`).join("\n")}

## Навчальні модулі

Можна обрати будь-який модуль або повну річну програму.

${moduleList}

${hasOpenModules(modules) ? "Інші модулі у розробці: інформація про нові модулі зʼявлятиметься поступово.\n\n" : ""}## Для кого

${list(audience)}

## Викладачі

${teachers.map((t) => `### ${t.name}\n\n${list(t.details)}`).join("\n\n")}

## Гурток, названий на честь Леоніда Паська

${namedAfter.text} Більше: ${namedAfter.link}

> ${namedAfter.quote} — Леонід Пасько

## Поширені запитання

${faq.map((item) => `### ${item.q}\n\n${item.a}`).join("\n\n")}

## Контакти

- ${site.address.place}: ${site.address.street}, ${site.address.city}, ${site.address.postalCode}
- Email: ${site.email}
- Telegram: ${site.telegram}
- Instagram: ${site.instagram}
- Політика конфіденційності: ${SITE_URL}/privacy
`;
}

// https://llmstxt.org
export function llmsTxt(): string {
  return `# ${site.fullName}

> ${site.description}

Офлайн-гурток KSE та Інституту св. Томи Аквінського для учнів 8–11 класів у кампусі Інституту (${site.address.street}, ${site.address.city}) та на виїзних заняттях. Річна програма складається з двотижневих тематичних модулів; кожен модуль — три заняття: «Теорія», «Практика» та «Досвід» (візити до державних інституцій і посольств, зустрічі з експертами). Запис — щонайменше на три модулі або на весь курс; після 12 модулів учні отримують сертифікат KSE.

## Основне

- [Повний опис гуртка](${SITE_URL}/index.md): програма, актуальний розклад модулів, викладачі, FAQ і контакти в Markdown
- [Головна сторінка](${SITE_URL}/): сайт гуртка
- [Реєстрація](${SITE_URL}/onboarding): форма заявки на гурток

## Контакти

- [Email](mailto:${site.email})
- [Telegram](${site.telegram})
- [Instagram](${site.instagram})

## Optional

- [Політика конфіденційності](${SITE_URL}/privacy)
- [Київська школа економіки](${site.provider.url})
`;
}
