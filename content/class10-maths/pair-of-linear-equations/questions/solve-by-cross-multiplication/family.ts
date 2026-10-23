import { column, family, space } from "@chalk/author";
import { Level } from "@chalk/content";
import { Method } from "@chalk/prop-linear-equations";
import { Concept } from "../../concepts.gen";
import { pairParams, solveQuestion } from "../../kit";

/** Solve a pair with exactly one solution by cross-multiplication (NCERT 3.4.3, Exercise 3.5). */
export const solveByCrossMultiplication = family({
  level: Level.Medium,
  tests: [Concept.CrossMultiplication],
  params: pairParams,
  build: (p, bk) => column([solveQuestion(bk, p, Method.CrossMultiplication), space()]),
});
