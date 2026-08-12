# P-book ↔ tiny.school — integrační kontrakt · v0.3

**Rozsah v0.3:** integrace je **volitelná a oportunistická**. P-book funguje plnohodnotně bez Tiny; propojení práci obohatí. Tři povrchy, všechny nepovinné:

- **(A) Přihlášení** — žák propojí p-book se školním účtem (OIDC).
- **(B) Předání do chatbota Tiny** — u didakticky navržených konverzací, kde má hodnotu dozor učitele.
- **(C) Zápis learning signálů** do profilu žáka.

Oproti v0.2 vypadává: závislost na LLM runtime Tiny, požadavek `/v1/assistant/tasks` (p-book má vlastní LLM bránu), assignment API, embedy, `roster.read`.

**Důsledek pro plánování:** MVP p-booku **nečeká na roadmapu Tiny**. Každý povrch níže lze dodat samostatně; bez kteréhokoli z nich p-book funguje, jen v omezenějším propojení.

---

## 0. Hranice odpovědnosti

| Doména | Tiny | P-book |
|---|---|---|
| Školní identita, PII, třídy | ✅ jediný držitel | pairwise `sub`, jen když je žák propojen |
| Didaktické chatboty, dozor konverzací, alerty učiteli | ✅ | volající klient (oportunisticky) |
| Profil žáka a jeho historie | ✅ | producent signálů |
| **LLM runtime pro generativní funkce** | — | ✅ **vlastní brána a klíč** |
| **Moderace, věková politika, krizová cesta u vlastní brány** | — | ✅ |
| Obsah, item pooly, kvízy, vstupenky, tellingy, gamifikace | — | ✅ |
| Frontend žáka i tenký učitelský pohled | — | ✅ |
| Distribuce úkolů | odkaz v lekci/úkolu | generuje odkaz |

Zásada: **z p-booku do Tiny tečou jen odvozené signály a dialogy vedené uvnitř Tiny. Dialogy vedené vlastní bránou zůstávají u nás** a řídí se naší politikou (viz zadání §8, §9).

---

## A. Přihlášení (volitelné)

```
GET  {tiny}/oauth/authorize
       ?client_id=pbook&response_type=code&code_challenge=…
       &scope=openid assistant.invoke profile.write
POST {tiny}/oauth/token      → access_token (~15 min), refresh_token, id_token
GET  {tiny}/oauth/userinfo   → { sub, role: student|teacher, locale, grade_band }
     {tiny}/.well-known/openid-configuration, /jwks.json
```

- `sub` je **pairwise per app**; p-book nežádá jméno ani e-mail.
- Bez přihlášení běží p-book na lokálním pseudonymním účtu — **všechny funkce včetně generativních jsou dostupné**.
- Propojení = jednosměrný merge lokálních dat pod `sub`.

| Scope | Účel | Nutnost |
|---|---|---|
| `openid` | pairwise identita | podmínka propojení |
| `assistant.invoke` | předání do chatbota Tiny (§B) | volitelné |
| `profile.write` | zápis learning signálů (§C) | volitelné |
| `profile.read` | čtení úrovně žáka pro adaptaci obtížnosti | volitelné |

---

## B. Předání do chatbota Tiny (oportunistické)

Volá se jen tehdy, **když je žák propojen a dozor učitele má hodnotu**: tutorovaný úkol zadaný učitelem, box „Zamysli se!", retrospektiva skupinové práce. Jinak tutéž konverzaci obslouží vlastní brána p-booku podle téže verzované politiky.

```http
POST {tiny}/v1/assistant/sessions
{
  "student_ref": "<pairwise sub>",
  "bot": "pruvodce-ukolem",      // nebo zvedavy-mimon, argumentacni-partner, co-kdyby, …
  "topic": "…",
  "context": { "goal": "…", "rubric": ["…"],
               "checkpoints": [{"id":"c1","prompt":"…"}],
               "scaffold_level": 2 },
  "origin": {"app":"pbook","unit":"inf-zs2-x","lesson":"L2"}
}
→ 201 { "session_ref": "…", "stream_url": "…" }

POST {tiny}/v1/assistant/sessions/{ref}/messages   → SSE
POST {tiny}/v1/assistant/sessions/{ref}/close
→ { "summary": "…", "flags": [...],
    "checkpoints": [{"id":"c1","reached":true,"assisted":false}] }   // [DELTA] volitelné
```

- Session je vidět v učitelském přehledu Tiny; odlišena `origin.app = pbook`.
- Alerty na nevhodný obsah řeší Tiny svým kanálem.
- P-book surový dialog nestahuje; z `close` dopočítá autonomii a pošle signál (§C).
- Chybí-li strukturovaný `close`, p-book si checkpointy vyhodnotí sám z vlastní stopy — degradace, ne blokace.

---

## C. Zápis learning signálů

**Learning signál = odvozený agregovaný údaj (doména, kompetence, úroveň, confidence), nikdy surový obsah.**

```http
POST {tiny}/v1/profile/signals
{
  "student_ref": "…",
  "signals": [
    { "domain": "informatika/data-a-informace",
      "competence": "rozpozna-zaujaty-zdroj",
      "level": 0.72, "confidence": 0.6,
      "source": {"app":"pbook","kind":"quiz","unit":"inf-zs2-x","lesson":"L2"},
      "occurred_at": "…" }
  ]
}
→ 202 { "accepted": 1 }
```

