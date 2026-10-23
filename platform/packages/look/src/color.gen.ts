// Generated from tokens.json by `pnpm --filter @chalk/look generate`. Do not edit.

/** A colour of the look, by its role. A colour field takes one of these or any `#rrggbb`. */
export const Color = {
  Surface: "surface",
  SurfaceContainer: "surface-container",
  SurfacePress: "surface-press",
  OnSurface: "on-surface",
  OnSurfaceVariant: "on-surface-variant",
  OutlineVariant: "outline-variant",
  InverseSurface: "inverse-surface",
  OnInverseSurface: "on-inverse-surface",
  Primary: "primary",
  OnPrimary: "on-primary",
  PrimaryContainer: "primary-container",
  PrimaryPress: "primary-press",
  Secondary: "secondary",
  SecondaryContainer: "secondary-container",
  OnSecondaryContainer: "on-secondary-container",
  Right: "right",
  RightContainer: "right-container",
  Wrong: "wrong",
  WrongContainer: "wrong-container",
  Category1: "category-1",
  Category2: "category-2",
  Category3: "category-3",
  Category4: "category-4",
} as const;
export type Color = (typeof Color)[keyof typeof Color];
