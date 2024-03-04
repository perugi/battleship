const ConsoleLogger = (events) => {
  events.on('newGame', (data) =>
    console.log(`New Game: ${JSON.stringify(data)}`)
  );

  events.on('gameStarted', (data) =>
    console.log(`Game Started: ${JSON.stringify(data)}`)
  );

  events.on('shoot', (data) => console.log(`Shoot: ${JSON.stringify(data)}`));

  events.on('shotReceived', (data) =>
    console.log(`Shot Received: ${JSON.stringify(data)}`)
  );
};

export default ConsoleLogger;
