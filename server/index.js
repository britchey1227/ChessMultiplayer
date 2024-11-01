// TODO: user emit instead of sending to each connection (might need socket.io)

import { Server } from 'socket.io'
import { Bishop, Rook, Queen, Knight, Pawn, King } from './pieces/index.js'

function startingBoard() {
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
    moves: [],
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

let check = false

function findKing(board, color) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            let piece = board[row][col]
            if (piece && piece.color === color && piece.type === 'King') {
                return { row, col }
            }
        }
    }
    return null
}

function isKingInCheck(board, color, lastMove) {
    let kingPos = findKing(board, color)
    if (!kingPos) return false

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            let piece = board[row][col]
            if (piece && piece.color !== color) {
                let moves = piece.getValidMoves(row, col, board, lastMove)
                for (let move of moves) {
                    if (move.row === kingPos.row && move.col === kingPos.col) {
                        return true
                    }
                }
            }
        }
    }
    return false
}

function generateAllMoves(board, color, lastMove) {
    let allMoves = []
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            let piece = board[row][col]
            if (piece && piece.color === color) {
                let moves = piece.getValidMoves(row, col, board, lastMove)
                for (let move of moves) {
                    allMoves.push({
                        fromRow: row,
                        fromCol: col,
                        toRow: move.row,
                        toCol: move.col,
                        piece: move.piece,
                    })
                }
            }
        }
    }
    return allMoves
}

function simulateMove(board, move) {
    const { fromRow, fromCol, toRow, toCol, piece } = move
    let newBoard = board.map((row) => row.slice())

    // if we simulate en pessent
    if (!newBoard[toRow][toCol] && piece.type === 'Pawn') {
        if (
            piece.color === 'w' &&
            newBoard[toRow + 1][toCol] &&
            newBoard[toRow + 1][toCol].color != piece.color &&
            newBoard[toRow + 1][toCol].type === 'Pawn'
        ) {
            newBoard[toRow + 1][toCol] = null
        } else if (
            piece.color === 'b' &&
            newBoard[toRow - 1][toCol] &&
            newBoard[toRow - 1][toCol].color != piece.color &&
            newBoard[toRow - 1][toCol].type === 'Pawn'
        ) {
            newBoard[toRow - 1][toCol] = null
        }
    }

    // if we simulate castle
    if (
        newBoard[fromRow][fromCol].type === 'King' &&
        !newBoard[fromRow][fromCol].check
    ) {
        // kingside
        if (fromCol - toCol === -2) {
            newBoard[fromRow][7].totalMoves++
            newBoard[fromRow][5] = newBoard[fromRow][7]
            newBoard[fromRow][7] = null
        }
        // queenside
        if (fromCol - toCol === 2) {
            newBoard[fromRow][0].totalMoves++
            newBoard[fromRow][3] = newBoard[fromRow][0]
            newBoard[fromRow][0] = null
        }
    }

    newBoard[fromRow][fromCol].totalMoves++
    newBoard[toRow][toCol] = newBoard[fromRow][fromCol]
    newBoard[fromRow][fromCol] = null

    return newBoard
}

function isCheckmate(board, color, lastMove) {
    if (!isKingInCheck(board, color, lastMove)) return false

    let allMoves = generateAllMoves(board, color, lastMove)
    for (let move of allMoves) {
        let newBoard = simulateMove(board, move)
        if (!isKingInCheck(newBoard, color, lastMove)) {
            // console.log(move)    shows what move stops checkmate
            return false
        }
    }
    return true
}

// decide where to put this (in game or leave here or somewhere else)
// https://www.chess.com/terms/chess-notation
let lastMove = ''

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

    let opponentColor = 'w'
    let pieceColor = 'b'
    if (game.board[fromRow][fromCol].color === 'w')
        (opponentColor = 'b'), (pieceColor = 'w')

    lastMove = ''
    // append the pice
    if (game.board[fromRow][fromCol].type != 'Pawn') {
        lastMove += game.board[fromRow][fromCol].stringify()[1]
    }

    // if we capture a piece, add the x notation
    if (game.board[toRow][toCol] != null) {
        // for pawn captures, we need to add the file
        if (game.board[fromRow][fromCol].type === 'Pawn') {
            lastMove += fromFile
        }
        lastMove += 'x'
    }

    // if en pessent, add notation and removed captured piece
    if (
        !game.board[toRow][toCol] &&
        game.board[fromRow][fromCol].type === 'Pawn'
    ) {
        if (
            pieceColor === 'w' &&
            game.board[toRow + 1][toCol] &&
            game.board[toRow + 1][toCol].color === opponentColor &&
            game.board[toRow + 1][toCol].type === 'Pawn'
        ) {
            game.board[toRow + 1][toCol] = null
            lastMove += fromFile + 'x'
        } else if (
            pieceColor === 'b' &&
            game.board[toRow - 1][toCol] &&
            game.board[toRow - 1][toCol].color === opponentColor &&
            game.board[toRow - 1][toCol].type === 'Pawn'
        ) {
            game.board[toRow - 1][toCol] = null
            lastMove += fromFile + 'x'
        }
    }

    // add to for move notation
    lastMove += to
    // if we castle
    if (game.board[fromRow][fromCol].type === 'King') {
        // kingside
        if (fromCol - toCol === -2) {
            game.board[fromRow][7].totalMoves++
            game.board[fromRow][5] = game.board[fromRow][7]
            game.board[fromRow][7] = null
            lastMove = '0-0'
        }
        // queenside
        if (fromCol - toCol === 2) {
            game.board[fromRow][0].totalMoves++
            game.board[fromRow][3] = game.board[fromRow][0]
            game.board[fromRow][0] = null
            lastMove = '0-0-0'
        }
    }

    game.board[fromRow][fromCol].totalMoves++
    game.board[toRow][toCol] = game.board[fromRow][fromCol]
    game.board[fromRow][fromCol] = null

    game.moves.push(lastMove)

    if (isKingInCheck(game.board, opponentColor, lastMove)) {
        if (isCheckmate(game.board, opponentColor, lastMove)) {
            // send checkmate and end game
            console.log(`${opponentColor} is in checkmate!`)
        } else {
            let { row, col } = findKing(game.board, opponentColor)
            game.board[row][col].check = true
            console.log(`${opponentColor} is in check!`)
        }
    } else {
        let { row, col } = findKing(game.board, opponentColor)
        game.board[row][col].check = false
    }
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

    // TODO:
    // check logic & checkmate logic

    let piece = game.board[fromRow][fromCol]

    // if the move is valid
    if (
        game.board[fromRow][fromCol].validMoves(
            fromRow,
            fromCol,
            toRow,
            toCol,
            game.board,
            lastMove
        )
    ) {
        // if after the move we are still in check, invalid
        let newBoard = simulateMove(game.board, {
            fromRow,
            fromCol,
            toRow,
            toCol,
            piece,
        })
        if (
            isKingInCheck(
                newBoard,
                game.board[fromRow][fromCol].color,
                lastMove
            )
        ) {
            // console.log(move)    shows what move stops checkmate
            return false
        }
        return true
    } else {
        return false
    }

    // return game.board[fromRow][fromCol].validMoves(
    //     fromRow,
    //     fromCol,
    //     toRow,
    //     toCol,
    //     game.board,
    //     lastMove
    // )
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
                reverseBoard(stringifyBoard(game.board))
            )
        } else {
            io.in(socket.id).emit('init-game', stringifyBoard(game.board))
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
        game.moves = []
        check = false
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

console.log('Listening...')
