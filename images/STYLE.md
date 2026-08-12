# Vizuální systém knihy „Jak funguje internet?"

Jeden systém pro VŠECHNY obrázky (diagramy, animace, komiksy). Shodný s design
systémem, kterým kniha generuje čtenářské remixy (`api/generate.js`) a komiksy
(`scripts/generate-comics.js`) — obsah i AI výtvory tak vypadají jako jedna kniha.
Minimalismus: má vyniknout obsah, ne forma.

## Plátno

- Diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 420" font-family="system-ui,sans-serif">`
  (hustý diagram smí 800×520; komiks má vlastní zamčený layout 800×640, viz níže)
- Pozadí VŽDY: `<rect width="800" height="420" rx="14" fill="#FAFAF7" stroke="#E5E7EB"/>`
- Titulek: `x="400" y="36" text-anchor="middle" font-size="19" font-weight="700" fill="#1E1B4B"`
- Popisek dole (1 řádek, vysvětlí pointu): `x="400" y="H−16" text-anchor="middle" font-size="12.5" fill="#6B7280"`
- ŽÁDNÉ: gradienty, filtry, stíny, `<image>`, transform na `<text>`, emoji v textech diagramu.

## Barvy (jen tyto)

| role | čára | výplň |
|---|---|---|
| inkoust (texty, neutrální obrysy) | `#1E1B4B` | — |
| sekundární text, šipky bez významu | `#6B7280` | — |
| rámečky, linky mřížek | `#E5E7EB` | `#FFFFFF` |
| **fialová = zařízení lidí** (mobil, notebook, klient) | `#7C3AED` | `#EDE9FE` |
| **modrá = síť a data v pohybu** (kabely, pakety, Wi-Fi, routery) | `#0EA5E9` | `#E0F2FE` |
| **zelená = cíl / server / v pořádku** | `#10B981` | `#D1FAE5` |
| **jantarová = zvýraznění / pozor** | `#D97706` | `#FEF3C7` |
| červená = výpadek/chyba, jen výjimečně | `#EF4444` | `#FEE2E2` |

Významy barev drž v celé knize (fialová klient · modrá síť · zelená server).
V jednom diagramu max 3 akcentové barvy + neutrály.

## Tvary a text

- Uzly: `rx="8"`–`10`, stroke-width 1.5–2. Osoby: kruh hlava (r 9–11) + čárové tělo
  (stroke-width 2.5, linecap round), bez obličeje nebo max 2 prvky.
- Šipky: `stroke-width="2"`, trojúhelníkový marker; přerušovaná čára `stroke-dasharray="6 5"` = bezdrát.
- Písmo: pouze `system-ui,sans-serif`; velikosti 11 (minimum) / 12.5 / 14 / 19 (titulek); váhy 400 a 700.
- Max ~12 vizuálních prvků, velkorysý prázdný prostor, texty se NIKDY nepřekrývají s tvary.
- Česky, spisovně, krátce. Čísla s mezerou (35 000 km).

## Animace (jen když pohyb = význam)

- Vše čitelné i v klidu. JEDNA jemná smyčka (3–6 s, linear/ease-in-out, infinite):
  putující paket (translate po trase / `stroke-dashoffset`), vlnky signálu (opacity).
- Zápis: `<style>` uvnitř SVG s `@keyframes`; navrch vždy
  `@media (prefers-reduced-motion: reduce){ * { animation: none !important } }`.

## Komiks (zamčený layout — neodchylovat se)

- `viewBox="0 0 800 640"`, pozadí jako výše; titulek y=38, size 21, weight 700 (vtipný, dvojsmysl, max 52 znaků).
- 4 panely PŘESNĚ: P1 `x=14 y=56`, P2 `x=406 y=56`, P3 `x=14 y=336`, P4 `x=406 y=336` — vždy `width=380 height=264 rx=10 fill=#FFFFFF stroke=#E5E7EB`.
- Vizuál v horních ~200 px panelu; popisek panelu na posledním řádku: size 12, `#6B7280`, střed panelu, `y = panel_y + 250`, max 66 znaků.
- Patička (poučení vážně): střed, y=626, size 13, `#6B7280`, max 95 znaků.
- Bubliny: rounded rect rx 9 + text 12.5 px, max 34 znaků/řádek, max 2 řádky, max 2 bubliny/panel. Max 9 prvků na panel.
- Příběh: jedna všední situace, která JE mechanismus konceptu (dvojí čtení); P1 expozice → P2 rozvinutí → P3 komplikace → P4 pointa. Pointa nevysvětluje — vysvětluje patička.

## Kontrola před odevzdáním každého SVG

1. Validní XML (`python3 -c "import sys,xml.etree.ElementTree as ET; ET.fromstring(open(f).read())"`).
2. Žádný text mimo plátno, žádný text pod 11 px, žádný překryv textu s tvary.
3. Jen povolené barvy; pozadí přesně dle systému; `font-family` jen system-ui,sans-serif.
4. Vyrenderuj přes chromium a PODÍVEJ SE na výsledek (nástroj Read) — obrázek musí být pochopitelný sám o sobě.
