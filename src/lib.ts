type Line = [number, number, number, number];

type State = [Line, Line, Line, Line];

function stateIsEqual(s1: State, s2: State): boolean {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (s1[i][j] !== s2[i][j]) return false;
    }
  }
  return true;
}

function renderLine(line: Line): string {
  let buf = `<div class='game-row'>`;
  for (const i of line) {
    buf += `<div class='game-cell'>${i === 0 ? "" : i}</div>`;
  }
  buf += `</div>`;
  return buf;
}

function renderState(state: State): string {
  return `<div class='game-container'>
${state.map(renderLine).join("\n")}
</div>`;
}

const emptyState: State = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];
const emptyLine = (): Line => [0, 0, 0, 0];

function getLine<T>(grid: T[][], kind: "row" | "col", index: number): T[] {
  const line: T[] = [];
  switch (kind) {
    case "col": {
      for (let i = 0; i < 4; i++) line.push(grid[i][index]);
      break;
    }
    case "row": {
      for (let i = 0; i < 4; i++) line.push(grid[index][i]);
      break;
    }
  }
  return line;
}

function handleLine(line: Line): Line {
  let numLine = line.filter((n) => n !== 0);
  for (let i = 0; i + 1 < numLine.length; i++) {
    if (numLine[i] === numLine[i + 1]) {
      numLine[i] = numLine[i] + numLine[i + 1];
      numLine[i + 1] = 0;
      i++;
    }
  }
  numLine = numLine.filter((n) => n !== 0);
  const result = emptyLine();
  for (let i = 0; i < numLine.length; i++) {
    result[i] = numLine[i];
  }
  return result;
}

function replaceLine(
  state: State,
  line: Line,
  kind: "row" | "col",
  index: number
): State {
  const newState = structuredClone(state);
  switch (kind) {
    case "col": {
      for (let i = 0; i < 4; i++) newState[i][index] = line[i];
      break;
    }
    case "row": {
      for (let i = 0; i < 4; i++) newState[index][i] = line[i];
      break;
    }
  }
  return newState;
}

function random(n: number): number {
  return Math.floor(Math.random() * n);
}

function generateNew(state: State): State {
  const newState = structuredClone(state);
  const emptyCubes: [number, number][] = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (state[i][j] === 0) emptyCubes.push([i, j]);
    }
  }
  const [i, j] = emptyCubes[random(emptyCubes.length)];
  newState[i][j] = Math.random() < 0.9 ? 2 : 4;
  return newState;
}

enum Action {
  Up,
  Down,
  Left,
  Right,
}

function lineKind(action: Action): "row" | "col" {
  return action === Action.Left || action === Action.Right ? "row" : "col";
}

function isReverse(action: Action): boolean {
  return action === Action.Down || action === Action.Right;
}

function handleAction(state: State, action: Action): State {
  let newState = structuredClone(state);
  const kind = lineKind(action);
  const reverse = isReverse(action);
  for (let i = 0; i < 4; i++) {
    const line = getLine(newState, kind, i) as Line;
    if (reverse) line.reverse();
    const newLine = handleLine(line);
    if (reverse) newLine.reverse();
    newState = replaceLine(newState, newLine, kind, i);
  }
  return newState;
}

function initState(): State {
  return generateNew(generateNew(emptyState));
}

export {
  initState,
  renderState,
  handleAction,
  generateNew,
  stateIsEqual,
  getLine,
  lineKind,
  lineAnimateInstructions,
  isReverse,
  Action,
};

