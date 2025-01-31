# battleship
An implementation of the classic Battleship game in Vanilla HTML, CSS and JavaScript.

💻 [Live Demo](https://perugi.github.io/battleship/) 💻

![screenshot](https://github.com/user-attachments/assets/7367ab46-bc93-493e-aa75-fecc0660bd59)

## 💡 Features
- Single and Local Multiplayer modes.
- Ship placing using drag&drop and random placement.
- AI shooting automatically (randomly), when it's turn.
- Gameboard status showing active/sunken ships, hits and misses.

## 🛠️ Technologies, Tools, Design Approaches
- HTML, vanilla CSS and JS.
- Test Driven Development for all non-UI modules. Jest used as a unit testing library
- Module pattern used for design of all JS logic.
- Logic and User Interface modules separated using a pub/sub events package (@perugi/events)
- User Interface implemented as a stateless module, complete game is playable through the console.
- Webpack bundler, ESlint and Prettier, used as part of my standard vanilla web toolchain.
