---
id: cmvf4x1m2vvx
status: proposed
on: class10-science/light/reflection-and-images/overview/names
piece: room
source: content/class10-science/light/reflection-and-images/overview.ts:319
lessonTitle: Reflection and images
board: names
createdAt: 2026-10-19T10:51:55.370Z
lessonId: concept/3027536a100838c2
boardIndex: 6
snapshot: "planeMirror: a torch shining down on a flat mirror with a ruler along it; tapping next
  labels, one by one, the incident ray, the point of incidence, the normal, the reflected ray, i and
  r"
locale: en
thread:
  - by: claude
    at: 2026-10-24T06:07:26Z
    text: "Proposal below: i and r get their own colours (arc and label), and each ray takes its angle's
      colour, so you can see which angle belongs to which ray. Same change in rayAngle, the figure
      used on the examples and your-turn pages. I'd also add it to principles.md as a rule: two
      quantities that are compared get different colours."
proposal:
  summary: "Colour i and r differently in planeMirror and rayAngle: incident ray + i in
    --color-category-1, reflected ray + r in --color-category-2 (arcs and labels). The normal stays
    grey and dashed. Text unchanged."
  changes:
    - before: "planeMirror (plane-mirror-view.tsx, styles.css): both arcs and both labels use .pm-angles /
        .pm-angle-label in --color-secondary; both rays use .pm-ray in --color-primary"
      after: the arc and label for i, and the incident ray, in --color-category-1; the arc and label for
        r, and the reflected ray, in --color-category-2 (new classes .pm-angle-i / .pm-angle-r,
        .pm-ray-in / .pm-ray-out); the label step that names i and r lights each in its own colour
    - before: "rayAngle (ray-angle-view.tsx, ray-angle.css): every .ra-arc and .ra-label in
        --color-secondary"
      after: the angle to the normal (i) in --color-category-1, the reflected angle (r) in
        --color-category-2; the angle to the surface and the angle between the rays stay
        --color-secondary
---
can we differnetiat angle of incidednce and refelction they are colored the same
