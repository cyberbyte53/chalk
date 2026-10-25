// Fonts are bundled with the app (no font server): cached with it, so text renders offline. Each
// family's CSS splits it by script, so a phone downloads only the scripts a page uses.
import "@fontsource/baloo-2/500.css";
import "@fontsource/baloo-2/600.css";
import "@fontsource/baloo-2/700.css";
import "@fontsource/baloo-2/800.css";
import "@chalk/look/look.css";
import "@chalk/player/styles.css";
import "@chalk/player/rich-text.css";
import "@chalk/library/styles.css";
import "./app.css";
import { setStateChecks } from "@chalk/player";
import { render } from "preact";
import { App } from "./app";

// The shipped app checks each change lightly; development checks every change fully (bugs fail
// loudly where they happen). Saved state is always checked fully.
if (import.meta.env.PROD) setStateChecks("light");

const root = document.getElementById("app");
if (root === null) throw new Error("#app is missing from index.html");
render(<App />, root);
