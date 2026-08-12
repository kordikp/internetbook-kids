---
id: ch1-klient-server
type: spine
title: "Klient a server: kdo komu slouží"
readingTime: 3
standalone: false
core: false
teaser: "Tvůj mobil je klient, který posílá požadavky. A každé zařízení v síti má svou adresu – IP adresu."
voice: thinker
parent: ch1-servery
diagram: null
recallQ: "Co dělá v modelu klient–server klient a podle čeho se zařízení v síti pozná?"
recallA: "Klient (tvůj mobil nebo počítač) posílá serveru požadavek a server vrací odpověď. Každé zařízení jednoznačně určuje jeho IP adresa – např. IPv4 ve tvaru X.X.X.X, kde X je 0 až 255."
status: accepted
concept: ch1-servery
state: edited
lens: generic
visuality: text-first
depth: technical
formalism: none
lengthBand: standard
genre: explainer
carriers: prose
---

Představ si, že by internet najednou přestal fungovat. Nejde jen o to, že by nejely sociální sítě – přestaly by fungovat jízdní řády, objednávání k lékaři, platby kartou, navigace... Skoro všechno kolem nás na internetu závisí.

Server je počítač zapojený do sítě, který má obrovské úložiště a plní speciální úkoly – třeba vyhledá spojení v jízdním řádu, skladuje tvoje dokumenty na cloudu nebo ukládá obsah Instagramu. Typicky nemá ani monitor, ani klávesnici, protože se k němu připojujeme **vzdáleně**.

Tomuto způsobu komunikace říkáme **KLIENT–SERVER**:

- **Klient** = tvoje zařízení (mobil, počítač), které posílá **požadavek**: „Ukaž mi video o kočičkách."
- **Server** = počítač, který požadavek splní a pošle **odpověď**: „Dobře, tady ho máš."

Serverů existují různé typy: webové, herní, chatservery... a s mnoha „služebními" servery komunikuješ, aniž o tom víš.

## Podle čeho se v síti pozná, kdo je kdo?

Každý dům má svou adresu, každý člověk rodné číslo – a každé zařízení v internetu má **IP adresu** (IP = Internet Protocol), která ho v síti **jednoznačně určuje**.

- **IPv4** (starší verze): tvar X.X.X.X, kde X je číslo 0 až 255. Příklad: **193.179.60.95**. Takových adres existuje jen asi 4 miliardy – a docházejí.
- **IPv6** (nová verze): mnohem delší, zapisuje se šestnáctkově. Příklad: 2001:2000:8002:2030:47ff:fea5:3085. Adres je tolik, že by jich na každého člověka připadlo asi 10²⁸.

> **Tip:** IP adresy webů si nemusíš pamatovat – podobně jako si neukládáš telefonní čísla, ale jména v kontaktech. Zapamatovatelnou adresu (URL) za tebe na IP adresu překládá **DNS server**.

**Zkus to!** Otevři si stránku https://traceroute-online.com/ a zadej adresu webu své školy. Stránka vypíše, přes jaké routery putoval požadavek z jejich počítače v Americe až na školní webový server. Jaké země vidíš na mapě? Přes kolik routerů (hopů) požadavek prošel? Jakou IP adresu má web tvé školy?
