import type { ContentModules } from "@chalk/author";

/**
 * modules.gen.ts as the app, the server and the studio see its type: they load each module at run
 * time, so they don't type-check the whole content again (content/ is checked once, on its own).
 */
export declare const modules: ContentModules;
