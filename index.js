// TODO: Set current player based on response from init game (hasn't been inited yet)
window.addEventListener('DOMContentLoaded', () => {
    let board = [
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '']
    ];

    const tiles = Array.from(document.querySelectorAll('.tile'));
    colorBoard()

    const audio = document.getElementById("audio");
    // const playerDisplay = document.querySelector('.display-player');
    const resetButton = document.querySelector('#reset');
    const announcer = document.querySelector('.announcer');

    // TODO: Set currentPlayer based on response from init-game
    let currentPlayer = null;
    let isGameActive = true;

    const WHITE = 'w'
    const BLACK = 'b'
    const TIE = 'TIE';

    function format(obj) {
        return JSON.stringify(obj)
    }

    //connect the user to the server
    const ws = new WebSocket("ws://localhost:8080")
    ws.onopen = () => {
        ws.send(format({ type: 'init-game', data: {} }))
    }

    ws.onmessage = (event) => {
        const { type, data } = JSON.parse(event.data)
        console.log(`Received event with type ${type} and data ${JSON.stringify(data)}`)

        if (type === 'init-game') {
            board = data
            syncBoard()
        }

        if (type === 'move-made') {
            board = data.board
            syncBoard()
        }

        // TODO: Implement on server
        if (type === 'game-over') {
            const winner = data.winner
            board = data.board
            syncBoard()
            isGameActive = false
            announce(winner)
        }

        if (type === 'game-reset') {
            board = data.board
            syncBoard()
            hideAnnounce()
            isGameActive = true;
        }
    }

    function colorBoard() {
        for (let i = 0; i < 64; i++) {
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
                tiles[i].innerHTML = `<img class='img-fluid' src='images/${board[row][col]}.png'>`;
            } else {
                tiles[i].innerHTML = '';
            }
        }
    }

    function toBoardIndex(index) {
        let row = parseInt(index / 8)
        let col = parseInt(index % 8)
        return [row, col]
    }

    const announce = (type) => {
        switch (type) {
            case WHITE:
                announcer.innerHTML = 'White Wins!';
                break;
            case BLACK:
                announcer.innerHTML = 'Black Wins!';
                break;
            case TIE:
                announcer.innerText = 'Tie...';
        }
        announcer.classList.remove('hide');
    };

    const hideAnnounce = () => {
        announcer.classList.add('hide');
    }

    const isValidAction = (tile) => {
        // TODO: Some basic validation later. But let server do the validation for now
        return true;
    };

    let lastClickedTile = null
    const userAction = (tile, index) => {
        console.log(tile)
        if (isValidAction(tile) && isGameActive) {
            if (!lastClickedTile) {
                tile.style.backgroundColor = "rgba(0, 29, 54, .75)";
                lastClickedTile = tile;
            } else if (lastClickedTile === tile) {
                colorBoard()
                lastClickedTile = null;
            } else {
                const from = lastClickedTile.id
                const to = tile.id

                colorBoard()
                lastClickedTile = null;
                ws.send(format({ type: 'make-move', data: { to, from } }))
            }
        }
    }

    tiles.forEach((tile, index) => {
        tile.addEventListener('click', () => userAction(tile, index));
        // tile.addEventListener('click', audio.play);
    });

    function resetGame() {
        ws.send(format({ type: 'reset-game', data: {} }))
    }

    resetButton.addEventListener('click', resetGame);
});