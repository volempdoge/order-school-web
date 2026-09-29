import {
  audience,
  faq,
  knowledgeTopics,
  namedAfter,
  site,
  SITE_URL,
  structure,
  teachers,
} from "@/content/site";
import type { TimelineModule } from "@/lib/modules";

const list = (items: readonly string[]) => items.map((item) => `- ${item}`).join("\n");

// Markdown version of the home page for LLMs and other text-only clients (/index.md)
export function homeMarkdown(modules: TimelineModule[], { unavailable = false } = {}): string {
  const moduleList = modules.length
    ? modules
        .map((m) => {
          const status = m.status ? ` — ${m.status}` : "";
          const description = m.description ? `\n\n  ${m.description}` : "";
          return `- **Модуль ${m.moduleId}: ${m.title}** (${m.dateRange})${status}${description}`;
        })
        .join("\n")
    : unavailable
      ? `Розклад модулів тимчасово недоступний. Напишіть нам у Telegram (${site.telegram}) або на ${site.email} — розповімо про найближчі модулі.`
      : "Розклад модулів уточнюється.";

  return `# ${site.fullName}

> ${site.description}

${site.shortDescription} Навчання відбувається офлайн у головному кампусі KSE (${site.address.street}, ${site.address.city}) та в наших партнерів. Ви ознайомитеся з основами політичних наук і політичної філософії, вивчите історію політичних ідей та їхній вплив на сучасність. Без зайвих спрощень, легковажності й поверхневості. Лише поглиблене вивчення першоджерел і літератури, практичні кейси та власні дослідження.

- Реєстрація: ${SITE_URL}/onboarding
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

Інші модулі у розробці: інформація про нові модулі зʼявлятиметься поступово.

## Для кого

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

Офлайн-гурток для учнів 8–11 класів у головному кампусі Київської школи економіки (${site.address.street}, ${site.address.city}) та в партнерів. Річна програма складається з двотижневих тематичних модулів; кожен модуль — три заняття: «Теорія», «Практика» та «Досвід» (візити до державних інституцій і посольств, зустрічі з експертами). Можна записатися на окремий модуль або на весь курс; після 12 модулів учні отримують сертифікат KSE.

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
