// TODO: user emit instead of sending to each connection (might need socket.io)
import { WebSocketServer } from "ws";

let startingBoard = [
  ["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"],
  ["bP", "bP", "bP", "bP", "bP", "bP", "bP", "bP"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["wP", "wP", "wP", "wP", "wP", "wP", "wP", "wP"],
  ["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"],
];

const game = {
  board: null,
  p1: null,
  p2: null,
  spec: [],
  turn: "w",
};

function getFileRank(mv) {
  return [mv[0], parseInt(mv[1])];
}

function getIndexesGivenFileRank({ file, rank }) {
  const col = file.charCodeAt(0) - "a".charCodeAt(0);
  const row = 8 - rank;
  return [row, col];
}

function reverseBoard(board) {
  let result = board.toReversed();
  for (let i = 0; i < board.length; i++) {
    result[i] = result[i].toReversed();
  }
  return result;
}

function makeMove({ to, from }) {
  console.log(`Making move from ${from} to ${to}...`);
  const [fromFile, fromRank] = [from[0], parseInt(from[1])];
  const [toFile, toRank] = [to[0], parseInt(to[1])];

  const [fromRow, fromCol] = getIndexesGivenFileRank({
    file: fromFile,
    rank: fromRank,
  });
  console.log("fromRow", fromRow, "fromCol", fromCol);
  const [toRow, toCol] = getIndexesGivenFileRank({
    file: toFile,
    rank: toRank,
  });
  console.log("toRow", toRow, "toCol", toCol);

  game.board[toRow][toCol] = game.board[fromRow][fromCol];
  game.board[fromRow][fromCol] = "";
}

function toggleTurn() {
  game.turn = game.turn === "w" ? "b" : "w";
}

function isTurn(ws) {
  if (game.turn === "w") return ws === game.p1;
  return ws === game.p2;
}

function isValidMove({ to, from }) {
  console.log(`Checking if valid from ${from} to ${to}...`);
  const [fromFile, fromRank] = [from[0], parseInt(from[1])];
  const [toFile, toRank] = [to[0], parseInt(to[1])];

  const [fromRow, fromCol] = getIndexesGivenFileRank({
    file: fromFile,
    rank: fromRank,
  });
  const [toRow, toCol] = getIndexesGivenFileRank({
    file: toFile,
    rank: toRank,
  });

  // check rows
  if (fromRow < 0 || toRow < 0 || fromRow >= 8 || toRow >= 8) return false;

  // check cols
  if (fromCol < 0 || toCol < 0 || fromCol >= 8 || toCol >= 8) return false;

  // More chess logic...

  // brainstorming: if we want to display valid moves to user before they do a move
  // once clicked on a from piece, ask to view valid moves
  // valid moves would send back an empty board with only valid moves (x = valid, '' = invalid)
  // front end colors only x's to display valid (maybe add class valid to tile)
  // check if to is valid, if yes send move
  // simple front end, simpler back end than having to send valid moves to display on front end then determine if the move is valid

  // TODO:
  // each piece logic will be updated to a function inside each object
  // still need collision check
  // optimize the hard code
  // check logic & checkmate logic
  // en pessent in pawn moves
  // castling in king moves

  // bishop
  if (game.board[fromRow][fromCol][1] === "B") {
    // check if to falls into the diagonals
    for (let i = fromRow, j = fromCol; i < 8 && j < 8; i++, j++) {
      if (i === toRow && j == toCol) return true;
    }
    for (let i = fromRow, j = fromCol; i < 8 && j >= 0; i++, j--) {
      if (i === toRow && j == toCol) return true;
    }
    for (let i = fromRow, j = fromCol; i >= 0 && j < 8; i--, j++) {
      if (i === toRow && j == toCol) return true;
    }
    for (let i = fromRow, j = fromCol; i >= 0 && j >= 0; i--, j--) {
      if (i === toRow && j == toCol) return true;
    }
    return false;
  }

  // rook
  if (game.board[fromRow][fromCol][1] === "R") {
    if (fromCol === toCol || fromRow === toRow) return true;
    return false;
  }

  // queen
  if (game.board[fromRow][fromCol][1] === "Q") {
    // check if to falls into the diagonals
    for (let i = fromRow, j = fromCol; i < 8 && j < 8; i++, j++) {
      if (i === toRow && j == toCol) return true;
    }
    for (let i = fromRow, j = fromCol; i < 8 && j >= 0; i++, j--) {
      if (i === toRow && j == toCol) return true;
    }
    for (let i = fromRow, j = fromCol; i >= 0 && j < 8; i--, j++) {
      if (i === toRow && j == toCol) return true;
    }
    for (let i = fromRow, j = fromCol; i >= 0 && j >= 0; i--, j--) {
      if (i === toRow && j == toCol) return true;
    }
    if (fromCol === toCol || fromRow === toRow) return true;
    return false;
  }

  //knight
  if (game.board[fromRow][fromCol][1] === "N") {
    if (fromRow + 1 === toRow && fromCol + 2 == toCol) return true;
    if (fromRow + 1 === toRow && fromCol - 2 == toCol) return true;
    if (fromRow + 2 === toRow && fromCol + 1 == toCol) return true;
    if (fromRow + 2 === toRow && fromCol - 1 == toCol) return true;
    if (fromRow - 1 === toRow && fromCol + 2 == toCol) return true;
    if (fromRow - 1 === toRow && fromCol - 2 == toCol) return true;
    if (fromRow - 2 === toRow && fromCol + 1 == toCol) return true;
    if (fromRow - 2 === toRow && fromCol - 1 == toCol) return true;
    return false;
  }

  //pawn
  if (game.board[fromRow][fromCol][1] === "P") {
    //TODO: Add en pessent
    //black
    if (game.board[fromRow][fromCol][0] === "b") {
      if (fromRow === 1) {
        //if pawn hasnt moved
        if (fromRow + 1 === toRow) {
          if (game.board[toRow][toCol] === "") return true;
          return false;
        } else if (fromRow + 2 === toRow) {
          if (
            game.board[fromRow + 1][toCol] === "" &&
            game.board[fromRow + 2][toCol] === ""
          )
            return true;
          return false;
        }
      } else if (fromRow + 1 === toRow) {
        if (fromCol === toCol && game.board[toRow][toCol] === "") return true;
        if (fromCol + 1 === toCol && game.board[toRow][toCol][0] === "w")
          return true;
        if (fromCol - 1 === toCol && game.board[toRow][toCol][0] === "w")
          return true;
      }
    }
    //white
    if (game.board[fromRow][fromCol][0] === "w") {
      if (fromRow === 6) {
        //if pawn hasnt moved
        if (fromRow - 1 === toRow) {
          if (game.board[toRow][toCol] === "") return true;
          return false;
        } else if (fromRow - 2 === toRow) {
          if (
            game.board[fromRow - 1][toCol] === "" &&
            game.board[fromRow - 2][toCol] === ""
          )
            return true;
          return false;
        }
      } else if (fromRow - 1 === toRow) {
        if (fromCol === toCol && game.board[toRow][toCol] === "") return true;
        if (fromCol + 1 === toCol && game.board[toRow][toCol][0] === "b")
          return true;
        if (fromCol - 1 === toCol && game.board[toRow][toCol][0] === "b")
          return true;
      }
    }
    return false;
  }

  // king
  if (game.board[fromRow][fromCol][1] === "K") {
    // TODO: add castling
    if (fromRow + 1 === toRow) {
      if (fromCol === toCol || fromCol - 1 === toCol || fromCol + 1 === toCol)
        return true;
    } else if (fromRow - 1 === toRow) {
      if (fromCol === toCol || fromCol - 1 === toCol || fromCol + 1 === toCol)
        return true;
    } else if (fromRow === toRow) {
      if (fromCol - 1 === toCol || fromCol + 1 === toCol) return true;
    }
    return false;
  }

  return true;
}

function handleMessage(ws, payload) {
  console.log(`Recieved: ${payload}`);
  const { type, data } = JSON.parse(payload);

  switch (type) {
    case "init-game":
      // BUG: everytime a new user connects it resets the board, so game can be halfway done and spec joins and resets the board
      // SOLUTION: send current board rather than making it startingBoard, only reset on initial connect for white and on reset button
      game.board = structuredClone(startingBoard);
      if (ws === game.p2) {
        ws.send(
          format({
            type: "init-game",
            data: structuredClone(reverseBoard(game.board)),
          })
        );
      } else {
        ws.send(
          format({ type: "init-game", data: structuredClone(game.board) })
        );
      }
      return;
    case "make-move":
      if (!isTurn(ws)) {
        ws.send(
          format({
            type: "invalid-move",
            data: {
              message: "Not your move bruv",
            },
          })
        );
        return;
      }
      if (!isValidMove(data)) {
        // TODO: add move to a move list in the game
        ws.send(
          format({
            type: "invalid-move",
            data: {
              message: `Move from ${data.from} to ${data.to} is not valid`,
            },
          })
        );
        return;
      }

      makeMove(data);
      toggleTurn(game);
      if (game.p1) {
        game.p1.send(
          format({ type: "move-made", data: { board: game.board } })
        ); //send to white
      }
      if (game.p2) {
        game.p2.send(
          format({
            type: "move-made",
            data: { board: reverseBoard(game.board) },
          })
        ); //send reversed board to black
      }

      for (let client of game.spec) {
        client.send(format({ type: "move-made", data: { board: game.board } })); //send to each spec
      }
      return;
    case "reset-game":
      game.board = structuredClone(startingBoard);
      game.turn = "w";
      if (game.p1) {
        game.p1.send(
          format({ type: "game-reset", data: { board: game.board } })
        ); //send to white
      }
      if (game.p2) {
        game.p2.send(
          format({
            type: "game-reset",
            data: { board: reverseBoard(game.board) },
          })
        ); //send reversed board to black
      }

      for (let client of game.spec) {
        client.send(
          format({ type: "game-reset", data: { board: game.board } })
        ); //send to each spec
      }
      return;
    default:
      ws.send(
        format({
          type: "unkown-message",
          data: `Uknown message with type ${type} and data ${data}`,
        })
      );
  }
}

function format(data) {
  return JSON.stringify(data);
}

function handleConnect(ws) {
  if (!game.p1) {
    //white
    game.p1 = ws;
    const payload = format({ type: "welcome", data: { player: "p1" } });
    ws.send(payload);
  } else if (!game.p2) {
    //black
    game.p2 = ws;
    const payload = format({ type: "welcome", data: { player: "p2" } });
    ws.send(payload);
  } else {
    //spectator
    game.spec.push(ws);
    const payload = format({ type: "welcome", data: { player: "spec" } });
    ws.send(payload);
  }
}

const wss = new WebSocketServer({ port: 3000 });
wss.on("connection", function connection(ws) {
  handleConnect(ws);
  ws.on("message", function message(data) {
    handleMessage(ws, data);
  });
});
console.log("listening");
