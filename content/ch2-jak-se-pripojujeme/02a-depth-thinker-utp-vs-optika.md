---
id: ch2-utp-vs-optika
type: spine
title: "UTP vs. optika: silnice vs. dálnice"
readingTime: 3
standalone: false
core: false
teaser: "Jeden kabel doveze data 100 metrů, druhý 100 kilometrů. V čem je trik? Ve světle."
voice: thinker
parent: ch2-kabely
diagram: images/ch2-silnice-vs-dalnice.svg
recallQ: "Proč se na dlouhé vzdálenosti používají optická vlákna místo kovových kabelů?"
recallA: "V optickém vlákně letí signál jako světlo — téměř beze ztrát a imunní vůči elektromagnetickému rušení, bouřce i mrazu. Optika zvládne desítky Gb/s na vzdálenost až 100 km, zatímco kovový UTP kabel jen asi 100 Mb/s na 100 metrů."
status: accepted
concept: ch2-kabely
state: edited
lens: generic
visuality: balanced
depth: technical
formalism: none
lengthBand: standard
genre: explainer
carriers: prose|diagram
---

Většina přenosu dat po internetu jde **kabely** — tvoří celou páteř internetu. Ale kabel není jako kabel. Používají se dva hlavní druhy:

- **Kovový (UTP) kabel** — přenosová rychlost kolem **100 Mb/s**, dosah maximálně **100 metrů**. Je to kroucená dvojlinka s konektorem RJ-45, kterou zapojuješ do počítače nebo routeru.
- **Optický kabel** (ze skla či plastu) — přenosová rychlost **desítky Gb/s**, dosah až **100 kilometrů**. Signál se v tenkých vláknech přenáší **světlem**, s minimální ztrátou a imunitou vůči elektromagnetickému rušení — bouřka ani mráz na optice nepoznáš.

Představ si to jako silnice: **UTP je úzká cesta lesem, optika je mnohaproudá dálnice.** Přesně to ukazuje diagram.

## Zesilovače na dně oceánu

Optické kabely leží i **na dně oceánů** a spojují kontinenty. Ani světlo ale nedoletí nekonečně daleko — na každých zhruba 100 km je na kabelu **zesilovač signálu**, aby data překonala celou vzdálenost třeba mezi Londýnem a New Yorkem.

## Kdo se stará o českou páteř?

V Česku se o **páteřní síť** stará telekomunikační infrastruktura **CETIN**: přibližně **38 000 km optických kabelů** a přístupová síť s asi **20 miliony km metalických kabelů**, která rozvádí internet až do obcí. CETIN síť pronajímá **poskytovatelům internetu** — a od nich si připojení kupujeme my.

**Zamysli se!** Proč má smysl, aby dálnice (optika) vedla mezi městy, ale poslední metry k tobě domů klidně zvládne úzká cesta (UTP)? Nápověda: kolik dat teče jedním bytem a kolik celým městem?