function lineAnimateInstructions(before: number[], after: number[]): number[] {
  let i = 0;
  let j = 0;
  const instructions = [0, 0, 0, 0];
  while (i < 4 && j < 4 && after[j] !== 0) {
    while (before[i] === 0) i++;
    if (after[j] === before[i]) {
      if (j !== i) instructions[i] = i - j;
      j++;
      i++;
    } else {
      let k = i + 1;
      while (k < 4 && before[k] === 0) k++;
      instructions[i] = i - j;
      instructions[k] = k - j;
      i = k + 1;
      j++;
    }
  }
  return instructions;
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it("handleLine test", () => {
    expect(renderLine(handleLine([2, 2, 2, 2]))).toMatchInlineSnapshot(
      `"<div class='game-row'><div class='game-cell'>4</div><div class='game-cell'>4</div><div class='game-cell'></div><div class='game-cell'></div></div>"`
    );
    expect(renderLine(handleLine([2, 0, 0, 2]))).toMatchInlineSnapshot(
      `"<div class='game-row'><div class='game-cell'>4</div><div class='game-cell'></div><div class='game-cell'></div><div class='game-cell'></div></div>"`
    );
  });
  it("action test", () => {
    const state: State = [
      [2, 2, 0, 2],
      [2, 0, 2, 0],
      [4, 0, 0, 4],
      [4, 2, 0, 4],
    ];
    expect(renderState(handleAction(state, Action.Up))).toMatchInlineSnapshot(`
      "<div class='game-container'>
      <div class='game-row'><div class='game-cell'>4</div><div class='game-cell'>4</div><div class='game-cell'>2</div><div class='game-cell'>2</div></div>
      <div class='game-row'><div class='game-cell'>8</div><div class='game-cell'></div><div class='game-cell'></div><div class='game-cell'>8</div></div>
      <div class='game-row'><div class='game-cell'></div><div class='game-cell'></div><div class='game-cell'></div><div class='game-cell'></div></div>
      <div class='game-row'><div class='game-cell'></div><div class='game-cell'></div><div class='game-cell'></div><div class='game-cell'></div></div>
      </div>"
    `);
    expect(renderState(handleAction(state, Action.Down)))
      .toMatchInlineSnapshot(`
        "<div class='game-container'>
        <div class='game-row'><div class='game-cell'></div><div class='game-cell'></div><div class='game-cell'></div><div class='game-cell'></div></div>
        <div class='game-row'><div class='game-cell'></div><div class='game-cell'></div><div class='game-cell'></div><div class='game-cell'></div></div>
        <div class='game-row'><div class='game-cell'>4</div><div class='game-cell'></div><div class='game-cell'></div><div class='game-cell'>2</div></div>
        <div class='game-row'><div class='game-cell'>8</div><div class='game-cell'>4</div><div class='game-cell'>2</div><div class='game-cell'>8</div></div>
        </div>"
      `);
    expect(renderState(handleAction(state, Action.Left)))
      .toMatchInlineSnapshot(`
        "<div class='game-container'>
        <div class='game-row'><div class='game-cell'>4</div><div class='game-cell'>2</div><div class='game-cell'></div><div class='game-cell'></div></div>
        <div class='game-row'><div class='game-cell'>4</div><div class='game-cell'></div><div class='game-cell'></div><div class='game-cell'></div></div>
        <div class='game-row'><div class='game-cell'>8</div><div class='game-cell'></div><div class='game-cell'></div><div class='game-cell'></div></div>
        <div class='game-row'><div class='game-cell'>4</div><div class='game-cell'>2</div><div class='game-cell'>4</div><div class='game-cell'></div></div>
        </div>"
      `);
    expect(renderState(handleAction(state, Action.Right)))
      .toMatchInlineSnapshot(`
        "<div class='game-container'>
        <div class='game-row'><div class='game-cell'></div><div class='game-cell'></div><div class='game-cell'>2</div><div class='game-cell'>4</div></div>
        <div class='game-row'><div class='game-cell'></div><div class='game-cell'></div><div class='game-cell'></div><div class='game-cell'>4</div></div>
        <div class='game-row'><div class='game-cell'></div><div class='game-cell'></div><div class='game-cell'></div><div class='game-cell'>8</div></div>
        <div class='game-row'><div class='game-cell'></div><div class='game-cell'>4</div><div class='game-cell'>2</div><div class='game-cell'>4</div></div>
        </div>"
      `);
  });
  it("animation test", () => {
    expect(
      lineAnimateInstructions([2, 2, 4, 4], [4, 8, 0, 0]).join(" ")
    ).toMatchInlineSnapshot(`"0 1 1 2"`);
    expect(
      lineAnimateInstructions([0, 0, 0, 2], [2, 0, 0, 0]).join(" ")
    ).toMatchInlineSnapshot(`"0 0 0 3"`);
    expect(
      lineAnimateInstructions([4, 0, 0, 2], [4, 2, 0, 0]).join(" ")
    ).toMatchInlineSnapshot(`"0 0 0 2"`);
    expect(
      lineAnimateInstructions([0, 0, 0, 0], [0, 0, 0, 0]).join(" ")
    ).toMatchInlineSnapshot(`"0 0 0 0"`);
  });
}
