var async = require('async');
var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;

var db, words, rss, rssSaveAll = [];
async.series([function(next){
  MongoClient.connect('mongodb://localhost:27017/ClassifierRSSFeeds12', function(err, _db){
    db = _db;
    next(err);
  });
}, function(next){
  db
  .collection('rss_prepare_unic')
  .find({})
  .toArray(function(err, wordsObj){
    words = wordsObj.map(function(wordObj){ return wordObj._id; });
    next(err);
  });
}, function(next){
  db
  .collection('rss_prepare')
  .find({})
  .toArray(function(err, _rss){
    rss = _rss;
    next(err);
  });
}, function(next){
  var i = 0;
  async.forEachSeries(rss, function(rss, next){
    console.log(++i);
    var rssWordsMap = {};
    var rssWords = rss.value.words;
    if(rssWords){
      rssWords.forEach(function(rssWord){
	if(!rssWordsMap[rssWord]){
	  rssWordsMap[rssWord] = 0;
	}
	rssWordsMap[rssWord]++;
      });
    }
    var vector = words.map(function(word){
      if(rssWordsMap[word]){
	return rssWordsMap[word];
      } else {
	return 0;
      }
    });
    var rssSave = {
      url: rss._id,
      categorie: rss.value.categorie,
      vector: vector
    }
    db.collection('rss_bag_of_words').insert(rssSave, next);
  }, next);
}], function(err){
  db.close();
});



  /*
  function map(){
    if(this.value.words){
      this.value.words.forEach(function(word){
	emit(word, 1);
      });
    }
  }
  
  function reduce(key, objs){
    var all = 0;
    for(var i = 0; i < objs.length; i++){
      all += objs[i];
    }
    return all;
  }
  
  db.collection('rss_prepare').mapReduce(map, reduce, {
    query: {},
    verbose: true,
    out: 'rss_prepare_unic'
  }, function(err){
    console.log(err);
    db.close();
  });
  */
  
  /*
   * 
   * }, function(next){
  async.forEachSeries(rssSaveAll, function(rssSave, next){
    db.collection('rss_bag_of_words').insert(rssSave, next);
  }, next);
}], function(err){
  db.close();
});*/