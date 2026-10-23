import { readFileSync } from "node:fs";
import {
  type AnyPropDef,
  EffectKind,
  applyPatch,
  asAnyProp,
  prepareAction,
  viewOf,
} from "@chalk/prop";
import { renderToString } from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { defs } from "./defs";
import {
  Allotrope,
  CarbonScene,
  ChainAction,
  ChainSignal,
  Cleaner,
  CovalentAction,
  Flame,
  Fuel,
  GENERAL,
  Group,
  LabAction,
  LabKind,
  MOLECULES,
  Molecule,
  Series,
  Shape,
  SoapAction,
  SoapMode,
  type SoapState,
  Water,
  allotropesDef,
  bookFormula,
  carbonChainDef,
  carbonLabDef,
  carbonProps,
  carbonSceneDef,
  chainOf,
  classOf,
  covalentBondDef,
  diamondLattice,
  fullereneAtoms,
  fullereneBonds,
  homologousSeriesDef,
  isComplete,
  labOf,
  molecularFormula,
  nameOf,
  outerCount,
  problemOf,
  rowsOf,
  sharedPairsOf,
  soapActionDef,
  soapResultOf,
} from "./index";

type Result<S> = { state: S; signals: string[] };

function runner<S extends Record<string, unknown>>(raw: { defaults: S }) {
  const def = asAnyProp(raw as never) as AnyPropDef;
  return (state: S, name: string, args: Record<string, unknown> = {}): Result<S> => {
    const result = prepareAction(def, state, name, args);
    if (!result.isOk) throw new Error(result.errors.join("; "));
    if (result.effect.kind !== EffectKind.Set) throw new Error(`${name} should be instant`);
    const next = applyPatch(def, state, result.effect.set);
    if (!next.isOk) throw new Error(next.errors.join("; "));
    return { state: next.state as S, signals: result.effect.emit.map((e) => e.signal) };
  };
}

const view = (raw: unknown, s: Record<string, unknown>) =>
  viewOf(asAnyProp(raw as never) as AnyPropDef, s) as Record<string, unknown>;

describe("covalent bonds", () => {
  it("every molecule gives every atom a full outer shell (2 for H, 8 for the rest)", () => {
    for (const m of Object.values(Molecule)) expect(isComplete(MOLECULES[m]), m).toBe(true);
  });
  it("counts shared pairs as NCERT does", () => {
    expect(sharedPairsOf(MOLECULES.H2)).toBe(1);
    expect(sharedPairsOf(MOLECULES.O2)).toBe(2);
    expect(sharedPairsOf(MOLECULES.N2)).toBe(3);
    expect(sharedPairsOf(MOLECULES.CH4)).toBe(4);
    expect(sharedPairsOf(MOLECULES.CO2)).toBe(4);
    expect(sharedPairsOf(MOLECULES.C2H6)).toBe(7); // Exercise 1: 7 covalent bonds
    expect(outerCount(MOLECULES.H2O, 0)).toBe(8);
    expect(outerCount(MOLECULES.H2O, 1)).toBe(2);
  });
  it("steps apart → sharing → lines, and only switches to an offered molecule", () => {
    const run = runner(covalentBondDef);
    let s = { ...covalentBondDef.defaults, choices: [Molecule.H2, Molecule.O2] as Molecule[] };
    s = run(s, CovalentAction.Next).state;
    s = run(s, CovalentAction.Next).state;
    expect(s.step).toBe(2);
    expect(run(s, CovalentAction.Next).state.step).toBe(2);
    const picked = run(s, CovalentAction.Pick, { molecule: Molecule.O2 });
    expect(picked.state).toMatchObject({ molecule: Molecule.O2, step: 0 });
    expect(run(s, CovalentAction.Pick, { molecule: Molecule.N2 }).state.molecule).toBe(Molecule.H2);
    expect(view(covalentBondDef, { ...s, molecule: Molecule.N2, choices: [] }).kinds).toEqual([
      "triple",
    ]);
  });
});

