//mongoos
var mongoose = require('mongoose');
var db = process.env.MONGODB_URI || 'mongodb://localhost/amath4';
mongoose.connect(db);

var request = require('request-promise')
var cheerio = require('cheerio')
var Promise = require('bluebird')
mongoose.Promise = Promise
var Product = require('./Product')
Promise.promisifyAll(mongoose);

var baseUrl = 'http://www.amathusdrinks.com/catalog/seo_sitemap/product/?p='

var i = 29;
var max = 46;

function getProducts(page){
  console.log("Lefutott");
	return request.get(baseUrl + page)
	.then(function(results){
    console.log("Lefutott2");
		var $ = cheerio.load(results)
		var links = []
		$('.sitemap li a').each(function(i, el){
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
	var category = $($('.breadcrumbs li')[2]).text().trim().toLowerCase().slice(0, -1)
	var sub_category = $($('.breadcrumbs li')[4]).text().trim().toLowerCase()

	if(category === 'corporate gift'){
		return false
	}

	if(category === 'our brand'){
		if(['spirits','wines','liqueurs','beers'].indexOf(sub_category) > -1){
			category = $($('.breadcrumbs li')[4]).text().trim().toLowerCase().slice(0, -1)
		} else {
			category = ''
		}
		sub_category = ''
	}

	var measurable = category === 'spirit' || category === 'liqueur' ? true : false

	if(!$('.UnitV').text().split(': ')[1]){
		return false
	}

	var capacity = $('.UnitV').text().split(': ')[1].toLowerCase().split(' ').join('')

	try{
		capacity = capacity.match(/\d+(\.?\d+)?\s?[c,m,l]/i)[0]
	} catch(e) {
		try{
			capacity = capacity.match(/\d+(\.?\d+)/i)[0]
		} catch(e){
			console.log(e, capacity, $('.product-header-name h2').text().trim())
		}
		console.log(e, capacity, $('.product-header-name h2').text().trim())
	}

	switch (capacity.slice(-1)) {
		case 'c':
			capacity = capacity.slice(0,-1) * 10
			break
		case 'm':
			capacity = capacity.slice(0,-1)
			break
		case 'l':
			capacity = capacity.slice(0,-1) * 1000
			break
		default:
			capacity = capacity.slice(0,-1) * 10
	}

	var name = $('.product-header-name h2').text().trim()

	var prod = new Product({
		name: name,
		category: category,
		sub_category: sub_category,
		images: {
			thumbnail: $('#zoomimage img').attr('src').replace('/1/image/275x378/','/1/thumbnail/275x/'),
			normal: $('#zoomimage').attr('href')
		},
		capacity: capacity,
		approved: true
	})

	console.log("wur");
	if (category === '' || sub_category === '' ) {
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
     //console.log(prod);
	};
};


getProducts(i);
