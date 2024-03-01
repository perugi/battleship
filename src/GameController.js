import Player from './Player';

const GameController = () => {
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
      // TODO once PUBSUB is implemented, this should call the win event.
      winner = activePlayer;
      activePlayer = null;
      return true;
    }

    return false;
  };

  return {
    newGame,
    shoot,
    getPlayers: () => players,
    getActivePlayer: () => activePlayer,
    getWinner: () => winner,
  };
};

export default GameController;
