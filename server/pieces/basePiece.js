export default class BasePiece {
    constructor(color, type) {
        this.color = color.toLowerCase()
        this.type = type
        this.totalMoves = 0
    }

    validMoves() {
        console.log('oi bruv, make a piece child')
    }

    stringify() {
        return `${this.color}${this.type[0]}`
    }

    isPathClear(fromRow, fromCol, toRow, toCol, board) {
        const rowStep = Math.sign(toRow - fromRow)
        const colStep = Math.sign(toCol - fromCol)
        let row = fromRow + rowStep
        let col = fromCol + colStep

        if (
            board[row][col] !== null &&
            board[row][col].color === board[fromRow][fromCol].color
        )
            return false
        while (row !== toRow || col !== toCol) {
            if (board[row][col] !== null) return false
            row += rowStep
            col += colStep
        }

        return true
    }

    getValidMoves(fromRow, fromCol, board, lastMove) {
        let moves = []
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (
                    this.validMoves(fromRow, fromCol, row, col, board, lastMove)
                ) {
                    moves.push({
                        row: row,
                        col: col,
                        piece: this,
                    })
                }
            }
        }
        return moves
    }
}
