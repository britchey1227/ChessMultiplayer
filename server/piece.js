class Piece {
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
}

export class Bishop extends Piece {
    constructor(color) {
        super(color, 'Bishop')
    }

    validMoves(fromRow, fromCol, toRow, toCol, board) {
        // check if to falls into the diagonals
        for (let i = fromRow, j = fromCol; i < 8 && j < 8; i++, j++) {
            if (i === toRow && j == toCol) return true
        }
        for (let i = fromRow, j = fromCol; i < 8 && j >= 0; i++, j--) {
            if (i === toRow && j == toCol) return true
        }
        for (let i = fromRow, j = fromCol; i >= 0 && j < 8; i--, j++) {
            if (i === toRow && j == toCol) return true
        }
        for (let i = fromRow, j = fromCol; i >= 0 && j >= 0; i--, j--) {
            if (i === toRow && j == toCol) return true
        }
        return false
    }
}

export class Rook extends Piece {
    constructor(color) {
        super(color, 'Rook')
    }

    validMoves(fromRow, fromCol, toRow, toCol, board) {
        if (fromCol === toCol || fromRow === toRow) return true
        return false
    }
}

export class Queen extends Piece {
    constructor(color) {
        super(color, 'Queen')
    }

    validMoves(fromRow, fromCol, toRow, toCol, board) {
        // check if to falls into the diagonals
        for (let i = fromRow, j = fromCol; i < 8 && j < 8; i++, j++) {
            if (i === toRow && j == toCol) return true
        }
        for (let i = fromRow, j = fromCol; i < 8 && j >= 0; i++, j--) {
            if (i === toRow && j == toCol) return true
        }
        for (let i = fromRow, j = fromCol; i >= 0 && j < 8; i--, j++) {
            if (i === toRow && j == toCol) return true
        }
        for (let i = fromRow, j = fromCol; i >= 0 && j >= 0; i--, j--) {
            if (i === toRow && j == toCol) return true
        }
        if (fromCol === toCol || fromRow === toRow) return true
        return false
    }
}

export class Knight extends Piece {
    constructor(color) {
        super(color, 'Knight')
    }

    validMoves(fromRow, fromCol, toRow, toCol, board) {
        if (fromRow + 1 === toRow && fromCol + 2 == toCol) return true
        if (fromRow + 1 === toRow && fromCol - 2 == toCol) return true
        if (fromRow + 2 === toRow && fromCol + 1 == toCol) return true
        if (fromRow + 2 === toRow && fromCol - 1 == toCol) return true
        if (fromRow - 1 === toRow && fromCol + 2 == toCol) return true
        if (fromRow - 1 === toRow && fromCol - 2 == toCol) return true
        if (fromRow - 2 === toRow && fromCol + 1 == toCol) return true
        if (fromRow - 2 === toRow && fromCol - 1 == toCol) return true
        return false
    }

    stringify() {
        return `${this.color}N`
    }
}

export class Pawn extends Piece {
    constructor(color) {
        super(color, 'Pawn')
    }

    validMoves(fromRow, fromCol, toRow, toCol, board) {
        //TODO: Add en pessent
        //black
        if (this.color === 'b') {
            if (fromRow === 1) {
                //if pawn hasnt moved
                if (fromRow + 1 === toRow) {
                    if (fromCol === toCol && board[toRow][toCol] === null)
                        return true
                    if (fromCol + 1 === toCol && board[toRow][toCol] != null && board[toRow][toCol].color === 'w')
                        return true
                    if (fromCol - 1 === toCol && board[toRow][toCol] != null && board[toRow][toCol].color === 'w')
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
                if (fromCol + 1 === toCol && board[toRow][toCol] != null && board[toRow][toCol].color === 'w')
                    return true
                if (fromCol - 1 === toCol && board[toRow][toCol] != null && board[toRow][toCol].color === 'w')
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
                    if (fromCol + 1 === toCol && board[toRow][toCol] != null &&  board[toRow][toCol].color === 'b')
                        return true
                    if (fromCol - 1 === toCol && board[toRow][toCol] != null &&  board[toRow][toCol].color === 'b')
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
                if (fromCol + 1 === toCol && board[toRow][toCol] != null &&  board[toRow][toCol].color === 'b')
                    return true
                if (fromCol - 1 === toCol && board[toRow][toCol] != null &&  board[toRow][toCol].color === 'b')
                    return true
            }
        }
        return false
    }
}

export class King extends Piece {
    constructor(color) {
        super(color, 'King')
    }

    validMoves(fromRow, fromCol, toRow, toCol, board) {
        // TODO: add castling
        if (fromRow + 1 === toRow) {
            if (
                fromCol === toCol ||
                fromCol - 1 === toCol ||
                fromCol + 1 === toCol
            )
                return true
        } else if (fromRow - 1 === toRow) {
            if (
                fromCol === toCol ||
                fromCol - 1 === toCol ||
                fromCol + 1 === toCol
            )
                return true
        } else if (fromRow === toRow) {
            if (fromCol - 1 === toCol || fromCol + 1 === toCol) return true
        }
        return false
    }
}
