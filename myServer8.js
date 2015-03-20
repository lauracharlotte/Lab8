var express = require('express');
var https = require('https');
var http = require('http');
var bodyParser = require('body-parser');
var fs = require('fs');
var url = require('url');
var app = express();

var basicAuth = require('basic-auth-connect');
var auth = basicAuth (function(user, pass)
{
	return((user === 'cs360')&&(pass==='test'));
});

app.use(bodyParser.json());
var options = 
{
	host: '127.0.0.1',
	key: fs.readFileSync('ssl/server.key'),
	cert: fs.readFileSync('ssl/server.crt')
};
http.createServer(app).listen(80);
https.createServer(options, app).listen(443);
app.get('/', function(req,res)
{
	res.send("Get Index");
});
app.use('/',express.static('./html',{maxAge: 60*60*1000}));
app.get('/getcity', function(req,res)
{
	console.log("In getcity route");
	//res.json([{city:"Price"},{city:"Provo"}]);
	var urlObj = url.parse(req.url,true,false);
	fs.readFile('html/cities.dat.txt', function(err,data)
	{
		if(err) 
 		{ 
 			throw err; 
 		} 
 		var cities = data.toString().split("\n"); 
 			 
 
 		//var myRe = new RegExp("^"+urlObj.query["q"]); 
 		var myRe = urlObj.query["q"]; //Idk whether to use this one or the one above 
 
 
 		var jsonresult = []; 
 
 
 		for(var i = 0; i < cities.length; i++) 
 		{ 
 			var result = cities[i].search(myRe); 
 			if(result != -1) 
 			{	 
 				jsonresult.push({city:cities[i]}); 
 			} 
 		} 
 		res.writeHead(200); 
 		res.end(JSON.stringify(jsonresult)); 
	});
});
app.get('/comment', function(req, res)
{
	console.log("In comment route");
	console.log("IN GET");

	//console.log(req.body.Name);
	//console.log(req.body.Comment);

//read all of the database entries and return them in a JSON array 
 	var MongoClient = require('mongodb').MongoClient; 
 	MongoClient.connect("mongodb://localhost/weather",function(err, db) 
 	{ 
 		if(err) throw err; 
 		db.collection("comments", function(err, comments) 
 		{ 
 			comments.find(function(err, items) 
 			{ 
 				items.toArray(function(err, itemArr) 
 				{ 
 					console.log("Document Array: "); 
 					console.log(itemArr); 
 					res.writeHead(200); 
 					res.end(JSON.stringify(itemArr)); 
 				}); 
 			}); 
		}); 
 	}); 
//

});
app.post('/comment',auth, function(req, res)
{
	console.log("In POST comment route");
	console.log(req.user);
	console.log("Remote User");
	console.log(req.remoteUser);

	console.log(req.body);


	var jsonData = ""; 
 	req.on('data', function(chunk) 
 	{ 
 		jsonData += chunk;	 
 	}); 
 	req.on('end', function() 
 	{ 
 		var reqObj = JSON.parse(jsonData); 
 		console.log(reqObj); 
 		console.log("Name: "+reqObj.Name); 
 		console.log("Comment: "+reqObj.Comment); 
 			 
 		//Now put it into database 
 		var MongoClient = require('mongodb').MongoClient; 
 		MongoClient.connect("mongodb://localhost/weather", function(err, db) 
       		{	 
 			if(err) throw err; 
                      	db.collection('comments').insert(reqObj,function(err,records){ 
                      	console.log("Record added as "+records[0]._id); 
                  	}); 
 		}); 
 	}); 
	console.log("POST comment route");
	
	res.writeHead(200);
	res.end("{}");
	//res.status(200);
	//res.end();
});
