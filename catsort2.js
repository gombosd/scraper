var Product = require('./Product');
var mongoose = require('mongoose');
var db = process.env.MONGODB_URI || 'mongodb://localhost/Products';

  mongoose.connect(db, function(){
    console.log("eddig lefut");
    var list = [];

    Product.find({}, function(err, prod){
      for (var i = 0; i < prod.length; i++) {
        if (prod[i].category === "beer" && prod[i].sub_category === "cider" && prod[i].capacity < 5000) {
          prod[i].sub_category = "bottled cider"

          prod[i].save(function(err, res){
            if (err) {
              console.log(prod2.name);
            }
            console.log(i);
          })
        }
        else if (prod[i].category === "beer" && prod[i].sub_category !== "cider" && prod[i].capacity < 5000) {
          prod[i].sub_category = "bottled beer"

          prod[i].save(function(err, res){
            if (err) {
              console.log(prod2.name);
            }
            console.log(i);
          })
        }
        else if (prod[i].category === "beer") {
          prod[i].sub_category = "other"

          prod[i].save(function(err, res){
            if (err) {
              console.log(prod2.name);
            }
            console.log(i);
          })
        }
      }
    })
  });
