//mongoos
var mongoose = require('mongoose');
var db = process.env.MONGODB_URI || 'mongodb://localhost/gwe';
mongoose.connect(db);

var request = require('request-promise')
var cheerio = require('cheerio')
var Promise = require('bluebird')
mongoose.Promise = Promise
var Product = require('./Product')
Promise.promisifyAll(mongoose);

//var baseUrl = 'https://www.thewhiskyexchange.com/c/304/blended-scotch-whisky' //19 -d
//var baseUrl = 'https://www.thewhiskyexchange.com/c/309/blended-malt-scotch-whisky' //4 -d
//var baseUrl = 'https://www.thewhiskyexchange.com/c/310/grain-scotch-whisky' //2 -d
//var baseUrl = 'https://www.thewhiskyexchange.com/c/32/irish-whiskey' //4 -d
//var baseUrl = 'https://www.thewhiskyexchange.com/c/33/american-whiskey' //14 -d
//var baseUrl = 'https://www.thewhiskyexchange.com/c/34/canadian-whisky' //2 -d
//var baseUrl = 'https://www.thewhiskyexchange.com/c/35/japanese-whisky' //2 -d
//var baseUrl = 'https://www.thewhiskyexchange.com/c/305/rest-of-the-world-whisky' //9 -d
//var baseUrl = 'https://www.thewhiskyexchange.com/c/306/scotch-whisky-decanters' //3 -d
//var baseUrl = 'https://www.thewhiskyexchange.com/c/385/miniatures' //17 -d
var baseUrl = 'https://www.thewhiskyexchange.com/c/351/cognac' //24
//var baseUrl = 'https://www.thewhiskyexchange.com/c/355/armagnac' //7 -d
//var baseUrl = 'https://www.thewhiskyexchange.com/c/338/gin' //21 -d
//var baseUrl = 'https://www.thewhiskyexchange.com/c/335/vodka' //20 -d
//var baseUrl = 'https://www.thewhiskyexchange.com/c/358/absinthe' //2 -d
//var baseUrl = 'https://www.thewhiskyexchange.com/c/343/liqueurs' //45 -d
//var baseUrl = 'https://www.thewhiskyexchange.com/c/366/other-spirits' //16 -d
//var baseUrl = 'https://www.thewhiskyexchange.com/c/365/vermouths-and-aperitifs' //13 -d
//var baseUrl = 'https://www.thewhiskyexchange.com/c/330/champagne' //15 -d
//var baseUrl = 'https://www.thewhiskyexchange.com/c/378/fortified-wine' //9 -d
//var baseUrl = 'https://www.thewhiskyexchange.com/c/40/single-malt-scotch-whisky' //134 -d
//var baseUrl = 'https://www.thewhiskyexchange.com/c/348/soft-drinks-and-syrups' //10 -d

var i = 8;
var max = 24;

function getProducts(page){
  console.log("Lefutott");
	return request.get(baseUrl + '?pg=' +  page)
	.then(function(results){
    console.log("Lefutott2");
		var $ = cheerio.load(results)
		var links = []
		$('.group-list div a').each(function(i, el){
			links.push('https://www.thewhiskyexchange.com' + $(this).attr('href').toString())
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
	var $ = cheerio.load(html);

  var category;
	var sub_category;
	var img = $('#productDefaultImage img').attr('data-original');
	var header = $('.breadcrumb__list').text().toLowerCase().trim().slice(5);
	var wtype = $('#prodMeta dl dd').text().toLowerCase();
	var name = $($('.name-container h1')).text();
	name = name.slice(name.search('(\\n)')+2)
	name = name.slice(0,name.search('(\\r)'))
	name = name.trim()

	var capacity = $($('.strength')).text().trim();
	if (capacity.search('cl') !== -1) {
		capacity = capacity.slice(0,capacity.search('cl'));
		capacity = parseFloat(capacity)*10;
	}
	else {
		console.log($('title').text());
		return
	}

/*
//spirits
	if (header.search("whisky") !== -1 || header.search("whiskey") !== -1) {
		sub_category = "whisky";
		category = "spirit";
	}
	else if (header.search("absinthe") !== -1) {
		sub_category = "absinthe";
		category = "spirit";
	}
	else if (header.search("akvavit") !== -1) {
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
	else if (header.search("liqueur") !== -1 && header.search("herb") !== -1) {
		sub_category = "herbal";
		category = "liqueur";
	}
	else if (header.search("liqueur") !== -1 && header.search("cream") !== -1) {
		sub_category = "herbal";
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
//whine
	else if (header.search("wine") !== -1) {
		if (wtype.search("fortified")) {
			sub_category = "fortified"
		}
		else if (wtype.search("white")) {
			sub_category = "white"
		}
		else if (wtype.search("red")) {
			sub_category = "red"
		}
		else if (wtype.search("rosé")) {
			sub_category = "rosé"
		}
		else if (wtype.search("champagne")) {
			sub_category = "champagne"
		}
		category = "wine";
	}
	else if (header.search("liqueur") === -1) {
		//console.log(header);
	}
	else {
		//console.log(" "+header);
	}

if (header.search("purées") === -1) {
  sub_category = "purees";
  category = "sundries";
}
else if (header.search("juice") === -1) {
  sub_category = "juices";
  category = "mixer";
}
else if (header.search("soft drinks and mixers") === -1) {
  sub_category = "soft drinks & mixers";
  category = "mixer";
}
*/
category = "liqueur"
sub_category = "spirits"

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
	if (category === undefined || sub_category === undefined ) {
		console.log("log3");
		return Promise.reject()
	}
	else {
		return prod.save(function (err) {
		  if (err) {
		    console.log("jipp" + err);
				return Promise.reject()
		  }
			//console.log(prod);
		});

		// var lol = $('#productDefaultImage img').attr()
//		 console.log(prod);
	};
};


getProducts(i);