describe("carbon chains", () => {
  const straight = (n: number, more: Partial<Parameters<typeof chainOf>[0]> = {}) =>
    chainOf({ carbons: n, ...more });
  it("the alkanes of Table 4.2 are CnH2n+2", () => {
    const names = ["methane", "ethane", "propane", "butane", "pentane", "hexane"];
    for (let n = 1; n <= 6; n++) {
      const c = straight(n);
      expect(nameOf(c).en).toBe(names[n - 1]);
      expect(molecularFormula(c)).toBe(n === 1 ? "CH4" : `C${n}H${2 * n + 2}`);
    }
  });
  it("double and triple bonds give alkenes CnH2n and alkynes CnH2n−2", () => {
    const ethene = straight(2, { bonds: [2, 1, 1, 1, 1, 1] });
    expect([nameOf(ethene).en, molecularFormula(ethene), classOf(ethene)]).toEqual([
      "ethene",
      "C2H4",
      "alkene",
    ]);
    const ethyne = straight(2, { bonds: [3, 1, 1, 1, 1, 1] });
    expect([nameOf(ethyne).en, molecularFormula(ethyne)]).toEqual(["ethyne", "C2H2"]);
    expect(molecularFormula(straight(3, { bonds: [2, 1, 1, 1, 1, 1] }))).toBe("C3H6");
    expect(molecularFormula(straight(4, { bonds: [3, 1, 1, 1, 1, 1] }))).toBe("C4H6");
  });
  it("butane has two isomers and pentane three, all with the same formula", () => {
    const butanes = [straight(4), straight(4, { shape: Shape.Branched })];
    expect(butanes.map(molecularFormula)).toEqual(["C4H10", "C4H10"]);
    expect(new Set(butanes.map((c) => nameOf(c).en)).size).toBe(2);
    const pentanes = [
      straight(5),
      straight(5, { shape: Shape.Branched }),
      straight(5, { shape: Shape.DoublyBranched }),
    ];
    expect(pentanes.map(molecularFormula)).toEqual(["C5H12", "C5H12", "C5H12"]);
    expect(new Set(pentanes.map((c) => nameOf(c).en)).size).toBe(3);
  });
  it("rings: cyclohexane C6H12, cyclopentane C5H10, benzene C6H6", () => {
    expect(molecularFormula(straight(6, { shape: Shape.Ring }))).toBe("C6H12");
    expect(molecularFormula(straight(5, { shape: Shape.Ring }))).toBe("C5H10");
    const benzene = straight(6, { shape: Shape.Ring, bonds: [2, 1, 2, 1, 2, 1] });
    expect([nameOf(benzene).en, molecularFormula(benzene)]).toEqual(["benzene", "C6H6"]);
  });
  it("functional groups follow Table 4.4", () => {
    const g = (n: number, group: Group) => straight(n, { group });
    expect([nameOf(g(2, Group.Alcohol)).en, bookFormula(g(2, Group.Alcohol))]).toEqual([
      "ethanol",
      "C2H5OH",
    ]);
    expect([nameOf(g(1, Group.Alcohol)).en, bookFormula(g(1, Group.Alcohol))]).toEqual([
      "methanol",
      "CH3OH",
    ]);
    expect([nameOf(g(1, Group.Aldehyde)).en, bookFormula(g(1, Group.Aldehyde))]).toEqual([
      "methanal",
      "HCHO",
    ]);
    expect([nameOf(g(3, Group.Ketone)).en, bookFormula(g(3, Group.Ketone))]).toEqual([
      "propanone",
      "CH3COCH3",
    ]);
    expect(nameOf(g(4, Group.Ketone)).en).toBe("butanone");
    expect([nameOf(g(2, Group.Acid)).en, bookFormula(g(2, Group.Acid))]).toEqual([
      "ethanoic acid",
      "CH3COOH",
    ]);
    expect([nameOf(g(5, Group.Bromo)).en, bookFormula(g(5, Group.Bromo))]).toEqual([
      "bromopentane",
      "C5H11Br",
    ]);
    expect(nameOf(g(6, Group.Aldehyde)).en).toBe("hexanal");
    expect(molecularFormula(g(2, Group.Acid))).toBe("C2H4O2");
  });
  it("molecular masses and bond counts", () => {
    expect(view(carbonChainDef, straight(1)).mass).toBe(16);
    expect(view(carbonChainDef, straight(2, { group: Group.Alcohol })).mass).toBe(46);
    expect(view(carbonChainDef, straight(2, { group: Group.Acid })).mass).toBe(60);
    expect(view(carbonChainDef, straight(2)).covalentBonds).toBe(7);
  });
  it("refuses what a carbon can't do, and says why", () => {
    expect(problemOf(straight(2, { group: Group.Ketone }))).toMatch(/ketone/);
    expect(problemOf(straight(3, { bonds: [2, 2, 1, 1, 1, 1] }))).toMatch(/only one/);
    expect(
      problemOf(straight(3, { bonds: [3, 1, 1, 1, 1, 1], group: Group.Alcohol })),
    ).toBeDefined();
    const run = runner(carbonChainDef);
    const s = { ...straight(2, { group: Group.Alcohol }), canSetBonds: true };
    const r = run(s, ChainAction.SetBond, { index: 0, order: 2 });
    expect(r.signals).toEqual([ChainSignal.NotPossible]);
    expect(r.state.bonds[0]).toBe(1);
  });
  it("building changes and announces the compound", () => {
    const run = runner(carbonChainDef);
    let s = { ...straight(2), canSetBonds: true, canSetGroup: true, canSetCarbons: true };
    let r = run(s, ChainAction.SetBond, { index: 0, order: 3 });
    expect(nameOf(r.state).en).toBe("ethyne");
    expect(r.signals).toEqual([ChainSignal.Built]);
    s = run(r.state, ChainAction.SetBond, { index: 0, order: 1 }).state;
    r = run(s, ChainAction.SetGroup, { group: Group.Acid });
    expect(nameOf(r.state).en).toBe("ethanoic acid");
    // fewer carbons than a ketone needs: the group is dropped rather than refused
    s = run(run(r.state, ChainAction.SetCarbons, { carbons: 3 }).state, ChainAction.SetGroup, {
      group: Group.Ketone,
    }).state;
    expect(nameOf(run(s, ChainAction.SetCarbons, { carbons: 2 }).state).en).toBe("ethane");
  });
  it("ring double bonds are benzene's alternating ones", () => {
    const run = runner(carbonChainDef);
    const s = run({ ...straight(6, { shape: Shape.Ring }) }, ChainAction.SetBond, {
      index: 2,
      order: 2,
    }).state;
    expect(nameOf(s).en).toBe("benzene");
  });
});

