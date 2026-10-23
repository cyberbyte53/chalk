import { column, family, space } from "@chalk/author";
import { Level } from "@chalk/content";
import { Method } from "@chalk/prop-linear-equations";
import { Concept } from "../../concepts.gen";
import { pairParams, solveQuestion } from "../../kit";

/** Solve a pair with exactly one solution by substitution (NCERT 3.4.1, Exercise 3.3). */
export const solveBySubstitution = family({
  level: Level.Medium,
  tests: [Concept.SubstitutionMethod],
  params: pairParams,
  build: (p, bk) => column([solveQuestion(bk, p, Method.Substitution), space()]),
});
