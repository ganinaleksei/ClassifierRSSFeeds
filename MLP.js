var ml = require('machine_learning');

 
// teach it positive phrases

function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

var MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb://localhost:27017/ClassifierRSSFeeds12', function(err, db){
  db.collection('rss_bag_of_words').find().limit(100).toArray(function(err, rss){
    rss = shuffle(rss);
    
    console.log("shuffle ok");
    
    var trainLength = parseInt(rss.length * 0.7);
    var trainRSS = rss.splice(0, trainLength);
    //var rss = rss.splice(0, 10);
    
    
    
    
    
    var ml = require('machine_learning');
    var categoriesMap = {};
    function getX(rss){
      return rss.map(function(trainRSS){
	categoriesMap[trainRSS.categorie] = true;
	return trainRSS.vector;
      });
    }
    var x = getX(trainRSS);
    var categoriesList = Object.keys(categoriesMap);
    
    var y = trainRSS.map(function(trainRSS){
      return categoriesList.map(function(categorie){
	if(trainRSS.categorie === categorie){
	  return 1;
	} else {
	  return 0;
	}
      });
    });

    console.log("mlp");
    
    var mlp = new ml.MLP({
      'input' : x,
      'label' : y,
      'n_ins' : x[0].length,
      'n_outs' : categoriesList.length,
      'hidden_layer_sizes' : [4,4,5]
    });

    mlp.set('log level',1); // 0 : nothing, 1 : info, 2 : warning.

    mlp.train({
      'lr' : 0.6,
      'epochs' : 200 //20000
    });

    var a = getX(rss);
    
    var allPredict = mlp.predict(a);
    var positive = 0;
    allPredict.forEach(function(predict, i){
      var max = predict.reduce(function(e, i){ if(e < i){return i;} else {return e;}});
      var maxIndex = predict.indexOf(max);
      var categorie = categoriesList[maxIndex];
      if(rss[i].categorie == categorie){
	positive++;
      }
      
    });
    console.log("Точность:", (100 * positive / rss.length) + "%");


    
    
    
    
    /*
    
    SVM.train(trainRSS.map(function(trainRSS){
      return trainRSS.vector;
    }), trainRSS.map(function(trainRSS){
      return trainRSS.categorie;
    }));
    
    var testlabels = svm.predict(rss.map(function(rss){
      return rss.vector;
    }));
    
    console.log("testlabels:", testlabels);*/
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