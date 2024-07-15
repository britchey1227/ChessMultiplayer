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

    isPathClear(fromRow, fromCol, toRow, toCol, board) {
        const rowStep = Math.sign(toRow - fromRow)
        const colStep = Math.sign(toCol - fromCol)
        let row = fromRow + rowStep
        let col = fromCol + colStep

        while (row !== toRow || col !== toCol) {
            if (board[row][col] !== null) return false
            row += rowStep
            col += colStep
        }
        return true
    }
}

export class Bishop extends Piece {
    constructor(color) {
        super(color, 'Bishop')
    }

    validMoves(fromRow, fromCol, toRow, toCol, board) {
        if (Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol)) {
            // if it's a diagonal
            return this.isPathClear(fromRow, fromCol, toRow, toCol, board)
        }
        return false
    }
}

export class Rook extends Piece {
    constructor(color) {
        super(color, 'Rook')
    }

    validMoves(fromRow, fromCol, toRow, toCol, board) {
        if (fromCol === toCol || fromRow === toRow)
            return this.isPathClear(fromRow, fromCol, toRow, toCol, board)
        return false
    }
}

export class Queen extends Piece {
    constructor(color) {
        super(color, 'Queen')
    }

    validMoves(fromRow, fromCol, toRow, toCol, board) {
        if (Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol)) {
            // if it's a diagonal
            return this.isPathClear(fromRow, fromCol, toRow, toCol, board)
        }
        if (fromCol === toCol || fromRow === toRow)
            return this.isPathClear(fromRow, fromCol, toRow, toCol, board)
        return false
    }
}

export class Knight extends Piece {
    constructor(color) {
        super(color, 'Knight')
    }

    validMoves(fromRow, fromCol, toRow, toCol, board) {
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

export class Pawn extends Piece {
    constructor(color) {
        super(color, 'Pawn')
        this.enPessent = false
    }

    validMoves(fromRow, fromCol, toRow, toCol, board, lastMove) {
        // en pessent
        if (lastMove.length === 2 || (lastMove.length === 3 && lastMove[2] === '+')) {
            const lastRow = 8 - parseInt(lastMove[1])
            const lastCol = lastMove.charCodeAt(0) - 'a'.charCodeAt(0)
            if (
                (fromRow == 3 || fromRow == 4) &&
                lastRow === fromRow &&
                (lastCol === fromCol + 1 || lastCol === fromCol - 1) &&
                board[lastRow][lastCol].totalMoves === 1 &&
                toCol === lastCol
            ) {
                if (this.color === 'w' && toRow === lastRow - 1) {
                    this.enPessent = true
                    return true
                } else if (this.color === 'b' && toRow === lastRow + 1) {
                    this.enPessent = true
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

export class King extends Piece {
    constructor(color) {
        super(color, 'King')
    }

    validMoves(fromRow, fromCol, toRow, toCol, board) {
        if (Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1) {
            // if move is within 1x1
            return true
        }
        // castling
        if (this.totalMoves === 0 && fromRow === toRow) {
            // castle king side
            if (
                fromCol - toCol === -2 &&
                board[fromRow][7].type === 'Rook' &&
                board[fromRow][7].totalMoves === 0
            ) {
                return this.isPathClear(fromRow, fromCol, toRow, 7, board)
            }

            //castle queen side
            if (
                fromCol - toCol === 2 &&
                board[fromRow][0].type === 'Rook' &&
                board[fromRow][0].totalMoves === 0
            ) {
                return this.isPathClear(fromRow, fromCol, toRow, 0, board)
            }
        }
        return false
    }
}
