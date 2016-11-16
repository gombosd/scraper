//mongoos
var mongoose = require('mongoose');
var db = process.env.MONGODB_URI || 'mongodb://localhost/matth';
mongoose.connect(db);

var request = require('request-promise')
var cheerio = require('cheerio')
var Promise = require('bluebird')
mongoose.Promise = Promise
var Product = require('./Product')
Promise.promisifyAll(mongoose);

var cat = ['wine', 'champagne', 'spirits', 'beer', 'cider'] //, 'soft-drinks', 'ready-to-drink'
var pagenumber = 1; //wine-23 ch-2 sp-16
var a = 2;
var baseUrl = 'http://www.matthewclark.co.uk/products/' + cat[a] + '/?page=' + pagenumber + '&Request.OrderBy=Name&Request.PageSize=60#results'

function getProducts(page){
  console.log("Lefutott");
	return request.get('http://www.matthewclark.co.uk/products/' + cat[a] + '/?page=' + pagenumber + '&Request.OrderBy=Name&Request.PageSize=60#results')
	.then(function(results){
    console.log("Lefutott2");
		var $ = cheerio.load(results)
		var links = []
		$('#js-product-list div figure a').each(function(i, el){
			links.push('http://www.matthewclark.co.uk' + $(this).attr('href').toString())
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
    if (pagenumber === 16) {
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
  var img = 'http://www.matthewclark.co.uk' + $('.product-details div .img-responsive').attr('src').toString()
  var category;
  var sub_category;
  if (cat[a] === 'champagne') {
	  category = 'wine'
    sub_category = 'champagne'
	}
  else if (cat[a] === 'wine') {
    category = 'wine'
  }
  else if (cat[a] === 'spirits') {
    category = 'spirit'
  }
  else if (cat[a] === 'beer' || cat[a] === 'cider') {
    category = 'beer'
  }
  var name = $('.cms-content h2').text().trim().slice(0,$('.cms-content h2').text().trim().search("We're a"));
	var details = $('.product-table li').text().trim().toLowerCase();
  var det = $($('.breadcrumb li')[3]).text().trim().toLowerCase();
  var capacity = details.slice(details.search('bottle size:')+13,details.search('list price:'))

  if (capacity.search('cl') !== -1) {
    capacity = capacity.slice(0,capacity.search('cl'));
    capacity = parseFloat(capacity)*10;
  }
  else if (capacity.search('lt') !== -1) {
    capacity = capacity.slice(0,capacity.search('lt'))
    capacity = parseFloat(capacity)*1000;
  }
  else if (capacity.search('ml') !== -1) {
    capacity = capacity.slice(0,capacity.search('lt'))
    capacity = parseFloat(capacity);
  }
	else {
		console.log("err")
	}

/* //wine sorter
  if (details.search('red') !== -1 && details.search('sparkling') === -1) {
    sub_category = 'red'
  }
  else if (details.search('white') && details.search('sparkling') === -1) {
    sub_category = 'white'
  }
  else if (details.search('rosé') && details.search('sparkling') === -1) {
    sub_category = 'rosé'
  }
  else if (details.search('sparkling') !== -1) {
    sub_category = 'sparkling'
  }
  else if (details.search('fortified') !== -1) {
    sub_category = 'fortified'
  }
  else {

  }
*/

//spirit sorter
	if ((det + ' ').search('rum') !== -1) {
    if (details.search('cachaca') !== -1) {
      sub_category = 'cachaca';
    }
    else {
      sub_category = 'rum';
    }
	}
  else if ((det + ' ').search('brandy') !== -1) {
    if (details.search('brandy') !== -1) {
      sub_category = 'brandy';
    }
    else {
      //sub_category = 'rum';
    }
	}
	else if ((det + ' ').search('whisky') !== -1 || (det + ' ').search('whiskey') !== -1 || (det + ' ').search('bourbon') !== -1) {
		sub_category = 'whisky';
	}
	else if ((det + ' ').search('gin') !== -1) {
		sub_category = 'gin';
	}
	else if ((det + ' ').search('vodka') !== -1) {
		sub_category = 'vodka';
	}
	else if ((det + ' ').search('tequila') !== -1) {
    if (details.search('tequila') !== -1) {
      sub_category = 'tequila';
    }
    else if (details.search('mezcal') !== -1) {
      sub_category = 'mezcal';
    }
    else {

    }
	}
	else if ((det + ' ').search('brandy') !== -1) {
		sub_category = 'brandy';
	}
	else {
		//console.log(det);
	}

 /* //beers
	if ((details + ' ').search(' pale ale ') !== -1) {
		sub_category = "pale ale";
	}
	else if ((details + ' ').search(' ale ') !== -1) {
		sub_category = "ale";
	}
	else if ((details + ' ').search(' lager ') !== -1) {
		sub_category = "lager";
	} */

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
        //console.log(prod);
        return
      }
		});
    //console.log(prod);
  }
}

getProducts(pagenumber);
