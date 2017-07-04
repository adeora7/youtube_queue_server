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
		var collectionP = db.collection('playlists');
		var all_playlists = [];
			
		var q1 = request.params.query;
		var q2 = '^'+request.params.query;
		
	    	var stream = collectionP.find({ $or: [ {"name": { $regex: q1, $options: 'i' }}, {"PID": {'$regex': q2 }}   ] }).limit(30).stream();
		
		stream.on("data", function(item){ 
		    	console.log("data came ");
			all_playlists.push(item);
		    
		});
	    	stream.on("end", function(item){ 
			console.log("That's it");
			response.send(all_playlists);
		});

	    	//response.send('hello world');
	});
		
});

app.post('/upload/playlist/', function(request, response){
	MongoClient.connect('mongodb://root:password@ds145302.mlab.com:45302/youtube_queue_server', {native_parser:true}, function(err,db){
		assert.equal(null, err);
		var collectionC = db.collection('counter');
		var counter = CollectionC.findOne();
		var currID = counter.playlists + 1;
		var collectionP = db.collection('playlists');

		//insert into playlists
		if( collectionP.insert({ PID: currID, name: request.params.name, videos: request.params.videos }) )
		{
			if(collectionC.update({},{ $inc: { playlists: 1 }  }))
			{
				response.send("success!");
			}
			else
			{
				response.send("failure!");
			}
		}
	});

});

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});


