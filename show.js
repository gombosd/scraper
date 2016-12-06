var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var Product = require('./Product');

//mongoose
var mongoose = require('mongoose');
var db = process.env.MONGODB_URI || 'mongodb://localhost/Products';
mongoose.connect(db);

//express middleware
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', function(req, res){
	Product.find({}, function(err, prod){
		if(err){
			return res.json(err);
		}
    console.log(prod.length);
		res.json(prod);
	})
});

app.post('/listing', function(req, res){
	Product.find({}, function(err, prod){
		if(err || !req.body.category){
			return res.json("Lol, it lookes like something went wrong!");
		}
		var match = []
		for (var i = 0; i < prod.length; i++) {
			if (prod[i].category === req.body.category) {
				if (req.body.sub_category) {
					if (prod[i].sub_category === req.body.sub_category) {
						match.push({
							name: prod[i].name,
							capacity: prod[i].capacity
						})
					}
				}
				else {
					match.push({
						name: prod[i].name,
						capacity: prod[i].capacity
					})
				}
			}
		}
		res.json(match);
	})
});

app.delete('/delcat', function(req, res){
	Product.find({}, function(err, prod){
		if(err || !req.body.category){
			return res.json("Lol, it lookes like something went wrong!");
		}
		for (var i = 0; i < prod.length; i++) {
			if (prod[i].category === req.body.category) {
				var lol = prod[i].name
				prod[i].remove(function(err){
					if (err) {
						return console.log(err);
					}
					console.log(lol + " deleted");
				});
			}
		}
	})
});

//app listener
app.listen(process.env.PORT || 3500, function () {
  console.log('Listening on port 3500!');
});
