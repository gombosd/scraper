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
    console.log("lefut");
		res.json(prod);
	})
});

app.put('/shorting',function(req, res){
  Product.find({}, function(err, prod){
		if(err){
			return res.json(err);
		}
    for (var i = 0; i < prod.length; i++) {
      var sn = prod[i].name.toLowerCase();
      sn = sn.replace(/\s+/g, '');
      sn = sn.replace(/\'/gi, '');
      sn = sn.replace(/\./gi, '');
      sn = sn.replace(/\°/gi, '');
      prod[i].shortname = sn;
      prod[i].save(function (err, prod) {
  	    if (err) {
  	  		return res.json(err);
  	  	}
  	  });
    }
    res.send("all sorted")
	})
});

//app listener
app.listen(process.env.PORT || 8080, function () {
  console.log('Listening on port 8080!');
});
