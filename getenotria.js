//mongoos
var mongoose = require('mongoose');
var db = process.env.MONGODB_URI || 'mongodb://localhost/eno';
mongoose.connect(db);

var request = require('request-promise')
var cheerio = require('cheerio')
var Promise = require('bluebird')
mongoose.Promise = Promise
var Product = require('./Product')
Promise.promisifyAll(mongoose);

var cat = ['97', '98', '100', '101', '103', '120', '174'] // wines
var sc = ['red', 'white', 'champagne', 'dessert', 'sparkling', 'fortified', 'rosé'];
var pagenumber = 1; //83 58 11 5 8 9 7 --wines
var a = 0; //0-d

function getProducts(page){
  console.log("Lefutott");
	return request.get('http://www.enotriacoe.com/wine.html?cat=' + cat[a] + '&p=' + pagenumber)
	.then(function(results){
    console.log("Lefutott2");
		var $ = cheerio.load(results)
		var links = []
		$('.heading-name a').each(function(i, el){
			links.push($(this).attr('href').toString())
		})
		return links
	})
	.then(function(links){
		return Promise.all(links.map(function(link){
			return request.get(link)
		}))
	})
	.then(function(productPages){
    console.log("Lefutott3");
		return productPages.map(function(page){
			return parsePage(page)
		}).filter(function(page){
			return page !== false
		})
	})
  .then(function(){
    console.log("Lefutott4");
    if (pagenumber === 83) {
      return console.log("All done")
    }
    pagenumber = pagenumber+1;
    console.log(pagenumber);
    return getProducts(pagenumber);
	})
	.catch(function(err){
		console.log(err)
    pagenumber = pagenumber+1;
	})
}

function parsePage(html){
	var $ = cheerio.load(html)
  var img = $('.product-img-box img').attr('src')
  var category = "wine"
  var sub_category = sc[a]

  var name = $('.product-name h1').text().trim();
	var details = $('.wine-information').text().trim().toLowerCase();
  var capacity = details.slice(details.search('bottle:')+7,details.search('0cl'))
  capacity = parseFloat(capacity.trim())*10;
  //console.log(img);

var prod = new Product({
    name: name,
		category: category,
		sub_category: sub_category,
    images: {
      thumbnail: img
    },
		capacity: capacity,
		approved: true
  })

  if (capacity === 0) {
		return false;
	}
  else {
		prod.save(function (err) {
		  if (err) {
		    console.log(err);
        return
		  }
      else {
        //console.log(prod);
        console.log("saved");
        return
      }
		});
    //console.log(prod);
}
}

getProducts(pagenumber);
