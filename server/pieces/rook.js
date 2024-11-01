import BasePiece from './basePiece.js'
export default class Rook extends BasePiece {
    constructor(color) {
        super(color, 'Rook')
    }

    validMoves(fromRow, fromCol, toRow, toCol, board) {
        if (fromRow === toRow && fromCol === toCol) return false
        if (fromCol === toCol || fromRow === toRow)
            return this.isPathClear(fromRow, fromCol, toRow, toCol, board)
        return false
    }
}
