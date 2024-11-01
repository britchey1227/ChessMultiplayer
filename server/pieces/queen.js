import BasePiece from './basePiece.js'

export default class Queen extends BasePiece {
    constructor(color) {
        super(color, 'Queen')
    }

    validMoves(fromRow, fromCol, toRow, toCol, board) {
        if (fromRow === toRow && fromCol === toCol) return false
        if (Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol)) {
            // if it's a diagonal
            return this.isPathClear(fromRow, fromCol, toRow, toCol, board)
        }
        if (fromCol === toCol || fromRow === toRow)
            return this.isPathClear(fromRow, fromCol, toRow, toCol, board)
        return false
    }
}
