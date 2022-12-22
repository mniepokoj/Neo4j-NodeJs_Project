var http = require('http');
var express = require('express');
var app = express();
var routes = require('./routes')(app);
var port = 8080;
app.set('view engine', 'ejs');


http.createServer(app).listen(port, function(){
                console.log('Express server listening on port ' + port);
});

