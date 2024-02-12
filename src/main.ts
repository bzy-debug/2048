import {
  renderState,
  initState,
  Action,
  handleAction,
  generateNew,
  stateIsEqual,
  getLine,
  lineKind,
  lineAnimateInstructions,
  isReverse,
} from "./lib";

type AnimationInstruction = {
  action: Action;
  lineInstructions: number[][];
};

let isInAnimation = false;

let currentState = initState();

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = renderState(currentState);

function animate(instructions: AnimationInstruction): void {
  isInAnimation = true;
  const { action, lineInstructions } = instructions;
  const grid = [...app.querySelectorAll<HTMLDivElement>(".game-row")].map(
    (row) => [...row.querySelectorAll<HTMLDivElement>(".game-cell")]
  );
  const kind = lineKind(action);
  const isReverse = action === Action.Down || action === Action.Right;
  const axis = action === Action.Left || action === Action.Right ? "X" : "Y";

  for (let i = 0; i < 4; i++) {
    const cubes = getLine(grid, kind, i);
    const lineInstruction = lineInstructions[i];
    if (isReverse) lineInstruction.reverse();
    for (let j = 0; j < 4; j++) {
      if (lineInstruction[j] === 0) continue;
      const distance = lineInstruction[j] * (4 + 1);
      cubes[j].style.transform = `translate${axis}(${
        isReverse ? "" : "-"
      }${distance}rem)`;
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
  const afterAction = handleAction(currentState, action);
  const kind = lineKind(action);
  const reverse = isReverse(action);
  const lineInstructions = [];
  for (let i = 0; i < 4; i++) {
    const before = getLine(currentState, kind, i);
    const after = getLine(afterAction, kind, i);
    if (reverse) {
      before.reverse(), after.reverse();
    }
    lineInstructions.push(lineAnimateInstructions(before, after));
  }
  animate({ action, lineInstructions });
  if (!stateIsEqual(currentState, afterAction)) {
    const afterGenerate = generateNew(afterAction);
    currentState = afterGenerate;
  } else {
    isInAnimation = false;
  }
  app.addEventListener("transitionend", () => {
    isInAnimation = false;
    app.innerHTML = renderState(currentState);
  });
});
