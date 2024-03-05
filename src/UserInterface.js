const UserInterface = (events) => {
  const renderStartScreen = () => {
    document.querySelector('#content').innerHTML = `
        <label for="player-name">Player Name:</label>
        <input type="text" id="player-name" />
        <button id="start-game">Start Game</button>
    `;

    const startGameButton = document.querySelector('#start-game');
    startGameButton.addEventListener('click', () => {
      const playerName = document.querySelector('#player-name').value;
      events.emit('newGame', { playerName });
    });
  };

  const renderGameboards = (data) => {
    document.querySelector('#content').innerHTML = `
        <div>
          <h1> Player Board [${data.player1.getName()}] </h1>
          <div id="player-gameboard"></div>
        </div>
        <div>
          <h1> Opponents Board [${data.player2.getName()}] </h1>
        <div id="opponent-gameboard"></div>
    `;

    const playerGameboard = document.querySelector('#player-gameboard');
    const opponentGameboard = document.querySelector('#opponent-gameboard');

    data.player1.getShips().forEach((row) => {
      row.forEach((cell) => {
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell');
        if (cell) {
          cellElement.classList.add('ship');
        }
        playerGameboard.appendChild(cellElement);
      });
    });

    data.player2.getShips().forEach((row) => {
      row.forEach(() => {
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell');
        opponentGameboard.appendChild(cellElement);
      });
    });
  };

  const renderShot = (data) => {};

  const renderEndScreen = (data) => {};

  const handleGameStateChange = (data) => {
    if (data.gameState === 'notStarted') {
      renderStartScreen();
    } else if (data.gameState === 'gameStarted') {
      renderGameboards(data);
    } else if (data.gameState === 'shotReceived') {
      renderShot(data);
    } else if (data.gameState === 'gameOver') {
      renderEndScreen(data);
    }
  };

  events.on('gameStateChange', handleGameStateChange);

  return {
    renderStartScreen,
  };
};

export default UserInterface;
