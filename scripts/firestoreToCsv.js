var json2xls = require('json2xls');
const fs = require('fs')
var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccount.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

var db = admin.firestore();

db.collection("bskEvents")
  .get().then(snap => {
  console.log("snap", snap.docs.length);
  let docs = []
  snap.docs.forEach(doc => {
    docs.push(doc.data())
  });
  console.log("docs", docs)
  var xls = json2xls(docs)
  fs.writeFileSync('india_tpd_2021_final.xls', xls,'binary')
})

