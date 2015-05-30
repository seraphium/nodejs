/**
 * Created by jackiezhang on 15/5/24.
 */


function divEscapedContentElement(message) {
    return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
    return $('<div></div>').html('<i>' + message + '</i>');
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

function processUserMotion(chatApp, socket)
{
    if(window.DeviceMotionEvent)
    {
        window.addEventListener("devicemotion", function(){
            chatApp.sendmotion($('#room').text(), event.accelerationIncludingGravity.x,
                event.accelerationIncludingGravity.y,
                event.accelerationIncludingGravity.z,
                event.rotationRate.alpha,
                event.rotationRate.beta,
                event.rotationRate.gamma
             );
        }, false);
    }else{
        console.log("DeviceMotionEvent is not supported");
    }

}

var x = 0, y = 0,
    vx = 0, vy = 0,
    ax = 0, ay = 0;

var sphere = document.getElementById("sphere");

function boundingBoxCheck(){
    if (x<0) { x = 0; vx = -vx; }
    if (y<0) { y = 0; vy = -vy; }
    if (x>document.documentElement.clientWidth-20) { x = document.documentElement.clientWidth-20; vx = -vx; }
    if (y>document.documentElement.clientHeight-20) { y = document.documentElement.clientHeight-20; vy = -vy; }

}

function processSphere(message)
{
    ax = message.accelerationX * 5;
    ay = message.accelerationY * 5;

}
var socket = io.connect();
var client_id = 0;

$(document).ready(function() {
    var chatApp = new Chat(socket);

    socket.on('serverIpId', function (result) {
        var url = "http://" + result.ip + ":3000/client.html?cid=" + result.id;
        $('#id').text("id:" + result.id);
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
        var landscapeOrientation = window.innerWidth/window.innerHeight > 1;
        if ( landscapeOrientation) {
            vx = vx + ay;
            vy = vy + ax;
        } else {
            vy = vy - ay;
            vx = vx + ax;
        }
        vx = vx * 0.98;
        vy = vy * 0.98;
        y = parseInt(y + vy / 50);
        x = parseInt(x + vx / 50);

        boundingBoxCheck();
        if (sphere != null)
        {
            sphere.style.top = y + "px";
            sphere.style.left = x + "px";

        }


    }, 25);

    processUserMotion(chatApp, socket);

});