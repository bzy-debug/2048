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
  let buf = `<div class='line'>`;
  for (const i of line) {
    buf += `<div class='cube'>${i === 0 ? "" : i}</div>`;
  }
  buf += `</div>`;
  return buf;
}

function renderState(state: State): string {
  return `<div class='game'>
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

function getLine(state: State, kind: "row" | "col", index: number): Line {
  const line = emptyLine();
  switch (kind) {
    case "col": {
      for (let i = 0; i < 4; i++) line[i] = state[i][index];
      break;
    }
    case "row": {
      for (let i = 0; i < 4; i++) line[i] = state[index][i];
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

function handleAction(state: State, action: Action): State {
  let newState = structuredClone(state);
  const kind =
    action === Action.Left || action === Action.Right ? "row" : "col";
  const isReverse = action === Action.Down || action === Action.Right;
  for (let i = 0; i < 4; i++) {
    const line = getLine(newState, kind, i);
    if (isReverse) line.reverse();
    const newLine = handleLine(line);
    if (isReverse) newLine.reverse();
    newState = replaceLine(newState, newLine, kind, i);
  }
  return newState;
}

function nextState(state: State, action: Action): State {
  const afterMove = handleAction(state, action);
  return stateIsEqual(state, afterMove) ? afterMove : generateNew(afterMove);
}

function initState(): State {
  return generateNew(generateNew(emptyState));
}

export { initState, nextState, renderState, Action };

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it("handleLine test", () => {
    expect(renderLine(handleLine([2, 2, 2, 2]))).toMatchInlineSnapshot(
      `"<div class='line'><div class='cube'>4</div><div class='cube'>4</div><div class='cube'></div><div class='cube'></div></div>"`
    );
    expect(renderLine(handleLine([2, 0, 0, 2]))).toMatchInlineSnapshot(
      `"<div class='line'><div class='cube'>4</div><div class='cube'></div><div class='cube'></div><div class='cube'></div></div>"`
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
      "<div class='game'>
      <div class='line'><div class='cube'>4</div><div class='cube'>4</div><div class='cube'>2</div><div class='cube'>2</div></div>
      <div class='line'><div class='cube'>8</div><div class='cube'></div><div class='cube'></div><div class='cube'>8</div></div>
      <div class='line'><div class='cube'></div><div class='cube'></div><div class='cube'></div><div class='cube'></div></div>
      <div class='line'><div class='cube'></div><div class='cube'></div><div class='cube'></div><div class='cube'></div></div>
      </div>"
    `);
    expect(renderState(handleAction(state, Action.Down)))
      .toMatchInlineSnapshot(`
        "<div class='game'>
        <div class='line'><div class='cube'></div><div class='cube'></div><div class='cube'></div><div class='cube'></div></div>
        <div class='line'><div class='cube'></div><div class='cube'></div><div class='cube'></div><div class='cube'></div></div>
        <div class='line'><div class='cube'>4</div><div class='cube'></div><div class='cube'></div><div class='cube'>2</div></div>
        <div class='line'><div class='cube'>8</div><div class='cube'>4</div><div class='cube'>2</div><div class='cube'>8</div></div>
        </div>"
      `);
    expect(renderState(handleAction(state, Action.Left)))
      .toMatchInlineSnapshot(`
        "<div class='game'>
        <div class='line'><div class='cube'>4</div><div class='cube'>2</div><div class='cube'></div><div class='cube'></div></div>
        <div class='line'><div class='cube'>4</div><div class='cube'></div><div class='cube'></div><div class='cube'></div></div>
        <div class='line'><div class='cube'>8</div><div class='cube'></div><div class='cube'></div><div class='cube'></div></div>
        <div class='line'><div class='cube'>4</div><div class='cube'>2</div><div class='cube'>4</div><div class='cube'></div></div>
        </div>"
      `);
    expect(renderState(handleAction(state, Action.Right)))
      .toMatchInlineSnapshot(`
        "<div class='game'>
        <div class='line'><div class='cube'></div><div class='cube'></div><div class='cube'>2</div><div class='cube'>4</div></div>
        <div class='line'><div class='cube'></div><div class='cube'></div><div class='cube'></div><div class='cube'>4</div></div>
        <div class='line'><div class='cube'></div><div class='cube'></div><div class='cube'></div><div class='cube'>8</div></div>
        <div class='line'><div class='cube'></div><div class='cube'>4</div><div class='cube'>2</div><div class='cube'>4</div></div>
        </div>"
      `);
  });
}
