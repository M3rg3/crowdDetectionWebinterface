const express = require('express');
const app = express();
const path = require('path')
const router = express.Router();



app.get('/', function (req,res) {
    res.sendFile(path.join(__dirname + "/index.html"));
    console.log("Host has connected to application!");
})

app.use('/', router);
app.listen(process.env.PROT || 4000, () => console.log('Application running on port 4000'));

