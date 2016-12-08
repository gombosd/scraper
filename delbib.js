var Product = require('./Product');
var mongoose = require('mongoose');
var db = process.env.MONGODB_URI || 'mongodb://localhost/Products';

  mongoose.connect(db, function(){
    console.log("eddig lefut");
    var list = [];

    Product.find({}, function(err, prod){
        for (var i = 0; i < prod.length; i++) {
          if (prod[i].images.thumbnail.search('www.amathusdrinks.com') !== -1) {
            list.push(prod[i].sub_category)
          }/*
          else {
          //console.log(prod[i].images.thumbnail);
            if (  prod[i].images.thumbnail === ("http://www.matthewclark.co.uk/images/default-image.png")) {
              list.push(prod[i]._id)
            }
          } */
        }
        console.log(list, list.length, prod.length);/*
        Product.remove({_id: {$in: list}}, function(err, prod){
          console.log(prod);
        }); */
      })
      //console.log(prod);

  });
