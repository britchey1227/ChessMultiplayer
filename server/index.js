// TODO: user emit instead of sending to each connection (might need socket.io)

import { Server } from 'socket.io'
import { Bishop, Rook, Queen, Knight, Pawn, King } from './piece.js'

function startingBoard(){
    return [
        [
            new Rook('b'),
            new Knight('b'),
            new Bishop('b'),
            new Queen('b'),
            new King('b'),
            new Bishop('b'),
            new Knight('b'),
            new Rook('b'),
        ],
        [
            new Pawn('b'),
            new Pawn('b'),
            new Pawn('b'),
            new Pawn('b'),
            new Pawn('b'),
            new Pawn('b'),
            new Pawn('b'),
            new Pawn('b'),
        ],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [
            new Pawn('w'),
            new Pawn('w'),
            new Pawn('w'),
            new Pawn('w'),
            new Pawn('w'),
            new Pawn('w'),
            new Pawn('w'),
            new Pawn('w'),
        ],
        [
            new Rook('w'),
            new Knight('w'),
            new Bishop('w'),
            new Queen('w'),
            new King('w'),
            new Bishop('w'),
            new Knight('w'),
            new Rook('w'),
        ],
    ]
}

const game = {
    board: null,
    white: null,
    black: null,
    spectators: [],
    turn: 'w',
}

function getFileRank(mv) {
    return [mv[0], parseInt(mv[1])]
}

function getIndexesGivenFileRank({ file, rank }) {
    const col = file.charCodeAt(0) - 'a'.charCodeAt(0)
    const row = 8 - rank
    return [row, col]
}

function reverseBoard(board) {
    let result = board.toReversed()
    for (let i = 0; i < board.length; i++) {
        result[i] = result[i].toReversed()
    }
    return result
}

function stringifyBoard(board) {
    let result = [
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
    ]

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (board[i][j] === null) {
                result[i][j] = ''
            } else {
                result[i][j] = board[i][j].stringify()
            }
        }
    }
    return result
}

function makeMove({ to, from }) {
    console.log(`Making move from ${from} to ${to}...`)
    const [fromFile, fromRank] = [from[0], parseInt(from[1])]
    const [toFile, toRank] = [to[0], parseInt(to[1])]

    const [fromRow, fromCol] = getIndexesGivenFileRank({
        file: fromFile,
        rank: fromRank,
    })
    console.log('fromRow', fromRow, 'fromCol', fromCol)
    const [toRow, toCol] = getIndexesGivenFileRank({
        file: toFile,
        rank: toRank,
    })
    console.log('toRow', toRow, 'toCol', toCol)

    game.board[fromRow][fromCol].totalMoves++
    game.board[toRow][toCol] = game.board[fromRow][fromCol]
    game.board[fromRow][fromCol] = null
}

function toggleTurn() {
    game.turn = game.turn === 'w' ? 'b' : 'w'
}

function isTurn(socket) {
    if (game.turn === 'w') return socket.id === game.white
    return socket.id === game.black
}

function isValidMove({ to, from }) {
    console.log(`Checking if valid from ${from} to ${to}...`)
    const [fromFile, fromRank] = [from[0], parseInt(from[1])]
    const [toFile, toRank] = [to[0], parseInt(to[1])]

    const [fromRow, fromCol] = getIndexesGivenFileRank({
        file: fromFile,
        rank: fromRank,
    })
    const [toRow, toCol] = getIndexesGivenFileRank({
        file: toFile,
        rank: toRank,
    })

    // check rows
    if (fromRow < 0 || toRow < 0 || fromRow >= 8 || toRow >= 8) return false

    // check cols
    if (fromCol < 0 || toCol < 0 || fromCol >= 8 || toCol >= 8) return false

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

    return game.board[fromRow][fromCol].validMoves(
        fromRow,
        fromCol,
        toRow,
        toCol,
        game.board
    )
}

function format(data) {
    return JSON.stringify(data)
}

function handleConnect(io, socket) {
    console.log(`New connection ${socket.id}`)
    let data
    if (!game.white) {
        //white
        game.white = socket.id
        data = { playerType: 'white' }
    } else if (!game.black) {
        //black
        game.black = socket.id
        data = { playerType: 'black' }
    } else {
        //spectator
        game.spectators.push(socket.id)
        data = { playerType: 'spectator' }
    }

    io.in(socket.id).emit('welcome', data)
}

function handleMessages(io, socket) {
    socket.on('init-game', () => {
        debug('init-game')
        if (socket.id === game.white) {
            game.board = startingBoard()
        }

        if (socket.id === game.black) {
            io.in(socket.id).emit(
                'init-game',
                structuredClone(reverseBoard(stringifyBoard(game.board)))
            )
        } else {
            io.in(socket.id).emit(
                'init-game',
                structuredClone(stringifyBoard(game.board))
            )
        }
    })

    socket.on('make-move', (data) => {
        debug('make-move', data)

        if (!isTurn(socket)) {
            io.in(socket.id).emit('invalid-movde', {
                message: 'Not your move bruv',
            })
            return
        }
        if (!isValidMove(data)) {
            // TODO: add move to a move list in the game
            io.in(socket.id).emit('invalid-move', {
                message: `Move from ${data.from} to ${data.to} is not valid`,
            })

            return
        }

        makeMove(data)
        toggleTurn(game)

        // socket.emit('move-made',{ board: game.board })
        if (game.white) {
            io.in(game.white).emit('move-made', {
                board: stringifyBoard(game.board),
            })
        }
        if (game.black) {
            io.in(game.black).emit('move-made', {
                board: reverseBoard(stringifyBoard(game.board)),
            })
        }

        for (let clientId of game.spectators) {
            io.in(clientId).emit('move-made', {
                board: stringifyBoard(game.board),
            }) //send to each spectator
        }
    })

    socket.on('reset-game', () => {
        //  need to check if w or b resets so specs cant
        debug('reset-game')
        game.board = startingBoard()
        game.turn = 'w'
        socket.emit('game-reset', { board: stringifyBoard(game.board) })
        if (game.white) {
            io.in(game.white).emit('move-made', {
                board: stringifyBoard(game.board),
            })
        }
        if (game.black) {
            io.in(game.black).emit('move-made', {
                board: reverseBoard(stringifyBoard(game.board)),
            })
        }

        for (let clientId of game.spectators) {
            io.in(clientId).emit('move-made', {
                board: stringifyBoard(game.board),
            }) //send to each spectator
        }
    })
}

function debug(type, message = {}) {
    console.log(
        `Received event with type ${type} and data ${JSON.stringify(message)}`
    )
}

const io = new Server({
    cors: {
        origin: ['http://localhost:8080'],
    },
})
io.listen(3000)
io.on('connection', (socket) => {
    handleConnect(io, socket)
    handleMessages(io, socket)
})
