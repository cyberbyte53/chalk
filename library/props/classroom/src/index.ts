import { type PropModule, propModule } from "@chalk/player";
import { classroom } from "./classroom";
import { ClassroomView } from "./classroom-view";
import { sounds } from "./defs";

export { Attention, StandingKind, childrenNow, countsOf } from "./classroom";
export { classroom };

export const classroomProp = propModule(classroom, ClassroomView, sounds[classroom.type]);

/** Every prop in this package, for the library. */
export const classroomProps: readonly PropModule[] = [classroomProp];
