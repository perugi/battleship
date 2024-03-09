const ConsoleLogger = (events) => {
  events.on('newGame', (data) =>
    console.log(`New Game: ${JSON.stringify(data)}`)
  );

  events.on('shoot', (data) => console.log(`Shoot: ${JSON.stringify(data)}`));

  events.on('gameStateChange', (data) => {
    let log = '--- Game State Change ---\n';
    log += `Game State: ${data.gameState}\n`;
    log += `Shot: ${
      data.shot
        ? `${data.shot.shootingPlayer.getName()} | [${data.shot.x}, ${
            data.shot.y
          }] | ${data.shot.shipHit ? 'hit' : 'miss'}}`
        : 'null'
    }\n`;
    log += `Player 1: ${data.player1.toString()}\n`;
    log += `Player 2: ${data.player2.toString()}\n`;
    log += `Active Player: ${
      data.activePlayer ? data.activePlayer.getName() : 'null'
    }\n`;
    log += `Winner: ${data.winner ? data.winner.getName() : 'null'}\n`;
    console.log(log);
  });
};

export default ConsoleLogger;
