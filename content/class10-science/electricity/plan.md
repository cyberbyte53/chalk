---
status: built
source: content/sources/text/sc10-ch12-electricity.txt
approved: 2026-10-19
---

# Class 10 Science, Ch12: Electricity (plan)

Source: NCERT jesc112 (2020-21, the full edition; keep everything). Structure: theory-first, like Light L1. Every lesson runs Hook (story) → Learn (NCERT order, define before use, props) → See it in life (story, explained) → Practice (examples, in-text questions and exercises, your turn, mission log). Hindi with every string.

## Mission: the winter the bill doubled
January. Mom opens the electricity bill: ₹3,240, twice last winter's. She makes Riya and Kabir a deal: find out where the electricity goes and bring the next bill down, and they keep half of whatever they save. Riya wants a new phone cover and earphones; Kabir wants a cricket bat.

Along the way:
- Kabir's torch won't light;
- Grandpa's room heater and the geyser;
- the fan regulator;
- the wedding next door, with fairy lights that all die when one bulb goes;
- the fuse that blows when the heater, iron and geyser run together;
- the meter box that counts "units".

The finale is the bill audit: they swap bulbs for LEDs and put the geyser on a timer, and the next bill comes down.

Roadmap of stops: (1) current, (2) potential difference, (3) circuit diagrams, (4) Ohm's law, (5) what resistance depends on, (6) series, (7) parallel, (8) heating effect, (9) power and the bill.

## Lessons
1. **Electric current and circuit (12.1).**
   - Hook: the bill and the deal, then the "why this chapter", the roadmap, and Kabir's dead torch.
   - Learn: charge; a current is a flow of charge; a circuit is a closed path; a switch makes or breaks the path; I = Q/t; coulomb, ampere, mA, µA; electrons are 1.6 × 10⁻¹⁹ C, so 1 C ≈ 6 × 10¹⁸ electrons; conventional current runs opposite to the electrons; the ammeter goes in series (Fig 12.1). Also the "flow of charges" box (drift speed about 1 mm/s).
   - Practice: Example 12.1, in-text Q1–3.
2. **Potential difference (12.2).**
   - Hook: the overhead water tank on the roof.
   - Learn: water flows only with a pressure (level) difference; charges flow only with a potential difference; a cell keeps one up by chemical action; V = W/Q; volt (1 V = 1 J/C); the voltmeter goes in parallel.
   - Practice: Example 12.2, in-text Q1–3.
3. **Circuit diagrams (12.3).**
   - Hook: Kabir tries to draw the switchboard as a picture.
   - Learn: Table 12.1, all 11 symbols; reading a diagram; drawing Fig 12.1.
   - Practice: draw-the-circuit questions; in-text Q1–2 of 12.6.1 come later.
4. **Ohm's law (12.4).**
   - Hook: the fan regulator, or why the heater pulls so much more current than a bulb.
   - Learn:
     - Activity 12.1 (1–4 cells, nichrome, table, V–I graph through the origin);
     - V ∝ I, so V = IR; resistance; the ohm; I = V/R; double R halves I; variable resistance and the rheostat;
     - Activity 12.2 (nichrome, torch bulb, 10 W bulb in gap XY);
     - good conductor, resistor, poor conductor, insulator.
   - Practice: Examples 12.3 and 12.4, Exercises 7 and 8, in-text Q3 of 12.5.
