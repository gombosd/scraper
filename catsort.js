var Product = require('./Product');
var Product2 = require('./Product2');
var mongoose = require('mongoose');
var db = process.env.MONGODB_URI || 'mongodb://localhost/Products';

  mongoose.connect(db, function(){
    console.log("eddig lefut");
    var list = [];

    Product2.find({}, function(err, prod){
      for (var i = 0; i < prod.length; i++) {
        (function(i){
          Product.findById(prod[i]._id, function(err2, prod2){
          if (prod2) {
            prod2.sub_category = prod[i].sub_category

            prod2.save(function(err, res){
              if (err) {
                console.log(prod2.name);
              }
              console.log(i);
            })
          }
          })
        })(i)
      }
    })
  });
