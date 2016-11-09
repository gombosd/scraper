var Promise = require('bluebird')
var mongoose = require('mongoose')

/**
 * Product Schema
 */
var ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: 'text'
  },
  shortname: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    index: true,
    default: 'beverage'
  },
  category: {
    type: String,
  },
  sub_category: {
    type: String
  },
  images: {
    thumbnail: String,
    normal: String,
    original: String
  },
  measurable: {
    type:Boolean,
    default: false
  },
  measurable_from: {
    type: Number,
    default: 0.1
  },
  measurable_till: {
    type: Number,
    default: 0.8
  },
  capacity: {
    type:Number,
    default: 700
  },
  approved: {
    type:Boolean,
    default: false
  }
});


/**
 * @typedef Product
 */
module.exports = mongoose.model('Product', ProductSchema);
