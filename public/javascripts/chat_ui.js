/**
 * Created by jackiezhang on 15/5/24.
 */


function divEscapedContentElement(message) {
    return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
    return $('<div></div>').html('<i>' + message + '</i>');
}

function divNewSphere(id)
{
    return $('<div id="sphere' + id + '"></div>');
}

function processUserInput(chatApp, socket) {
    var message = $('#send-message').val();
    var systemMessage;

    if (message.charAt(0) == '/') {
        systemMessage = chatApp.processCommand(message);
        if (systemMessage) {
            $('#messages').append(divSystemContentElement(systemMessage));
        }
    } else {
        chatApp.sendMessage($('#room').text(), message);
        $('#messages').append(divEscapedContentElement(message));
        $('#messages').scrollTop($('#messages').prop('scrollHeight'));
    }

    $('#send-message').val('');
}

var client = {};
var sphereNum = 0;
var x = [], y = [],
    vx = [], vy = [],
    ax = [], ay = [], landscape = [];



function boundingBoxCheck(id){
    if (x[id]<0) { x[id] = 0; vx[id] = -vx[id]; }
    if (y[id]<0) { y[id] = 0; vy[id] = -vy[id]; }
    if (x[id]>document.documentElement.clientWidth-20)
        { x[id] = document.documentElement.clientWidth-20; vx[id] = -vx[id]; }
    if (y[id]>document.documentElement.clientHeight-20)
        { y[id] = document.documentElement.clientHeight-20; vy[id] = -vy[id]; }

}

function processSphere(message)
{
    var socketid = message.socketid;
    ax[client[socketid]] = message.accelerationX * 5;
    ay[client[socketid]] = message.accelerationY * 5;
    landscape[client[socketid]] = message.landscape;
}
var socket = io.connect();
var client_id = 0;

$(document).ready(function() {

    chatApp.createRoom();

    socket.on('serverIpRoom', function (result) {
        var url = "http://" + result.ip + ":3000/client.html?room=" + result.room;
        $('#id').text("room:" + result.room);
        jQuery('#qrcode').qrcode({width: 64, height: 64, text: url});
    });

    socket.on('nameResult', function(result) {
        var message;

        if (result.success) {
            message = 'You are now named as ' + result.name + '.';
        } else {
            message = result.message;
        }
        $('#messages').append(divSystemContentElement(message));
    });

    socket.on('joinResult', function(result) {
        $('#room').text(result.room);
        $('#messages').append(divSystemContentElement('Room changed.'));
    });
    socket.on('clientJoined', function(result) {
        client[result.socketid] = sphereNum;
        $('#grid').append(divNewSphere(sphereNum));
        x[sphereNum] = 0;
        y[sphereNum] = 0;
        vx[sphereNum] = 0;
        vy[sphereNum] = 0;
        ax[sphereNum] = 0;
        ay[sphereNum] = 0;

        sphereNum ++;

    });
    socket.on('message', function (message) {
       var newElement = $('<div></div>').text(message.text);
        $('#messages').append(newElement);
    });

    socket.on('motion', function (message) {
        processSphere(message);
    });

    socket.on('rooms', function(rooms) {
        $('#room-list').empty();
        for (var room in rooms) {
            room = room.substring(1, room.length);
            if (room != '') {
                $('#room-list').append(divEscapedContentElement(room));
            }
        }
        $('#room-list div').click(function() {
            chatApp.processCommand('/join ' + $(this).text());
            $('#send-message').focus();
        });
    });

    setInterval(function() {
        socket.emit('rooms');
    }, 1000);
    $('#send-message').focus();

    $('#send-form').submit(function() {
        processUserInput(chatApp, socket);
        return false;
    });

    setInterval( function() {
        for (var key in client)
        {
            var sphereid = client[key];
            if (landscape[sphereid]) {
                vx[sphereid] = vx[sphereid] + ay[sphereid];
                vy[sphereid] = vy[sphereid] + ax[sphereid];
            } else {
                vy[sphereid] = vy[sphereid] - ay[sphereid];
                vx[sphereid] = vx[sphereid] + ax[sphereid];
            }
            vx[sphereid] = vx[sphereid] * 0.98;
            vy[sphereid] = vy[sphereid] * 0.98;
            y[sphereid] = parseInt(y[sphereid] + vy[sphereid] / 50);
            x[sphereid] = parseInt(x[sphereid] + vx[sphereid] / 50);

            boundingBoxCheck(sphereid);
            var sphere = document.getElementById("sphere" + sphereid);
            if (sphere != null)
            {
                sphere.style.top = y + "px";
                sphere.style.left = x + "px";

            }
        }




    }, 25);


});