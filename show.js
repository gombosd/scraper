var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var Product = require('./Product');

//mongoose
var mongoose = require('mongoose');
var db = process.env.MONGODB_URI || 'mongodb://localhost/products';
mongoose.connect(db);

//express middleware
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', function(req, res){
	Product.find({}, function(err, prod){
		if(err){
			return res.json(err);
		}
    console.log("dafuq");
		res.json(prod);
	})
});

app.get('/:category', function(req, res){
	Product.find({category: req.params.category}, function(err, prod){
		if(err){
			return res.json(err);
		}
    console.log("dafuq");
		res.json(prod);
	})
});

//app listener
app.listen(process.env.PORT || 3000, function () {
  console.log('Listening on port 3000!');
});
