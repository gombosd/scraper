var request = require('request-promise')
var cheerio = require('cheerio')
var Promise = require('bluebird')
var filesystem = require("fs");
var mongoose = require('mongoose')
mongoose.Promise = Promise
var Product = require('./Product')
Promise.promisifyAll(mongoose);

var baseUrl = './we/www.thewhiskyexchange.com/p/'

var _getAllFilesFromFolder = function(dir) {
		var htmls = []
		var ids = filesystem.readdirSync(baseUrl);
		for (var i = 0; i < ids.length; i++) {
			htmls.push(baseUrl + ids[i] + filesystem.readdirSync(baseUrl + ids[i]))
		}

    return htmls;

};
var htmls = _getAllFilesFromFolder(baseUrl)
/*
for (var i = 0; i < htmls.length; i++) {
	parsePage(htmls[i]);
}
*/



function parsePage(html){
	var $ = cheerio.load()
//	var category = $($('.breadcrumbs li')[2]).text().trim().toLowerCase().slice(0, -1)
	var sub_category = $($('li span')[1]).text()
	console.log(sub_category)
}

parsePage(htmls[0]);

/*
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

	return {
		name: $('.product-header-name h2').text().trim(),
		type: 'beverage',
		category: category,
		sub_category: sub_category,
		images: {
			thumbnail: $('#zoomimage img').attr('src').replace('/1/image/275x378/','/1/thumbnail/275x/'),
			normal: $('#zoomimage').attr('href')
		},
		capacity: capacity,
		measurable: measurable,
		approved: true,
		sku: $('.sku').text().trim().split(' ')[1]
	} */

/*
function saveProducts(prodid_num) {
	if(prodid_num === 46){
		return console.log('All saved')
	}
	getProducts(prodid_num)
	.then(function(products){
		return Product.create(products)
	})
	.then(function(response){
		console.log('Saved prodid: ' + prodid_num)
		saveProducts(++prodid_num)
	})
	.catch(function(err){
		console.log(err)
		saveProducts(++prodid_num)
	})
}


// connect to mongo db
mongoose.connect('mongodb://localhost/whiskyex', { server: { socketOptions: { keepAlive: 1 } } });
mongoose.connection.on('error', function(){
  throw new Error('unable to connect to database: ${config.db}');
})
mongoose.connection.on('connected', function(){
	console.log('connected')
	saveProducts(1)
})*/
