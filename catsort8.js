var Product = require('./Product');
var mongoose = require('mongoose');
var db = process.env.MONGODB_URI || 'mongodb://localhost/FixedAllProd';

  mongoose.connect(db, function(){
    console.log("eddig lefut");

    Product.find({}, function(err, prod){
      for (var i = 0; i < prod.length; i++) {
        (function(i){
          if (prod[i].images.normal) {
            if (prod[i].images.normal.search("amathusdrinks") !== -1) {
              prod[i].from = "amathusdrinks"
            }
            else if (prod[i].images.normal.search("enotriacoe") !== -1) {
              prod[i].from = "enotriacoe"
            }
            else if (prod[i].images.normal.search("thewhiskyexchange") !== -1) {
              prod[i].from = "thewhiskyexchange"
            }
            else if (prod[i].images.normal.search("bibendum") !== -1) {
              prod[i].from = "bibendum"
            }
            else if (prod[i].images.normal.search("matthewclark") !== -1) {
              prod[i].from = "matthewclark"
            }
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
