const EMPTY = 0;
const DARK = 1;
const LIGHT = 2;

const boardElement = document.getElementById("board");

/**
 * 盤面を表示する
 */
async function showBoard(turnCount) {
  const response = await fetch(`/api/games/latest/turns/${turnCount}`);
  const responseBody = await response.json();
  const board = responseBody.board;
  const nextDisc = responseBody.nextDisc;

  // 盤面を初期化
  while (boardElement.firstChild) {
    boardElement.removeChild(boardElement.firstChild);
  }

  board.forEach((line, y) => {
    line.forEach((square, x) => {
      const squareElement = document.createElement("div");
      squareElement.className = "square";

      if (square !== EMPTY) {
        const stoneElement = document.createElement("div");
        const color = square === DARK ? "dark" : "light";
        stoneElement.className = `stone ${color}`;
        squareElement.appendChild(stoneElement);
      } else {
        squareElement.addEventListener("click", async () => {
          const nextTurnCount = turnCount + 1;
          await registerTurn(nextTurnCount, nextDisc, x, y);
          await showBoard(nextTurnCount);
        });
      }

      boardElement.appendChild(squareElement);
    });
  });
}

/**
 * 対戦を開始する
 */
async function registerGame() {
  await fetch("/api/games", {
    method: "POST",
  });
}

/**
 * ターンを登録する
 * @param {*} turnCount
 * @param {*} disc
 * @param {*} x
 * @param {*} y
 */
async function registerTurn(turnCount, disc, x, y) {
  const requestBody = {
    turnCount,
    move: {
      disc,
      x,
      y,
    },
  };

  await fetch("/api/games/latest/turns", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });
}

async function main() {
  await registerGame();
  await showBoard(0);
}

main();
