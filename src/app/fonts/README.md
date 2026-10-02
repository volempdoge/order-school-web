# Fonts

| File                    | Font              | Weight            | Used for                                             |
| ----------------------- | ----------------- | ----------------- | ---------------------------------------------------- |
| `cy-grotesk-wide.woff2` | Cy Grotesk Wide   | 600 (single face) | Headings (`font-display`, `type-display`, `type-h2`) |
| `gotham-pro-500.woff2`  | Gotham Pro Medium | 500               | Body text (`font-body`)                              |
| `gotham-pro-700.woff2`  | Gotham Pro Bold   | 700               | Accents, buttons, `type-h3`, `type-quote`            |

The files are WOFF2 subsets (Latin, Cyrillic incl. Ukrainian, punctuation) of the original
TTF/WOFF files. The originals, including the unused italic/light/black faces, are in git history
before this change (`git show 91a2f9e:src/app/fonts/…`).

Gotham Pro has no Ukrainian apostrophe «ʼ» (U+02BC). Before subsetting, U+02BC is mapped in the
`cmap` to the font's own `’` (U+2019) glyph, so the text keeps the correct character and still renders
in Gotham.

To regenerate from an original file (needs `pip install fonttools brotli`):

```bash
# after mapping U+02BC → the U+2019 glyph in the cmap (fontTools)
pyftsubset GothamProMedium.woff --flavor=woff2 --layout-features='*' --output-file=gotham-pro-500.woff2 \
  --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2000-206F,U+20AC,U+20B4,U+2116,U+2122,U+2190-2193,U+2212,U+2215,U+FEFF,U+FFFD"
```
