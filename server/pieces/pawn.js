import BasePiece from './basePiece.js'

export default class Pawn extends BasePiece {
    constructor(color) {
        super(color, 'Pawn')
    }

    validMoves(fromRow, fromCol, toRow, toCol, board, lastMove) {
        if (fromRow === toRow && fromCol === toCol) return false
        // en pessent
        if (
            (lastMove && lastMove.length === 2) ||
            (lastMove && lastMove.length === 3 && lastMove[2] === '+')
        ) {
            const lastRow = 8 - parseInt(lastMove[1])
            const lastCol = lastMove.charCodeAt(0) - 'a'.charCodeAt(0)
            if (
                (fromRow === 3 || fromRow === 4) &&
                lastRow === fromRow &&
                (lastCol === fromCol + 1 || lastCol === fromCol - 1) &&
                board[lastRow][lastCol].totalMoves === 1 &&
                toCol === lastCol
            ) {
                if (this.color === 'w' && toRow === lastRow - 1) {
                    return true
                } else if (this.color === 'b' && toRow === lastRow + 1) {
                    return true
                }
            }
        }

        //black
        if (this.color === 'b') {
            if (fromRow === 1) {
                //if pawn hasnt moved
                if (fromRow + 1 === toRow) {
                    if (fromCol === toCol && board[toRow][toCol] === null)
                        return true
                    if (
                        fromCol + 1 === toCol &&
                        board[toRow][toCol] != null &&
                        board[toRow][toCol].color === 'w'
                    )
                        return true
                    if (
                        fromCol - 1 === toCol &&
                        board[toRow][toCol] != null &&
                        board[toRow][toCol].color === 'w'
                    )
                        return true
                    return false
                } else if (fromRow + 2 === toRow) {
                    if (
                        board[fromRow + 1][toCol] === null &&
                        board[fromRow + 2][toCol] === null
                    )
                        return true
                    return false
                }
            } else if (fromRow + 1 === toRow) {
                if (fromCol === toCol && board[toRow][toCol] === null)
                    return true
                if (
                    fromCol + 1 === toCol &&
                    board[toRow][toCol] != null &&
                    board[toRow][toCol].color === 'w'
                )
                    return true
                if (
                    fromCol - 1 === toCol &&
                    board[toRow][toCol] != null &&
                    board[toRow][toCol].color === 'w'
                )
                    return true
            }
        }
        //white
        if (this.color === 'w') {
            if (fromRow === 6) {
                //if pawn hasnt moved
                if (fromRow - 1 === toRow) {
                    if (fromCol === toCol && board[toRow][toCol] === null)
                        return true
                    if (
                        fromCol + 1 === toCol &&
                        board[toRow][toCol] != null &&
                        board[toRow][toCol].color === 'b'
                    )
                        return true
                    if (
                        fromCol - 1 === toCol &&
                        board[toRow][toCol] != null &&
                        board[toRow][toCol].color === 'b'
                    )
                        return true
                } else if (fromRow - 2 === toRow) {
                    if (
                        board[fromRow - 1][toCol] === null &&
                        board[fromRow - 2][toCol] === null
                    )
                        return true
                    return false
                }
            } else if (fromRow - 1 === toRow) {
                if (fromCol === toCol && board[toRow][toCol] === null)
                    return true
                if (
                    fromCol + 1 === toCol &&
                    board[toRow][toCol] != null &&
                    board[toRow][toCol].color === 'b'
                )
                    return true
                if (
                    fromCol - 1 === toCol &&
                    board[toRow][toCol] != null &&
                    board[toRow][toCol].color === 'b'
                )
                    return true
            }
        }
        return false
    }
}
