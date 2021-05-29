const express = require('express');
const app = express();
const path = require('path')
const router = express.Router();
const expressws = require('express-ws')(app);
const { ObjectId } = require('mongodb');
const Mongoclient = require('mongodb');
const { Console } = require('console');
const uri = "mongodb+srv://Read-only:Password123456789@cluster0.kxfj4.mongodb.net/Locations?retryWrites=true&w=majority";


app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + "/index.html"));
    console.log("Host has connected to application!");
})

app.use('/', router);

//port for local host used for testing 
//app.listen(process.env.PROT || 4000, () => console.log('Application running on port 4000'));

app.listen(process.env.PROT || 5000, () => console.log('Application running on port 5000'));

app.ws("/ContainerCreator", function(ws, req) {
    ws.on("message", function(event) {
        //console.log((event));
        console.log("Begining Collection Count.")

        Mongoclient.connect(uri, function(err, db) {
            if (err) throw err;

            var ldb = db.db('Locations');

            ldb.listCollections().toArray(function(err, d) {
                console.log(d.length + " number of collections currently Stored!");

                var x = 0

                var collectionstr = JSON.stringify(d.length);

                console.log("");
                console.log("length = " + d.length);

                while (x < d.length) {

                    var d2s = JSON.stringify(d[x]);
                    console.log(d2s);

                    strarray = d2s.split('"');

                    JSON.stringify(strarray[3]);
                    console.log("cut str = " + JSON.stringify(strarray[3]));

                    collectionstr += "|";
                    collectionstr += JSON.stringify(strarray[3]);

                    x++;
                };



                console.log("");
                console.log(collectionstr);
                ws.send(collectionstr);
            });

        });
    });

});

app.ws("/DataRetriver", function(ws, req) {
    ws.on("message", function(event) {

        console.log("event Data = " + event);

        Mongoclient.connect(uri, function(err, db) {
            if (err) throw err;


            var ColNames = event.split(",")

            var ldb = db.db('Locations');


            for (i = 0; i < ColNames.length; i++) {
                console.log(ColNames[i])

                var entry = ldb.collection(ColNames[i]).find().limit(1).sort({ $natural: -1 });

                entry.toArray(function(err, results) {
                    if (err) throw err;

                    var output = ('%j', results);
                    console.log(output);

                    ws.send(JSON.stringify(output));

                })

            }


        });
    })
})

app.ws("/DataUpdater", function(ws, req) {
    ws.on("message", function(event) {

        console.clear();
        console.log("Client Message recived: " + event);

        var Colid = event.split(",");

        Mongoclient.connect(uri, function(err, db) {
            if (err) throw err;

            var ldb = db.db('Locations');

            for (i = 0; i < Colid.length; i++) {

                console.log("getting Latest data from " + Colid[i] + " Data collection");

                var entry = ldb.collection(Colid[i]).find().limit(1).sort({ $natural: -1 });

                entry.toArray(function(err, results) {
                    if (err) throw err;

                    var output = ('%j', results);
                    console.log(output);

                    ws.send(JSON.stringify(output));
                })
            };
            console.log("update complete");


        })
        setTimeout(() => {
            ws.send("Update-Complete");;
        }, 10000);

    })
})