// Server entry point — Clean Architecture Bootstrap
const path = require('path');
const ExpressServer = require('./src/frameworks/ExpressServer');
const PlayerRepository = require('./src/domain/PlayerRepository');
const PlayerUseCases = require('./src/usecases/PlayerUseCases');
const SocketController = require('./src/adapters/SocketController');

// Load environment variables
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '..', '..', '..', 'public');

// 1. Initialize repository
const playerRepository = new PlayerRepository();

// 2. Initialize use cases
const playerUseCases = new PlayerUseCases(playerRepository);

// 3. Initialize server frameworks
const expressServer = new ExpressServer(PORT, PUBLIC_DIR);

// 4. Initialize interface adapter
const socketController = new SocketController(expressServer.io, playerUseCases);

// 5. Wire adapter to framework
expressServer.registerSocketController(socketController);

// 6. Start server
expressServer.start();
