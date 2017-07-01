var express = require('express');
var app = express();
var Db= require('mongodb').Db;
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
app.set('port', (process.env.PORT || 5000));
app.set('mongo_url', (process.env.PORT || 'mongodb://root:password@ds145302.mlab.com:45302/youtube_queue_server'));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
	
	MongoClient.connect(mongo_url, {native_parser:true}, function(err, db) {
	    assert.equal(null, err);
	    db.collection('playlists').find(function(err, result) {
		    assert.equal(null, err);
		    //res.send(result);
		    db.close();
	    });
	    response.send('hello world');
	});
		
});

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});