describe("homologous series", () => {
  it("each row is one CH2 (14 u) heavier, with rising boiling points", () => {
    for (const series of Object.values(Series)) {
      const rows = rowsOf(series, 6);
      for (let i = 1; i < rows.length; i++) {
        expect((rows[i]?.mass ?? 0) - (rows[i - 1]?.mass ?? 0)).toBe(14);
        expect(rows[i]?.boiling ?? 0).toBeGreaterThan(rows[i - 1]?.boiling ?? 0);
      }
    }
    expect(rowsOf(Series.Alkenes, 4).map((r) => r.formula)).toEqual(["C2H4", "C3H6", "C4H8"]);
    expect(rowsOf(Series.Alcohols, 4).map((r) => r.formula)).toEqual([
      "CH3OH",
      "C2H5OH",
      "C3H7OH",
      "C4H9OH",
    ]);
    expect(GENERAL.alkanes).toBe("CnH2n+2");
  });
  it("the general formulas fit every row", () => {
    for (const r of rowsOf(Series.Alkanes, 6))
      expect(r.formula).toBe(r.n === 1 ? "CH4" : `C${r.n}H${2 * r.n + 2}`);
    for (const r of rowsOf(Series.Alkynes, 6)) expect(r.formula).toBe(`C${r.n}H${2 * r.n - 2}`);
  });
  it("refuses a highlight with no row above", () => {
    const def = asAnyProp(homologousSeriesDef) as AnyPropDef;
    expect(applyPatch(def, { ...homologousSeriesDef.defaults }, { highlight: 1 }).isOk).toBe(false);
    expect(applyPatch(def, { ...homologousSeriesDef.defaults }, { highlight: 3 }).isOk).toBe(true);
  });
});

