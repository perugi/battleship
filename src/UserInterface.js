import GameState from './GameState';

const UserInterface = (events) => {
  const CELL_SIZE_PX = 40;

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
        cellElement.classList.add('gameboard-cell');
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

    if (showShips) {
      player.getPlacingStatus().forEach((ship) => {
        if (ship.placed) {
          const placedShipElement = document.createElement('div');
          placedShipElement.classList.add('placed-ship');
          placedShipElement.setAttribute('data-length', ship.length);
          if (ship.dir === 'h') {
            placedShipElement.style.height = `${CELL_SIZE_PX + 1}px`;
            placedShipElement.style.width = `${
              ship.length * CELL_SIZE_PX + 1
            }px`;
          } else {
            placedShipElement.style.height = `${
              ship.length * CELL_SIZE_PX + 1
            }px`;
            placedShipElement.style.width = `${CELL_SIZE_PX + 1}px`;
          }

          // Find the cell that is the origin of the placed ship in order to position
          // the ship element correctly.
          const originCell = document.querySelector(
            `[data-row="${ship.origin.y}"][data-col="${ship.origin.x}"]`
          );
          const originRect = originCell.getBoundingClientRect();
          placedShipElement.style.top = `${originRect.top}px`;
          placedShipElement.style.left = `${originRect.left}px`;

          gameboardDiv.appendChild(placedShipElement);
        }
      });
    }
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
    document.removeEventListener('click', passTurn);
  };

  const renderPassTurnScreen = (data) => {
    const passTurnModal = document.querySelector('.pass-turn.modal');

    const nextPlayer = passTurnModal.querySelector('#next-player');
    nextPlayer.textContent = data.activePlayer.getName();

    passTurnModal.style.display = 'flex';

    document.addEventListener('keydown', passTurn);
    document.addEventListener('click', passTurn);
  };

  const renderUnplacedShips = (player, unplacedShipsDiv) => {
    // eslint-disable-next-line no-param-reassign
    unplacedShipsDiv.innerHTML = '';

    player.getPlacingStatus().forEach((status, index) => {
      const unplacedShipElement = document.createElement('div');
      unplacedShipElement.classList.add('unplaced-ship');
      if (status.placed) {
        unplacedShipElement.classList.add('hidden');
      }
      unplacedShipElement.setAttribute('data-length', status.length);
      unplacedShipElement.setAttribute('data-index', index);
      unplacedShipElement.style.height = `${CELL_SIZE_PX}px`;
      unplacedShipElement.style.width = `${status.length * CELL_SIZE_PX}px`;
      unplacedShipsDiv.appendChild(unplacedShipElement);
    });
  };

  const renderShipPlacing = (data) => {
    const content = document.querySelector('#content');

    content.innerHTML = `
        <h1> Player Board [${data.activePlayer.getName()}] </h1>
        <div id="ship-placing-area">
          <div id="unplaced-ships"></div>
          <div id="player-gameboard"></div>
        </div>
        <div id="dragged-ship"></div>
        <button id="place-to-main-menu">Main Menu</button>
        <button id="place-random">Place Ships Randomly</button>
        <button id="clear-ships">Clear Ships</button>
    `;

    const unplacedShipsDiv = document.querySelector('#unplaced-ships');
    renderUnplacedShips(data.activePlayer, unplacedShipsDiv);

    const playerGameboardDiv = document.querySelector('#player-gameboard');
    renderGameboard(data.activePlayer, playerGameboardDiv, true);

    const shipPlacementIndicator = document.createElement('div');
    shipPlacementIndicator.classList.add('ship-placement-indicator');
    playerGameboardDiv.appendChild(shipPlacementIndicator);

    const gameboardCells = playerGameboardDiv.querySelectorAll('.cell');
    const legalShipPlacementsHV = { h: null, v: null };
    const adjacents = data.activePlayer.getAdjacents();

    let selectedShip = null;
    const draggedShip = document.querySelector('#dragged-ship');
    let draggedShipRotation = 'h';
    let legalPlacementCoords = null;

    const continueDragging = (e) => {
      draggedShip.style.top = `${e.clientY - CELL_SIZE_PX / 2}px`;
      draggedShip.style.left = `${e.clientX - CELL_SIZE_PX / 2}px`;

      const draggedLegalShipPlacements =
        legalShipPlacementsHV[draggedShipRotation];
      legalPlacementCoords = null;
      draggedLegalShipPlacements.forEach((legalShipPlacement) => {
        if (
          e.clientX > legalShipPlacement.left &&
          e.clientX < legalShipPlacement.right &&
          e.clientY > legalShipPlacement.top &&
          e.clientY < legalShipPlacement.bottom
        ) {
          shipPlacementIndicator.classList.add('active');
          draggedShip.classList.remove('dragging');
          shipPlacementIndicator.style.top = `${legalShipPlacement.top}px`;
          shipPlacementIndicator.style.left = `${legalShipPlacement.left}px`;
          legalShipPlacement.cell.classList.add('legal-ship-placement');
          legalPlacementCoords = {
            row: parseInt(legalShipPlacement.cell.dataset.row, 10),
            col: parseInt(legalShipPlacement.cell.dataset.col, 10),
          };
        }
      });

      if (!legalPlacementCoords) {
        shipPlacementIndicator.classList.remove('active');
        draggedShip.classList.add('dragging');
      }
    };

    const rotateShip = () => {
      draggedShipRotation = draggedShipRotation === 'h' ? 'v' : 'h';

      const selectedShipLength = parseInt(selectedShip.dataset.length, 10);

      if (draggedShipRotation === 'h') {
        draggedShip.style.height = `${CELL_SIZE_PX}px`;
        draggedShip.style.width = `${selectedShipLength * CELL_SIZE_PX}px`;
        shipPlacementIndicator.style.height = `${CELL_SIZE_PX + 1}px`;
        shipPlacementIndicator.style.width = `${
          selectedShipLength * CELL_SIZE_PX + 1
        }px`;
      } else {
        draggedShip.style.height = `${selectedShipLength * CELL_SIZE_PX}px`;
        draggedShip.style.width = `${CELL_SIZE_PX}px`;
        shipPlacementIndicator.style.height = `${
          selectedShipLength * CELL_SIZE_PX + 1
        }px`;
        shipPlacementIndicator.style.width = `${CELL_SIZE_PX + 1}px`;
      }
    };

    const rotateShipKey = (e) => {
      if (e.key === 'r' || e.key === 'R') {
        rotateShip();
      }
    };

    const endDragging = () => {
      if (legalPlacementCoords) {
        events.emit('placeShip', {
          shipIndex: parseInt(selectedShip.dataset.index, 10),
          x: legalPlacementCoords.col,
          y: legalPlacementCoords.row,
          direction: draggedShipRotation,
        });
      } else {
        selectedShip.classList.remove('hidden');
      }

      document.removeEventListener('mousemove', continueDragging);
      document.removeEventListener('mouseup', endDragging);
      document.removeEventListener('keydown', rotateShipKey);
      document.removeEventListener('wheel', rotateShip);

      if (draggedShipRotation === 'v') {
        rotateShip();
      }

      shipPlacementIndicator.classList.remove('active');
      draggedShip.classList.remove('dragging');

      legalShipPlacementsHV.h = null;
      legalShipPlacementsHV.v = null;
    };

    const generateLegalShipPlacements = (
      draggedShipLength,
      generateRotation
    ) => {
      // To generate a list of legal ship placements, we iterate over all of
      // the gameboard cells, checking if the ship could be placed there,
      // by looking at all cells that would compose it. For all cells, if the
      // adjacents array for that cell location is an empty set, it's
      // valid potential placement.
      const legalShipPlacements = new Set();
      gameboardCells.forEach((cell) => {
        const cellCol = parseInt(cell.getAttribute('data-col'), 10);
        const cellRow = parseInt(cell.getAttribute('data-row'), 10);

        const potentialPlacementAdjacents = [];

        // Ship would go out of bounds, cannot be a legal placement.
        if (generateRotation === 'h') {
          if (cellCol + draggedShipLength > adjacents.length) return;
        } else if (cellRow + draggedShipLength > adjacents.length) return;

        for (let i = 0; i < draggedShipLength; i++) {
          if (generateRotation === 'h') {
            potentialPlacementAdjacents.push(adjacents[cellRow][cellCol + i]);
          } else {
            potentialPlacementAdjacents.push(adjacents[cellRow + i][cellCol]);
          }
        }

        if (potentialPlacementAdjacents.every((adjacent) => !adjacent.size)) {
          const cellRect = cell.getBoundingClientRect();
          legalShipPlacements.add({
            cell,
            top: cellRect.top,
            bottom: cellRect.bottom,
            left: cellRect.left,
            right: cellRect.right,
          });
        }
      });

      return legalShipPlacements;
    };

    const startDragging = (e) => {
      e.preventDefault();

      selectedShip = e.target;
      selectedShip.classList.add('hidden');
      draggedShip.classList.add('dragging');
      const selectedShipLength = parseInt(selectedShip.dataset.length, 10);

      draggedShip.style.top = `${e.clientY - CELL_SIZE_PX / 2}px`;
      draggedShip.style.left = `${e.clientX - CELL_SIZE_PX / 2}px`;

      draggedShip.style.width = `${selectedShipLength * CELL_SIZE_PX}px`;
      shipPlacementIndicator.style.width = `${
        selectedShipLength * CELL_SIZE_PX + 1
      }px`;

      legalShipPlacementsHV.h = generateLegalShipPlacements(
        selectedShipLength,
        'h'
      );
      legalShipPlacementsHV.v = generateLegalShipPlacements(
        selectedShipLength,
        'v'
      );

      document.addEventListener('mousemove', continueDragging);
      document.addEventListener('mouseup', endDragging);
      document.addEventListener('keydown', rotateShipKey);
      document.addEventListener('wheel', rotateShip);
    };

    const unplacedShips = document.querySelectorAll(
      '.unplaced-ship:not(.hidden)'
    );
    unplacedShips.forEach((ship) => {
      ship.addEventListener('mousedown', startDragging);
    });

    const placeToMainMenuButton = document.querySelector('#place-to-main-menu');
    placeToMainMenuButton.addEventListener('click', () => {
      renderMainMenu();
    });

    const placeRandomShipsButton = document.querySelector('#place-random');
    placeRandomShipsButton.addEventListener('click', () => {
      events.emit('placeRandomShips');
    });

    const clearShipsButton = document.querySelector('#clear-ships');
    clearShipsButton.addEventListener('click', () => {
      events.emit('clearShips');
    });

    const continueButton = document.createElement('button');
    if (!data.player2.getIsAi() && data.activePlayer === data.player1) {
      continueButton.textContent = 'Confirm';
      continueButton.classList.add('place-player-2');
      continueButton.addEventListener('click', () => {
        events.emit('placingPlayer2');
      });
    } else {
      continueButton.textContent = 'Start Game';
      continueButton.classList.add('start-game');
      continueButton.addEventListener('click', () => {
        events.emit('startGame');
      });
    }
    if (data.activePlayer.getAllShipsPlaced()) {
      continueButton.disabled = false;
    } else {
      continueButton.disabled = true;
    }
    content.appendChild(continueButton);
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

  const renderGameboards = (
    player,
    opponent,
    activePlayer,
    allowShooting = false
  ) => {
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

    renderGameboard(opponent, opponentGameboard, false);
    if (allowShooting) {
      [...opponentGameboard.children].forEach((cell) => {
        cell.addEventListener('click', shoot);
      });
    }

    const pauseButton = document.querySelector('#pause-game');
    pauseButton.addEventListener('click', renderPauseScreen);
  };

  const renderShot1Player = async (data) => {
    if (data.shot) {
      if (data.shot.shootingPlayer.getIsAi()) {
        // Delay rendering of the AI shot in order to simulate AI thinking.
        await delay(1000);
      }

      if (data.activePlayer.getIsAi()) {
        renderGameboards(data.player1, data.player2, data.activePlayer, false);
      } else {
        renderGameboards(data.player1, data.player2, data.activePlayer, true);
      }

      // In a singleplayer game, the shot is automatically primed and, on AI moves, taken.
      events.emit('primeShot');
      if (data.activePlayer.getIsAi()) {
        events.emit('shoot');
      }
    } else {
      // This is the case when the game is started and the method is called
      // without any shot data. We render the gameboards interactively to allow
      // the player to shoot and prime the shot.
      events.emit('primeShot');
      renderGameboards(data.player1, data.player2, data.activePlayer, true);
    }
  };

  const renderShot2Players = async (data) => {
    if (data.shot) {
      if (data.activePlayer !== data.shot.shootingPlayer) {
        // Active player is not the one who shot - The turn needs to be passed,
        // so we render the gameboard without interactivity, wait for 1 second
        // for the player to observe his shot and then render the pass turn screen.
        renderGameboards(
          data.shot.shootingPlayer,
          data.shot.shootingPlayer.getOpponent(),
          data.shot.shootingPlayer,
          false
        );
        await delay(1000);
        renderPassTurnScreen(data);
      } else {
        // This case covers if the shot was a hit - we just render the shot and
        // prime the next one.
        renderGameboards(
          data.shot.shootingPlayer,
          data.shot.shootingPlayer.getOpponent(),
          data.shot.shootingPlayer,
          true
        );
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
          data.activePlayer,
          true
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
