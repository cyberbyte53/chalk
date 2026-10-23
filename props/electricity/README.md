# @chalk/prop-electricity

Props for NCERT Class 10 Ch 12, *Electricity*. They sit alongside `@chalk/prop-circuit`, which stays the general circuit diagram with its solver. Each prop knows its own small world. Shown words are in English and Hindi, everything is drawn with the look's tokens, and signals are emitted from actions.

| Prop (`type`) | World | Learner can |
|---|---|---|
| `chargeFlow` | Charge moving through a wire past a marked cross-section: I = Q/t, Q = It, electrons per coulomb, conventional current vs electrons | set the current, run a timed count |
| `waterTank` | A tank feeding a tap, and its circuit twin: height ↔ V, narrow pipe ↔ R, flow ↔ I, tap ↔ key | raise or lower the tank, swap the pipe, open the tap |
| `circuitSymbols` | The 11 symbols of Table 12.1, shown as a table or a tap-to-reveal quiz | reveal names |
| `ohmLab` | Activity 12.1 (1–4 cells, nichrome, ammeter, voltmeter, table, V–I graph); gap mode for Activity 12.2; data mode for Exercise 7 | add cells, plug the key, record, choose what goes in the gap |
| `wireResistance` | Activity 12.3: R = ρl/A from Table 12.2's resistivities, compared with wire (1) | change the length, the area and the material; mark a new reference |
| `resistorCombo` | Series, parallel or mixed (Ex 12.9) resistors or bulbs on a battery: equivalent R, branch currents and voltages, glow | move the ammeter and voltmeter, change values, break a bulb |
| `jouleHeating` | H = I²Rt in a coil heating water; cord vs element; fuse on the 220 V mains | set I, R and t, run; switch appliances, pick a fuse rating, fit a new fuse |
| `electricityBill` | Appliances × watts × hours → kW h, units in the month, ₹ | change hours, swap a bulb for an LED |
| `electricityScene` | Story panels for "the winter the bill doubled" | — |

Tests (`src/electricity.test.tsx`) check the textbook's worked examples (12.1, 12.5–12.9, 12.11, 12.13), the laws (V ∝ I, R ∝ l, R ∝ 1/A, series and parallel rules, Joule's law), fuses, the bill, and that every view renders in both languages at 300, 340 and 420 px.
