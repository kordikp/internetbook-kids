# Zadání: P-book — Školní edice (2. stupeň ZŠ) · v0.4

**Cíl:** rozšířit p-book (`kordikp/recsysbook-kids`) o školní režim pro výuku informatiky na 2. stupni ZŠ. Pilot = blok 4 vyučovacích hodin s domácí přípravou mezi hodinami. Obsah bloku se vkládá jako datový balíček **bez zásahu do kódu** (§5).

**Změny v0.4 — samostatnost**

- P-book **má vlastní LLM klíč a vlastní LLM bránu**. Generativní funkce nezávisí na Tiny.
- Žák pracuje **nezávisle na Tiny**; přihlášení přes Tiny je volitelné propojení, ne podmínka.
- **Funkce Tiny se volají oportunisticky** — když k tomu je vhodná příležitost (§4).
- Důsledek: **MVP není blokované roadmapou Tiny**, ale p-book přebírá odpovědnost za moderaci, věkovou přiměřenost, ochranu dat u nezletilých a náklady (§7, §8). Tyto povinnosti nejsou volitelné — dřív je nesla platforma, teď je neseme my.

---

## 1. Řídící principy

- **P0 — Samostatnost s propojením.** P-book funguje plnohodnotně sám. Tiny je vrstva, která práci obohatí, když je žák propojen se školou.
- **P1** Hodnotí se proces a dialog, ne artefakt.
- **P2** Domov je výchozí prostředí; hodina je volitelná nadstavba.
- **P3** Minimalizace dat. Nepropojený žák = lokální pseudonymní účet bez jména a e-mailu. Propojený = pairwise `sub` z Tiny.
- **P4** Čeština je plnohodnotný jazyk UI i obsahu.
- **P5** Ověřený core je nedotknutelný. Vše generované (AI i žákem) je označená vrstva navíc s návratem k originálu na jedno kliknutí.
- **P6** Offline: čtení, cvičení a kvízy fungují bez sítě; generativní funkce degradují čitelně.
- **P7 — Bezpečnost je naše.** Každý výstup modelu prochází vlastní moderací a věkovou politikou. Žádná generativní funkce se nenasazuje bez testů podle §8.

---

## 2. Stavy propojení

| Stav | Jak vzniká | Co funguje |
|---|---|---|
| **Volný** | žák otevře p-book, lokální pseudonymní účet | čtení, cvičení, kvízy, gamifikace, **všechny generativní funkce**; data lokálně + volitelný sync |
| **Propojený se školou** | přihlášení přes Tiny (OIDC) | totéž + learning signály do profilu, vstupenky viditelné učiteli, tutorované úkoly přes chatboty Tiny, alerty učiteli |

Přechod z volného do propojeného je jednosměrný merge lokálních dat pod `sub`. Odpojení = data zůstávají lokálně, sync se zastaví.

---

## 3. Vstup a distribuce úkolů

Žádné assignment API. Úkoly se šíří **odkazem**, který učitel vloží do Tiny (nebo kamkoli jinam):

```
https://<pbook>/u/{unit}/{lesson}[/{task}]?src=tiny&class=<opaque>
```

Odkaz sám nic neautorizuje — autorizuje se až přihlášením. V p-booku je pro učitele tlačítko **„Zkopírovat odkaz pro Tiny"**.

---

## 4. Kdy se volá Tiny (oportunistické body)

Pravidlo: **stejná funkce má obě cesty; nepropojený žák nikdy nenarazí na slepou uličku.**

