import { renderState, initState, Action, nextState } from "./lib";

let currentState = initState();

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = renderState(currentState);

document.addEventListener("keydown", (e) => {
  let action: Action | undefined;
  switch (e.code) {
    case "ArrowLeft":
      action = Action.Left;
      break;
    case "ArrowRight":
      action = Action.Right;
      break;
    case "ArrowUp":
      action = Action.Up;
      break;
    case "ArrowDown":
      action = Action.Down;
      break;
  }
  if (action === undefined) return;
  currentState = nextState(currentState, action);
  app.innerHTML = renderState(currentState);
});
