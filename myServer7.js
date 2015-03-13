var fs = require('fs');
var http = require('http');
var url = require('url');
var ROOT_DIR = "html";
var path = require('path');
var readline = require('readline');

http.createServer(function (req,res)
{
	var urlObj = url.parse(req.url, true, false);
	
	//If this is our comments REST service
        if(urlObj.pathname.indexOf("comment") != -1)
        {
                console.log("comment route");
                if(req.method === "POST")
                {

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
		                
			res.writeHead(200);	//hopefully working?????
			res.end("");		//hopefully working?????
		}
		else if(req.method === "GET")
		{
			console.log("In GET");
		
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
			
		//	res.writeHead(200);
		//	res.end(JSON.stringify(itemArr));
		}
        }
 	else{

	fs.readFile(ROOT_DIR + urlObj.pathname, function(err, data)
	{	
		var thisname = path.extname(urlObj.pathname);

		if(urlObj.pathname.indexOf("getcity") != -1)
		{
			//Execute the REST service
			
			fs.readFile('html/cities.dat.txt', function(err,data)
			{
				if(err)
				{
					throw err;
				}
				var cities = data.toString().split("\n");
			
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

			//console.log("In REST Service");
		}
		else
		{
			if(err)
      		        {
                	        res.writeHead(404);
            	        	res.end(JSON.stringify(err));
                	       // console.log("ERROR");
        	                return;
	                }

			if(thisname == ".txt")
			{		
				res.setHeader("Content-Type", "text/plain");
			}
			
			res.writeHead(200);
			res.end(data);

			//Serve static files
		}
	});
	}
}).listen(80);