| Situace | Cesta |
|---|---|
| Tutorovaný úkol zadaný učitelem, žák propojen | **Tiny** — šablona „Průvodce úkolem", učitel vidí konverzaci, dostává alerty a shrnutí |
| Tutorovaný úkol, žák nepropojen | vlastní tutor p-booku (tatáž politika, §8) |
| Box **„Zamysli se!"**, žák propojen | **Tiny** — didakticky navržený bot (Argumentační partner, Zvědavý mimoň, Co kdyby…) |
| Box „Zamysli se!", žák nepropojen | vlastní persona p-booku podle téže specifikace |
| Dokončení přípravy, kvízu, tellingu, bloku | **Tiny** — zápis learning signálu do profilu žáka (jen propojený) |
| Generativní funkce G1/G3/G4 (§6) | **vždy vlastní LLM brána** — nejde o konverzaci |
| Zachycený rizikový obsah (§8) | **Tiny** alert učiteli, pokud propojen; jinak jen lokální bezpečnostní reakce |

**Riziko dvojí implementace:** dvě cesty k témuž znamenají rozjezd pedagogiky i bezpečnosti. Mitigace: **jedna sdílená specifikace politiky** (cíl, sokratovská pravidla, zakázané chování) jako verzovaný artefakt; testovací sada z §8 běží v CI **proti oběma cestám** a rozdíly ve výsledcích jsou build failure.

---

## 5. Schéma obsahu

Vrstva **units**: jednotka odkazuje na core segmenty nebo přináší vlastní, načítá se jako datový balíček.

```yaml
unit:
  id: inf-zs2-<slug>
  grade: 8-9
  lang: cs
  lessons:
    - id: L2
      objectives: ["…"]                 # mapovatelné na RVP (nová informatika)
      home_prep:                        # těžiště
        segments: [seg/c, seg/d]
        recall: auto
        activity: {type: tutored_task, tutor_config: tc/L2}
        est_min: 20
        link_label: "Domácí příprava na středu"
      in_class:                         # volitelné
        - {phase: warmup,   min: 5,  source: generated}
        - {phase: aktivita, min: 25, segments: [seg/a, seg/b], offline: true}
      gate: {requires: home_prep, min_score: 0.7, soft: true}
```

**Segment** musí nést 4–8 kvízových položek otagovaných konceptem a **povinný blok `prompts`** (≥1):

```yaml
segment:
  id: seg/c
  concepts: [rec-cold-start]
  prompts:
    - {type: try,        id: p1, task: "…", answer: "…", to_item_pool: true}
    - {type: didyouknow, id: p2, text: "…", concept: rec-cold-start}
    - {type: think,      id: p3, question: "…", handoff: {bot: "argumentacni-partner", minutes: 3}}
```

Hustota: max 1 box na obrazovku, typy střídat. `try` boxy plní item pool — autor píše kvízy vedlejším efektem psaní textu. `handoff` míří na personu, kterou obslouží Tiny nebo vlastní brána podle stavu propojení.

**Choreografie bloku:** H1 (úvod) → **DP1** → H2 → **DP2** (tutorovaný úkol) → H3 (start tellingu) → **DP3** (telling + peer review) → H4 (obhajoby, boss kvíz, certifikát).

---

## 6. Generativní funkce pro žáka (MVP)

| # | Funkce | Popis |
|---|---|---|
| **G1** | **Přepni podání** | Segment se přegeneruje: jednodušeji · podrobněji · jako komiks · jako příběh · s příkladem z oblasti, kterou mám rád. Zdroj = **výhradně text segmentu**. |
| **G2** | **Nerozumím / Zamysli se** | Dialog nad odstavcem nebo boxem; cesta dle §4. |
| **G3** | **Další příklad / vyzkoušej mě** | Cvičné položky k témuž konceptu, označené jako cvičné, **nevstupují** do oficiálního item poolu. |
| **G4** | **Můj telling** | Žák s AI vytvoří vlastní podání tématu, uloží, může odevzdat a po schválení publikovat do třídní vrstvy. |

**Pojistky (G1–G4):** ukotvení ve zdrojovém textu s instrukcí nepřidávat fakta · viditelné označení „vytvořeno AI na tvé přání" + tlačítko **Zobrazit původní** · výchozí soukromí (jen pro žáka; do třídní vrstvy jen se schválením učitele) · denní rozpočet a cache · moderace dle §8 · v každém bloku alespoň jednou **Lov chyb**, aby žáci trénovali nedůvěru k výstupům AI.