Producenti signálů: zvládnutí konceptu (kvíz, recall), dokončení domácí přípravy (vstupenka), výsledek tutorovaného úkolu (autonomie, miskoncepce), odevzdaný telling, dokončení bloku (certifikát).

`GET {tiny}/v1/profile/{student_ref}` *(`profile.read`)* → agregovaný profil pro adaptaci obtížnosti. Bez něj si p-book vede vlastní model.

**Fronta a offline:** signály se řadí do fronty a odesílají idempotentně; výpadek Tiny neblokuje práci žáka.

---

## D. Odkazy z Tiny do p-booku

```
https://<pbook>/u/{unit}/{lesson}[/{task}]?src=tiny&class=<opaque>
```

Stabilní, sdílitelné i mimo Tiny (QR na projektoru, školní web). `class` je neprůhledný token bez PII, slouží jen ke skupinovým agregátům. Odkaz sám nic neautorizuje — autorizuje se až přihlášením. V p-booku je tlačítko **„Zkopírovat odkaz pro Tiny"**.

---

## E. Webhooky Tiny → p-book

HMAC podpis (`X-Tiny-Signature`), retry s backoffem, idempotency key.

| Událost | Reakce |
|---|---|
| `consent.changed` | okamžité zastavení dotčeného zpracování |
| `data.erase {student_ref}` | tvrdý výmaz záznamů propojeného žáka ≤ 30 dní + potvrzení |
| `app.suspended` | zneplatnění tokenů; p-book **běží dál** v samostatném režimu |
| `session.completed` *(volitelné)* | alternativa k synchronnímu `close` |

---

## F. Alert do Tiny při rizikovém obsahu **[DELTA]**

Krizová cesta p-booku (zadání §8) potřebuje u **propojeného** žáka doručit signál učiteli. Ideálně stávajícím kanálem Tiny pro upozornění na nevhodný obsah:

```http
POST {tiny}/v1/alerts
{ "student_ref": "…", "severity": "high",
  "category": "self_harm" | "abuse" | "inappropriate",
  "origin": {"app":"pbook","unit":"…"},
  "note": "Zachyceno v domácí přípravě; obsah zprávy nepřenášíme." }
```

Bez tohoto endpointu zůstává jediná reakce lokální obrazovka s odkazem na pomoc — funkční, ale škola se nedozví nic. **Doporučení: dohodnout kanál před pilotem** a rozhodnout, co se učiteli sděluje a co ne.

---

## G. Registrace appky

```json
{
  "app_id": "pbook",
  "name": "P-book — Školní edice",
  "redirect_uris": ["https://<pbook>/auth/callback"],
  "webhook_url": "https://<pbook>/hooks/tiny",
  "requested_scopes": ["openid", "assistant.invoke", "profile.write", "profile.read"],
  "own_llm": true,
  "data_retention_days": 30,
  "dpa_ref": "<odkaz na zpracovatelskou smlouvu>"
}
```

Tier: pilot **Verified**, cíl **Partner**. Pozn.: `own_llm: true` je pro Tiny podstatný údaj — část konverzací žáka **neprochází její moderací**. Tiny by měla mít právo si vyžádat naše bezpečnostní testy (zadání §8) jako podmínku tieru; navrhujeme to sami.

---

## H. Nefunkční požadavky a ochrana dat

Verzování `/v1`; chyby RFC 9457; `Idempotency-Key` na POST; rate limity dle tieru; Sandbox tier s testovacím účtem.

Rozdělení rolí je nově složitější a patří k právnímu review: u školního nasazení je správcem škola (Tiny i p-book zpracovatelé), u volného domácího použití je správcem provozovatel p-booku. Dialogy vedené vlastní bránou spadají do našeho režimu (retence 30 dní, Stažení a Vymazání v aplikaci). Poskytovatel modelů: EU nebo odpovídající mechanismus, **žádný trénink na našich datech**, minimální retence, DPA.

---

## I. Souhrn [DELTA] požadavků na Tiny

1. **`/v1/profile/signals`** — zápis learning signálů z externí appky. *Bez něj p-book funguje, ale nic škole nepředá.*
2. **`/v1/alerts`** — kanál pro rizikový obsah zachycený externí appkou (§F). *Bezpečnostně nejdůležitější položka.*
3. **Šablona „Průvodce úkolem"** jako verzovaná ekosystémová šablona s parametry.
4. **Webhooky** `consent.changed`, `data.erase`, `app.suspended`.
5. *(volitelné)* strukturovaný `close`, `profile.read`, `session.completed`.

Požadavek na `/v1/assistant/tasks` z v0.2 **odpadá**.

---

## J. Otevřené otázky

1. Existuje kanál pro alerty z externí appky (§F), nebo jej musíme řešit jinak?
2. Taxonomie kompetencí pro `profile.signals` — číselník Tiny, nebo vlastní s mapováním?
3. Chce Tiny vidět v učitelském přehledu i sessions z p-booku ve stejném seznamu jako své hodiny? (odlišené `origin.app`)
4. Trust tier pro pilot při `own_llm: true` — postačí Verified, nebo bude platforma vyžadovat audit našich bezpečnostních testů?
5. Volné domácí použití bez školy: povolit v pilotu, nebo p-book zveřejnit až s propojením?
6. Věková hranice 13+ a souhlas zákonných zástupců pro nižší ročníky.
