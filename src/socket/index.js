import { Server } from "socket.io";

const io = new Server();

export const configSocket = (httpServer) => {
  io.attach(httpServer);

  io.on("connection", (socket) => {
    console.log("A new socket connected...");
    let username = `User ${Math.round(Math.random() * 999999)}`;

    socket.emit("connected", username);
  });
};

export default io;
