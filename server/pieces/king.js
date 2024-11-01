import BasePiece from './basePiece.js'

export default class King extends BasePiece {
    constructor(color) {
        super(color, 'King')
        this.check = false
    }

    validMoves(fromRow, fromCol, toRow, toCol, board, lastMove) {
        if (fromRow === toRow && fromCol === toCol) return false
        if (Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1) {
            // if move is within 1x1
            return this.isPathClear(fromRow, fromCol, toRow, toCol, board)
        }
        // castling
        if (!this.check && this.totalMoves === 0 && fromRow === toRow) {
            // castle king side
            if (
                fromCol - toCol === -2 &&
                board[fromRow][7] &&
                board[fromRow][7].type === 'Rook' &&
                board[fromRow][7].totalMoves === 0
            ) {
                return (
                    this.isPathClear(fromRow, fromCol, toRow, 7, board) &&
                    this.canCastleKingSide(
                        board,
                        fromRow,
                        fromCol,
                        this.color,
                        lastMove
                    )
                )
            }

            //castle queen side
            if (
                fromCol - toCol === 2 &&
                board[fromRow][0] &&
                board[fromRow][0].type === 'Rook' &&
                board[fromRow][0].totalMoves === 0
            ) {
                return (
                    this.isPathClear(fromRow, fromCol, toRow, 0, board) &&
                    this.canCastleQueenSide(
                        board,
                        fromRow,
                        fromCol,
                        this.color,
                        lastMove
                    )
                )
            }
        }
        return false
    }

    canCastleKingSide(board, fromRow, fromCol, color, lastMove) {
        // method to check if any piece attacks a square that the king skips over during castling
        // get the opponent color
        let opponentColor = 'b'
        if (color === 'b') opponentColor = 'w'

        // generateALlMoves except pawn moves
        let allMoves = []
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                let piece = board[row][col]
                if (piece && piece.color === opponentColor) {
                    if (piece.type === 'Pawn') continue
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

        // if any move covers the castle square
        for (let move of allMoves) {
            if (move.toRow === fromRow && move.toCol === fromCol + 1)
                return false
        }

        // if any pawn covers the castle square
        if (color === 'w') {
            // check if a pawn is on the crucial squares
            const e2 = board[6][4]
            const g2 = board[6][6]
            if (e2 && e2.color === opponentColor && e2.type === 'Pawn')
                return false
            if (g2 && g2.color === opponentColor && g2.type === 'Pawn')
                return false
        } else {
            // check if a pawn is on the crucial squares
            const e7 = board[1][4]
            const g7 = board[1][6]
            if (e7 && e7.color === opponentColor && e7.type === 'Pawn')
                return false
            if (g7 && g7.color === opponentColor && g7.type === 'Pawn')
                return false
        }

        return true
    }

    canCastleQueenSide(board, fromRow, fromCol, color, lastMove) {
        // method to check if any piece attacks a square that the king skips over during castling
        // get the opponent color
        let opponentColor = 'b'
        if (color === 'b') opponentColor = 'w'

        // generateALlMoves except pawn moves
        let allMoves = []
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                let piece = board[row][col]
                if (piece && piece.color === opponentColor) {
                    if (piece.type === 'Pawn') continue
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

        // if any move covers the castle square
        for (let move of allMoves) {
            if (move.toRow === fromRow && move.toCol === fromCol - 1)
                return false
        }

        // if any pawn covers the castle square
        if (color === 'w') {
            // check if a pawn is on the crucial squares
            const e2 = board[6][4]
            const c2 = board[6][2]
            if (e2 && e2.color === opponentColor && e2.type === 'Pawn')
                return false
            if (c2 && c2.color === opponentColor && c2.type === 'Pawn')
                return false
        } else {
            // check if a pawn is on the crucial squares
            const e7 = board[1][4]
            const c7 = board[1][2]
            if (e7 && e7.color === opponentColor && e7.type === 'Pawn')
                return false
            if (c7 && c7.color === opponentColor && c7.type === 'Pawn')
                return false
        }

        return true
    }
}
