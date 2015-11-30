var svm = require("svm");
var SVM = new svm.SVM();

 
// teach it positive phrases

function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

var MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb://localhost:27017/ClassifierRSSFeeds12', function(err, db){
  db.collection('rss_bag_of_words').find().toArray(function(err, rss){
    rss = shuffle(rss);
    var trainLength = parseInt(rss.length * 0.01);
    var trainRSS = rss.splice(0, trainLength);
    var rss = rss.splice(0, trainLength);
    SVM.train(trainRSS.map(function(trainRSS){
      return trainRSS.vector;
    }), trainRSS.map(function(trainRSS){
      return trainRSS.categorie;
    }));
    
    var testlabels = svm.predict(rss.map(function(rss){
      return rss.vector;
    }));
    
    console.log("testlabels:", testlabels);
    /*
    
    var categories = {};
    console.log("trainLength:", trainLength);
    for(var i = 0; i < trainLength; i++){
      //console.log(rss[i].categorie);
      if(rss[i].content){
	classifier.learn(rss[i].content, rss[i].categorie);
	categories[rss[i].categorie] = true;
	console.log(rss[i].categorie);
      }
    }  
    //console.log(classifier.getClassifications(rss[trainLength].content));
    var positive = 0;
    for(i = trainLength; i < rss.length; i++){
      if(rss[i].content){
	var res = classifier.categorize(rss[i].content);
        //var res = classifier.classify(rss[i].content);
	console.log("res: ", res, " - ", rss[i].categorie);
	if(res === rss[i].categorie){
	  positive++  
	}
	//console.log();
      }
    }
    //console.log(classifier.toJson());
    console.log("Качество распознования:", (positive / (rss.length - trainLength) * 100) + "%");
    var categories = Object.keys(categories);
    console.log("Категорий:", categories.length);
    console.log(categories);
    */
    db.close();
  });
});

 
/*
classifier.learn('amazing, awesome movie!! Yeah!! Oh boy.', 'positive')
classifier.learn('Sweet, this is incredibly, amazing, perfect, great!!', 'positive')
 
// teach it a negative phrase 
 
classifier.learn('terrible, shitty thing. Damn. Sucks!!', 'negative')
 
// now ask it to categorize a document it has never seen before 
 
classifier.categorize('awesome, cool, amazing!! Yay.')
// => 'positive' 
 
// serialize the classifier's state as a JSON string. 
var stateJson = classifier.toJson()
 
// load the classifier back from its JSON representation. 
var revivedClassifier = bayes.fromJson(stateJson);
console.log(classifier.categorize('awesome, cool, amazing!! Yay.'));
*/
/*
var BayesClassifier = require('bayes-classifier');
var classifier = new BayesClassifier();
var MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb://localhost:27017/ClassifierRSSFeeds12', function(err, db){
  db.collection('rss').find().toArray(function(err, rss){
    var trainLength = parseInt(rss.length * 0.7);
    console.log("trainLength:", trainLength);
    for(var i = 0; i < trainLength; i++){
      if(rss[i].connect){
        classifier.addDocuments(rss[i].content, rss[i].categorie);
      }
    }
    classifier.train();
    
    console.log(classifier.getClassifications(rss[trainLength].content));
    for(i = trainLength; i < rss.length; i++){
      if(rss[i].content){
        //var res = classifier.classify(rss[i].content);
        //console.log(res === rss[i].categorie);
      }
    }
    //db.close();
  });
});
*/