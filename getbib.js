//mongoos
var mongoose = require('mongoose');
var db = process.env.MONGODB_URI || 'mongodb://localhost/bib';
mongoose.connect(db);

var request = require('request-promise')
var cheerio = require('cheerio')
var Promise = require('bluebird')
mongoose.Promise = Promise
var Product = require('./Product')
Promise.promisifyAll(mongoose);

var baseUrlb = 'http://www.bibendum-wine.co.uk/shop?limit=30&p='
//var baseUrle = '&product_type=4046' // wines
//var baseUrle = '&product_type=4045' // spirits
var baseUrle = '&product_type=4047' // beers

var i = 1;

function getProducts(page){
  console.log("Lefutott");
	return request.get(baseUrlb +  page + baseUrle)
	.then(function(results){
    console.log("Lefutott2");
		var $ = cheerio.load(results)
		var links = []
		$('.category-products ul li > a').each(function(i, el){
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
    if (i === 1) {
      return console.log("All done")
    }
    i = i+1;
    return getProducts(i);
	})
	.catch(function(err){
		console.log(err)
		saveProducts(++page_num)
	})
}

function parsePage(html){
	var $ = cheerio.load(html)
  var img = $('.product-image img').attr('src').toString()
	var category = "beer"
  var name = $('.product-name').text().trim();
	var details =name.toLowerCase(); //name.toLowerCase(); // $($('.attributes_1 li span')).text().trim().toLowerCase();
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

  var sub_category;
/* //wine sorter
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
*/
/*
//spirit sorter
	if ((details + ' ').search(' rum ') !== -1) {
		sub_category = 'rum';
		//name = name.slice(details.search(' rum'),details.search(' rum')+5)
	}
	else if ((details + ' ').search(' whisky ') !== -1 || (details + ' ').search(' whiskey ') !== -1 || (details + ' ').search(' bourbon ') !== -1) {
		sub_category = 'whisky';
	}
	else if ((details + ' ').search(' gin ') !== -1) {
		sub_category = 'gin';
		//name = name.slice((details + ' ').search('gin')-1,(details + ' ').search('gin')+4)
	}
	else if ((details + ' ').search(' vodka ') !== -1) {
		sub_category = 'vodka';
		//name = name.slice((details + ' ').search('vodka')-1,(details + ' ').search('vodka')+4)
	}
	else if ((details + ' ').search(' tequila ') !== -1) {
		sub_category = 'tequila';
		//name = name.slice((details + ' ').search('tequila')-1,(details + ' ').search('tequila')+4)
	}
	else if ((details + ' ').search(' cachaca ') !== -1) {
		sub_category = 'cachaça';
		//name = name.slice((details + ' ').search('cachaca')-1,(details + ' ').search('cachaca')+4)
	}
	else {
		//console.log(details);
	}
*/
//beers
	if ((details + ' ').search(' pale ale ') !== -1) {
		sub_category = "pale ale";
	}
	else if ((details + ' ').search(' ale ') !== -1) {
		sub_category = "ale";
	}
	else if ((details + ' ').search(' lager ') !== -1) {
		sub_category = "lager";
	}

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

  if (sub_category === undefined ||  capacity === 0) {
		return false;
	}
  else {
		prod.save(function (err) {
		  if (err) {
		    console.log(err);
        return
		  }
      else {
        console.log(prod);
        return
      }
		});
	}
}

// össz 40 boros lap Craggy Range Kidnappers Chardonnay 2012
// össz 3 spirits lap --done
// össz 1 beer lap --done
getProducts(i);
