/**
 * Created by jackiezhang on 15/5/31.
 */
/**
 * Created by jackiezhang on 15/5/24.
 */
var socket = io.connect();
var client_id = 0;
var room;

function processUserMotion(chatApp, socket)
{
    if(window.DeviceMotionEvent)
    {
        window.addEventListener("devicemotion", function(){
            chatApp.sendmotion(room, event.accelerationIncludingGravity.x,
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



$(document).ready(function() {
    var chatApp = new Chat(socket);
    var uri = window.location.search;
    var urlAux = uri.split('=');
    room = urlAux[1];

    chatApp.changeRoom(room);

    socket.on('joinResult', function(result) {
        $('#room').text(result.room);
    });


    processUserMotion(chatApp, socket);

});