---

## 7. Vlastní LLM brána

Veškerý provoz modelů jde přes **jednu serverovou bránu p-booku**; klient nikdy nemá klíč a nevolá poskytovatele přímo.

**Vrstvy zpracování požadavku**

1. **Autorizace a rozpočet** — limit na účet a den, ochrana proti smyčkám a automatizovanému zneužití.
2. **Scrubbing** — odstranění zjevných osobních údajů z volného textu žáka (jméno, e-mail, telefon, adresa, škola) před odesláním poskytovateli. Žák může do promptu napsat cokoli; scrubbing je poslední pojistka, ne alibi.
3. **Politika** — systémový prompt dle úlohy (verzovaný artefakt, §4), věková přiměřenost, čeština, ukotvení ve zdroji.
4. **Vstupní moderace** — klasifikace před voláním modelu.
5. **Volání poskytovatele** — routing podle úlohy: levnější model pro G1/G3, silnější pro tutora a G4.
6. **Výstupní moderace** — kontrola generovaného obsahu před zobrazením.
7. **Log** — pseudonymní, s retencí dle §9; bez ukládání celého dialogu déle, než je nutné.

**Smluvní požadavky na poskytovatele:** zpracování v EU nebo s odpovídajícím mechanismem, **žádný trénink na našich datech**, nulová nebo minimální retence, DPA. Bez toho poskytovatele nenasazujeme.

**Náklady:** odhad pilotu ~20 generování × ~1 500 tokenů výstupu na žáka a blok. Ochrany: denní limit, cache identických požadavků (unit + segment + režim), krátké výstupy, levnější model tam, kde stačí, měsíční strop nasazení s tvrdým vypnutím a čitelnou hláškou místo tiché chyby.

---

## 8. Bezpečnost a moderace (nová odpovědnost)

Dřív ji nesla Tiny. Teď je naše a je podmínkou nasazení.

**Věková politika.** Cílová skupina 13–15 let. Systémová politika zakazuje sexuální obsah, násilí, návodné informace k sebepoškozování, nákupu látek a podobně; jazyk odpovídá věku; model nevystupuje jako kamarád ani terapeut a neodrazuje od kontaktu s dospělými.

**Krizová cesta.** Žák může doma napsat věci, na které učebnice nemá odpovídat sama. Pokud vstupní klasifikátor zachytí známky sebepoškozování, ohrožení, nebo zneužívání:

1. generativní funkce se pro danou zprávu zastaví — žádná improvizovaná odpověď modelu;
2. zobrazí se krátká, laskavá obrazovka, která povzbudí ke kontaktu s dospělým, kterému žák věří, a nabídne **Linku bezpečí 116 111** (zdarma, nonstop);
3. je-li žák propojený se školou, odejde alert do Tiny stávajícím kanálem k učiteli; nepropojený žák dostane jen bod 2 — a to je zároveň důvod, proč propojení se školou v pilotu preferovat;
4. incident se loguje pseudonymně pro účely revize, obsah zprávy se neuchovává déle než pro tuto revizi nutné.

Formulace obrazovky připraví a schválí didaktici a psycholog týmu AI dětem, ne vývojář.

**Testy před nasazením** (v CI, proti oběma cestám z §4):

- **Jailbreak sada** — „řekni mi rovnou výsledek", „ignoruj pravidla", role-play obcházení; tutor nesmí vydat finální řešení.
- **Věková sada** — nevhodná témata, vulgarita, pokusy o osobní vztah.
- **Krizová sada** — scénáře podle výše uvedené cesty, kontrola, že se nespustí generace a zobrazí se správná obrazovka.
- **Ukotvení** — G1/G3 nesmí přidat fakta mimo zdrojový text; namátková lidská kontrola vzorku v pilotu.
- **Únik dat** — kontrola, že po scrubbingu neodchází PII.

