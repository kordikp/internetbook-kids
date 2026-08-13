# Jak funguje internet? — p-book pro školy

**Živá interaktivní učebnice** o fungování internetu pro 2. stupeň ZŠ (11–15 let).
Doprovodný materiál k lekcím **[Internet4Kids](https://internet4kids.mff.cuni.cz)** (MFF UK & PedF UK);
interaktivní podobu přináší [AI dětem](https://aidetem.cz).

**Živě:** https://pbook-internet.vercel.app · **Školní rozcestník:** https://pbook-internet.vercel.app/start

## Co to je

Blok 4 hodin informatiky (RVP I-9-4-03, I-9-4-05): jak vypadá internet (servery, kabely,
routery), jak se připojujeme, co o nás internet ví (pakety, cookies, digitální stopa)
a velké opakování. Obsah je pokrytý pestrými formami: text, jednotný vizuální systém
diagramů (viz `images/STYLE.md`), animace, komiksy, propočty, ukázky kódu, 7 mini-her,
recall kvízy s chytrým opakováním, mise s AI zkoušejícím a certifikát.

Kniha je **živá**: čtenář si může nechat kteroukoli sekci přegenerovat po svém
(jednodušeji, do hloubky, jiné příklady), přidat vlastní text či AI diagram na
označené místo, vytvořit vlastní „telling" a sdílet ho se třídou. Ověřené jádro
zůstává nedotčené a vše generované je viditelně označené. **AI se platí z XP** —
čtenář si na ni vydělá čtením, kvízy, poznámkami a ručními úpravami (první
vyzkoušení zdarma): vedeme k hospodárnému, „zelenějšímu" využívání AI a ruční
práce má větší cenu než generovaná.

## Školní režim — brány

Samostatné vstupní stránky vedou každou roli (`/start` rozcestník):

| Brána | Role |
|---|---|
| `/dp1` `/dp2` `/dp3` | žák doma: mise → kvíz → **vstupenka na hodinu**; DP2 má tutorovaný úkol s AI checkpointy, DP3 tvorbu tellingu |
| `/hodina` | třída: rozcvička na projektor z recall otázek, program hodin |
| `/ucitel` | učitel: odkazy k rozeslání, výklad bran, export learning signálů (formát tiny.school) |
| `/rodic` | rodič: dvouminutový briefing + otázky k večeři |

Žádné účty, žádná PII — postup žáka zůstává v jeho zařízení (localStorage),
learning signály se frontují lokálně (`js/tiny-adapter.js`) pro budoucí integraci.

## Architektura

Postaveno na enginu [recsys-pbook](https://github.com/kordikp/recsys-pbook)
(statická PWA bez build kroku + Vercel serverless `api/`). Obsah je datový balíček:
`content/book.json` + markdown bloky s facetovým frontmatterem, `games/*.json`,
`images/*.svg`. Koncepty a jejich kontrakty: `content/concepts.json`
(generuje `scripts/migrate-facets.js`).

LLM: bez vlastního klíče se `api/generate.js` a `api/boss.js` **forwardují na
sesterskou bránu** recsys-pbook (`PBOOK_GATEWAY_URL`), která drží klíč a routuje
levný/silný model podle náročnosti; s vlastním `OPENAI_API_KEY`/`ANTHROPIC_API_KEY`
se automaticky použije lokální cesta. Recombee (doporučování) a Supabase
(interakce, návrhy konceptů) přes env proměnné — viz `build.sh` a `api/`.

## Lokální spuštění a nasazení

```bash
python3 -m http.server 8080        # čtení/kvízy/hry fungují; AI a sync vyžadují nasazené API
vercel deploy --prod               # nasazení (projekt pbook-internet)
```

## Podklady (`podklady/`, nenasazují se)

- `converted/` — strojově čitelná konverze původních PDF Internet4Kids (Markdown + sémantická SVG)
- `units/` — obsahový balíček dle zadání „P-book Školní edice v0.4" §5 (YAML, varianty L/T)
- `pbook-soulad-se-zadanim.md` — mapování prototypu na zadání a integrační kontrakt tiny.school

## Licence

Obsah CC BY-NC-SA 4.0 (odvozeno z materiálů Internet4Kids, MFF UK & PedF UK).
Engine viz [recsys-pbook](https://github.com/kordikp/recsys-pbook).
