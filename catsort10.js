var Product = require('./Product');
var mongoose = require('mongoose');
var db = process.env.MONGODB_URI || 'mongodb://localhost/amath3';

  mongoose.connect(db, function(){
    console.log("eddig lefut");

    Product.find({}, function(err, prod){
      for (var i = 0; i < prod.length; i++) {
        (function(i){
          if (prod[i].sub_category === "rum") {
            console.log(prod[i].name);
          }
        })(i)
      }
    })
  });
