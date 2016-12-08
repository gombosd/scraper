//mongoos
var mongoose = require('mongoose');
var db = process.env.MONGODB_URI || 'mongodb://localhost/amath';
mongoose.connect(db);

var request = require('request-promise')
var cheerio = require('cheerio')
var Promise = require('bluebird')
mongoose.Promise = Promise
var Product = require('./Product')
Promise.promisifyAll(mongoose);

var baseUrl = 'http://www.amathusdrinks.com/catalog/seo_sitemap/product/?p=' //10 -d

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



  if (header.search("corporate") !== -1) {

  }
//spirits
	else if (header.search("whisky") !== -1 || header.search("whiskey") !== -1) {
		sub_category = "whisky";
		category = "spirit";
	}
	else if (header.search("absinthe") !== -1) {
		sub_category = "absinthe";
		category = "spirit";
	}
	else if (header.search("aquavit") !== -1) {
		sub_category = "akvavit";
		category = "spirit";
	}
	else if (header.search("bitters") !== -1) {
		sub_category = "bitters";
		category = "spirit";
	}
	else if (header.search("brandy") !== -1) {
		sub_category = "brandy";
		category = "spirit";
	}
	else if (header.search("cachaça") !== -1) {
		sub_category = "cachaça";
		category = "spirit";
	}
	else if (header.search("gin") !== -1) {
		sub_category = "gin";
		category = "spirit";
	}
	else if (header.search("mezcal") !== -1) {
		sub_category = "mezcal";
		category = "spirit";
	}
	else if (header.search("rum") !== -1) {
		sub_category = "rum";
		category = "spirit";
	}
	else if (header.search("tequila") !== -1) {
		sub_category = "tequila";
		category = "spirit";
	}
	else if (header.search("vodka") !== -1) {
		sub_category = "vodka";
		category = "spirit";
	}
//liqueurs
	else if (header.search("liqueur") !== -1 && header.search("advocaat") !== -1) {
		sub_category = "advocaat";
		category = "liqueur";
	}
	else if (header.search("liqueur") !== -1 && header.search("aperitif") !== -1) {
		sub_category = "aperitif";
		category = "liqueur";
	}
	else if (header.search("liqueur") !== -1 && header.search("herbal") !== -1) {
		sub_category = "herbal";
		category = "liqueur";
	}
	else if (header.search("liqueur") !== -1 && header.search("cream") !== -1) {
		sub_category = "cream";
		category = "liqueur";
	}
	else if (header.search("liqueur") !== -1 && header.search("fruit") !== -1) {
		sub_category = "fruit";
		category = "liqueur";
	}
	else if (header.search("liqueur") !== -1 && header.search("coffee") !== -1) {
		sub_category = "coffee";
		category = "liqueur";
	}
	else if (header.search("liqueur") !== -1 && header.search("sambuca") !== -1) {
		sub_category = "sambuca";
		category = "liqueur";
	}
  else if (header.search("liqueur") !== -1) {
    sub_category = "other";
		category = "liqueur";
  }
//whine
	else if (header.search("wine") !== -1) {
    category = "wine"
		if (header.search("fortified")) {
			sub_category = "fortified"
		}
		else if (header.search("white")) {
			sub_category = "white"
		}
		else if (header.search("red")) {
			sub_category = "red"
		}
		else if (header.search("rosé")) {
			sub_category = "rosé"
		}
		else if (header.search("champagne")) {
			sub_category = "champagne"
		}
		else if (header.search("sparkling")) {
			sub_category = "sparkling"
		}
		else if (header.search("sweet")) {
			sub_category = "white"
		}
		else if (header.search("sake")) {
			sub_category = "sake"
		}
    else {
      sub_category = "other"
    }
	}
  else if (header.search("beer") !== -1) {
    category = "beer"
    if (header.search("cider") !== -1) {
      sub_category = "bottled cider"
    }
    else {
      sub_category = "bottled beer"
    }
  }
  else if (header.search("mixer") !== -1) {
    category = "mixer"
    if (header.search("water") !== -1) {
      sub_category = "water"
    }
    else if (header.search("juice") !== -1) {
      sub_category = "juice"
    }
    else {
      sub_category = "other"
    }
  }
  else if (sub_category = "sundries") {
    category = "sundries"
    if (header.search("syrup") !== -1) {
      sub_category = "syrup"
    }
    else if (header.search("purees") !== -1) {
      sub_category = "purees"
    }
    else {
      sub_category = "other"
    }
  }
	else {
		console.log(" "+header);
	}

	var prod = new Product ({
		name: name,
		category: category,
		sub_category: sub_category,
		capacity: capacity,
		approved: true,
		images: {
			thumbnail: img
		}
	});

	console.log("wur");
	if (category === undefined) {
		console.log("log3");
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
