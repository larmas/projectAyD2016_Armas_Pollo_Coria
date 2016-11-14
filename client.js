var socket = io.connect('localhost:3000', {"forceNew": true});
socket.on("refresh", function (data) {
	location.reload(true);
});
function plays(action, value){
	socket.emit("play", action, value);
}