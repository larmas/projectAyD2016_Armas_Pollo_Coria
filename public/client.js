var socket = io.connect('http://localhost:3000', {'forceNew':true});
    console.log("refresh");
    socket.on("refresh", function (data) {
      location.reload();
    });
    function play(action, value){
      console.log("emit desde newGame.jade"+action+" "+value);
      socket.emit("play", action, value);
    }