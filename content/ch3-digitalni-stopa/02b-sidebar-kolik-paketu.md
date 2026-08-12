---
id: ch3-kolik-paketu
type: spine
title: "Na kolik paketů se rozseká fotka?"
readingTime: 1
standalone: false
core: false
teaser: "Fotka z mobilu má 5 MB a jeden paket unese jen asi 1 500 bajtů. Spočítej si, na kolik dílků se rozpadne."
parent: ch3-pakety
diagram: null
recallQ: "Jak spočítáš, na kolik paketů se rozdělí 5MB fotka?"
recallA: "Velikost převedeš na bajty a vydělíš tím, kolik jeden paket unese (asi 1 500 bajtů): 5 000 000 ÷ 1 500 ≈ 3 300 paketů. Čtyřminutová písnička (~4 MB) dá zhruba 2 700 paketů."
status: accepted
concept: ch3-pakety
state: edited
lens: generic
visuality: text-first
depth: standard
formalism: light
lengthBand: tldr
genre: worked-example
carriers: prose|table
---

Jeden paket toho moc neunese: obvykle nejvýš asi **1 500 bajtů** (bajt ≈ jedno písmeno). Kolik paketů tedy vznikne z běžné fotky? Stačí vydělit velikost souboru tím, co se vejde do jednoho paketu:

| co posíláš | velikost | výpočet | paketů |
|---|---|---|---|
| fotka z mobilu | 5 MB = 5 000 000 B | 5 000 000 ÷ 1 500 | **≈ 3 300** |
| písnička (4 min) | 4 MB = 4 000 000 B | 4 000 000 ÷ 1 500 | **≈ 2 700** |

Tři tisíce dílků z jedné fotky — a každý z nich nese čísla i adresy z minulého bloku, aby se v cíli všechno správně složilo. Routery to zvládají miliardkrát denně.

**Zkus to!** Minutové video může mít kolem 100 MB. Na kolik paketů se rozseká? (Nápověda: 100 000 000 ÷ 1 500 — vyjde ti přes 60 tisíc.)
