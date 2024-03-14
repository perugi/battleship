import GameState from './GameState';

const UserInterface = (events) => {
  const createBlankGameboard = (gameboardDiv) => {
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell');
        cellElement.setAttribute('data-row', i);
        cellElement.setAttribute('data-col', j);
        gameboardDiv.appendChild(cellElement);
      }
    }
  };

  const renderStartScreen = () => {
    document.querySelector('#content').innerHTML = `
        <label for="player-name">Player Name:</label>
        <input type="text" id="player-name" />
        <div id="player-gameboard"></div>
        <button id="start-game">Start Game</button>
    `;

    const playerGameboardDiv = document.querySelector('#player-gameboard');
    createBlankGameboard(playerGameboardDiv);

    const startGameButton = document.querySelector('#start-game');
    startGameButton.addEventListener('click', () => {
      const playerName = document.querySelector('#player-name').value;
      events.emit('newGame', {
        player1Name: playerName,
        player1IsAi: false,
        player2Name: 'Computer',
        player2IsAi: true,
      });
    });
  };

  const shoot = (event) => {
    if (event.target.classList.contains('was-shot-at')) return;

    events.emit('shoot', {
      x: event.target.getAttribute('data-col'),
      y: event.target.getAttribute('data-row'),
    });
  };

  const renderPauseScreen = () => {
    const pauseModal = document.querySelector('#pause-modal');
    pauseModal.style.display = 'flex';
  };

  const renderGameboards = (data) => {
    document.querySelector('#content').innerHTML = `
        <div><span id="next-player">${data.activePlayer.getName()}</span>'s turn</div>
        <div>
          <h1> Player Board [${data.player1.getName()}] </h1>
          <div id="player-gameboard"></div>
        </div>
        <div>
          <h1> Opponents Board [${data.player2.getName()}] </h1>
        <div id="opponent-gameboard"></div>
        <button id="pause-game">Pause Game</button>
    `;

    const playerGameboard = document.querySelector('#player-gameboard');
    const opponentGameboard = document.querySelector('#opponent-gameboard');

    data.player1.getShips().forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell');
        cellElement.setAttribute('data-row', rowIndex);
        cellElement.setAttribute('data-col', colIndex);
        if (cell) {
          cellElement.classList.add('ship');
        }
        playerGameboard.appendChild(cellElement);
      });
    });

    data.player2.getShips().forEach((row, rowIndex) => {
      row.forEach((_, colIndex) => {
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell');
        cellElement.setAttribute('data-row', rowIndex);
        cellElement.setAttribute('data-col', colIndex);
        cellElement.addEventListener('click', shoot);
        opponentGameboard.appendChild(cellElement);
      });
    });

    const pauseButton = document.querySelector('#pause-game');
    pauseButton.addEventListener('click', renderPauseScreen);
  };

  const renderShot = (data) => {
    // TODO show whose turn it is on the screen (based on data.activePlayer)

    console.log(data.shot.shootingPlayer.getOpponent());
    const gameboardId =
      data.shot.shootingPlayer.getOpponent() === data.player1
        ? 'player'
        : 'opponent';

    const cellElement = document.querySelector(
      `#${gameboardId}-gameboard [data-row="${data.shot.y}"][data-col="${data.shot.x}"]`
    );

    if (data.shot.shipHit) {
      cellElement.classList.add('hit');
    } else {
      cellElement.classList.add('empty');
    }

    console.log(cellElement);
    cellElement.classList.add('was-shot-at');

    const nextPlayer = document.querySelector('#next-player');
    nextPlayer.textContent = data.activePlayer.getName();
  };

  const renderEndScreen = (data) => {
    const gameOverModal = document.querySelector('#game-over-modal');
    const winnerName = document.querySelector('#winner-name');

    winnerName.textContent = data.winner.getName();
    gameOverModal.style.display = 'flex';
  };

  const handleGameStateChange = (data) => {
    if (data.gameState === GameState.notStarted) {
      renderStartScreen();
    } else if (data.gameState === GameState.gameStarted) {
      renderGameboards(data);
    } else if (data.gameState === GameState.shotReceived) {
      renderShot(data);
    } else if (data.gameState === GameState.gameOver) {
      renderEndScreen(data);
    }
  };

  const createEventListeners = () => {
    const gameOverToGameSetupButton = document.querySelector(
      '#game-over-to-game-setup'
    );

    gameOverToGameSetupButton.addEventListener('click', () => {
      const modal = document.querySelector('#game-over-modal');
      modal.style.display = 'none';
      renderStartScreen();
    });

    const pausedToGameSetupButton = document.querySelector(
      '#pause-to-game-setup'
    );

    pausedToGameSetupButton.addEventListener('click', () => {
      const modal = document.querySelector('#pause-modal');
      modal.style.display = 'none';
      renderStartScreen();
    });
  };

  const continueButton = document.querySelector('.continue.modal-button');
  continueButton.addEventListener('click', () => {
    const pauseModal = document.querySelector('#pause-modal');
    pauseModal.style.display = 'none';
  });

  createEventListeners();
  events.on('gameStateChange', handleGameStateChange);
  renderStartScreen();
};

export default UserInterface;
