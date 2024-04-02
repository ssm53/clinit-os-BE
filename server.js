import { createServer } from "http";
import { configSocket } from "./src/socket/index.js";

import app from "./app.js";
const port = process.env.PORT || 8080;

const httpServer = createServer(app);
configSocket(httpServer);

httpServer.listen(port, () => {
  console.log(`App started; listening on port ${port}`);
});

// OLD WAY BEFORE WEB SOCKETS
// import app from "./app.js";
// const port = process.env.PORT || 8080;

// app.listen(port, () => {
//   console.log(`App started; listening on port ${port}`);
// });
