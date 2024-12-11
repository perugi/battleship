import GameState from './GameState';

const UserInterface = (events) => {
  const delay = (ms) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    });

  const renderGameboard = (player, gameboardDiv, showShips) => {
    // eslint-disable-next-line no-param-reassign
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

  const renderMainMenu = () => {
    document.querySelector('#content').innerHTML = `
        <label for="player-name">Player Name:</label>
        <input type="text" id="player-name" />
        <label for "player-ai">Play vs. Computer</label>
        <input type="checkbox" id="play-vs-ai" checked/>
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
      const playVsAi = document.querySelector('#play-vs-ai').checked;

      events.emit('createPlayers', {
        player1Name: playerName,
        player1IsAi: false,
        player2Name: playVsAi ? 'Computer' : opponentName,
        player2IsAi: playVsAi,
      });
    });

    const playVsAiCheckbox = document.querySelector('#play-vs-ai');
    playVsAiCheckbox.addEventListener('change', () => {
      const opponentSetup = document.querySelector('#opponent-setup');
      if (playVsAiCheckbox.checked) {
        opponentSetup.style.display = 'none';
      } else {
        opponentSetup.style.display = 'block';
      }
    });
  };

  const passTurn = () => {
    const passTurnModal = document.querySelector('.pass-turn.modal');

    events.emit('primeShot');
    passTurnModal.style.display = 'none';
    document.removeEventListener('keydown', passTurn);
  };

  const renderPassTurnScreen = (data) => {
    const passTurnModal = document.querySelector('.pass-turn.modal');

    const nextPlayer = passTurnModal.querySelector('#next-player');
    nextPlayer.textContent = data.activePlayer.getName();

    passTurnModal.style.display = 'flex';

    document.addEventListener('keydown', passTurn);
  };

  const renderShipPlacing = (data) => {
    const content = document.querySelector('#content');

    content.innerHTML = `
        <h1> Player Board [${data.activePlayer.getName()}] </h1>
        <div id="player-gameboard"></div>
        <button id="place-random">Place Ships Randomly</button>
    `;

    const playerGameboardDiv = document.querySelector('#player-gameboard');
    renderGameboard(data.activePlayer, playerGameboardDiv, true);

    const placeRandomShipsButton = document.querySelector('#place-random');
    placeRandomShipsButton.addEventListener('click', () => {
      events.emit('placeRandomShips');
    });

    if (!data.player2.getIsAi() && data.activePlayer === data.player1) {
      const placePlayer2Button = document.createElement('button');
      placePlayer2Button.textContent = 'Confirm';
      placePlayer2Button.classList.add('place-player-2');
      placePlayer2Button.addEventListener('click', () => {
        events.emit('placingPlayer2');
      });
      content.appendChild(placePlayer2Button);
    } else {
      const startButton = document.createElement('button');
      startButton.textContent = 'Start Game';
      startButton.classList.add('start-game');
      startButton.addEventListener('click', () => {
        events.emit('startGame');
      });
      content.appendChild(startButton);
    }
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
    const pauseModal = document.querySelector('.pause.modal');
    pauseModal.style.display = 'flex';
  };

  const renderGameboards = (player, opponent, activePlayer) => {
    document.querySelector('#content').innerHTML = `
        <div><span id="active-player">${activePlayer.getName()}</span>'s turn</div>
        <div>
          <h1> Player Board [${player.getName()}] </h1>
          <div id="player-gameboard"></div>
        </div>
        <div>
          <h1> Opponents Board [${opponent.getName()}] </h1>
        <div id="opponent-gameboard"></div>
        <button id="pause-game">Pause Game</button>
    `;

    const playerGameboard = document.querySelector('#player-gameboard');
    const opponentGameboard = document.querySelector('#opponent-gameboard');

    renderGameboard(player, playerGameboard, true);

    // TODO prevent interactivity when waiting for AI moves.
    renderGameboard(opponent, opponentGameboard, false);
    [...opponentGameboard.children].forEach((cell) => {
      cell.addEventListener('click', shoot);
    });

    const pauseButton = document.querySelector('#pause-game');
    pauseButton.addEventListener('click', renderPauseScreen);
  };

  const renderShot1Player = async (data) => {
    if (data.shot && data.shot.shootingPlayer.getIsAi()) {
      // Delay rendering of the AI shot in order to simulate AI thinking.
      await delay(1000);
    }

    renderGameboards(data.player1, data.player2, data.activePlayer);

    // In a singleplayer game, the shot is autmatically primed and,
    // on AI moves, taken.
    events.emit('primeShot');
    if (data.activePlayer.getIsAi()) {
      events.emit('shoot');
    }
  };

  const renderShot2Players = async (data) => {
    if (data.shot) {
      renderGameboards(
        data.shot.shootingPlayer,
        data.shot.shootingPlayer.getOpponent(),
        data.shot.shootingPlayer
      );

      if (data.activePlayer !== data.shot.shootingPlayer) {
        // Active player is not the one who shot - The turn needs to be passed,
        // so we wait for 1 second for the player to observe his shot and render the pass turn screen.
        await delay(1000);
        renderPassTurnScreen(data);
      } else {
        // This case covers if the shot was a hit - we just prime the next one.
        events.emit('primeShot');
      }
    } else {
      // This is the case when the game is started and the method is called
      // without any shot data. We show the pass screen in order to not reveal the
      // opponent ships.
      renderPassTurnScreen(data);
    }
  };

  const renderEndScreen = (data) => {
    const gameOverModal = document.querySelector('.game-over.modal');
    const winnerName = document.querySelector('#winner-name');

    winnerName.textContent = data.winner.getName();
    gameOverModal.style.display = 'flex';
  };

  const handleGameStateChange = (data) => {
    if (data.gameState === GameState.notStarted) {
      renderMainMenu();
    } else if (data.gameState === GameState.placingShips) {
      renderShipPlacing(data);
    } else if (data.gameState === GameState.shotReceived) {
      if (data.player2.getIsAi()) {
        renderShot1Player(data);
      } else {
        renderShot2Players(data);
      }
    } else if (data.gameState === GameState.shotPrimed) {
      if (!data.player2.getIsAi()) {
        renderGameboards(
          data.activePlayer,
          data.activePlayer.getOpponent(),
          data.activePlayer
        );
      }
    } else if (data.gameState === GameState.gameOver) {
      renderEndScreen(data);
    }
  };

  const createEventListeners = () => {
    const gameOverToMainMenuButton = document.querySelector(
      '#game-over-to-main-menu'
    );
    gameOverToMainMenuButton.addEventListener('click', () => {
      const modal = document.querySelector('.game-over.modal');
      modal.style.display = 'none';
      renderMainMenu();
    });

    const pausedToMainMenuButton = document.querySelector(
      '#pause-to-main-menu'
    );
    pausedToMainMenuButton.addEventListener('click', () => {
      const modal = document.querySelector('.pause.modal');
      modal.style.display = 'none';
      renderMainMenu();
    });

    const continueButton = document.querySelector('.continue.modal-button');
    continueButton.addEventListener('click', () => {
      const pauseModal = document.querySelector('.pause.modal');
      pauseModal.style.display = 'none';
    });

    const pausedToShipPlaceButton = document.querySelector(
      '#pause-to-ship-place'
    );
    pausedToShipPlaceButton.addEventListener('click', () => {
      const modal = document.querySelector('.pause.modal');
      modal.style.display = 'none';
      events.emit('restartGame');
    });

    const gameOverToShipPlaceButton = document.querySelector(
      '#game-over-to-ship-place'
    );
    gameOverToShipPlaceButton.addEventListener('click', () => {
      const modal = document.querySelector('.game-over.modal');
      modal.style.display = 'none';
      events.emit('restartGame');
    });
  };

  createEventListeners();
  events.on('gameStateChange', handleGameStateChange);
  renderMainMenu();
};

export default UserInterface;
