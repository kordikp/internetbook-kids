---
id: ch1-obsah-paketu
type: spine
title: "Co je uvnitř paketu"
readingTime: 2
standalone: false
core: false
teaser: "Každý paket nese kromě kousku dat i 'štítek' – bez něj by se zpráva nikdy neposkládala."
voice: thinker
parent: ch1-routery
diagram: null
recallQ: "Co všechno obsahuje každý paket?"
recallA: "IP adresu odesílatele, IP adresu příjemce, identifikátor zprávy, samotný kousek dat (obsah) a pořadové číslo, aby šla zpráva v cíli složit. Heslo k Wi-Fi mezi to rozhodně nepatří."
status: accepted
concept: ch1-routery
state: edited
lens: generic
visuality: text-first
depth: technical
formalism: none
lengthBand: standard
genre: explainer
carriers: prose
---

Aby síť paketů fungovala, musí každý paket kromě kousku dat nést i „štítek" s údaji – podobně jako krabice s kostmi dinosaura měla nálepku s adresou a číslem. Každý paket obsahuje:

- **IP adresu odesílatele** – kdo paket poslal (aby bylo kam poslat odpověď),
- **IP adresu příjemce** – kam má paket dorazit (podle ní routery směrují),
- **identifikátor zprávy** – ke které zprávě či souboru paket patří (aby se nesmíchaly kosti dvou dinosaurů),
- **obsah** – samotný kousek dat,
- **pořadí** – pořadové číslo, aby šel soubor v cíli zase složit.

Právě podle **IP adresy příjemce** se router na každé křižovatce rozhoduje, kterým směrem paket poslat dál. A podle **pořadových čísel** tvůj mobil pozná, že paket č. 7 patří před paket č. 8 – i když osmý dorazil dřív, protože jel rychlejší cestou.

**Zamysli se!** Co se stane, když jeden paket cestou úplně zmizí (třeba vypadne router)? Příjemce si podle pořadových čísel všimne, že mu jeden chybí, a řekne si o něj znovu. Proto se ti video občas na chvilku zasekne – čeká se na ztracený paket.

A jedna kontrolní otázka: patří do paketu heslo k tvé Wi-Fi? **Nepatří.** Heslo slouží jen k připojení tvého zařízení k domácímu routeru – po síti se ve tvých paketech nerozesílá.
