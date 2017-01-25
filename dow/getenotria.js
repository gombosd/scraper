//mongoos
var mongoose = require('mongoose');
var db = process.env.MONGODB_URI || 'mongodb://localhost/eno';
mongoose.connect(db);

var request = require('request-promise')
var cheerio = require('cheerio')
var Promise = require('bluebird')
mongoose.Promise = Promise
var Product = require('../Product')
Promise.promisifyAll(mongoose);

//var cat = ['97', '98', '100', '101', '103', '120', '174'] // wines
//var sc = ['red', 'white', 'champagne', 'dessert', 'sparkling', 'fortified', 'rosé'];
//var cat = ['137','138','140','145','148','151','159','169','170','171','172','136'];
//var sc = ['gin','rum','vodka','brandy','other whiskey','scotch whiskey','tequila','mezcal','other','cachaca','other','other']
//var pagenumber = 1; //84 60 11 5 8 9 8 --wines
var cat = ['142']
var sc = ['other']
var pagenumber = 1; //18 17 15 8 12 13 | 7 2 1 2 1 6 --spirits
var a = 0; //0 1 2 3 4 5 6 wines | 0 1 2 3 4 5 6 7 8 9 10

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
    if (pagenumber === 29) {
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
  var category = "liqueur"
  var sub_category = sc[a]
  

  var name = $('.product-name h1').text().trim();
	var details = $('.wine-information').text().trim().toLowerCase();
  var capacity = details.slice(details.search('bottle:')+7,details.search('0cl'))
  capacity = parseFloat(capacity.trim())*10;
  //console.log(img);
  var country = $('.country').text().toLowerCase();

  if (country.search('united states') !== -1) {
    sub_category = "american whiskey"
  }

var prod = new Product({
    name: name,
		category: category,
		sub_category: sub_category,
    images: {
      normal: img
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
