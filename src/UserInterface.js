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

    const letterRow = document.createElement('div');
    letterRow.classList.add('gameboard-row');

    const emptyCell = document.createElement('div');
    emptyCell.classList.add('header-cell');
    letterRow.appendChild(emptyCell);

    for (let i = 1; i <= player.getShips().length; i++) {
      const numberCell = document.createElement('div');
      numberCell.classList.add('header-cell');
      numberCell.textContent = String.fromCharCode(64 + i);
      letterRow.appendChild(numberCell);
    }
    gameboardDiv.appendChild(letterRow);

    player.getShips().forEach((row, rowIndex) => {
      const gameboardRow = document.createElement('div');
      gameboardRow.classList.add('gameboard-row');

      const numberCell = document.createElement('div');
      numberCell.classList.add('header-cell');
      numberCell.textContent = rowIndex + 1;
      gameboardRow.appendChild(numberCell);

      row.forEach((ship, colIndex) => {
        const cellElement = document.createElement('div');
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

        gameboardRow.appendChild(cellElement);
      });

      gameboardDiv.appendChild(gameboardRow);
    });

    const renderShipOnBoard = (status) => {
      const shipElement = document.createElement('div');
      shipElement.classList.add('placed-ship');
      shipElement.setAttribute('data-length', status.ship.getLength());
      shipElement.setAttribute('data-index', status.index);
      shipElement.setAttribute('data-dir', status.dir);
      if (status.dir === 'h') {
        shipElement.style.height = `${CELL_SIZE_PX}px`;
        shipElement.style.width = `${
          status.ship.getLength() * (CELL_SIZE_PX - 1) + 1
        }px`;
      } else {
        shipElement.style.height = `${
          status.ship.getLength() * (CELL_SIZE_PX - 1) + 1
        }px`;
        shipElement.style.width = `${CELL_SIZE_PX}px`;
      }

      // Find the cell that is the origin of the ship in order to position
      // the ship element correctly.
      const originCell = gameboardDiv.querySelector(
        `[data-row="${status.origin.y}"][data-col="${status.origin.x}"]`
      );
      const gameboardRect = gameboardDiv.getBoundingClientRect();
      const originRect = originCell.getBoundingClientRect();
      shipElement.style.top = `${originRect.top - gameboardRect.top}px`;
      shipElement.style.left = `${originRect.left - gameboardRect.left}px`;

      gameboardDiv.appendChild(shipElement);
    };

    player.getShipStatus().forEach((status) => {
      if (showShips && status.placed) {
        renderShipOnBoard(status);
      }

      if (!showShips && status.ship.isSunk()) {
        renderShipOnBoard(status);
      }
    });
  };

  const renderMainMenu = () => {
    document.querySelector('.content').innerHTML = `
        <div class="gamemode-select-div">
          <button class="gamemode-select singleplayer active">Singleplayer</button>
          <button class="gamemode-select multiplayer">Multiplayer</button>
        </div>
        <div class="player-setup">
          <label for="player-name">Player Name:</label>
          <input type="text" id="player-name" class="player-name"/>
        </div>
        <div class="opponent-setup">
          <label for="opponent-name">Opponent Name:</label>
          <input type="text" id="opponent-name" class="opponent-name"/>
        </div>
        <button class="create-players">Confirm</button>
    `;

    let isSinglePlayer = true;

    const gamemodeSelectButtons = document.querySelectorAll('.gamemode-select');
    gamemodeSelectButtons.forEach((button) => {
      button.addEventListener('click', () => {
        gamemodeSelectButtons.forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');
        isSinglePlayer = button.classList.contains('singleplayer');

        if (!isSinglePlayer) {
          document.querySelector('.opponent-setup').style.display = 'flex';
        } else {
          document.querySelector('.opponent-setup').style.display = 'none';
        }
      });
    });

    const createPlayersButton = document.querySelector('.create-players');
    createPlayersButton.addEventListener('click', () => {
      const playerName = document.querySelector('.player-name').value;
      const opponentName = document.querySelector('.opponent-name').value;

      events.emit('createPlayers', {
        player1Name: playerName,
        player1IsAi: false,
        player2Name: isSinglePlayer ? 'Computer' : opponentName,
        player2IsAi: isSinglePlayer,
      });
    });
  };

  const passTurn = () => {
    const passTurnModal = document.querySelector('.pass-turn.modal');

    passTurnModal.style.display = 'none';
    document.removeEventListener('keydown', passTurn);
    document.removeEventListener('click', passTurn);
  };

  const renderPassTurnScreen = (data) => {
    const passTurnModal = document.querySelector('.pass-turn.modal');

    const nextPlayer = passTurnModal.querySelector('.next-player');
    nextPlayer.textContent = data.activePlayer.getName();

    passTurnModal.style.display = 'flex';

    document.addEventListener('keydown', passTurn);
    document.addEventListener('click', passTurn);
  };

  const renderUnplacedShips = (player, unplacedShipsDiv) => {
    // eslint-disable-next-line no-param-reassign
    unplacedShipsDiv.innerHTML = '';

    player.getShipStatus().forEach((status) => {
      const unplacedShipElement = document.createElement('div');
      unplacedShipElement.classList.add('unplaced-ship');
      if (status.placed) {
        unplacedShipElement.classList.add('hidden');
      }
      unplacedShipElement.setAttribute('data-length', status.ship.getLength());
      unplacedShipElement.setAttribute('data-index', status.index);
      unplacedShipElement.setAttribute('data-dir', 'h');
      unplacedShipElement.style.height = `${CELL_SIZE_PX}px`;
      unplacedShipElement.style.width = `${
        status.ship.getLength() * CELL_SIZE_PX
      }px`;
      unplacedShipsDiv.appendChild(unplacedShipElement);
    });
  };

  const renderShipPlacing = (data) => {
    const content = document.querySelector('.content');

    content.innerHTML = `
        <div class="game-guidance">Place your ships on the board.</div>
        <h1>${data.activePlayer.getName()}'s board</h1>
        <div class="ship-placing-area">
          <div class="unplaced-ships"></div>
          <div class="gameboard"></div>
        </div>
        <div class="dragged-ship"></div>
        <button class="place-to-main-menu">Main Menu</button>
        <button class="place-random">Place Ships Randomly</button>
        <button class="clear-ships">Clear Ships</button>
    `;

    const unplacedShipsDiv = document.querySelector('.unplaced-ships');
    renderUnplacedShips(data.activePlayer, unplacedShipsDiv);

    const playerGameboardDiv = document.querySelector('.gameboard');
    renderGameboard(data.activePlayer, playerGameboardDiv, true);

    let shipPlacementIndicator = document.createElement('div');
    shipPlacementIndicator.classList.add('ship-placement-indicator');
    playerGameboardDiv.appendChild(shipPlacementIndicator);

    let gameboardCells = playerGameboardDiv.querySelectorAll('.gameboard-cell');
    const legalShipPlacementsHV = { h: null, v: null };
    const tempAdjacents = data.activePlayer
      .getAdjacents()
      .map((row) => row.map((set) => new Set(set)));

    let selectedShip = null;
    const draggedShip = document.querySelector('.dragged-ship');
    let draggedShipRotation = 'h';
    let legalPlacementCoords = null;
    let isMove = false;

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
          const playerGameboardRect =
            playerGameboardDiv.getBoundingClientRect();
          shipPlacementIndicator.style.top = `${
            legalShipPlacement.top - playerGameboardRect.top
          }px`;
          shipPlacementIndicator.style.left = `${
            legalShipPlacement.left - playerGameboardRect.left
          }px`;
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
        shipPlacementIndicator.style.height = `${CELL_SIZE_PX}px`;
        shipPlacementIndicator.style.width = `${
          selectedShipLength * (CELL_SIZE_PX - 1) + 1
        }px`;
      } else {
        draggedShip.style.height = `${selectedShipLength * CELL_SIZE_PX}px`;
        draggedShip.style.width = `${CELL_SIZE_PX}px`;
        shipPlacementIndicator.style.height = `${
          selectedShipLength * (CELL_SIZE_PX - 1) + 1
        }px`;
        shipPlacementIndicator.style.width = `${CELL_SIZE_PX}px`;
      }
    };

    const rotateShipKey = (e) => {
      if (e.key === 'r' || e.key === 'R') {
        rotateShip();
      }
    };

    const endDragging = () => {
      if (isMove) {
        events.emit('removeShip', {
          shipIndex: parseInt(selectedShip.dataset.index, 10),
        });
        isMove = false;
      }

      if (legalPlacementCoords) {
        events.emit('placeShip', {
          shipIndex: parseInt(selectedShip.dataset.index, 10),
          x: legalPlacementCoords.col,
          y: legalPlacementCoords.row,
          direction: draggedShipRotation,
        });
      } else {
        selectedShip.classList.remove('hidden');

        if (draggedShipRotation === 'v') {
          rotateShip();
        }
      }

      document.removeEventListener('mousemove', continueDragging);
      document.removeEventListener('mouseup', endDragging);
      document.removeEventListener('keydown', rotateShipKey);
      document.removeEventListener('wheel', rotateShip);

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
          if (cellCol + draggedShipLength > tempAdjacents.length) return;
        } else if (cellRow + draggedShipLength > tempAdjacents.length) return;

        for (let i = 0; i < draggedShipLength; i++) {
          if (generateRotation === 'h') {
            potentialPlacementAdjacents.push(
              tempAdjacents[cellRow][cellCol + i]
            );
          } else {
            potentialPlacementAdjacents.push(
              tempAdjacents[cellRow + i][cellCol]
            );
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

    const areCoordsWithinGameboard = (row, col) => {
      const gameboardDimension = data.activePlayer.getShips().length;

      if (
        row >= 0 &&
        row < gameboardDimension &&
        col >= 0 &&
        col < gameboardDimension
      )
        return true;

      return false;
    };

    const startDragging = (e) => {
      e.preventDefault();

      console.log(e.target);

      selectedShip = e.target;
      selectedShip.classList.add('hidden');
      draggedShip.classList.add('dragging');
      const selectedShipLength = parseInt(selectedShip.dataset.length, 10);
      draggedShipRotation = selectedShip.dataset.dir;

      draggedShip.style.top = `${e.clientY - CELL_SIZE_PX / 2}px`;
      draggedShip.style.left = `${e.clientX - CELL_SIZE_PX / 2}px`;

      if (draggedShipRotation === 'h') {
        draggedShip.style.height = `${CELL_SIZE_PX}px`;
        draggedShip.style.width = `${selectedShipLength * CELL_SIZE_PX}px`;
        shipPlacementIndicator.style.height = `${CELL_SIZE_PX}px`;
        shipPlacementIndicator.style.width = `${
          selectedShipLength * (CELL_SIZE_PX - 1) + 1
        }px`;
      } else {
        draggedShip.style.height = `${selectedShipLength * CELL_SIZE_PX}px`;
        draggedShip.style.width = `${CELL_SIZE_PX}px`;
        shipPlacementIndicator.style.height = `${
          selectedShipLength * (CELL_SIZE_PX - 1) + 1
        }px`;
        shipPlacementIndicator.style.width = `${CELL_SIZE_PX}px`;
      }

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

    const startMoveDragging = (e, ship) => {
      isMove = true;

      // The adjacents and playerShips array are temporarily modified and gameboard
      // rerendered so that the picked up ship disappears and its cells become
      // valid placements. We are not copying the adjacents, but working on the
      // actual array, because it's used at start dragging to generate a map of
      // valid placements.
      const movedShip = data.activePlayer.getShipStatus()[ship.dataset.index];
      const tempPlayerShips = data.activePlayer
        .getShips()
        .map((row) => [...row]);
      const tempShipStatus = data.activePlayer
        .getShipStatus()
        .map((status) => ({ ...status }));

      for (let i = -1; i < movedShip.ship.getLength() + 1; i++) {
        for (let j = -1; j < 2; j++) {
          if (movedShip.dir === 'v') {
            if (
              areCoordsWithinGameboard(
                movedShip.origin.y + i,
                movedShip.origin.x + j
              )
            ) {
              tempAdjacents[movedShip.origin.y + i][
                movedShip.origin.x + j
              ].delete(movedShip.ship);
              tempPlayerShips[movedShip.origin.y + i][movedShip.origin.x + j] =
                null;
            }
          } else if (
            areCoordsWithinGameboard(
              movedShip.origin.y + j,
              movedShip.origin.x + i
            )
          ) {
            tempAdjacents[movedShip.origin.y + j][
              movedShip.origin.x + i
            ].delete(movedShip.ship);
            tempPlayerShips[movedShip.origin.y + j][movedShip.origin.x + i] =
              null;
          }
        }
      }

      tempShipStatus[ship.dataset.index].placed = false;

      const tempPlayer = {
        getShips: () => tempPlayerShips,
        getAdjacents: () => tempAdjacents,
        getShotsReceived: () => data.activePlayer.getShotsReceived(),
        getShipStatus: () => tempShipStatus,
      };

      renderGameboard(tempPlayer, playerGameboardDiv, true);

      shipPlacementIndicator = document.createElement('div');
      shipPlacementIndicator.classList.add('ship-placement-indicator');
      playerGameboardDiv.appendChild(shipPlacementIndicator);
      gameboardCells = playerGameboardDiv.querySelectorAll('.gameboard-cell');

      startDragging(e);
    };

    const placedShips = document.querySelectorAll(
      '.player-area gameboard>.placed-ship'
    );
    placedShips.forEach((ship) => {
      ship.addEventListener('mousedown', (e) => startMoveDragging(e, ship));
    });

    const placeToMainMenuButton = document.querySelector(
      'button.place-to-main-menu'
    );
    placeToMainMenuButton.addEventListener('click', () => {
      renderMainMenu();
    });

    const placeRandomShipsButton = document.querySelector(
      'button.place-random'
    );
    placeRandomShipsButton.addEventListener('click', () => {
      events.emit('placeRandomShips');
    });

    const clearShipsButton = document.querySelector('button.clear-ships');
    clearShipsButton.addEventListener('click', () => {
      events.emit('clearShips');
    });

    const continueButton = document.createElement('button');
    if (!data.player2.getIsAi() && data.activePlayer === data.player1) {
      continueButton.textContent = 'Confirm';
      continueButton.classList.add('place-player-2');
      continueButton.addEventListener('click', (e) => {
        e.stopPropagation();
        events.emit('placingPlayer2');
      });
    } else {
      continueButton.textContent = 'Start Game';
      continueButton.classList.add('start-game');
      continueButton.addEventListener('click', (e) => {
        e.stopPropagation();
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
    events.emit('shoot', {
      x: event.target.getAttribute('data-col'),
      y: event.target.getAttribute('data-row'),
    });
  };

  const renderPauseScreen = () => {
    const pauseModal = document.querySelector('.pause.modal');
    pauseModal.style.display = 'flex';
  };

  const renderShipStatus = (player, shipStatusDiv) => {
    player.getShipStatus().forEach((status) => {
      const shipStatus = document.createElement('div');
      shipStatus.classList.add('ship');
      if (status.ship.isSunk()) {
        shipStatus.classList.add('sunk');
      }

      for (let i = 0; i < status.ship.getLength(); i++) {
        const shipCell = document.createElement('div');
        shipCell.classList.add('cell');
        shipStatus.appendChild(shipCell);
      }

      shipStatusDiv.appendChild(shipStatus);
    });
  };

  const renderGameboards = (
    player,
    opponent,
    activePlayer,
    allowShooting = false
  ) => {
    document.querySelector('.content').innerHTML = `
        <div class=game-guidance><span class="active-player">${activePlayer.getName()}</span>'s turn to shoot</div>
          <h1> ${player.getName()}'s Board </h1>
          <div class="player-area ${activePlayer === player ? 'inactive' : ''}">
            <div class="ship-status"></div>
            <div class="gameboard"></div>
          </div>
          <h1> ${opponent.getName()}'s Board </h1>
          <div class="opponent-area ${
            activePlayer === opponent ? 'inactive' : ''
          }">
            <div class="ship-status"></div>
            <div class="gameboard"></div>
          </div>
        <button class="pause-game">Pause Game</button>
    `;

    const playerGameboard = document.querySelector('.player-area .gameboard');
    renderGameboard(player, playerGameboard, true);

    const opponentGameboard = document.querySelector(
      '.opponent-area>.gameboard'
    );
    renderGameboard(opponent, opponentGameboard, false);
    if (allowShooting) {
      const targetCells = opponentGameboard.querySelectorAll(
        '.gameboard-cell:not(.hit):not(.miss):not(.adjacent)'
      );
      targetCells.forEach((cell) => {
        cell.addEventListener('click', shoot);
      });
    }

    const playerShips = document.querySelector('.player-area .ship-status');
    renderShipStatus(player, playerShips);

    const opponentShips = document.querySelector('.opponent-area .ship-status');
    renderShipStatus(opponent, opponentShips);

    const pauseButton = document.querySelector('.pause-game');
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
        events.emit('primeShot');
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
      events.emit('primeShot');
      renderPassTurnScreen(data);
    }
  };

  const renderEndScreen = (data) => {
    const gameOverModal = document.querySelector('.game-over.modal');
    const winnerName = document.querySelector('.winner-name');

    winnerName.textContent = data.winner.getName();
    gameOverModal.style.display = 'flex';
  };

  const handleGameStateChange = (data) => {
    if (data.gameState === GameState.notStarted) {
      renderMainMenu();
    } else if (data.gameState === GameState.placingShips) {
      renderShipPlacing(data);
      if (data.activePlayer === data.player2) {
        renderPassTurnScreen(data);
      }
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
      '.game-over-to-main-menu.modal-button'
    );
    gameOverToMainMenuButton.addEventListener('click', () => {
      const modal = document.querySelector('.game-over.modal');
      modal.style.display = 'none';
      renderMainMenu();
    });

    const pausedToMainMenuButton = document.querySelector(
      '.pause-to-main-menu.modal-button'
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
      '.pause-to-ship-place.modal-button'
    );
    pausedToShipPlaceButton.addEventListener('click', () => {
      const modal = document.querySelector('.pause.modal');
      modal.style.display = 'none';
      events.emit('restartGame');
    });

    const gameOverToShipPlaceButton = document.querySelector(
      '.game-over-to-ship-place.modal-button'
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
