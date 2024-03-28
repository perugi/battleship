import GameState from './GameState';

const UserInterface = (events) => {
  const renderGameboard = (player, gameboardDiv, showShips) => {
    gameboardDiv.innerHTML = '';

    player.getShips().forEach((row, rowIndex) => {
      row.forEach((ship, colIndex) => {
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell');
        cellElement.setAttribute('data-row', rowIndex);
        cellElement.setAttribute('data-col', colIndex);

        if (showShips && ship) {
          cellElement.classList.add('ship');
        }

        if (showShips && player.getAdjacents()[rowIndex][colIndex].size > 0) {
          cellElement.classList.add('adjacent');
        }

        if (player.getShotsReceived()[rowIndex][colIndex]) {
          if (ship) {
            cellElement.classList.add('hit');
          } else {
            cellElement.classList.add('miss');
          }
        }

        if (ship && ship.isSunk()) {
          cellElement.classList.add('sunk');
        }

        if (
          [...player.getAdjacents()[rowIndex][colIndex]].some((adjacentShip) =>
            adjacentShip.isSunk()
          )
        ) {
          cellElement.classList.add('adjacent');
        }

        gameboardDiv.appendChild(cellElement);
      });
    });
  };

  const renderGameSetup = () => {
    document.querySelector('#content').innerHTML = `
        <label for="player-name">Player Name:</label>
        <input type="text" id="player-name" />
        <label for "player-ai">Play vs. Computer</label>
        <input type="checkbox" id="player-ai" checked/>
        <div id="opponent-setup">
          <label for="opponent-name">Opponent Name:</label>
          <input type="text" id="opponent-name" />
        </div>
        <button id="create-players">Confirm</button>
    `;

    const createPlayersButton = document.querySelector('#create-players');
    createPlayersButton.addEventListener('click', () => {
      const playerName = document.querySelector('#player-name').value;
      const opponentName = document.querySelector('#opponent-name').value;
      const playVsAi = document.querySelector('#player-ai').checked;

      if (playVsAi) {
        events.emit('createPlayers', {
          player1Name: playerName,
          player1IsAi: false,
          player2Name: 'Computer',
          player2IsAi: true,
        });
      } else {
        events.emit('createPlayers', {
          player1Name: playerName,
          player1IsAi: false,
          player2Name: opponentName,
          player2IsAi: false,
        });
      }
    });
  };

  const renderShipPlacing = (data) => {
    document.querySelector('#content').innerHTML = `
        <h1> Player Board [${data.player1.getName()}] </h1>
        <div id="player-gameboard"></div>
        <button id="place-random">Place Ships Randomly</button>
        <button id="start-game">Start Game</button>
    `;

    const playerGameboardDiv = document.querySelector('#player-gameboard');
    renderGameboard(data.player1, playerGameboardDiv, true);

    const placeRandomShipsButton = document.querySelector('#place-random');
    placeRandomShipsButton.addEventListener('click', () => {
      events.emit('placeRandomShips', { playerIndex: 0 });
    });

    const startGameButton = document.querySelector('#start-game');
    startGameButton.addEventListener('click', () => {
      events.emit('startGame');
    });
  };

  const shoot = (event) => {
    if (
      event.target.classList.contains('miss') ||
      event.target.classList.contains('hit')
    )
      return;

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

    renderGameboard(data.player1, playerGameboard, true);

    renderGameboard(data.player2, opponentGameboard, false);
    [...opponentGameboard.children].forEach((cell) => {
      cell.addEventListener('click', shoot);
    });

    const pauseButton = document.querySelector('#pause-game');
    pauseButton.addEventListener('click', renderPauseScreen);
  };

  const renderShot = (data) => {
    const gameboardDiv = document.querySelector(
      `#${
        data.shot.shootingPlayer === data.player1 ? 'opponent' : 'player'
      }-gameboard`
    );

    if (data.shot.shootingPlayer === data.player1) {
      renderGameboard(data.player2, gameboardDiv, false);

      [...gameboardDiv.children].forEach((cell) => {
        cell.addEventListener('click', shoot);
      });
    } else {
      renderGameboard(data.player1, gameboardDiv, true);
    }

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
      renderGameSetup();
    } else if (data.gameState === GameState.placingShips) {
      renderShipPlacing(data);
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
      renderGameSetup();
    });

    const pausedToGameSetupButton = document.querySelector(
      '#pause-to-game-setup'
    );
    pausedToGameSetupButton.addEventListener('click', () => {
      const modal = document.querySelector('#pause-modal');
      modal.style.display = 'none';
      renderGameSetup();
    });

    const continueButton = document.querySelector('.continue.modal-button');
    continueButton.addEventListener('click', () => {
      const pauseModal = document.querySelector('#pause-modal');
      pauseModal.style.display = 'none';
    });

    const pausedToRestartButton = document.querySelector(
      '#pause-to-restart-game'
    );
    pausedToRestartButton.addEventListener('click', () => {
      const modal = document.querySelector('#pause-modal');
      modal.style.display = 'none';
      events.emit('restartGame');
    });

    const gameOverToRestartButton = document.querySelector(
      '#game-over-to-restart-game'
    );
    gameOverToRestartButton.addEventListener('click', () => {
      const modal = document.querySelector('#game-over-modal');
      modal.style.display = 'none';
      events.emit('restartGame');
    });
  };

  createEventListeners();
  events.on('gameStateChange', handleGameStateChange);
  renderGameSetup();
};

export default UserInterface;
