# Гурток політології KSE

Сайт гуртка політичних студій Київської школи економіки: [polithurtok.com.ua](https://polithurtok.com.ua).
Next.js 16 (App Router), React 19, Tailwind CSS 4.

## Запуск

Потрібен Node.js 22 (`nvm use`).

```bash
npm install
npm run dev
```

Змінні середовища (`.env.local`):

| Змінна                                 | Для чого                                                                                                                                            |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NOTION_API_KEY`, `NOTION_DATABASE_ID` | Розклад модулів з Notion. Без поточних чи майбутніх модулів замість розкладу показується плашка про курси в розробці, а форма — як попередній запис |
| `NOTION_GALLERY_DATABASE_ID`           | База Notion для сторінки `/gallery` (див. «Галерея» нижче). Без неї галерея показує заглушку                                                        |
| `BLOB_READ_WRITE_TOKEN`                | Vercel Blob, куди копіюються фото галереї. Без нього фото беруться прямо з Notion (лише для локальної розробки: посилання Notion живуть годину)     |
| `NEXT_PUBLIC_FB_PIXEL_ID`              | Meta Pixel (необовʼязково)                                                                                                                          |
| `SENTRY_DSN`                           | Сповіщення про помилки сервера (зокрема збої Notion) у Sentry. Без неї моніторинг вимкнений                                                         |
| `NEXT_PUBLIC_SITE_URL`                 | Канонічний домен, за замовчуванням `https://polithurtok.com.ua`                                                                                     |

## Перевірки

| Команда                           | Що робить                                                                                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run check`                   | Усе нижче, крім збірки й Lighthouse, — запускайте перед PR                                                                                                    |
| `npm run format` / `format:check` | Prettier (+ сортування Tailwind-класів)                                                                                                                       |
| `npm run lint` / `lint:fix`       | ESLint: Next.js, TypeScript, React hooks, доступність (jsx-a11y), порядок імпортів, заборона сирих кольорів замість токенів                                   |
| `npm run lint:css`                | Stylelint для CSS з урахуванням директив Tailwind 4                                                                                                           |
| `npm run typecheck`               | Генерація типів маршрутів і `tsc` у суворому режимі                                                                                                           |
| `npm test` / `test:watch`         | Vitest: розклад модулів, markdown/llms.txt, robots, sitemap, metadata                                                                                         |
| `npm run test:e2e`                | Playwright (десктоп і мобільний): форма й згоди, мобільне меню, 404, запасний текст розкладу. Потрібна `npm run build`; запит до Google Apps Script підмінено |
| `npm run knip`                    | Невикористані файли, експорти й залежності                                                                                                                    |
| `npm run lighthouse`              | Lighthouse CI для `/`, `/onboarding`, `/privacy` (потрібна попередня `npm run build`)                                                                         |

Git-хуки (Husky) ставляться автоматично при `npm install`:

- **pre-commit** — ESLint, Stylelint і Prettier на змінених файлах (lint-staged);
- **pre-push** — `typecheck` і тести.

CI (`.github/workflows/ci.yml`) на кожен PR запускає всі перевірки, збірку, E2E, Lighthouse
(доступність і SEO ≥ 0.95, alt, title, description; контраст — лише попередження, бо акцентний `#F42B39` на бежевому свідомо нижчий за AA для дрібного тексту) і `npm audit` продакшн-залежностей.
Звіт Lighthouse зберігається як артефакт. Dependabot щотижня пропонує оновлення.

## Де лежать конфіги

- `package.json` — Prettier, Stylelint, Knip і lint-staged (ключі з однойменними назвами).
- У корені — лише ті, що інструменти й редактор шукають автоматично: `eslint.config.mjs`, `tsconfig.json`,
  `next.config.ts`, `postcss.config.mjs`, `vitest.config.mts`, `playwright.config.ts`.
- `.github/` — CI, Dependabot і `lighthouserc.json`.
- `src/instrumentation.ts` — Sentry (лише сервер).
- `src/types/global.d.ts` — глобальні типи Next.js і next-video.

У Stylelint вимкнено правила, які конфліктують із директивами Tailwind 4 (`@theme`, `@utility`, `@apply`,
`@custom-variant`), з групуванням токенів у `globals.css` і з записом брендових кольорів як у брендбуці.

У VS Code (`.vscode/settings.json`) згенеровані файли приховані, а конфіги згортаються під `package.json`,
`next.config.ts`, `tsconfig.json` і `vitest.config.mts`.

## Дизайн-система

Токени (2 шрифти, 5 кольорів, 3 радіуси) і типографічна шкала `type-*` описані на початку
[`src/app/globals.css`](src/app/globals.css). Кнопки — лише через [`Button`](src/components/ui/button.tsx),
заголовки секцій — через [`SectionHeading`](src/components/SectionHeading.tsx). Шрифти описані в
[`src/app/fonts/README.md`](src/app/fonts/README.md).

## Контент

Тексти, які використовуються і на сторінці, і в `index.md` / `llms.txt` / JSON-LD, лежать у
[`src/content/site.ts`](src/content/site.ts).

## Галерея

Сторінка `/gallery` будується з бази Notion і оновлюється раз на 5 хвилин.

**Налаштування (один раз):**

1. Створіть у Notion базу з полями:
   - назва (стандартне поле-заголовок) — назва події;
   - `Дата` — тип Date; таймлайн сортується за нею, нові згори, з поділом на роки;
   - `Опис` — тип Text, необовʼязково;
   - `Опубліковано` — тип Checkbox; на сайті лише позначені рядки.
2. У базі: ••• → Connections → додайте ту саму інтеграцію, що й для модулів.
3. ID бази (32 символи з посилання на неї) запишіть у `NOTION_GALLERY_DATABASE_ID`.
4. У Vercel: Storage → Create → Blob, підключіть до проєкту — `BLOB_READ_WRITE_TOKEN` додасться сам.

**Як додавати контент:** відкрийте рядок бази як сторінку й додавайте в її тіло:

- фото (перетягніть файл або вставте посилання) — підпис фото (Caption) показується під ним;
- відео — посилання на YouTube (блок Video, Embed або просто вставлене посилання); підпис так само;
- звичайний текст — показується під описом події.

Фото копіюються у Vercel Blob при першому оновленні сторінки після додавання (посилання Notion живуть
лише годину), повторно не завантажуються. Видалені з Notion фото прибираються з Blob автоматично.
Відео з інших сайтів і завантажені прямо в Notion відеофайли не показуються.
