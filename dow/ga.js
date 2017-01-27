//mongoos
var mongoose = require('mongoose');
var db = process.env.MONGODB_URI || 'mongodb://localhost/amath3';
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
	var header = $('.breadcrumbs').text()
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

  //header = " " + header + " ";
  //console.log(header);
  //spirits

  if (header.search("Corporate") !== -1) {

  }
//liqueurs
	else if (header.search("Liqueur") !== -1) {
		category = "liqueur";
	}
//whine
	else if (header.search("Wine") !== -1) {
    category = "wine"
		if (header.search("Fortified" !== -1)) {
			sub_category = "fortified"
		}
		else if (header.search("White") !== -1) {
			sub_category = "white"
		}
		else if (header.search("Red") !== -1) {
			sub_category = "red"
		}
		else if (header.search("Rosé") !== -1) {
			sub_category = "rose"
		}
		else if (header.search("Champagne") !== -1) {
			sub_category = "champagne"
		}
		else if (header.search("Sparkling") !== -1) {
			sub_category = "sparkling"
		}
		else if (header.search("Sweet") !== -1) {
			sub_category = "white"
		}
		else if (header.search("Sake") !== -1) {
			sub_category = "sake"
		}
    else {
      sub_category = "other"
    }
	}
  //beer
  else if (header.search("Beer") !== -1) {
    category = "beer"
    sub_category = "bottled"
  }
  //soft drinks
  else if (header.search("Mixer") !== -1) {
    category = "non-alcoholic"
    if (header.search("Water") !== -1) {
      sub_category = "water"
    }
    else if (header.search("Juice") !== -1) {
      sub_category = "juices"
    }
    else {
      sub_category = "mixer"
    }
  }
  else if (header.search("Sundries") !== -1) {
    category = "softdrinks"
    if (header.search("Syrup") !== -1) {
      sub_category = "syrups"
    }
    else if (header.search("Purees") !== -1) {
      sub_category = "pures"
    }
    else if (header.search("Garnishes") !== -1) {
      sub_category = "garnish"
      category = "other"
    }
    else {
      sub_category = "mixer"
    }
  }
  else if (header.search("Whisky") !== -1 || header.search("Whiskey") !== -1) {
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
	else if (header.search("Absinthe") !== -1) {
		sub_category = "others";
		category = "spirit";
	}
	else if (header.search("Aquavit") !== -1) {
		sub_category = "others";
		category = "spirit";
	}
	else if (header.search("Bitters") !== -1) {
		sub_category = "bitters";
		category = "spirit";
	}
	else if (header.search("Brandy") !== -1) {
		sub_category = "brandy";
		category = "spirit";
	}
	else if (header.search("Cachaca") !== -1) {
		sub_category = "cachaca";
		category = "spirit";
	}
	else if (header.search("Mezcal") !== -1) {
		sub_category = "mezcal";
		category = "spirit";
	}
	else if (header.search("Tequila") !== -1) {
		sub_category = "tequila";
		category = "spirit";
	}
	else if (header.search("Vodka") !== -1) {
		sub_category = "vodka";
		category = "spirit";
	}
	else if (header.search("Spirit") !== -1) {
		sub_category = "other";
		category = "spirit";
	}
	else if (header.search("Rum") !== -1) {
		sub_category = "rum";
		category = "spirit";
	}
	else if (header.search("Gin") !== -1) {
		sub_category = "gin";
		category = "spirit";
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
	else {/*
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
  */
  console.log(header);
  };
};


getProducts(i);
