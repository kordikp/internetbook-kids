---
id: ch2-stahovani-vypocet
type: spine
title: "Jak dlouho potrvá stáhnout film?"
readingTime: 2
standalone: false
core: false
teaser: "Film má 2 GB a internet máš „stovku". Tak to bude hned, ne? Pozor — bity nejsou bajty a rozdíl je osminásobný."
parent: ch2-wifi-router
diagram: null
recallQ: "Jaký je rozdíl mezi bitem a bajtem a proč na něm při stahování záleží?"
recallA: "1 bajt (B) = 8 bitů (b). Velikost souborů se udává v bajtech (MB, GB), ale rychlost připojení v bitech za sekundu (Mb/s). Film o velikosti 2 GB je proto 16 Gb dat — čas stahování spočítáš jako velikost ÷ rychlost, ale nejdřív musíš obě čísla převést na stejné jednotky."
status: accepted
concept: ch2-wifi-router
state: edited
lens: generic
visuality: balanced
depth: standard
formalism: light
lengthBand: standard
genre: worked-example
carriers: prose|table
---

Chceš stáhnout film o velikosti **2 GB**. Za jak dlouho ho budeš mít? Vzoreček je jednoduchý:

**čas stahování = velikost dat ÷ rychlost připojení**

Jenže pozor, je tu chyták s jednotkami:

- Velikost souborů se měří v **bajtech** (B) — megabajty (MB), gigabajty (GB).
- Rychlost připojení se měří v **bitech** za sekundu (b/s) — třeba Mb/s.
- **1 bajt = 8 bitů.** Malé „b" a velké „B" tedy vůbec není totéž!

Než začneš dělit, převeď obojí na stejné jednotky:

**2 GB = 2 × 8 = 16 Gb = 16 000 Mb** (protože 1 Gb = 1 000 Mb).

Teď stačí dosadit. Takhle dopadne stejný film na třech různých připojeních:

| Rychlost připojení | Výpočet | Čas stahování |
|---|---|---|
| 10 Mb/s | 16 000 ÷ 10 = 1 600 s | ≈ 27 minut |
| 100 Mb/s | 16 000 ÷ 100 = 160 s | ≈ 2,7 minuty |
| 500 Mb/s | 16 000 ÷ 500 = 32 s | ≈ půl minuty |

Kdo na osmičku zapomene, vyjde mu čas **8× kratší** — a pak se diví, proč stahování „visí". Ve skutečnosti to navíc bývá ještě o kousek pomalejší: o rychlost se dělíš s ostatními zařízeními v domácí síti.

**Zkus to!** Změř si doma rychlost připojení a spočítej, za jak dlouho by se stáhla hra o velikosti 60 GB. Nezapomeň na osmičku!
