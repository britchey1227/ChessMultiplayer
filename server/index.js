// TODO: user emit instead of sending to each connection (might need socket.io)
import { WebSocketServer } from 'ws';

let startingBoard = [
    ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR',],
    ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP',],
    ['', '', '', '', '', '', '', '',],
    ['', '', '', '', '', '', '', '',],
    ['', '', '', '', '', '', '', '',],
    ['', '', '', '', '', '', '', '',],
    ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP',],
    ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR',],
]

const game = {
    board: null,
    p1: null,
    p2: null,
    spec: [],
    turn: 'w'
}

function getFileRank(mv) {
    return [mv[0], parseInt(mv[1])]
}

function getIndexesGivenFileRank({ file, rank }) {
    const col = file.charCodeAt(0) - 'a'.charCodeAt(0)
    const row = 8 - rank
    return [row, col]
}

function reverseBoard(board){
    let result = board.toReversed()
    for(let i = 0; i < board.length; i++){
        result[i] = result[i].toReversed();
    }
    return result;
}

function makeMove({ to, from }) {
    console.log(`Making move from ${from} to ${to}...`)
    const [fromFile, fromRank] = [from[0], parseInt(from[1])]
    const [toFile, toRank] = [to[0], parseInt(to[1])]

    const [fromRow, fromCol] = getIndexesGivenFileRank({ file: fromFile, rank: fromRank })
    console.log('fromRow', fromRow, 'fromCol', fromCol)
    const [toRow, toCol] = getIndexesGivenFileRank({ file: toFile, rank: toRank })
    console.log('toRow', toRow, 'toCol', toCol)

    game.board[toRow][toCol] = game.board[fromRow][fromCol]
    game.board[fromRow][fromCol] = ''
}

function toggleTurn() {
    game.turn = game.turn === 'w' ? 'b' : 'w'
}

function isTurn(ws) {
    if (game.turn === 'w') return ws === game.p1
    return ws === game.p2
}

function isValidMove({ to, from }) {
    console.log(`Checking if valid from ${from} to ${to}...`)
    const [fromFile, fromRank] = [from[0], parseInt(from[1])]
    const [toFile, toRank] = [to[0], parseInt(to[1])]

    const [fromRow, fromCol] = getIndexesGivenFileRank({ file: fromFile, rank: fromRank })
    const [toRow, toCol] = getIndexesGivenFileRank({ file: toFile, rank: toRank })

    // check rows
    if (fromRow < 0 || toRow < 0 || fromRow >= 8 || toRow >= 8) return false

    // check cols
    if (fromCol < 0 || toCol < 0 || fromCol >= 8 || toCol >= 8) return false

    // CHECK IF FROM IS EMPTY

    // More chess logic...

    return true
}


function handleMessage(ws, payload) {
    console.log(`Recieved: ${payload}`);
    const { type, data } = JSON.parse(payload)

    switch (type) {
        case 'init-game':
            game.board = structuredClone(startingBoard)
            if (ws === game.p2) {
                // TODO: Reverse the board before sending
                ws.send(format({ type: 'init-game', data: structuredClone(reverseBoard(game.board)) }));
            } else {
                ws.send(format({ type: 'init-game', data: structuredClone(game.board) }));
            }
            return
        case 'make-move':
            if (!isTurn(ws)) {
                ws.send(format({
                    type: 'invalid-move', data: {
                        message: "Not your move bruv"
                    }
                }));
                return
            }
            if (!isValidMove(data)) {
                ws.send(format({
                    type: 'invalid-move', data: {
                        message: `Move from ${data.from} to ${data.to} is not valid`
                    }
                }));
                return
            }

            makeMove(data)
            toggleTurn(game)
            if (game.p1) {
                game.p1.send(format({ type: 'move-made', data: { board: game.board } }));   //send to white
            }
            if (game.p2) {
                // TODO: Reverse board later
                game.p2.send(format({ type: 'move-made', data: { board: reverseBoard(game.board) } }));   //send reversed board to black
            }

            for (let client of game.spec) {
                client.send(format({ type: 'move-made', data: { board: game.board } }));    //send to each spec
            }
            return
        case 'reset-game':
            game.board = structuredClone(startingBoard)
            if (game.p1) {
                game.p1.send(format({ type: 'game-reset', data: { board: game.board } }));   //send to white
            }
            if (game.p2) {
                // TODO: Reverse board later
                game.p2.send(format({ type: 'game-reset', data: { board: reverseBoard(game.board) } }));   //send reversed board to black
            }

            for (let client of game.spec) {
                client.send(format({ type: 'game-reset', data: { board: game.board } }));    //send to each spec
            }
            return
        default:
            ws.send(format({ type: 'unkown-message', data: `Uknown message with type ${type} and data ${data}` }));
    }
}

function format(data) {
    return JSON.stringify(data)
}

function handleConnect(ws) {
    if (!game.p1) {
        //white
        game.p1 = ws
        const payload = format({ type: 'welcome', data: { player: 'p1' } })
        ws.send(payload);
    } else if (!game.p2) {
        //black
        game.p2 = ws
        const payload = format({ type: 'welcome', data: { player: 'p2' } })
        ws.send(payload);
    } else {
        //spectator
        game.spec.push(ws);
        const payload = format({ type: 'welcome', data: { player: 'spec' } })
        ws.send(payload);
    }


}

const wss = new WebSocketServer({ port: 8080 });
wss.on('connection', function connection(ws) {
    handleConnect(ws)
    ws.on('message', function message(data) {
        handleMessage(ws, data)
    });

});
console.log('listening')