5. **Factors on which resistance depends (12.5).**
   - Hook: why the heater coil is nichrome and the extension cord copper.
   - Learn: Activity 12.3 (length l and 2l, a thicker wire, copper); R ∝ l, R ∝ 1/A, R = ρl/A; resistivity and its unit Ω m; Table 12.2; alloys (high ρ, don't oxidise, used in heaters); tungsten for filaments; copper and aluminium for lines.
   - Practice: Examples 12.5 and 12.6, in-text Q1–5, Exercises 6 and 18(b, d, e).
6. **Resistors in series (12.6.1).**
   - Hook: the wedding fairy lights; one bulb dies and the whole string goes dark.
   - Learn: series and parallel defined (Figs 12.6–12.7); Activity 12.4 (the same current everywhere); Activity 12.5 (V = V₁ + V₂ + V₃); Rs = R₁ + R₂ + R₃.
   - Practice: Example 12.7, in-text Q1–2, Exercise 9.
7. **Resistors in parallel (12.6.2).**
   - Hook: why the home's sockets aren't in series.
   - Learn: Activity 12.6 (I = I₁ + I₂ + I₃, the same V across each); 1/Rp = 1/R₁ + 1/R₂ + 1/R₃; mixed circuits (Ex 12.9); the disadvantages of series for homes.
   - Practice: Examples 12.8 and 12.9, in-text Q1–5, Exercises 1, 10, 11, 13 and 18(c).
8. **Heating effect of electric current (12.7).**
   - Hook: the fuse blows when the heater, iron and geyser are all on.
   - Learn: energy in a purely resistive circuit becomes heat; H = VIt = I²Rt (Joule's law of heating) and its three proportionalities; applications (iron, toaster, kettle); the bulb (tungsten, inert gas); the fuse (in series, melting point, ratings 1/2/3/5/10 A; a 1 kW iron at 220 V needs a 5 A fuse).
   - Practice: Examples 12.10 and 12.11, in-text Q1–3, Exercises 4, 17 and 18(a).
9. **Electric power (12.8).**
   - Hook: the meter box's "units".
   - Learn: power is the rate of using energy; P = VI = I²R = V²/R; the watt, the kilowatt; energy = P × t; W h, kW h = "unit" = 3.6 × 10⁶ J; we pay for energy, not electrons.
   - Practice: Examples 12.12 and 12.13, in-text Q1–2, Exercises 2, 3, 12, 14, 15 and 16.
   - Finale: the bill audit and the next, smaller bill; all nine stops recapped.

## Props
The existing `@chalk/prop-circuit` (a general circuit in textbook symbols, with a solver, meters, switches and moving-dash current) stays as it is and draws the lesson circuits. The new package `@chalk/prop-electricity` adds:
- **chargeFlow:** charges moving through a wire past a marked cross-section; the learner sets the current, and a timer counts the charge (Q = It); show conventional current, electrons, or both; electrons per coulomb.
- **waterTank:** an overhead tank feeding a pipe to a tap, beside its circuit twin. Tank height ↔ potential difference, pipe narrowness ↔ resistance, flow ↔ current. No height difference, no flow.
- **circuitSymbols:** Table 12.1's 11 symbols, with names, or as a tap-to-reveal quiz.
- **ohmLab:**
  - *Cells mode* (Activity 12.1): 1–4 cells and nichrome, an ammeter dial and a voltmeter dial; Record adds a row to the table; a V–I graph through the origin; the V/I column.
  - *Gap mode* (Activity 12.2): put nichrome, a torch bulb, a 10 W bulb, copper, rubber or glass in gap XY and read the ammeter (off the scale when the current is too large).
  - It can also plot given data (Exercise 7).
- **wireResistance** (Activity 12.3): a wire drawn to its length and thickness, in a material from Table 12.2. R = ρl/A, and the current from one cell, compared with reference wire (1). The resistivity table can be shown.
- **resistorCombo:** series, parallel or mixed (Ex 12.9) combinations of 2–3 (mixed: 5) resistors or bulbs on a battery. The ammeter can be moved and a voltmeter placed across any part; equivalent resistance, branch currents and voltages; break a bulb to see series go dark and parallel carry on.
- **jouleHeating:** a resistor heating water (H = I²Rt, temperature rise), with I, R and t set by the learner. *Cord and element* mode: the same current, different R, so only the element glows. *Fuse* mode: switch appliances on a 220 V line with a fuse rating; too much current melts the fuse.
- **electricityBill:** the family's appliances with watts, count and hours a day; units per day and month, and the cost at ₹ per unit; swap a 100 W bulb for a 9 W LED; the biggest consumer shown.
- **electricityScene:** story illustrations in the shared Person look: BillShock, TorchDead, RoofTank, MessyWiring, FanRegulator, FairyLights, FuseBlown, MeterBox, BillHalved.
