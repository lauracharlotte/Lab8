var fs = require('fs');
var http = require('http');
var url = require('url');
var ROOT_DIR = "html";
var path = require('path');

http.createServer(function (req,res)
{
	var urlObj = url.parse(req.url, true, false);
	fs.readFile(ROOT_DIR + urlObj.pathname, function(err, data)
	{
		//if(err)
		//{	
		//	res.writeHead(404);
		//	res.end(JSON.stringify(err));
		//	console.log("ERROR");
		//	return;
		//}
		
		var thisname = path.extname(urlObj.pathname);
		//console.log(thisname);
		//console.log("URL path "+urlObj.pathname);
		//console.log("URL search "+urlObj.search);
		//console.log("URL query "+urlObj.query["q"]);

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
}).listen(80);

