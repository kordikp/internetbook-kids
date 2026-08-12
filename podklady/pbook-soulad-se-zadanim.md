# P-book prototyp × zadání v0.4 × kontrakt v0.3 — soulad a mezery

Stav k 25. 7. 2026. Srovnává lokální prototyp v `pbook/` a obsahový balíček v `units/` se *Zadáním P-book — Školní edice v0.4* a *integračním kontraktem tiny.school v0.3*.

## Co je splněno

| Požadavek | Kde v prototypu |
|---|---|
| Obsah jako datový balíček bez zásahu do kódu (§5) | `units/inf-zs2-internet-{l,t}.yaml` ve formátu §5 (units → lessons → segments s `concepts`, otagované items, `prompts`, `tutor_configs`, gate 0.7 soft); čtečka má vlastní jednodušší formát `pbook/content/*.js` — viz mezera níže |
| P2 domov jako výchozí prostředí | celý tok segmenty → recall kvíz → vstupenka běží doma, bez učitele |
| P3 minimalizace dat / volný stav (§2, §9) | lokální pseudonymní účet (přezdívka), localStorage, žádné jméno/e-mail, žádný backend |
| P4 čeština | UI i obsah plně česky, čtecí úroveň 12–15 |
| P6 offline pro čtení/cvičení/kvízy | nulové síťové požadavky, běží z `file://` |
| Gate: `min_score 0.7, soft` (§5) | práh vstupenky 70 %, neomezené pokusy, brána je „soft" (kvíz jde opakovat, nic se nezamyká trvale) |
| Distribuce odkazem, žádné assignment API (§3, kontrakt §D) | deep-link `#/u/{unit}/{lesson}?src=tiny` + tlačítko „Zkopírovat odkaz pro Tiny" v lekci; odkaz nic neautorizuje |
| Choreografie bloku (§5) | L1→L4 s DP mezi hodinami; L4 = boss kvíz + certifikát bloku |
| P5 ověřený core nedotknutelný | prototyp zobrazuje pouze core; generovaná vrstva zatím neexistuje, takže kolize nehrozí |

## Mezery (vyžadují backend / LLM / Tiny — mimo dosah lokálního prototypu)

- **G1–G4 generativní funkce (§6) a vlastní LLM brána (§7)** — v prototypu nejsou; obsahový balíček je na ně připraven (`prompts.think` s `handoff`, `tutor_configs` ve tvaru kontraktu §B).
- **Moderace, věková politika, krizová cesta (§8)** — vzniká až s LLM bránou; testovací sady §8 je třeba postavit proti oběma cestám (vlastní brána i Tiny) dle mitigace v §4.
- **OIDC přihlášení, learning signály, alerty, webhooky (kontrakt §A, §C, §E, §F)** — prototyp je čistě volný stav; vstupenka však už nese všechna metadata potřebná pro budoucí signál `home_prep_completed` (skóre, čas, datum) a její kód je deterministický → idempotentní odeslání.
- **Recall `auto` a warm-up ze slabých míst žáka** — prototyp má jen náhodnou rozcvičku z probraných lekcí; adaptivní výběr podle konceptů vyžaduje item pool s tagy, který `units/*.yaml` už poskytuje.
- **Telling (M4/M5) a peer review** — v balíčku popsané jako `activity` v DP3, v čtečce zatím jen jako textová aktivita.

## Jedna technická poznámka k dvojímu formátu

`pbook/content/*.js` (render formát čtečky) vznikl dřív než `units/*.yaml` (výměnný formát §5). Obsahově jsou synchronní (YAML z JS vychází a rozšiřuje ho o koncepty, items navíc a prompts), ale dlouhodobě má být zdrojem pravdy **jen `units/*.yaml`** a render formát se má generovat build krokem. Doporučení: malý převodník `units → content` přidat před pilotem, jinak se formáty rozjedou.

## Návrhy k otevřeným otázkám zadání (§12)

- **(2) Autorství segmentů učitelem:** potvrzujeme „po pilotu" — formát §5 je už teď autorovatelný ručně (YAML + SVG), což pro pilot stačí.
- **(5) Volné domácí použití:** prototyp ukazuje, že volný stav je plnohodnotný; pro pilot ale doporučujeme preferovat propojení kvůli krizové cestě (§8 bod 3 — nepropojený žák se škole nezviditelní).
- **(7) Recombee personalizace:** ve školním režimu default **off**; adaptaci obtížnosti pokrývá `profile.read`/vlastní model nad koncepty.
