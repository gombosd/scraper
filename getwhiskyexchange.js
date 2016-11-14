var request = require('request-promise');
var cheerio = require('cheerio');
var Promise = require('bluebird');
var fs = require("fs");
var Product = require('./Product');
var express = require('express');

//mongoos
var mongoose = require('mongoose');
var db = process.env.MONGODB_URI || 'mongodb://localhost/whiskyex';
mongoose.connect(db);

var request = require('request-promise');
var Promise = require('bluebird');
mongoose.Promise = Promise;
Promise.promisifyAll(mongoose);

var baseUrl = './we/www.thewhiskyexchange.com/p/'

var _getAllFilesFromFolder = function(dir) {
		var htmls = [];
		var ids = fs.readdirSync(baseUrl);
		for (var i = 0; i < ids.length; i++) {
			htmls.push(baseUrl + ids[i] + '/' + fs.readdirSync(baseUrl + ids[i]))
		}
    return htmls;
};

var pages = _getAllFilesFromFolder(baseUrl)

function parsePage(html){
	var $ = cheerio.load(html);
  var category;
	var sub_category;
//	var img = $('#productDefaultImage img').attr('data-original').toString();
	var header = $('.breadcrumb-list').text().toLowerCase().trim().slice(5);
	var wtype = $('#prodMeta dl dd').text().toLowerCase();
	var name = $($('script')[9]).text().trim();
	name = name.slice(name.search('\"name\"')+9,name.search('\"image\"')-16)

	var capacity = $($('.strength')).text().trim();
	if (capacity.search('cl') !== -1) {
		capacity = capacity.slice(0,capacity.search('cl'));
		capacity = parseFloat(capacity)*10;
	}
	else {
		//console.log($('title').text());
		return
	}


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
	else if (header.search("liqueur") !== -1 && header.search("fruit") !== -1) {
		sub_category = "fruit";
		category = "liqueur";
	}
	else if (header.search("liqueur") !== -1 && header.search("coffee") !== -1) {
		sub_category = "coffee";
		category = "liqueur";
	}
//whine
	else if (header.search("champagne") !== -1) {
		sub_category = "champagne";
		category = "wine";
	}
	else if (header.search("wine") !== -1) {
		if (wtype.search("white")) {
			sub_category = "white"
		}
		else if (wtype.search("red")) {
			sub_category = "red"
		}
		else if (wtype.search("rosé")) {
			sub_category = "rosé"
		}
		category = "wine";
	}
	else if (header.search("liqueur") === -1) {
		//console.log(header);
	}
	else {
		//console.log(" "+header);
	}

	var prod = new Product ({
		name: name,
		category: category,
		sub_category: sub_category,
		capacity: capacity,
		approved: true
	});
console.log("wur");
	if (category === undefined || sub_category === undefined ) {
		return false;
	}
	else {/*
		prod.save(function (err) {
		  if (err) {
		    console.log(err);
		  }
		}) */
		console.log(prod);
	}
}
var htmls;

var i = 0;

function getProducts(){
	if (i === 5) {
		return true
	}
	if (pages[i].search('\,') !== -1) {
		pages[i] = pages[i].slice(0,pages[i].search(','))
	}
	console.log("for lefutott " + i);
	htmls = fs.readFileSync(pages[i], "utf8");
	return parsePage(htmls);
		.then(function(){
			i = i + 1;
			return parsePage(i);
		})
};

getProducts();
