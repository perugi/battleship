const UserInterface = (events) => {
  const renderStartScreen = () => {
    console.log('UI');
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

  const renderGameScreen = () => {};

  return {
    renderStartScreen,
  };
};

export default UserInterface;
