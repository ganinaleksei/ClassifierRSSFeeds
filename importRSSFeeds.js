var mongodb = require('mongodb');
var async   = require('async');
var request = require('request');
var cheerio = require('cheerio');

function uniqueArrayFilter(arr){
  var map = {};
  arr.forEach(function(item){
    map[item] = true;
  });
  return Object.keys(map);
}

var MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb://localhost:27017/ClassifierRSSFeeds12', function(err, db){
  async.waterfall([function(next){
      request('http://subscribe.ru/catalog/auto?rss', function(err, obj){
	var categories = [];
	cheerio.load(obj.body)
	('ul.leftmenu_ul a.leftmenu_link')
	.each(function(i, e){
	  if(/catalog\/[a-z]+/.test(e.attribs.href)){
	    var href = e.attribs.href;
	    var name = href.match(/catalog\/([a-z]+)\?/)[1];
	    categories.push({
	      href: 'http://subscribe.ru' + href,
	      name: name
	    });
	  }
	});
	next(null, categories);
      });
    }, function (categories, next){
      async.map(categories, function(categorie, next){
	categorie.feeds = [];
	function loadIndex(pos){
	  request(categorie.href + '&pos=' + pos, function(err, obj){
	    if(!obj){ next(null, categorie); }
	    //categorie.body = obj.body;
	    //categorie.feeds = [];
	    var newFeeds = [];
	    cheerio.load(obj.body)
	    ('div.layer-left a')
	    .each(function(i, e){
	      if(/^http\:\/\/redirect\.subscribe\.ru.*rss.*/.test(e.attribs.href)){
		newFeeds.push(e.attribs.href.replace('http://redirect.subscribe.ru/', 'http://'));
	      }
	    });
	    newFeeds = uniqueArrayFilter(newFeeds);
	    categorie.feeds = categorie.feeds.concat(newFeeds);
	    if(newFeeds.length){
	      loadIndex(pos + 200)
	    } else {
	      next(null, categorie);
	    }
	  });
	}
	loadIndex(1);
      }, function(err, categories, next){
	var crss = db.collection('rss');
	var ccategories = db.collection('categories');
	//console.log("categories:", categories);
	var linksAll = 0;
	categories.forEach(function(categorie){ linksAll += categorie.feeds.length; 
	  ccategories.insert({
	    categorie: categorie.name
	  });
	  var it = 0;
	  async.mapLimit(categorie.feeds, 16, function(feed, next){
	    console.log(++it, " из ", categorie.feeds.length);
	    request(feed, function(err, obj){
	      crss.insert({
		feed: feed,
		content: obj ? obj.body : null,
		categorie: categorie.name
	      }, next);
	    });
	  }, next);
	});
	//console.log("linksAll:", linksAll);
      });
    }], function(){
      
    }
  );
});