describe("allotropes", () => {
  it("C-60 has 60 carbons, 90 bonds, each carbon bonded to 3", () => {
    const atoms = fullereneAtoms();
    const bonds = fullereneBonds(atoms);
    expect(atoms.length).toBe(60);
    expect(bonds.length).toBe(90);
    const degree = atoms.map((_, i) => bonds.filter(([a, b]) => a === i || b === i).length);
    expect(new Set(degree)).toEqual(new Set([3]));
  });
  it("in the diamond block no carbon has more than 4 neighbours, and inner ones have exactly 4", () => {
    const { atoms, bonds } = diamondLattice();
    const degree = atoms.map((_, i) => bonds.filter(([a, b]) => a === i || b === i).length);
    expect(Math.max(...degree)).toBe(4);
    const inner = atoms.flatMap((p, i) => (p.every((v) => v >= 2 && v <= 4) ? [i] : []));
    expect(inner.length).toBeGreaterThan(0);
    for (const i of inner) expect(degree[i]).toBe(4);
  });
  it("bonds per carbon and conduction", () => {
    expect(view(allotropesDef, { ...allotropesDef.defaults }).bondsPerCarbon).toBe(4);
    const g = view(allotropesDef, { ...allotropesDef.defaults, kind: Allotrope.Graphite });
    expect([g.bondsPerCarbon, g.conducts]).toEqual([3, true]);
  });
});

describe("the lab bench", () => {
  const run = runner(carbonLabDef);
  it("alcohol burns clean; camphor and naphthalene sooty", () => {
    const s = labOf(LabKind.Spatula);
    expect(view(carbonLabDef, run(s, LabAction.SetFuel, { fuel: Fuel.Alcohol }).state).flame).toBe(
      Flame.Clean,
    );
    expect(
      view(carbonLabDef, run(s, LabAction.SetFuel, { fuel: Fuel.Naphthalene }).state).soot,
    ).toBe(true);
  });
  it("the burner's air hole decides the flame", () => {
    let s = run(labOf(LabKind.Burner), LabAction.Next).state;
    expect(view(carbonLabDef, s).flame).toBe(Flame.Clean);
    s = run(s, LabAction.SetAir, { isOpen: false }).state;
    expect(view(carbonLabDef, s).flame).toBe(Flame.Sooty);
  });
  it("permanganate loses its colour until the ethanol is used up", () => {
    let s = labOf(LabKind.Permanganate);
    const signals: string[][] = [];
    for (let i = 0; i < 4; i++) {
      const r = run(s, LabAction.AddDrop);
      s = r.state;
      signals.push(r.signals);
      expect(view(carbonLabDef, s).colourStays).toBe(i === 3);
    }
    expect(signals[3]).toContain("done");
  });
  it("chlorination happens only in sunlight", () => {
    let s = run(labOf(LabKind.Chlorination), LabAction.Next).state;
    expect(view(carbonLabDef, s).reacts).toBe(false);
    s = run(s, LabAction.SetSun, { isSunny: true }).state;
    expect(view(carbonLabDef, s).reacts).toBe(true);
  });
  it("refuses a step past the last", () => {
    const def = asAnyProp(carbonLabDef) as AnyPropDef;
    expect(applyPatch(def, labOf(LabKind.Spatula), { step: 2 }).isOk).toBe(false);
    expect(applyPatch(def, labOf(LabKind.Ester), { step: 3 }).isOk).toBe(true);
  });
});

describe("soap", () => {
  it("soap in hard water: little foam and scum; detergent foams anywhere", () => {
    expect(soapResultOf(Water.Hard, Cleaner.Soap)).toEqual({ foam: 1, scum: true });
    expect(soapResultOf(Water.Soft, Cleaner.Soap)).toEqual({ foam: 3, scum: false });
    expect(soapResultOf(Water.Hard, Cleaner.Detergent)).toEqual({ foam: 3, scum: false });
  });
  it("shaking reports the result; changing the water un-shakes", () => {
    const run = runner(soapActionDef);
    let s: SoapState = { ...soapActionDef.defaults, mode: SoapMode.HardWater, water: Water.Hard };
    const r = run(s, SoapAction.Shake);
    expect(r.signals).toEqual(["shaken"]);
    expect(view(soapActionDef, r.state).scum).toBe(true);
    s = run(r.state, SoapAction.SetCleaner, { cleaner: Cleaner.Detergent }).state;
    expect(s.isShaken).toBe(false);
  });
});

