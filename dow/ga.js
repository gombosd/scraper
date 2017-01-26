//mongoos
var mongoose = require('mongoose');
var db = process.env.MONGODB_URI || 'mongodb://localhost/amath2';
mongoose.connect(db);

var request = require('request-promise')
var cheerio = require('cheerio')
var Promise = require('bluebird')
mongoose.Promise = Promise
var Product = require('../Product')
Promise.promisifyAll(mongoose);

var baseUrl = 'http://www.amathusdrinks.com/catalog/seo_sitemap/product/?p='

var i = 1;
var max = 47;

function getProducts(page){
  console.log("Lefutott");
	return request.get(baseUrl +  page)
	.then(function(results){
    console.log("Lefutott2");
		var $ = cheerio.load(results)
		var links = []
		$('.sitemap li a').each(function(i, el){
			links.push($(this).attr('href').toString())
		})
    //console.log(links);
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
	var $ = cheerio.load(html);

  var category;
	var sub_category;
	var img = $('#zoomimage').attr('href');
	var header = $('.breadcrumbs').text().toLowerCase().trim();
	//var wtype = $('#prodMeta dl dd').text().toLowerCase();
	var name = $($('.product-header-name h2')).text().trim();
  var country = $('.country').text().toLowerCase();

	var capacity = $($('.UnitV')).text().trim().toLowerCase();
  capacity = capacity.slice(capacity.search("Unit Volume:")+14)
	if (capacity.search('cl') !== -1) {
    capacity = capacity.slice(0,capacity.search('cl'))
    capacity = parseFloat(capacity)*10
    //console.log(capacity);
	}
  else if (capacity.search('ml') !== -1) {
    capacity = capacity.slice(0,capacity.search('ml'))
    capacity = parseFloat(capacity)
  }
  else if (capacity.search('l') !== -1) {
    capacity = capacity.slice(0,capacity.search('l'))
    capacity = parseFloat(capacity)*1000
  }
	else {
		console.log($('title').text(), capacity);
		return
	}

  header = " " + header + " ";
  //spirits
  if (header.search("corporate") !== -1) {

  }
	else if (header.search("whisky") !== -1 || header.search("whiskey") !== -1) {
    if (country.search("scotland") !== -1) {
      sub_category = "scotch whiskey";
    }
    else if (country.search("usa") !== -1) {
      sub_category = "american whiskey";
    }
    else {
      sub_category = "other whiskey";
    }
		category = "spirit";
	}
	else if (header.search(" absinthe ") !== -1) {
		sub_category = "others";
		category = "spirit";
	}
	else if (header.search(" aquavit ") !== -1) {
		sub_category = "others";
		category = "spirit";
	}
	else if (header.search(" bitters ") !== -1) {
		sub_category = "bitters";
		category = "spirit";
	}
	else if (header.search(" brandy ") !== -1) {
		sub_category = "brandy";
		category = "spirit";
	}
	else if (header.search(" cachaca ") !== -1) {
		sub_category = "cachaca";
		category = "spirit";
	}
	else if (header.search(" gin ") !== -1) {
		sub_category = "gin";
		category = "spirit";
	}
	else if (header.search(" mezcal ") !== -1) {
		sub_category = "mezcal";
		category = "spirit";
	}
	else if (header.search(" rum ") !== -1) {
		sub_category = "rum";
		category = "spirit";
	}
	else if (header.search(" tequila ") !== -1) {
		sub_category = "tequila";
		category = "spirit";
	}
	else if (header.search(" vodka ") !== -1) {
		sub_category = "vodka";
		category = "spirit";
	}
	else if (header.search("spirit") !== -1) {
		sub_category = "other";
		category = "spirit";
	}
//liqueurs
	else if (header.search("liqueur") !== -1) {
		category = "liqueur";
	}
//whine
	else if (header.search("wine") !== -1) {
    category = "wine"
		if (header.search("fortified" !== -1)) {
			sub_category = "fortified"
		}
		else if (header.search("white") !== -1) {
			sub_category = "white"
		}
		else if (header.search(" red ") !== -1) {
			sub_category = "red"
		}
		else if (header.search("rosé") !== -1) {
			sub_category = "rose"
		}
		else if (header.search("champagne") !== -1) {
			sub_category = "champagne"
		}
		else if (header.search("sparkling") !== -1) {
			sub_category = "sparkling"
		}
		else if (header.search(" sweet ") !== -1) {
			sub_category = "white"
		}
		else if (header.search(" sake ") !== -1) {
			sub_category = "sake"
		}
    else {
      sub_category = "other"
    }
	}
  //beer
  else if (header.search("beer") !== -1) {
    category = "beer"
    sub_category = "bottled"
  }
  //soft drinks
  else if (header.search("mixer") !== -1) {
    category = "softdrinks"
    if (header.search("water") !== -1) {
      sub_category = "water"
    }
    else if (header.search("juice") !== -1) {
      sub_category = "juices"
    }
    else {
      sub_category = "mixer"
    }
  }
  else if (header.search("sundries") !== -1) {
    category = "softdrinks"
    if (header.search("syrup") !== -1) {
      sub_category = "syrups"
    }
    else if (header.search("purees") !== -1) {
      sub_category = "pures"
    }
    else if (header.search("garnishes") !== -1) {
      sub_category = "garnish"
      category = "other"
    }
    else {
      sub_category = "mixer"
    }
  }
	else {
    category = "other"
		console.log(header);
	}

  if (category === undefined) {
		category = "other"
	}

	var prod = new Product ({
		name: name,
		category: category,
		sub_category: sub_category,
		capacity: capacity,
		approved: true,
		images: {
			normal: img
		}
	});

	console.log("wur");
	if (category === undefined) {
		console.log(name);
		return Promise.reject()
	}
	else {
		return prod.save(function (err) {
		  if (err) {
		    console.log("jipp" + err);
				return Promise.reject()
		  }
			console.log(".");
		});
//console.log(prod);
		// var lol = $('#productDefaultImage img').attr()
//		 console.log(prod);
	};
};


getProducts(i);
