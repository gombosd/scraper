var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Product = require('./Product');

//mongoose
var mongoose = require('mongoose');
var db = process.env.MONGODB_URI || 'mongodb://localhost/matth';
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

var dellist;

// Read the file.
var fs = require('fs')
var kk;
kk = fs.readFile("./needtodel.txt", 'utf8', function(err, data) {
  if (err) throw err;
	return data
});
console.log(kk);
/*
llist = dellist.split("\n")
console.log(llist);

app.delete('/delel', function(req, res){
	Product.find({}, function(err, prod){
		if(err){
			return res.json(err);
		}
		for (var i = 0; i < prod.length; i++) {
			if (list.indexOf(prod[i]._id.toString()) !== -1) {
				prod[i].remove(function(err){
					if (err) {
					  return res.json(err);
					}
					res.json({
						message: "prod removed"
					})
				})
			}
		}
		prod.save(function (err, prod) {
	    if (err) {
	  		return res.json(err);
	  	}
	  	res.json(prod);
	  });
	})
});
*/

/*
app.delete('/delmat', function(req, res){
	Product.find({}, function(err, prod){
		if(err){
			return res.json(err);
		}
		for (var i = 0; i < prod.length; i++) {
			if (prod[i].category = whine && prod[i].img.thumbnail.search("matthewclark.co.uk") !== -1) {
				prod[i].remove(function(err){
					if (err) {
					  return res.json(err);
					}
					res.json({
						message: "prod removed"
					})
				})
			}
		}
		prod.save(function (err, prod) {
	    if (err) {
	  		return res.json(err);
	  	}
	  	res.json(prod);
	  });
	})
});
*/

//app listener
app.listen(process.env.PORT || 3400, function () {
  console.log('Listening on port 3400!');
});
