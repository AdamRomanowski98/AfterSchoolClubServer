const express = require("express");
const cors = require("cors");
const MongoClient = require('mongodb').MongoClient;
const app = express();
var path = require("path");
var fs = require("fs");
var corsOptions = {
    origin: "https://github.com/adamRomanowski98"
};

app.use(cors(corsOptions));

app.use(express.json());

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to the backend of the application." });
  });



//file logger
app.use(function(req, res, next) {
    var filePath = path.join(__dirname, "img", req.url);
    console.log('looking for file at: '+filePath);
      fs.stat(filePath, function(err, fileInfo) {
        if (err) {
          next();
            return;
          }
          if (fileInfo.isFile()){
            res.sendFile(filePath);
            console.log('file found')}
          else
            next();
      });
  
    });
    app.use(function(req, res,next) {
      console.log("file not found")
      next();
      });
  // database

// database
let db;
MongoClient.connect('mongodb+srv://AdamR:root@cluster0.46o1r.mongodb.net/test', (err, client) => {
  db = client.db('AfterSchoolClub')
  const ObjectID = require('mongodb').ObjectID;

  app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName)
    return next()
  })
  //logger
  app.use(function(request, response, next) {
    console.log("Incoming " + request.method + " method to " + request.url);
    next();
  });
  
  //get all from collection
  app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
      if (e) return next(e)
        res.send(results)
    })
  });
  app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insertOne(req.body, (e, results) => {
    if (e) return next(e)
      res.send(results)
    })  
  });
  app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.updateOne(
      {_id: ObjectID(req.params.id)},
      {$set: req.body},
      {safe: true, multi: false},
      (e, result) => {
        if (e) return next(e)
          res.send(result)
    })  
  })
})



// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});