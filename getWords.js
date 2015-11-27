var mongodb = require('mongodb');

var MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb://localhost:27017/ClassifierRSSFeeds12', function(err, db){
  function map(){
    var wordsLength = 0;
    if(this.value.words){
      wordsLength = this.value.words.length;
    }
    emit('words', {
      length: wordsLength
    });
  }
  
  function reduce(key, objs){
    var all = 0;
    for(var i = 0; i < objs.length; i++){
      all += objs[i].length;
    }
    return {
      length: all
    };
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
