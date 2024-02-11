import {
  renderState,
  initState,
  Action,
  handleAction,
  generateNew,
  stateIsEqual,
  type AnimationInstruction,
} from "./lib";

let isInAnimation = false;

let currentState = initState();

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = renderState(currentState);

function animate(instructions: AnimationInstruction): void {
  isInAnimation = true;
  const { action, lineInstructions } = instructions;
  const grid = [...app.querySelectorAll<HTMLDivElement>(".line")].map(
    (line) => [...line.querySelectorAll<HTMLDivElement>(".cube")]
  );
  if (action === Action.Left) {
    for (let i = 0; i < 4; i++) {
      const lineInstruction = lineInstructions[i];
      const cubes = grid[i];
      for (let j = 0; j < 4; j++) {
        cubes[j].style.transform = `translateX(-${lineInstruction[j]}00%)`;
      }
    }
  } else if (action === Action.Up) {
    for (let i = 0; i < 4; i++) {
      const cubes: HTMLDivElement[] = [];
      for (let j = 0; j < 4; j++) {
        cubes.push(grid[j][i]);
      }
      const lineInstruction = lineInstructions[i];
      for (let j = 0; j < 4; j++) {
        cubes[j].style.transform = `translateY(-${lineInstruction[j]}00%)`;
      }
    }
  } else if (action === Action.Right) {
    for (let i = 0; i < 4; i++) {
      const lineInstruction = lineInstructions[i].reverse();
      const cubes = grid[i];
      for (let j = 0; j < 4; j++) {
        cubes[j].style.transform = `translateX(${lineInstruction[j]}00%)`;
      }
    }
  } else if (action === Action.Down) {
    for (let i = 0; i < 4; i++) {
      const cubes: HTMLDivElement[] = [];
      for (let j = 0; j < 4; j++) {
        cubes.push(grid[j][i]);
      }
      const lineInstruction = lineInstructions[i].reverse();
      for (let j = 0; j < 4; j++) {
        cubes[j].style.transform = `translateY(${lineInstruction[j]}00%)`;
      }
    }
  }
}

document.addEventListener("keydown", (e) => {
  if (isInAnimation) return;
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
  const [afterAction, animationInstructions] = handleAction(
    currentState,
    action
  );
  animate(animationInstructions);
  if (!stateIsEqual(currentState, afterAction)) {
    const afterGenerate = generateNew(afterAction);
    currentState = afterGenerate;
  }
  app.addEventListener("transitionend", () => {
    isInAnimation = false;
    app.innerHTML = renderState(currentState);
  });
});
