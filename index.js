require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose')
const mongodb = require('mongodb');
const bodyParser = require('body-parser');
const shortid = require('shortid');



const app = express();


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


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

const ShortURL = mongoose.model( 'ShortURL', new mongoose.Schema({
  short_url: String,
  original_url: String,
  suffix: String
}));



app.post('/api/shorturl', (req, res) => { 
  const formatURL = (url) => {
    let urlformat = url.startsWith("http://www.") || url.startsWith("https://www.")
    if(urlformat == true) {
      return url; 
  } else {
    res.json({
      "error": "Invalid Url"
    });
  }
};

  let client_url = formatURL(req.body.url);
  let suffix = shortid.generate()

  const newURL = new ShortURL({
    original_url: client_url,
    short_url: __dirname + "/api/shorturl/" + suffix,
    suffix: suffix
  });

  newURL.save((err, doc) => {
    if(err) console.log(err)
    res.json({
      "original_url": newURL.original_url,
      "short_url": newURL.short_url,
      "suffix": newURL.suffix
    });    
  });
});

app.get('/api/shorturl/:suffix', async (req, res) => {
    let userGeneratedSuffix = req.params.suffix
  await ShortURL.find({suffix: userGeneratedSuffix})
                .then((foundURLs) => {
                  let urlRedirect =  foundURLs[0];
                  console.log(urlRedirect);
                  res.redirect(urlRedirect.original_url)
                });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