describe("the package", () => {
  it("defs.ts lists exactly the props index.ts registers", () => {
    expect(defs.map((d) => d.type).sort()).toEqual(carbonProps.map((m) => m.def.type).sort());
  });
  it("every view renders in both languages at phone widths, with no NaN or undefined", () => {
    const byType = new Map(carbonProps.map((m) => [m.def.type, m]));
    const cases: [string, Record<string, unknown>][] = [
      ...Object.values(Molecule).flatMap((molecule) =>
        [0, 1, 2].map((step): [string, Record<string, unknown>] => [
          "covalentBond",
          { ...covalentBondDef.defaults, molecule, step },
        ]),
      ),
      ...[1, 2, 3, 4, 5, 6].flatMap((carbons) =>
        Object.values(Group)
          .filter((group) => problemOf(chainOf({ carbons, group })) === undefined)
          .map((group): [string, Record<string, unknown>] => [
            "carbonChain",
            chainOf({
              carbons,
              group,
              canSetBonds: true,
              canSetGroup: true,
              canSetShape: true,
              canSetCarbons: true,
            }),
          ]),
      ),
      ["carbonChain", chainOf({ carbons: 6, shape: Shape.Ring, bonds: [2, 1, 2, 1, 2, 1] })],
      ["carbonChain", chainOf({ carbons: 5, shape: Shape.DoublyBranched })],
      ["carbonChain", chainOf({ carbons: 3, bonds: [3, 1, 1, 1, 1, 1], showH: false })],
      ...Object.values(Series).map((series): [string, Record<string, unknown>] => [
        "homologousSeries",
        { ...homologousSeriesDef.defaults, series, showBoiling: true, showGeneral: true },
      ]),
      ...Object.values(Allotrope).map((kind): [string, Record<string, unknown>] => [
        "allotropes",
        { ...allotropesDef.defaults, kind },
      ]),
      ...Object.values(LabKind).flatMap((kind) =>
        [0, 1, 2, 3]
          .filter((step) => problemOfLab(kind, step))
          .map((step): [string, Record<string, unknown>] => [
            "carbonLab",
            labOf(kind, { step, showEquation: true, drops: step }),
          ]),
      ),
      ...Object.values(SoapMode).flatMap((mode) =>
        [0, 1, 2, 3].map((step): [string, Record<string, unknown>] => [
          "soapAction",
          {
            ...soapActionDef.defaults,
            mode,
            step,
            isShaken: step > 1,
            water: step % 2 ? Water.Hard : Water.Soft,
          },
        ]),
      ),
      ...Object.values(CarbonScene).map((scene): [string, Record<string, unknown>] => [
        "carbonScene",
        { scene },
      ]),
    ];
    for (const [type, s] of cases)
      for (const locale of ["en", "hi"] as const)
        for (const width of [300, 340, 420]) {
          const m = byType.get(type);
          if (!m) throw new Error(type);
          const def = m.def;
          const patched = applyPatch(def, { ...def.defaults }, s);
          expect(patched.isOk, `${type} ${JSON.stringify(s)}`).toBe(true);
          if (!patched.isOk) continue;
          const html = renderToString(
            <m.View
              view={viewOf(def, patched.state)}
              locale={locale}
              width={width}
              call={() => undefined}
              signal={() => undefined}
            />,
          );
          expect(html, `${type} ${locale}`).not.toMatch(/NaN|undefined/);
        }
  });
  it("its styles draw only with the look's tokens", () => {
    const css = ["draw.css", "carbon.css"]
      .map((f) => readFileSync(new URL(f, import.meta.url), "utf8"))
      .join("\n");
    expect(
      css.split("\n").filter((l) => /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/.test(l)),
    ).toEqual([]);
  });
});

/** Whether a lab step exists for this demonstration. */
function problemOfLab(kind: LabKind, step: number): boolean {
  return (
    step <
    (
      {
        spatula: 2,
        burner: 2,
        permanganate: 2,
        hydrogenation: 3,
        chlorination: 2,
        sodium: 3,
        dehydration: 2,
        ester: 4,
        acidStrength: 3,
        carbonate: 3,
      } as const
    )[kind]
  );
}

void carbonSceneDef;
