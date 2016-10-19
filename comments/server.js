/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var fs = require('fs');
var path = require('path'); //node core mod https://nodejs.org/api/path.html
var express = require('express'); //node framework
var bodyParser = require('body-parser'); //helps pull post content from http requests
var app = express(); //define app using express

//__dirname global of directory this script runs from 
//path.join creates a path string out of all values passed in
var COMMENTS_FILE = path.join(__dirname, 'comments.json');

//set the port
app.set('port', (process.env.PORT || 3000));


//N.B 'use' binds middleware - http://expressjs.com/en/guide/using-middleware.html
//http://expressjs.com/en/guide/writing-middleware.html

//create a virtual path (where the path does not actually exist in the file system) for serving static assets directly in the app
//We 'specify' a mount path 
// '/' + __dirname + '/' public 
app.use('/', express.static(path.join(__dirname, 'public')));
//this lets us get the body from a post
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Additional middleware which will set headers that we need on each request.
app.use(function(req, res, next) {
	// Set permissive CORS header - this allows this server to be used only as
	// an API server in conjunction with something like webpack-dev-server.
	res.setHeader('Access-Control-Allow-Origin', '*');

	// Disable caching so we'll always get the latest comments.
	res.setHeader('Cache-Control', 'no-cache');
	next();
});

app.get('/api/comments', function(req, res) {
  	fs.readFile(COMMENTS_FILE, function(err, data) {
		
		if (err) {
	  		console.error(err);
	  		process.exit(1);
		}

		res.json(JSON.parse(data));
  	});
});

app.post('/api/comments', function(req, res) {
  fs.readFile(COMMENTS_FILE, function(err, data) {
	if (err) {
	  console.error(err);
	  process.exit(1);
	}
	var comments = JSON.parse(data);
	// NOTE: In a real implementation, we would likely rely on a database or
	// some other approach (e.g. UUIDs) to ensure a globally unique id. We'll
	// treat Date.now() as unique-enough for our purposes.
	var newComment = {
	  	id: Date.now(),
	  	author: req.body.author,
	  	text: req.body.text,
	};

	comments.push(newComment);
		fs.writeFile(COMMENTS_FILE, JSON.stringify(comments, null, 4), function(err) {
	  		if (err) {
				console.error(err);
				process.exit(1);
	  		}
	  		res.json(comments);
		});
  });
});


app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});