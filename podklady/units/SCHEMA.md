# Schéma obsahového balíčku „unit" (dle zadání P-book Školní edice v0.4, §5)

Jeden soubor = jedna unit: `units/<unit-id>.yaml`. Validní YAML (yaml.safe_load), plně česky, self-contained (texty segmentů uvnitř, obrázky odkazem na `pbook/assets/svg/`).

```yaml
unit:
  id: inf-zs2-internet-l          # nebo -t
  title: "Jak funguje internet"
  grade: "6-7"                    # -l: 6-7, -t: 8-9
  lang: cs
  source: "Internet4Kids (MFF UK + PedF UK), blok 4 hodin"
  rvp: ["I-9-4-03", "I-9-4-05"]

  lessons:
    - id: L1                      # L1..L4 = původní 1H..4H
      title: "…"
      objectives: ["žák vysvětlí …"]        # z příprav pro učitele, mapovatelné na RVP
      home_prep:                            # těžiště (P2: domov je výchozí prostředí)
        segments: [seg/l1-servery, …]       # reference na segments níže
        recall: auto
        est_min: 20
        link_label: "Domácí příprava na 2. hodinu"
        activity: {type: tutored_task, tutor_config: tc/L2}   # jen kde dává smysl (DP2)
      in_class:                             # volitelné; z původních prezentací/příprav
        - {phase: warmup,   min: 5,  source: generated}
        - {phase: aktivita, min: 25, note: "…co se dělá…", offline: true}
      gate: {requires: home_prep, min_score: 0.7, soft: true}

  segments:
    - id: seg/l1-servery
      title: "…"
      concepts: [server, datove-centrum]    # kebab-case slugy z tabulek pojmů lekce 4H
      est_min: 8
      blocks:                               # didaktický obsah (převzít z pbook/content/*.js)
        - {type: text,     html: "<p>…</p>"}
        - {type: figure,   src: "pbook/assets/svg/…/page-NN.svg", alt: "…", caption: "…"}
        - {type: note,     html: "…"}
        - {type: activity, html: "…"}
      items:                                # POVINNĚ 4–8 položek, každá otagovaná konceptem
        - {id: l1s1-i1, concept: server, q: "…", options: ["…","…","…","…"], correct: 2, explain: "…"}
      prompts:                              # POVINNĚ ≥1; typy střídat, max ~1 na obrazovku
        - {type: try,        id: l1s1-p1, task: "…", answer: "…", to_item_pool: true}
        - {type: didyouknow, id: l1s1-p2, text: "…", concept: server}
        - {type: think,      id: l1s1-p3, question: "…", handoff: {bot: argumentacni-partner, minutes: 3}}

  tutor_configs:                            # pro DP2 (tutorovaný úkol) — tvar dle kontraktu §B
    - id: tc/L2
      bot: pruvodce-ukolem
      goal: "…"
      rubric: ["…", "…"]
      checkpoints: [{id: c1, prompt: "…"}, {id: c2, prompt: "…"}]
      scaffold_level: 2

  boss_quiz:                                # L4: závěrečný kvíz bloku (12 položek, tagged)
    items: [ {id: bq-1, concept: …, q: …, options: […], correct: …, explain: …}, … ]
```

## Zásady

- **Choreografie bloku (§5):** H1 úvod → DP1 (segmenty + recall) → H2 → DP2 (tutorovaný úkol) → H3 (start tellingu) → DP3 (telling + peer review) → H4 (obhajoby, boss kvíz, certifikát). L3.home_prep tedy obsahuje `activity: {type: telling, …}` a `{type: peer_review}` jako součást DP3 (zapiš do L3/L4 dle logiky bloku).
- **Koncepty:** číselník odvoď z tabulek pojem→vysvětlení lekce 4H příslušné varianty (L: 26, T: 31 pojmů); slugy kebab-case bez diakritiky. Každá kvízová položka i didyouknow má `concept` z tohoto číselníku. Na začátek unit přidej `concepts:` seznam se slugy + českými názvy.
- **Items:** využij existující otázky z `pbook/content/*.js` (rozděl je k segmentům podle konceptu) a dopiš další tak, aby měl KAŽDÝ segment 4–8 položek. Boss kvíz L4 = 12 položek z `4H.js`. Správné indexy rozprostři, `explain` povinný.
- **Prompts:** `try` = malý úkol s řešením (plní item pool), `didyouknow` = zajímavost, `think` = otevřená otázka s `handoff` na personu (argumentacni-partner | zvedavy-mimon | co-kdyby | pruvodce-ukolem). V každém segmentu ≥1, v celé unit všechny typy zastoupeny; boxy `note`/`activity` z bloků můžeš povýšit na prompts, pak je z blocks vyndej (žádná duplicita).
- Žádné PII, žádné externí URL mimo activity texty (tam jen jako prostý text).
