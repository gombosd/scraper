var Product = require('./Product');
var mongoose = require('mongoose');
var db = process.env.MONGODB_URI || 'mongodb://localhost/FixedAllProd';

  mongoose.connect(db, function(){
    console.log("eddig lefut");

    Product.find({}, function(err, prod){
      for (var i = 0; i < prod.length; i++) {
        (function(i){
          if (prod[i].capacity > 5000 && prod[i].category === "beer") {
            prod[i].sub_category = "draft"
            prod[i].save(function(err, res){
              if (err) {
                console.log(prod.name);
              }
              console.log(i);
            })
          }
        })(i)
      }
    })
  });
