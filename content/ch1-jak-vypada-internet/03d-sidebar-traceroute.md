---
id: ch1-traceroute
type: spine
title: "Traceroute: vypiš si routery po cestě"
readingTime: 2
standalone: true
core: false
teaser: "Jedním příkazem si vypíšeš všechny chytré křižovatky mezi tebou a Googlem – i s časy."
voice: explorer
parent: ch1-routery
diagram: null
recallQ: "Co ukazuje jeden řádek výpisu traceroute a co znamenají časy v milisekundách?"
recallA: "Každý řádek je jeden router (hop) na cestě k cíli. Časy v ms říkají, jak dlouho trvá signálu cesta k danému routeru a zpět – hvězdička znamená, že router zrovna neodpověděl."
status: accepted
concept: ch1-routery
state: edited
lens: generic
visuality: text-first
depth: technical
formalism: none
lengthBand: tldr
genre: code-walkthrough
carriers: prose|code
---

Routery po cestě nejsou žádné tajemství – můžeš si je vypsat. Na Windows otevři **příkazový řádek** a napiš `tracert google.cz` (na mobilu poslouží web níže). Dostaneš něco takového:

```text
C:\> tracert google.cz

Tracing route to google.cz [142.251.36.131]
over a maximum of 30 hops:

  1     2 ms     1 ms     1 ms  192.168.1.1
  2     9 ms     8 ms    10 ms  62.141.5.9
  3    11 ms    10 ms    12 ms  89-24-28-9.customers.tmcz.cz [89.24.28.9]
  4    12 ms     *       13 ms  172.253.50.249
  5    14 ms    13 ms    14 ms  142.251.224.127
  6    13 ms    14 ms    13 ms  prg03s12-in-f3.1e100.net [142.251.36.131]

Trace complete.
```

Jak výpis číst:

- **Každý řádek = jeden router** na cestě (říká se mu *hop*). Řádek 1 je tvůj domácí Wi-Fi router (`192.168.1.1`), poslední řádek je cíl – server Googlu (`prg` v jeho jméně prozrazuje Prahu).
- **Časy v ms** říkají, jak dlouho letěl signál k routeru a zpět (ping). Zkouší se třikrát – proto tři čísla. Čím dál je router, tím bývá čas větší.
- **Hvězdička `*`** znamená, že router zrovna neodpověděl. Nemusí být rozbitý – jen se s tebou nebaví.

**Zkus to!** Na [traceroute-online.com](https://traceroute-online.com) si trasu necháš vykreslit i na mapě. Na kolik hopů se dostaneš k webu vaší školy? A přes které země vede cesta?
