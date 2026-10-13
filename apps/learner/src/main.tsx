import "@chalk/player/styles.css";
import "./app.css";
import { render } from "preact";
import { App } from "./App";

const root = document.getElementById("app");
if (root === null) throw new Error("#app is missing from index.html");
render(<App />, root);
