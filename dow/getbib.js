//mongoos
var mongoose = require('mongoose');
var db = process.env.MONGODB_URI || 'mongodb://localhost/bib';
mongoose.connect(db);

var request = require('request-promise')
var cheerio = require('cheerio')
var Promise = require('bluebird')
mongoose.Promise = Promise
var Product = require('../Product')
Promise.promisifyAll(mongoose);

var baseUrlb = 'http://www.bibendum-wine.co.uk/shop?limit=30&p='
//var baseUrle = '&product_type=4046' // wines -d
//var baseUrle = '&product_type=4045' // spirits
//var baseUrle = '&product_type=4047' // beers
var baseUrle = '&product_type=4050' // liqueurs
var i = 1;
var max = 1;

function getProducts(page){
  console.log("Lefutott");
	return request.get('http://www.bibendum-wine.co.uk/shop?limit=30&p=' +  page + '&product_type=4050')
	.then(function(results){
    console.log("Lefutott2");
		var $ = cheerio.load(results)
		var links = []
		$('.category-products ul li > a').each(function(i, el){
      //console.log("Link: ",$(this).attr('href').toString());
			links.push($(this).attr('href').toString())
		})
		return links
	})
	.then(function(links){
    console.log("Lefutott: " + i + "szer!");
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
    if (i === max) {
      return console.log("All done")
    }
    i = i+1;
    return getProducts(i);
	})
	.catch(function(err){
		console.log(err)
    i = i+1;
	})
}

function parsePage(html){
	var $ = cheerio.load(html)
  var img = $('.product-image img').attr('src').toString()
	var category = "liqueur"
  var name = $('.product-name').text().trim();
	var details = name.toLowerCase(); //name.toLowerCase(); // $($('.attributes_1 li span')).text().trim().toLowerCase();
  var capacity = $($('.attributes_1 li')).text().trim().toLowerCase();
  capacity = capacity.slice(capacity.search('bottle size')+12)

  if (capacity.search('cl') !== -1) {
    capacity = capacity.slice(0,capacity.search('cl')-1);
    capacity = parseFloat(capacity)*10;
  }
  else if (capacity.search('litres') !== -1) {
    capacity = capacity.slice(0,capacity.search('litres')-1)
    capacity = parseFloat(capacity)*1000;
  }
	else {
		capacity = parseFloat(capacity)*100;
	}

  var country = $($('.attributes_1 li')).text().trim().toLowerCase();
  var sub_category = "other"
 //wine sorter
 //console.log("details: " + details);
 /*
  if (details.search('red') !== -1 && details.search('still') !== -1) {
    sub_category = 'red'
  }
  else if (details.search('white') !== -1 && details.search('still') !== -1) {
    sub_category = 'white'
  }
  else if (details.search('rose') !== -1 && details.search('still') !== -1) {
    sub_category = 'rosé'
  }
  else if (details.search('champagne') !== -1) {
    sub_category = 'champagne'
  }
  else if (details.search('sparkling') !== -1) {
    sub_category = 'sparkling'
  }
  else if (details.search('sweet') !== -1) {
    sub_category = 'other'
  }
  else if (details.search('fortified') !== -1) {
    sub_category = 'fortified'
  }
  else {
    sub_category = 'other'
  }
*/
/*
//spirit sorter
	if ((details + ' ').search(' rum ') !== -1) {
		sub_category = 'rum';
	}
	else if ((details + ' ').search(' whisky ') !== -1 || (details + ' ').search(' whiskey ') !== -1 || (details + ' ').search(' bourbon ') !== -1) {
    if (country.search('usa') !== -1){
      sub_category = 'american whiskey';
    }
    else {
      sub_category = 'scotch whiskey';
    }
	}
	else if ((details + ' ').search(' gin ') !== -1) {
		sub_category = 'gin';
	}
	else if ((details + ' ').search(' brandy ') !== -1) {
		sub_category = 'brandy';
	}
	else if ((details + ' ').search(' vodka ') !== -1) {
		sub_category = 'vodka';
	}
	else if ((details + ' ').search(' mezcal ') !== -1) {
		sub_category = 'mezcal';
	}
	else if ((details + ' ').search(' tequila ') !== -1) {
		sub_category = 'tequila';
	}
	else if ((details + ' ').search(' cachaca ') !== -1) {
		sub_category = 'cachaca';
	}
	else if ((details + ' ').search(' cognac ') !== -1) {
		sub_category = 'cognac';
	}
	else {
		sub_category = 'other';;
	} */
/*
//beers
		sub_category = "bottled";
*/

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

  console.log("menteshez keszul");
  if (capacity === 0) {
    console.log("cap 0");
		return false;
	}
  else {
		prod.save(function (err) {
		  if (err) {
		    console.log(err);
        return
		  }
      else {
        console.log("saved");
        return
      }
		});
    //console.log("saved");
	}
}

// össz 40 boros lap
// össz 3 spirits lap
// össz 1 beer lap
getProducts(i);
