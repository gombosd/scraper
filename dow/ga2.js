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
  var header = [];
  for (var i = 0; i < 10; i++) {
    header.push($($('.breadcrumbs li a')[i]).text().trim().toLowerCase())
  }

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
var ob = false;
  //header = " " + header + " ";
  //console.log(header);
/*
  for (var i = 0; i < header.length; i++) {
    (function(i){*/
      //spirits
    //liqueurs
    if (header.indexOf("our brands") !== -1 || header.indexOf("corporate gifts") !== -1) {
      ob = true;
    }
    	if (header.indexOf("liqueurs") !== -1) {
    		category = "liqueur";
    	}
    //whine
    	else if (header.indexOf("wines") !== -1) {
        category = "wine"
    		if (header.indexOf("fortified") !== -1) {
    			sub_category = "fortified"
    		}
    		else if (header.indexOf("white") !== -1) {
    			sub_category = "white"
    		}
    		else if (header.indexOf("red") !== -1) {
    			sub_category = "red"
    		}
    		else if (header.indexOf("rosé") !== -1) {
    			sub_category = "rose"
    		}
    		else if (header.indexOf("champagne") !== -1) {
    			sub_category = "champagne"
    		}
    		else if (header.indexOf("sparkling") !== -1) {
    			sub_category = "sparkling"
    		}
    		else if (header.indexOf("sweet") !== -1) {
    			sub_category = "white"
    		}
    		else if (header.indexOf("sake") !== -1) {
    			sub_category = "sake"
    		}
        else {
          sub_category = "other"
        }
    	}
      //beer
      else if (header.indexOf("beers") !== -1) {
        category = "beer"
        sub_category = "bottled"
      }
      //soft drinks
      else if (header.indexOf("mixers") !== -1) {
        category = "non-alcoholic"
        if (header.indexOf("water") !== -1) {
          sub_category = "water"
        }
        else if (header.indexOf("juices") !== -1) {
          sub_category = "juices"
        }
        else {
          sub_category = "mixer"
        }
      }
      else if (header.indexOf("sundries") !== -1) {
        category = "non-alcoholic"
        if (header.indexOf("cocktail syrup's") !== -1) {
          sub_category = "syrup"
        }
        else if (header.indexOf("purees") !== -1) {
          sub_category = "pures"
        }
        else if (header.indexOf("garnishes") !== -1) {
          sub_category = "garnish"
          category = "other"
        }
        else if (name.toLowerCase().search("cordial") !== -1) {
          sub_category = "cordials"
        }
        else {
          sub_category = "mixer"
        }
      }
      else if (header.indexOf("whisky") !== -1 || header.indexOf("whiskey") !== -1) {
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
    	else if (header.indexOf("absinthe") !== -1) {
    		sub_category = "others";
    		category = "spirit";
    	}
    	else if (header.indexOf("aquavit") !== -1) {
    		sub_category = "others";
    		category = "spirit";
    	}
    	else if (header.indexOf("bitters") !== -1) {
    		sub_category = "bitters";
    		category = "spirit";
    	}
    	else if (header.indexOf("brandy") !== -1) {
    		sub_category = "brandy";
    		category = "spirit";
    	}
    	else if (header.indexOf("cachaça") !== -1) {
    		sub_category = "cachaca";
    		category = "spirit";
    	}
    	else if (header.indexOf("mezcal") !== -1) {
    		sub_category = "mezcal";
    		category = "spirit";
    	}
    	else if (header.indexOf("tequila") !== -1) {
    		sub_category = "tequila";
    		category = "spirit";
    	}
    	else if (header.indexOf("vodka") !== -1) {
    		sub_category = "vodka";
    		category = "spirit";
    	}
    	else if (header.indexOf("rum") !== -1) {
    		sub_category = "rum";
    		category = "spirit";
    	}
    	else if (header.indexOf("gin") !== -1) {
    		sub_category = "gin";
    		category = "spirit";
    	}
    	else if (header.indexOf("spirits") !== -1 && sub_category === undefined) {
    		sub_category = "other";
    		category = "spirit";
    	}
    	else {

    	}

      /*
    })(i)
  } */

	var prod = new Product ({
		name: name,
		category: category,
		sub_category: sub_category,
		capacity: capacity,
		approved: true,
		images: {
			normal: img,
      thumbnail: img
		}
	});

	//console.log("wur");
	if (category === undefined || ob === true) {
		//console.log(name);
    console.log(header);
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
  };
};


getProducts(i);
