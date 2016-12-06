var fs = require('fs')
var Product = require('./Product');
var mongoose = require('mongoose');
var db = process.env.MONGODB_URI || 'mongodb://localhost/Products';

fs.readFile("./needtodel.txt", 'utf8', function(err, data) {
  if (err) throw err;
  console.log("hh");
  list = data.split('\n')
  delete list[list.length-1]
  //console.log(list);


  mongoose.connect(db, function(){
    console.log("eddig lefut");
    //Product.remove({_id: mongoose.Types.ObjectId("583ee625e9edc46a81663d4c")}, function(err, res){ console.log(res) })*/
    //console.log(mongoose.Types.ObjectId("583ee625e9edc46a81663d4c"));
    Product.remove({oid: {$in: list}}, function(err, prod){
      console.log(prod);
    });


    /*  Product.find({}, function(err, prod){
        for (var i = 0; i < prod.length; i++) {
          (function(i){
            var newProd = prod[i].toObject()
            newProd.oid = newProd._id
            delete newProd._id
            delete newProd.__v
            //console.log(newProd);
            newProd.new = true;
            var creatProd = new Product (newProd)

            creatProd.save(function(){
              console.log("Saved: " + creatProd.name);
              prod[i].remove(function(err,res){
                console.log(err);
                //console.log(res);
                console.log("Deleted: " + prod[i].name);
              })
            })
          })(i)
        }
      }) */
      //console.log(prod);

  });
});
