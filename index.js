require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose')
const mongodb = require('mongodb');
const bodyParser = require('body-parser');
const shortid = require('shortid');



const app = express();


// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({"extended": false}))
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});



app.post('/api/shorturl', (req, res) => { 
  let prefix = "https://www." || "http://www.";
  let client_url = req.body.url;
  let short_url = shortid.generate();
  res.json({
    "original_url": `${client_url}`,
    "short_url": __dirname + "/api/shorturl/" + short_url
  })
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
