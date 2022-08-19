require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose')
const mongodb = require('mongodb');
const bodyParser = require('body-parser');
const shortid = require('shortid');
const dns = require('dns')


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

const links = [];
let id = 0;

app.post('/api/shorturl', (req, res) => {
  const {url} = req.body;

  const noHTTPSurl = url.replace(/^https?:\/\//, '')

  // check if url is valid
  dns.lookup(noHTTPSurl, (err, addresses, family) => {
    if(err) {
      return res.json({
        error: 'invalid url'
      })
    } else {
      id++;

      const link = {
        original_url: url,
        short_url: id
      }

      links.push(link);

      return res.json(links)
    }
  })
})

app.get('/api/shorturl/:short_url', (req, res) => {
  const {short_url} = req.params;
  const link = links.find(l => l.short_url === short_url);

  if(link) {
    return res.redirect(link.original_url)
  } else {
    return res.json({
      error: 'No short url'
    })
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
