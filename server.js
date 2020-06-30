// server.js
// where everyone's data got sent to everyone else
require("dotenv").config()
const express = require("express");
const http = require("http");
const app = express();
const port = process.env.PORT || 3000;
var server = http.createServer(app);


// https://expressjs.com/en/starter/static-files.html
app.use(process.env.BASE, express.static(__dirname));
app.get(process.env.BASE,(request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

const listener = server.listen(port, () => {
  console.log(`Server is listening on port ${listener.address().port}`);
});

var io = require("socket.io")(server);

var serverData = {}; // everyone's data

function newConnection(socket) {
  console.log("new connection: " + socket.id);

  socket.on("client-start", onClientStart);
  socket.on("client-update", onClientUpdate);
  socket.on("disconnect", onClientExit);

  function onClientStart() {
    // send an update every 10 milliseconds
    setInterval(function() {
      socket.emit("server-update", serverData);
    }, 10);
  }

  // client is sending us an update
  function onClientUpdate(data) {
    serverData[socket.id] = data;
  }

  // bye bye
  function onClientExit() {
    delete serverData[socket.id];
    console.log(socket.id + " disconnected");
  }
}

console.log("listening...");
io.sockets.on("connection", newConnection);
