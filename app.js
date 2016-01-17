var express = require('express');
require('dotenv').load();
var app = express();
var server = require('http').Server(app);
var socketIo = require('socket.io');
var request = require('request');
var io = socketIo(server);

// middleware
var morgan = require('morgan');
app.use(morgan('dev'));

app.set('view engine', 'ejs');

app.use(express.static('./public'));

// routes
app.get('/', function(req, res) {
  res.render('index');
});

// game variables and stuff,  should probably move this and socket stuff to another file.  right now it's just local variables here on the server, but will be stored in database eventually.
var allPlayers = [];

Array.prototype.getIndexBy = function(name, value) {
  for (var i = 0; i < this.length; i++) {
    if (this[i][name] == value) {
      return i;
    }
  }
  return -1;
};

// socket stuff
io.on('connection', function(socket) {
  console.log('new connection');
  socket.on('new player', function(data) { //new player signs in
    console.log('connected: ', socket.conn.id);
    data.socket = socket.conn.id;
    allPlayers.push(data); //adds it to local array of players
    io.sockets.emit('update all players', allPlayers); //sends new data to everyone
  })
  socket.on('update player', function(data) {
    //insert updated player data in to allPlayers array (database eventually? or maybe just database after the game is over)
    index = allPlayers.getIndexBy("id", data.id); //find that player
    allPlayers[index].left = data.left; //update position
    io.sockets.emit('update all players', allPlayers); //send new data out to everyone
  });
  socket.on('disconnect', function(data) {
    socket = socket.conn.id
    console.log("got a disconnect at socket " + socket); //why does this log twice on disconnect?  who is that phantom disconnecter???
    index = allPlayers.getIndexBy("socket", socket); //find that player
    if (allPlayers[index]) {
      var player = allPlayers[index];
      var id = player.id;
      allPlayers.splice(index, 1);
    };
    io.emit('user disconnected', id);
  });
});



// listen up
var port = parseInt(process.env.PORT) || 8080;

server.listen(port, function() {
  console.log('i am a server.  i am listening on port ' + port);
});
