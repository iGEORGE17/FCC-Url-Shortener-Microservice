require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose')
const mongodb = require('mongodb');
const bodyParser = require('body-parser');
const shortid = require('shortid');
const dns = require('dns');
const urlparser = require('url')

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
  original_url: String
}));


app.post('/api/shorturl', (req, res) => { 
  let client_url = req.body.url;

  dns.lookup(urlparser.parse(client_url).hostname, (error, address) => {
    if(!address) {
      res.json({
        error: 'invalid url'
      })
    } else {
      const newURL = new ShortURL({ original_url: client_url });
    
      newURL.save((err, data) => {
        if(err) console.log(err)
        res.json({
          original_url: data.original_url,
          short_url: data._id
        });    
      });
    }
  })

  
});

app.get('/api/shorturl/:short_url', async (req, res) => {
    let id = req.params.short_url
    await ShortURL.findById(id, (err, data) => {
        if(!data) {
          res.json({ error: 'invalid url'})
        } else {
          res.redirect(data.original_url)
        }
    })
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
