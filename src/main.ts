import "./style.css";
import { Monitor } from "./observer";

const app = document.querySelector<HTMLInputElement>("#app")!;

const span = document.createElement("span");
span.textContent = "I'm span";
const btn = document.querySelector(".btn");

const replay = document.querySelector(".replay");

btn?.addEventListener("click", () => {
  app?.append(span);
});
replay?.addEventListener("click", () => {
  monitor.replay("#iframe");
});

const monitor = new Monitor("#iframe");
monitor.start(app);
