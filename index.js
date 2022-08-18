require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose')
const mongodb = require('mongodb');
const bodyParser = require('body-parser');
const shortid = require('shortid');


//  initialize app 
const app = express();

// connect to mongodb
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({"extended": false}));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// shortURL model
const ShortURL = mongoose.model( 'ShortURL', new mongoose.Schema({
  short_url: String,
  original_url: String,
  suffix: String
}));


app.post('/api/shorturl', (req, res) => { 
  let client_url = req.body.url;
  let suffix = shortid.generate();
  let urlFormat = client_url.startsWith("http://www.") || client_url.startsWith("https://www.")

  if(urlFormat == true) {
    const newURL = new ShortURL({
      original_url: client_url,
      suffix: suffix,
      short_url: __dirname + "/api/shorturl/" + suffix
    });
  
    newURL.save((err, doc) => {
      if(err) console.log(err)
      res.json({
        "original_url": newURL.original_url,
        "short_url": newURL.short_url,
        "suffix": newURL.suffix
      });    
    });
  } else {
    res.json({
      error: "Invalid Url"
    });
  }   
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
