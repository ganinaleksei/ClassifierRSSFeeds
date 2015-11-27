var mongodb = require('mongodb');

var MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb://localhost:27017/ClassifierRSSFeeds12', function(err, db){
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
});
