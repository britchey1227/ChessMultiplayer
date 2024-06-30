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

    function format(obj){
        return JSON.stringify(obj)
    }

    //connect the user to the server
    const ws = new WebSocket("ws://localhost:8080")
    ws.onopen = () => {
        ws.send(format({type: 'init-game', data: {}}))
    }

    ws.onmessage = (event) => {
        const {type,data} = JSON.parse(event.data)
        console.log(`Received event with type ${type} and data ${data}`)

        if(type === 'init-game'){
            board = data
            colorBoard()
            initBoard()
            ws.send(format({type: 'make-move', data: {to: "e4", from: "e2"}}))
        }

        if(type === 'move-made'){
            board = data.board
            colorBoard()
            initBoard()
        }
    }

    const tiles = Array.from(document.querySelectorAll('.tile'));
    const audio = document.getElementById("audio");
    // const playerDisplay = document.querySelector('.display-player');
    const resetButton = document.querySelector('#reset');
    const announcer = document.querySelector('.announcer');

    // let board = [
    //     ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
    //     ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
    //     ['', '', '', '', '', '', '', ''],
    //     ['', '', '', '', '', '', '', ''],
    //     ['', '', '', '', '', '', '', ''],
    //     ['', '', '', '', '', '', '', ''],
    //     ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
    //     ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
    // ];

    let currentPlayer = 'X';
    let isGameActive = true;

    const PLAYERX_WON = 'PLAYERX_WON';
    const PLAYERO_WON = 'PLAYERO_WON';
    const TIE = 'TIE';
    
    function colorBoard(){
        for (let i = 0; i < 64; i++) {
            if (i % 2 === 0) {
                if (Math.floor(i / 8) % 2 === 0) {
                    tiles[i].style.backgroundColor = '#a6d1f8'
                } else {
                    tiles[i].style.backgroundColor = '#68b4fc'
                }
    
            } else {
                if (Math.floor(i / 8) % 2 === 0) {
                    tiles[i].style.backgroundColor = '#68b4fc'
                } else {
                    tiles[i].style.backgroundColor = '#a6d1f8'
                }
            }
        }
    }

    function initBoard() {
        for (let i = 0; i < tiles.length; i++) {
            let width = tiles[i].offsetWidth;  // Get the width of the tile
            let height = tiles[i].offsetHeight;  // Get the height of the tile
            let [row, col] = toBoardIndex(i)
            if (board[row][col] !== '') {
                tiles[i].innerHTML = `<img src='images/${board[row][col]}.png' width=${width} height=${height}>`;
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

    /*
        Indexes within the board
        [0] [1] [2]
        [3] [4] [5]
        [6] [7] [8]
    */

    function handleResultValidation() {
        let roundWon = false;
        for (let i = 0; i <= 7; i++) {
            const winCondition = winningConditions[i];
            const a = board[winCondition[0]];
            const b = board[winCondition[1]];
            const c = board[winCondition[2]];
            if (a === '' || b === '' || c === '') {
                continue;
            }
            if (a === b && b === c) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            announce(currentPlayer === 'X' ? PLAYERX_WON : PLAYERO_WON);
            isGameActive = false;
            return;
        }

        if (!board.includes(''))
            announce(TIE);
    }

    const announce = (type) => {
        switch (type) {
            case PLAYERO_WON:
                announcer.innerHTML = 'Player <span class="playerO">O</span> Won';
                break;
            case PLAYERX_WON:
                announcer.innerHTML = 'Player <span class="playerX">X</span> Won';
                break;
            case TIE:
                announcer.innerText = 'Tie';
        }
        announcer.classList.remove('hide');
    };

    const isValidAction = (tile) => {
        if (tile.innerText === 'X' || tile.innerText === 'O') {
            return false;
        }

        return true;
    };

    const updateBoard = (index) => {
        board[index] = currentPlayer;
    }

    // const changePlayer = () => {
    //     playerDisplay.classList.remove(`player${currentPlayer}`);
    //     currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    //     playerDisplay.innerText = currentPlayer;
    //     playerDisplay.classList.add(`player${currentPlayer}`);
    // }

    const userAction = (tile, index) => {
        if (isValidAction(tile) && isGameActive) {
            tile.style.backgroundColor = "red";
            tile.classList.add(`player${currentPlayer}`);
            updateBoard(index);
            // handleResultValidation();
            // changePlayer();
            console.log(index);
        }
    }

    const resetBoard = () => {
        board = [
            ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
            ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
            ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
        ];

        isGameActive = true;
        announcer.classList.add('hide');

        // if (currentPlayer === 'O') {
        //     changePlayer();
        // }

        colorBoard();
        initBoard();

        tiles.forEach(tile => {
            // tile.innerText = '';
            tile.classList.remove('playerX');
            tile.classList.remove('playerO');
        });
    }

    tiles.forEach((tile, index) => {
        tile.addEventListener('click', () => userAction(tile, index));
        // tile.addEventListener('click', play);
    });

    function play() {
        audio.play();
    }

    resetButton.addEventListener('click', resetBoard);
});