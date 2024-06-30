import { WebSocketServer } from 'ws';

// p = pawn
// b = bishop
// n = knight
// r = rook
// q = queen
// k = king

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
    console.log('fromRow', fromRow, 'fromCol', fromCol)
    const [toRow, toCol] = getIndexesGivenFileRank({ file: toFile, rank: toRank })
    console.log('toRow', toRow, 'toCol', toCol)

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
            game.board = startingBoard
            ws.send(format({ type: 'init-game', data: startingBoard }));
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
            ws.send(format({ type: 'move-made', data: { board: game.board } }));
            // Also, send this to othe player
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
        game.p1 = ws
        const payload = format({ type: 'welcome', data: { player: 'p1' } })
        ws.send(payload);
    } else if (!game.p2) {
        game.p2 = ws
        const payload = format({ type: 'welcome', data: { player: 'p2' } })
        ws.send(payload);
    } else {
        // CONSIDER MAKING THIS PERSON A SPECTATOR
        const payload = format({ type: 'welcome', data: 'Server full' })
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