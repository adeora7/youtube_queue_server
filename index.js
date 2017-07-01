var express = require('express');
var app = express();
var Db= require('mongodb').Db;
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

app.set('port', (process.env.PORT || 5000));
app.set('mongo_url', (process.env.MONGO_URI || 'mongodb://root:password@ds145302.mlab.com:45302/youtube_queue_server'));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/search/:query', function(request, response) {
	console.log(request.params.query);
	MongoClient.connect('mongodb://root:password@ds145302.mlab.com:45302/youtube_queue_server', {native_parser:true}, function(err, db) {
		assert.equal(null, err);
		var collection = db.collection('playlists');
		var all_playlists = []
		var q1 = request.params.query;
		var q2 = '^'+request.params.query;
	    	var stream = collection.find({ $or: [ {"name": {'$regex': q1 }}, {"PID": {'$regex': q2 }}   ] }).stream();
	    	stream.on("data", function(item){ 
		    	console.log("data came ");// + JSON.stringify(item));
			all_playlists.push(item);
		    
		});
	    	stream.on("end", function(item){ 
			console.log("That's it");
			response.send(all_playlists);
		});

	    	//response.send('hello world');
	});
		
});

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});


