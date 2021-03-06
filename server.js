/**
 * Created by jackiezhang on 15/5/24.
 */

var http = require('http');

var fs = require('fs');

var path = require('path');

var mime = require('mime');


var chatServer = require('./lib/chat_server');

var cache = {};


function send404(response)
{
    response.writeHead(404, {
        'Content-Type' : 'text/plain'});
    response.write('Error 404: resource not found');
    response.end();

}

function sendFile(response, filePath, fileContents)
{
    response.writeHead(200, {
        'Content-Type': mime.lookup(path.basename(filePath))
    });
    response.end(fileContents);

}

function serverStatic(response, cache, absPath)
{
    if (cache[absPath])
    {
        sendFile(response, absPath, cache[absPath]);
    }
    else
    {
        fs.exists(absPath, function(exists)
        {
            if (exists) {
                fs.readFile(absPath, function (err, data) {
                    if (err) {
                        send404(response);
                    }
                    else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }

                });
            }
            else
            {
                send404(response);
            }

        });
    }
}


var server = http.createServer(function(request, response)
{
    var filePath = false;
    if (request.url == '/') {
        filePath = 'public/index.html';

    }
    else
    {
        var url = require('url');
        filePath = 'public' + url.parse(request.url).pathname;
        var query = url.parse(request.url, true).query;
        if (query.room != null)
        {
            var room = query.room;

            console.log("Client connect to room: " + room );
        }

    }

    var absPath = './' + filePath;
    serverStatic(response, cache, absPath);



});

server.listen(3000, function()
    {
        console.log("Server listening on port 3000.");
    }

)

chatServer.listen(server);

