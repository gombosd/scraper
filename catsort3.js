var Product = require('./Product');
var mongoose = require('mongoose');
var db = process.env.MONGODB_URI || 'mongodb://localhost/AllProd';

  mongoose.connect(db, function(){
    console.log("eddig lefut");

    Product.find({}, function(err, prod){
      for (var i = 0; i < prod.length; i++) {
        (function(i){
          if (prod[i].name.toLowerCase().search("rosé") !== -1) {
            prod[i].sub_category = "rose"
          }

          prod[i].save(function(err, res){
            if (err) {
              console.log(prod2.name);
            }
            console.log(i);
          })
        })(i)
      }
    })
  });
