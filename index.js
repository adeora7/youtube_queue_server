var express = require('express');
var Db= require('mongodb').Db;
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var bodyParser = require('body-parser'); 

var app = express();

app.set('port', (process.env.PORT || 5000));
app.set('mongo_url', (process.env.MONGO_URI || 'mongodb://root:password@ds145302.mlab.com:45302/youtube_queue_server'));

app.use(bodyParser.json({ type: 'application/*+json' }));
app.use(bodyParser.urlencoded({ extended: true }));

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
		var stream = collectionP.find({ $or: [ {"name":{$regex: q1, $options: 'i'}}, {$where: "/.*"+q1+".*/.test(this.PID)"} ]} ).limit(30).stream();	
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
		collectionC.findOne({}, function(err, doc){
			
			var currID = parseInt(doc.playlists,10) + 1;
			var collectionP = db.collection('playlists');
			var vids = JSON.parse(request.body.videos);	
			//insert into playlists
			if( collectionP.insert({ PID: currID, name: request.body.name, videos: vids }) )
			{
				if(collectionC.update({},{ $inc: { playlists: 1 }  }))
				{
					response.send("Success! Playlist uploaded to store with PID:"+currID);
				}
				else
				{
					response.send("Failed to upload playlist to store.");
				}
			}
			else
			{
				response.send("Playlist could not be uploaded to store.");
			}
		});
		
	});

});

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});


