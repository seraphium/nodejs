/**
 * Created by jackiezhang on 15/5/24.
 */

var Chat = function(socket) {
    this.socket = socket;
}

Chat.prototype.sendMessage = function(room, text) {
    var message = {
        room: room,
        text: text
    };
    console.log ('message:' + message.text);
    this.socket.emit('message', message);
};

Chat.prototype.createRoom = function()
{
    this.socket.emit('createRoom', "");
}

Chat.prototype.sendmotion = function(room, id, x, y, z, a, b, g, landscape) {
    var accePara = {
        room: room,
        socketid: id,
        accelerationX: x,
        accelerationY: y,
        accelerationZ: z,
        rotationAlpha: a,
        rotationBeta: b,
        rotationGamma: g,
        landscape: landscape
    };

    this.socket.emit('motion', accePara);
};

Chat.prototype.changeRoom = function(room) {
    this.socket.emit('join', {
        newRoom: room
    });
};

Chat.prototype.processCommand = function(command) {
    var words = command.split(' ');
    var command = words[0]
        .substring(1, words[0]. length)
        .toLowerCase();

    var message = false;

    switch(command) {
        case 'join':
            words.shift();
            var room = words.join(' ');
            this.changeRoom(room);
            break;
        case 'nick':
            words.shift();
            var name = words.join(' ');
            this.socket.emit('nameAttempt', name);
            break;
        default:
            message = 'UnRecognized command.';
    }

    return message;
};