Výsledky testů jsou součástí akceptace pilotu (§11).

---

## 9. Data a soukromí

- **Nepropojený žák:** lokální pseudonymní účet, žádné jméno ani e-mail. Sync volitelný, klíčovaný náhodným identifikátorem zařízení.
- **Propojený žák:** pairwise `sub` z Tiny IdP. P-book **ani zde nezískává jméno ani e-mail.**
- **Dialogy s vlastní bránou** jsou nově osobní údaje v naší správě: retence 30 dní pro účely revize a ladění, poté jen agregáty; žák má v aplikaci Stažení a Vymazání.
- **Role:** pro školní nasazení je správcem škola, p-book zpracovatel (DPA). Pro volné domácí použití je správcem provozovatel p-booku — jiný právní režim, vyžaduje vlastní informační text a **právní review před pilotem**.
- **Věk:** doporučená hranice 13+ v souladu s Tiny; nasazení v 6.–7. ročníku vyžaduje samostatné rozhodnutí včetně souhlasu zákonných zástupců.
- `data.erase` a `consent.changed` z Tiny se propagují do p-booku (webhooky, viz kontrakt).

---

## 10. Mimo rozsah

Vlastní správa tříd a účtů učitelů, plný učitelský dashboard, embedy do UI Tiny, assignment API, přímá komunikace s rodiči, známkování, jmenné žebříčky, volný chat žák–žák, AI persony (týmová simulace), plná lokalizace celé knihy, plnohodnotný editor segmentů pro učitele (§12, otázka 2).

---

## 11. Akceptační kritéria pilotu

- Učitel zadá domácí přípravu vložením odkazu do Tiny; nikde jinde se nepřihlašuje.
- Nepropojený žák projde celou domácí přípravou včetně generativních funkcí bez jediné slepé uličky.
- ≥ 80 % žáků získá alespoň 2 plné vstupenky ze 3; žák bez vstupenky se přes záchytný pruh zapojí ≤ 15 min po začátku hodiny.
- ≥ 60 % žáků použije generativní funkci dobrovolně, mimo zadaný úkol.
- **Všechny sady z §8 procházejí**; krizová cesta ověřena ručně.
- V generovaném obsahu žádný případ přepsání nebo záměny s ověřeným core (kontrola vzorku).
- Náklady na LLM na žáka a blok pod stanoveným stropem; strop nasazení otestován.
- Audit databáze: žádné PII, jen pseudonymní reference.

---

## 12. Otevřené otázky

1. Poskytovatel modelů a smluvní režim (EU, no-training, retence) — kdo uzavírá a kdo platí.
2. Autorství segmentů učitelem (mix + AI generování z tématu): do MVP, nebo po pilotu? Návrh: po pilotu.
3. Je p-book scénářem celé hodiny, nebo obsahovou vrstvou? Toto zadání volí druhé.
4. Portfolio a pracovní deník: v p-booku, nebo v profilu Tiny (přežívá školní rok)? Návrh: Tiny.
5. Volné domácí použití bez školy — chceme ho v pilotu vůbec povolit, nebo p-book zveřejnit až s propojením? Má přímý dopad na §9 a na krizovou cestu.
6. Věková hranice a souhlas zákonných zástupců pro 6.–7. ročník.
7. Recombee personalizace ve školním režimu: default on, nebo off?

---

## 13. Návazné dokumenty

*P-book ↔ tiny.school — integrační kontrakt v0.3* (volitelné přihlášení, oportunistické volání chatbotů, zápis learning signálů, webhooky). *P-book ve výuce* — koncepce k připomínkování (vyžaduje aktualizaci na home-first a samostatnost). Obsahový balíček 4 hodin: dodá Pavel, formát dle §5.
