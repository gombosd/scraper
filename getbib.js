//mongoos
var mongoose = require('mongoose');
var db = process.env.MONGODB_URI || 'mongodb://localhost/bib';
mongoose.connect(db);

var request = require('request-promise')
var cheerio = require('cheerio')
var Promise = require('bluebird')
var mongoose = require('mongoose')
mongoose.Promise = Promise
var Product = require('./Product')
Promise.promisifyAll(mongoose);

var baseUrlb = 'http://www.bibendum-wine.co.uk/shop?limit=30&p='
var baseUrle = '&product_type=4046'

function getProducts(page){
	return request.get(baseUrlb +  page + baseUrle)
	.then(function(results){
		var $ = cheerio.load(results)
		var links = []
		$('.category-products ul li > a').each(function(i, el){
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
		return productPages.map(function(page){
			return parsePage(page)
		}).filter(function(page){
			return page !== false
		})
	})
}

function parsePage(html){
	var $ = cheerio.load(html)
	var category = "wine"
  var name = $('.product-name').text().trim();
	var details = $($('.attributes_1 li span')).text().trim().toLowerCase();
  var capacity = $($('.attributes_1 li')).text().trim().toLowerCase();
  capacity = capacity.slice(capacity.search('bottle size')+12)

  if (capacity.search('cl')) {
    capacity = capacity.slice(0,capacity.search('cl')-1);
    capacity = parseInt(capacity)*10;
  }
  else if (capacity.search('litres')) {
    capacity = capacity.slice(0,capacity.search('litres')-1)
    capacity = parseInt(capacity)*1000;
  }

  var sub_category;

  if (details.search('red') !== -1 && details.search('still') !== -1) {
    sub_category = 'red'
  }
  else if (details.search('white') && details.search('still') !== -1) {
    sub_category = 'white'
  }
  else if (details.search('rose') && details.search('still') !== -1) {
    sub_category = 'rosé'
  }
  else if (details.search('champagne') !== -1) {
    sub_category = 'champagne'
  }
  else if (details.search('sparkling') !== -1) {
    sub_category = 'sparkling'
  }
  else if (details.search('sweet') !== -1) {
    sub_category = 'sweet'
  }
  else if (details.search('fortified') !== -1) {
    sub_category = 'fortified'
  }
  else {

  }

  var prod = new Product ({
    name: name,
		category: category,
		sub_category: sub_category,
		capacity: capacity,
		approved: true
  })

  if (sub_category === undefined ||  capacity === 0) {
		return false;
	}
  else {
		prod.save(function (err) {
		  if (err) {
		    console.log(err);
		  }
      else {
        console.log(prod);
      }
		})
	}
}

//össz 40 boros lap
for (var i = 1; i <= 5; i++) {
  getProducts(i);
};
