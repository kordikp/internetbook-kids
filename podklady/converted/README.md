# Převedené materiály projektu Internet4Kids

Strojově čitelná konverze 22 PDF výukových materiálů (internet4kids.mff.cuni.cz, MFF UK + PedF UK) o fungování internetu. Převedeno 2026-07-24.

## Struktura lekcí

Každá lekce existuje ve dvou variantách: **L** (lehčí, 6.–7. ročník) a **T** (těžší, 8.–9. ročník).

| Lekce | Téma | Materiály |
|-------|------|-----------|
| 1H | Jak vypadá internet — servery, datová centra, kabely, routery; T navíc IP adresy, traceroute, pakety | prezentace, pracovní list, příprava pro učitele |
| 2H | Typy připojení — Wi-Fi, kabely (UTP/optika), mobilní data, satelity; měření rychlosti | prezentace, pracovní list, příprava pro učitele |
| 3H | Co o nás ví internet — pakety, IP, cookies, digitální stopa, personalizace | prezentace, pracovní list, příprava pro učitele |
| 4H | Velké opakování — Kahoot kvíz a hra Bingo | pracovní list, příprava pro učitele (prezentace neexistuje) |

## Obsah adresáře

- `*.md` — 22 Markdown přepisů, jeden na každé PDF. YAML frontmatter (`title`, `source`, `pages`, `converted`), prezentace po slidech (`## Slide N`), tabulky jako Markdown tabulky, každý obrázek popsán blokem `> **Popis obrázku:**`.
- `svg/<nazev_pdf>/page-NN.svg` — 130 věrných vektorových exportů stránek (`pdftocairo -svg`), vizuálně identické s PDF; bitmapy z originálu jsou vložené uvnitř.
- `svg-simple/<nazev_pdf>/page-NN.svg` — 130 zjednodušených **sémantických** rekonstrukcí týchž stránek: veškerý text jako `<text>` elementy, diagramy překreslené primitivy (`rect`/`line`/`path`), fotografie nahrazené piktogramy s popisným `<title>`, QR kódy jako rámečky s cílovou URL, žádné bitmapy. Kořen má `role="img" lang="cs"` + `<title>`/`<desc>`, logické skupiny `<g>` mají `aria-label`. Určeno pro strojové zpracování, přístupnost a další úpravy.

## Poznámky ke zdrojovým PDF

- `1H_prezentace_T.pdf`: skrytý slide 11 (video Google datacentra) v PDF chybí — od `page-11` platí strana N = slide N+1; v MD i SVG zdokumentováno.
- `3H_prezentace_T.pdf`: skrytý snímek 10 („Baterka") chybí — od `page-10` platí strana N = snímek N+1.
- QR kódy v materiálech odkazují na externí služby (speedtesty, Kahoot, myadcenter.google.com, traceroute-online.com) a byly platné k roku 2024.
