import './reset.css';
import './styles.css';

import Utilities from '@perugi/web-utilities';
import Events from '@perugi/events';

import GameController from './GameController';
import UserInterface from './UserInterface';
import ConsoleLogger from './ConsoleLogger';

Utilities.renderGHLogo();

const events = Events();
const gameController = GameController(events);
const userInterface = UserInterface(events);
ConsoleLogger(events);

userInterface.renderStartScreen();
