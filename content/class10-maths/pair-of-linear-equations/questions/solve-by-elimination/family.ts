import { column, family, space } from "@chalk/author";
import { Level } from "@chalk/content";
import { Method } from "@chalk/prop-linear-equations";
import { Concept } from "../../concepts.gen";
import { pairParams, solveQuestion } from "../../kit";

/** Solve a pair with exactly one solution by elimination (NCERT 3.4.2, Exercise 3.4). */
export const solveByElimination = family({
  level: Level.Medium,
  tests: [Concept.EliminationMethod],
  params: pairParams,
  build: (p, bk) => column([solveQuestion(bk, p, Method.Elimination), space()]),
});
