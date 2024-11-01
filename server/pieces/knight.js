import BasePiece from './basePiece.js'

export default class Knight extends BasePiece {
    constructor(color) {
        super(color, 'Knight')
    }

    validMoves(fromRow, fromCol, toRow, toCol, board) {
        if (fromRow === toRow && fromCol === toCol) return false
        if (
            board[toRow][toCol] &&
            board[toRow][toCol].color === board[fromRow][fromCol].color
        )
            return false
        const rowDiff = Math.abs(fromRow - toRow)
        const colDiff = Math.abs(fromCol - toCol)
        return (
            (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)
        )
    }

    stringify() {
        return `${this.color}N`
    }
}
