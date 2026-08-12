---
id: ch3-cookie-kod
type: spine
title: "Jak vypadá cookie doopravdy?"
readingTime: 1
standalone: false
core: false
teaser: "Žádné kouzlo, jen jeden řádek textu. Přečti si skutečnou cookie a zjisti, co v ní vlastně je."
parent: ch3-cookies
diagram: null
recallQ: "Je cookie program, který na tvém zařízení něco spouští?"
recallA: "Ne. Cookie je malý textový záznam: jméno=hodnota, do kdy platí (expires) a komu patří (domain). Nic spustit neumí — prohlížeč ji jen při další návštěvě ukáže serveru."
status: accepted
concept: ch3-cookies
state: edited
lens: generic
visuality: text-first
depth: technical
formalism: none
lengthBand: tldr
genre: code-walkthrough
carriers: prose|code
---

Šatnový lístek už znáš — a takhle vypadá doopravdy. Když ti chce server uložit cookie, pošle prohlížeči jeden řádek:

```http
Set-Cookie: navsteva=42; expires=Sat, 14 Nov 2026 12:00:00 GMT; domain=eshop.cz
```

- **`navsteva=42`** — jméno a hodnota: to jediné si stránka ukládá (tady číslo tvého „lístku"),
- **`expires=…`** — do kdy cookie platí; potom ji prohlížeč sám smaže,
- **`domain=eshop.cz`** — komu patří: prohlížeč ji ukáže jen stránkám eshop.cz.

A to je celé. **Cookie je jen malý textový záznam, ne program** — nemůže nic spustit, nic si z tvého zařízení „vzít". Jen leží v prohlížeči a čeká, až si ji server při další návštěvě přečte.

**Prozkoumej!** V počítači si cookies můžeš prohlédnout sám/sama: na libovolné stránce stiskni **F12** a najdi kartu *Aplikace* (Application) → *Soubory cookie*. Kolik jich tam ta stránka má?
