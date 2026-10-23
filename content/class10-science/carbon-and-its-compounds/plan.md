---
status: built
source: content/sources/text/sc10-ch04-carbon.txt
approved: 2026-10-20
---

# Class 10 Science, Ch4: Carbon and its Compounds (plan)

Source: NCERT jesc104 (2020-21, the full edition). Keep everything, including the "More to Know" boxes (allotropes, organic compounds, flames, coal and petroleum, alcohol as fuel, micelles) and soaps and detergents. Structure: theory-first, like Light L1: Hook → Learn (NCERT order, define before use, props) → See it in life → Practice (examples, NCERT in-text and exercises, your turn, mission log). Hindi with every string.

## Mission: The Soap Project
The school's Green Fair is three weeks away. Riya and Kabir want a stall selling handmade soap, made from cooking oil the way NCERT's Group Activity II does it. Grandpa warns them: "Soap is chemistry. Make it wrong and it won't lather in the village's hand-pump water."

Each lesson answers one question the project raises:
- Kabir's supply list (Activity 4.1), and why sugar water doesn't conduct;
- Mom's diamond nose-pin next to Kabir's pencil;
- the LPG cylinder;
- bottle labels (sanitizer, vinegar, a methanol warning);
- the blackened pan bottom;
- vanaspati vs oil;
- a fruity smell for the soap (ester);
- hard water and scum.

The finale is fair day: the soap works in soft water, and they sell a detergent bar for hard water.

## Lessons (NCERT order)
1. **covalent-bond** (4.1): Activity 4.1; Table 4.1 (low melting/boiling points, no conduction, so no ions); carbon's 4 valence electrons, why not C⁴⁻/C⁴⁺; sharing; H₂, Cl₂, O₂ (double), N₂ (triple), H₂O, NH₃, CH₄; covalent bond defined; strong bonds inside, weak forces between molecules. In-text Q1 (CO₂), Q2 (S₈).
2. **allotropes-of-carbon** (More to Know): diamond, graphite, C-60 fullerene; same chemistry, different structure and properties; synthetic diamonds.
3. **versatile-carbon** (4.2, 4.2.1): catenation, tetravalency, strong bonds from small size; organic compounds and Wöhler; saturated vs unsaturated; ethane, ethene, ethyne built step by step.
4. **chains-branches-rings** (4.2.2): Table 4.2 (methane to hexane); butane's two skeletons, structural isomers, pentane's three; cyclohexane, benzene; hydrocarbons, alkanes, alkenes, alkynes.
5. **functional-groups-and-series** (4.2.3, 4.2.4): heteroatom; Table 4.3 functional groups; homologous series, the CH₂ step and 14 u; CₙH₂ₙ₊₂, CₙH₂ₙ, CₙH₂ₙ₋₂; physical properties change gradually, chemical properties stay similar; Activity 4.2.
6. **naming-carbon-compounds** (4.2.5): rules (i)–(iv), Table 4.4; in-text Q4–Q5.
7. **combustion-and-oxidation** (4.3.1, 4.3.2): combustion equations (balance them); Activities 4.3 and 4.4: clean blue flame vs yellow sooty flame, air holes, blackened vessels; pollutants; flame vs glow; formation of coal and petroleum; Activity 4.5, alkaline KMnO₄, oxidising agents, ethanol → ethanoic acid.
8. **addition-and-substitution** (4.3.3, 4.3.4): hydrogenation with a Ni/Pd catalyst (catalyst defined), vegetable oils vs animal fats; substitution of CH₄ + Cl₂ in sunlight; in-text Q (oxy-acetylene welding).
9. **ethanol-and-ethanoic-acid** (4.4):
   - ethanol: properties and uses; sodium (Activity 4.6) giving sodium ethoxide + H₂; dehydration with concentrated H₂SO₄ to ethene; effects of alcohol, methanol poisoning, denatured alcohol, alcohol as fuel;
   - ethanoic acid: vinegar, glacial acetic acid, weak acid (Activity 4.7); esterification (Activity 4.8), saponification; with base; with carbonates and hydrogencarbonates (Activity 4.9).
10. **soaps-and-detergents** (4.5): Activity 4.10, micelles (hydrophilic/hydrophobic, the oil inside, emulsion, why soap solution looks cloudy); Activity 4.11 hard water and scum; Activity 4.12 detergents; agitation; the soap-making finale.

## Props (new package @chalk/prop-carbon)
- **covalentBond**: electron-dot builder for H₂, Cl₂, F₂, O₂, N₂, H₂O, NH₃, CH₄, CO₂, H₂S, C₂H₆, C₂H₄, C₂H₂, CH₃Cl.
  - Step from separate atoms with their valence electrons (dots for one, crosses for the other) to shared pairs, then to line bonds.
  - Derived: bond count, shared pairs, each atom's outer-shell count.
- **carbonChain**: build a carbon compound.
  - Settings: number of carbons (1–6); shape straight, branched or doubly branched, or ring; each C–C bond single, double or triple; a functional group (none, –Cl, –Br, –OH, –CHO, >C=O, –COOH).
  - Hydrogens fill automatically.
  - Derived: formula, name (NCERT rules), saturated or not, class, valency check, molecular mass.
- **homologousSeries**: a ladder for alkanes, alkenes, alkynes and alcohols: formula, mass, CH₂ / 14 u steps, rising boiling points, general formula.
- **allotropes**: diamond (3-D network), graphite (hexagon layers), C-60 (football); tap to compare hardness, conduction and look.
- **carbonLab**: test-tube and flame demonstrations, stepped:
  - flame: a burner with the air hole open or closed, and a saturated vs unsaturated fuel, giving a blue or sooty flame and a black plate;
  - KMnO₄ oxidation: purple fades, then stays;
  - hydrogenation: oil to vanaspati with a Ni catalyst;
  - chlorination: CH₄ + Cl₂ in sunlight, one H swapped at a time;
  - ethanol + sodium: fizz, pop test;
  - esterification: fruity smell;
  - acetic acid vs HCl: litmus and universal indicator;
  - ethanoic acid + Na₂CO₃: CO₂ turns lime water milky.
- **soapAction**: a soap molecule (head and tail), surface alignment, micelles round an oil droplet, rinse; hard vs soft water with soap or detergent (foam vs scum).
- **carbonScene**: story pictures for the Soap Project.
