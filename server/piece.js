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

export class Bishop extends Piece {
    constructor(color) {
        super(color, 'Bishop')
    }

    validMoves(fromRow, fromCol, toRow, toCol, board) {
        if (fromRow === toRow && fromCol === toCol) return false

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
        if (fromRow === toRow && fromCol === toCol) return false
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

export class Knight extends Piece {
    constructor(color) {
        super(color, 'Knight')
    }

    validMoves(fromRow, fromCol, toRow, toCol, board) {
        if (fromRow === toRow && fromCol === toCol) return false
        if(board[toRow][toCol] && board[toRow][toCol].color === board[fromRow][fromCol].color) return false
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
    }

    validMoves(fromRow, fromCol, toRow, toCol, board, lastMove) {
        if (fromRow === toRow && fromCol === toCol) return false
        // en pessent
        if (
            (lastMove && lastMove.length === 2) ||
            (lastMove.length === 3 && lastMove[2] === '+')
        ) {
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

export class King extends Piece {
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
                return this.isPathClear(fromRow, fromCol, toRow, 7, board) && this.canCastleKingSide(board, fromRow, fromCol, this.color, lastMove)
            }

            //castle queen side
            if (
                fromCol - toCol === 2 &&
                board[fromRow][0] &&
                board[fromRow][0].type === 'Rook' &&
                board[fromRow][0].totalMoves === 0
            ) {
                return this.isPathClear(fromRow, fromCol, toRow, 0, board) && this.canCastleQueenSide(board, fromRow, fromCol, this.color, lastMove)
            }
        }
        return false
    }

    canCastleKingSide(board, fromRow, fromCol, color, lastMove){
        // method to check if any piece attacks a square that the king skips over during castling
        // get the opponent color
        let opponentColor = 'b'
        if(color === 'b') opponentColor = 'w'

        // generateALlMoves except pawn moves
        let allMoves = []
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                let piece = board[row][col]
                if (piece && piece.color === opponentColor) {
                    if(piece.type === 'Pawn') continue
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
            if(move.toRow === fromRow && move.toCol === fromCol + 1) return false
        }

        // if any pawn covers the castle square
        if(color === 'w'){
            // check if a pawn is on the crucial squares
            const e2 = board[6][4]
            const g2 = board[6][6]
            if(e2 && e2.color === opponentColor && e2.type === 'Pawn') return false
            if(g2 && g2.color === opponentColor && g2.type === 'Pawn') return false
        } else {
            // check if a pawn is on the crucial squares
            const e7 = board[1][4]
            const g7 = board[1][6]
            if(e7 && e7.color === opponentColor && e7.type === 'Pawn') return false
            if(g7 && g7.color === opponentColor && g7.type === 'Pawn') return false
        }

        return true
    }

    canCastleQueenSide(board, fromRow, fromCol, color, lastMove){
        // method to check if any piece attacks a square that the king skips over during castling
        // get the opponent color
        let opponentColor = 'b'
        if(color === 'b') opponentColor = 'w'

        // generateALlMoves except pawn moves
        let allMoves = []
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                let piece = board[row][col]
                if (piece && piece.color === opponentColor) {
                    if(piece.type === 'Pawn') continue
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
            if(move.toRow === fromRow && move.toCol === fromCol - 1) return false
        }

        // if any pawn covers the castle square
        if(color === 'w'){
            // check if a pawn is on the crucial squares
            const e2 = board[6][4]
            const c2 = board[6][2]
            if(e2 && e2.color === opponentColor && e2.type === 'Pawn') return false
            if(c2 && c2.color === opponentColor && c2.type === 'Pawn') return false
        } else {
            // check if a pawn is on the crucial squares
            const e7 = board[1][4]
            const c7 = board[1][2]
            if(e7 && e7.color === opponentColor && e7.type === 'Pawn') return false
            if(c7 && c7.color === opponentColor && c7.type === 'Pawn') return false
        }

        return true
    }
}
