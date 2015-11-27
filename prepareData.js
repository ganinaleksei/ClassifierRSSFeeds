var mongodb = require('mongodb');

var MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb://localhost:27017/ClassifierRSSFeeds12', function(err, db){
  function map(){
    var words;
    if(this.content){
      words = this.content.toLowerCase().match(new RegExp('[а-яА-Я]+', 'img'));
    }
    emit(this.feed, {
      words: words,
      categorie: this.categorie
    });
  }
  
  function reduce(key, objs){
    return objs[0];
  }
  
  db.collection('rss').mapReduce(map, reduce, {
    query: {},
    verbose: true,
    out: 'rss_prepare'
  }, function(err){
    console.log(err);
    db.close();
  });
});
