const KEY = "kbjlkajfkladjsfdajsfdjasfdjkfl"
var express = require('express')
var multer  = require('multer')
var admin = require("firebase-admin");

var serviceAccount = require("./scripts/serviceAccount.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

var db = admin.firestore();


const { MongoClient } = require('mongodb');
var port = 3000;
const uri = "mongodb+srv://root:root@cluster0.aaabc.mongodb.net/bskeventsdb?retryWrites=true&w=majority";
const client = new MongoClient(uri);

var app = express()

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})
var upload = multer({ storage: storage })

/*
app.use('/a',express.static('/b'));
Above line would serve all files/folders inside of the 'b' directory
And make them accessible through http://localhost:3000/a.
*/
app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));

app.post('/profile-upload-single', function(req, res){
  return res.send({
    message: 'Please update your app'
  });
})

app.post(`/${KEY}/profile-upload-single`, upload.single('profile-file'), async function (req, res, next) {
  // req.file is the `profile-file` file
  // req.body will hold the text fields, if there were any
  const collection = client.db('bskeventsdb').collection('bskEvents');
  var timestamp = parseInt(req.body.timestamp)
  if(isNaN(timestamp)) {
    timestamp = new Date().getTime()*1000;
  }
  await collection.insertOne({
    firestoreId: req.body.firestoreId,
    name: req.body.name,
    district: req.body.district,
    state: req.body.state,
    timestamp,
    path: req.file.path,
    dst: `${req.body.district},${req.body.state}`
  });

  return res.send(req.file.path);
})

app.get('/districts', async function(req, res) {
  const collection = client.db('bskeventsdb').collection('bskEvents');
  const docs = await collection.distinct("dst");
  return res.send(docs);
});

app.post('/profile-upload-multiple', upload.array('profile-files', 12), function (req, res, next) {
    // req.files is array of `profile-files` files
    // req.body will contain the text fields, if there were any
    console.log(JSON.stringify(req.file))
    var response = '<a href="/">Home</a><br>'
    response += "Files uploaded successfully.<br>"
    for(var i=0;i<req.files.length;i++){
        response += `<img src="${req.files[i].path}" /><br>`
    }

    return res.send(response)
})

client.connect().then((err)=> {
  app.listen(port,() => console.log(`Server running on port ${port}!\nClick http://localhost:3000/`))
});
