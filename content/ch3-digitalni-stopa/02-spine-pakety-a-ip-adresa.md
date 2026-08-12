---
id: ch3-pakety
type: spine
title: "Pakety: skládačka, která se složí sama"
readingTime: 3
standalone: false
core: true
teaser: "Fotka se před odesláním rozpadne na očíslované dílky. Jak je možné, že se poskládají u kamaráda, a ne u souseda?"
voice: universal
parent: null
diagram: images/ch3-pakety-skladacka.svg
recallQ: "Co je to paket a podle čeho pozná cestu ke správnému zařízení?"
recallA: "Paket je malý očíslovaný kousek dat, na které se rozdělí vše, co po internetu posíláme. Každý paket nese IP adresu odesílatele i příjemce — podle ní routery poznají, kam ho poslat."
status: accepted
concept: ch3-pakety
state: core
lens: generic
visuality: balanced
depth: standard
formalism: none
lengthBand: standard
genre: explainer
carriers: prose|diagram
---

Všechno, co po internetu posíláš — zpráva, fotka, video — se před odesláním **rozloží na malé kousky**. Říkáme jim **pakety**. Každý paket je očíslovaný jako kost dinosaura z minulého bloku, cestuje sítí klidně jinou cestou než ostatní a v cílovém zařízení se všechny zase složí do původní podoby. Jako skládačka, která se složí sama.

Čím větší věc posíláš, tím víc paketů vznikne. Krátká zpráva? Pár paketů. Fotka? Víc. Video? Obvykle nejvíc, protože bývá ze všeho největší.

## Jak paket trefí ke správnému zařízení?

Jak je možné, že dílky tvé fotky dorazí do kamarádova mobilu, a ne třeba k sousedovi? Každé zařízení na internetu má svou adresu — **IP adresu**, kterou už znáš z první hodiny. A tady je klíčová věc: **IP adresa odesílatele i příjemce je součástí každého paketu**. Je to jako adresa napsaná na každé krabici s kostí — i zpáteční adresa, aby bylo kam poslat odpověď.

Podle těchto adres **routery** (chytré křižovatky sítě) poznají, kam mají který paket poslat dál. Paket skáče od routeru k routeru, až dorazí do cíle.

**Zkus to!** U každého tvrzení si nejdřív tipni: **VŽDY / SPÍŠE ANO / NE**. Řešení najdeš pod čarou.

1. Paket obsahuje IP adresu odesílatele.
2. Delší zpráva bude mít stejně paketů jako kratší zpráva.
3. Všechny pakety jedné zprávy musí cestovat stejnými routery.
4. Video bude rozděleno do více paketů než obrázek.
5. Pakety vždy přijdou už ve správném pořadí.
6. Pakety jsou po internetu směrovány servery.

---

*Řešení: 1. VŽDY (jinak by odpověď netrefila zpět), 2. NE (delší zpráva = víc paketů), 3. NE (každý může jet jinudy), 4. SPÍŠE ANO (většinou ano, ale záleží na velikosti souborů), 5. NE (pořadí se srovná až v cíli podle čísel), 6. NE (směrují je routery, ne servery).*
