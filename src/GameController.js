import Player from './Player';

const GameController = (events) => {
  const players = [];
  let activePlayer = null;
  let winner = null;

  const newGame = (playerName) => {
    winner = null;
    players.push(Player(playerName, false));
    players.push(Player('Computer', true));
    players[0].setOpponent(players[1]);
    players[1].setOpponent(players[0]);
    [activePlayer] = players;

    // TODO implement a mechanism to position the ships. For now, just
    // place the ships on the board automatically
    players[0].placeShip(1, 0, 0, 'v');
    players[0].placeShip(2, 1, 0, 'h');
    players[1].placeShip(1, 0, 0, 'v');
    players[1].placeShip(2, 1, 0, 'h');

    if (events) {
      events.emit('gameStarted', {
        player1: players[0],
        player2: players[1],
      });
    }
  };

  const newGameEvent = (data) => {
    newGame(data.playerName);
  };

  const shoot = (x, y) => {
    if (!activePlayer) throw new Error('No active player');

    let shipHit;

    if (activePlayer.getIsAi()) {
      shipHit = activePlayer.shootAuto();
    } else {
      shipHit = activePlayer.shoot(x, y);
    }

    if (!shipHit) {
      activePlayer = activePlayer.getOpponent();
    }

    if (activePlayer.getOpponent().allSunk()) {
      winner = activePlayer;
      activePlayer = null;
    }

    if (events) {
      events.emit('shotReceived', {
        shot: { x, y },
        shipHit,
        player1: players[0],
        player2: players[1],
        activePlayer,
        ships1: players[0].getShips(),
        ships2: players[1].getShips(),
        shotsReceived1: players[0].getShotsReceived(),
        shotsReceived2: players[1].getShotsReceived(),
        winner,
      });
    }

    return winner !== null;
  };

  const shootEvent = (data) => {
    shoot(data.x, data.y);
  };

  if (events) {
    events.on('newGame', newGameEvent);
    events.on('shoot', shootEvent);
  }

  return {
    newGame,
    shoot,
    getPlayers: () => players,
    getActivePlayer: () => activePlayer,
    getWinner: () => winner,
  };
};

export default GameController;
