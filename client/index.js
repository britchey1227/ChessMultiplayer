import { io } from 'socket.io-client'

window.addEventListener('DOMContentLoaded', () => {
    let board = [
        ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
        ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
        ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'],
    ]

    const tiles = Array.from(document.querySelectorAll('.tile'))
    colorBoard()

    const audio = document.getElementById('audio')
    // const playerDisplay = document.querySelector('.display-player');
    const resetButton = document.querySelector('#reset')
    const announcer = document.querySelector('.announcer')
    const playerTypeIndicator = document.querySelector('#playerType')

    let playerType = null
    let isGameActive = true

    const WHITE = 'w'
    const BLACK = 'b'
    const DRAW = 'DRAW'

    function debug(type, message) {
        console.log(
            `Received event with type ${type} and data ${JSON.stringify(
                message
            )}`
        )
    }

    const socket = io('http://localhost:3000')
    handleMessages(socket)

    function handleMessages(socket) {
        socket.on('connect', () => {
            debug('connect', {})
            socket.emit('init-game', {})
        })

        socket.on('welcome', (data) => {
            debug('welcome', data)
            playerType = data.playerType
            playerTypeIndicator.innerText = playerType
            if (playerType === 'black') {
                // if we are black, flip the ids on the tiles of the board
                flipBoard()
            }
        })

        socket.on('disconnect', (data) => {
            playerType = null
            if (tiles[0].id === 'h1') {
                flipBoard()
            }
            board = [
                ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
                ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
                ['', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', ''],
                ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
                ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'],
            ]
            colorBoard();
            syncBoard();
            playerTypeIndicator.innerText = 'Welcome'
        })

        socket.on('init-game', (data) => {
            debug('init-game', data)
            board = data
            syncBoard()
        })

        socket.on('move-made', (data) => {
            debug('move-made', data)
            board = data.board
            syncBoard()
        })

        socket.on('game-over', (data) => {
            debug('game-over', data)
            const winner = data.winner
            board = data.board
            syncBoard()
            isGameActive = false
            announce(winner)
        })

        socket.on('game-reset', (data) => {
            debug('game-reset', data)
            board = data.board
            syncBoard()
            hideAnnounce()
            isGameActive = true
        })
    }

    function colorBoard() {
        for (let i = 0; i < tiles.length; i++) {
            if (i % 2 === 0) {
                if (Math.floor(i / 8) % 2 === 0) {
                    tiles[i].style.backgroundColor = 'rgba(166, 209, 248, 0.75)'
                } else {
                    tiles[i].style.backgroundColor = 'rgba(104, 180, 252, 0.75)'
                }
            } else {
                if (Math.floor(i / 8) % 2 === 0) {
                    tiles[i].style.backgroundColor = 'rgba(104, 180, 252, 0.75)'
                } else {
                    tiles[i].style.backgroundColor = 'rgba(166, 209, 248, 0.75)'
                }
            }
        }
    }

    function syncBoard() {
        for (let i = 0; i < tiles.length; i++) {
            let [row, col] = toBoardIndex(i)
            if (board[row][col] !== '') {
                tiles[
                    i
                ].innerHTML = `<img class='img-fluid' src='images/${board[row][col]}.png'>`
            } else {
                tiles[i].innerHTML = ''
            }
        }
    }

    function toBoardIndex(index) {
        let row = parseInt(index / 8)
        let col = parseInt(index % 8)
        return [row, col]
    }

    function flipBoard() {
        for (let i = 0; i < tiles.length / 2; i++) {
            let temp = tiles[i].id
            tiles[i].id = tiles[tiles.length - 1 - i].id
            tiles[tiles.length - 1 - i].id = temp
        }
    }

    function tileToPiece(tile) {
        let row, col
        for (let i = 0; i < tiles.length; i++) {
            if (tiles[i] === tile) {
                ;[row, col] = toBoardIndex(i)
            }
        }
        return board[row][col]
    }

    const announce = (type) => {
        switch (type) {
            case WHITE:
                announcer.innerHTML = 'White Wins!'
                break
            case BLACK:
                announcer.innerHTML = 'Black Wins!'
                break
            case DRAW:
                announcer.innerText = 'Draw...'
        }
        announcer.classList.remove('hide')
    }

    const hideAnnounce = () => {
        announcer.classList.add('hide')
    }

    const isValidAction = (tile) => {
        // TODO: Some basic validation later. But let server do the validation for now
        return true
    }

    let lastClickedTile = null
    const userAction = (tile, index) => {
        if (isValidAction(tile) && isGameActive) {
            if (
                !lastClickedTile ||
                tileToPiece(lastClickedTile) === '' ||
                tileToPiece(tile)[0] === playerType
            ) {
                //if no previous tile, if from is empty, if to is of same color
                colorBoard()
                tile.style.backgroundColor = 'rgba(0, 29, 54, .75)'
                lastClickedTile = tile
            } else if (lastClickedTile === tile) {
                colorBoard()
                lastClickedTile = null
            } else {
                const from = lastClickedTile.id
                const to = tile.id
                colorBoard()
                lastClickedTile = null
                socket.emit('make-move', { to, from })
            }
        }
    }

    tiles.forEach((tile, index) => {
        tile.addEventListener('click', () => userAction(tile, index))
        // tile.addEventListener('click', audio.play);
    })

    function resetGame() {
        socket.emit('reset-game', {})
    }

    resetButton.addEventListener('click', resetGame)
})
