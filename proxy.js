const express = require('express');
const { parse, format } = require('url');
const qs = require('querystring');
const request = require('request');
const debug = require('debug')('proxy');
const app = express();

const PORT = process.env.PORT || 3000;

function encode(path) {
  return path
    .replace(/\//g, 'Z2F')
    .replace(/\?/g, 'Z3F')
    .replace(/\=/g, 'Z3D')
    .replace(/\&/g, 'Z26');
}

function doRequest(options) {
  return new Promise((resolve, reject) => {
    request(
      Object.assign(
        {
          followRedirect: response => {
            return false;
          },
          gzip: false,
          // add this cipthers otherwise ISS yield socket hang up error.
          ciphers: 'DES-CBC3-SHA',
          headers: {
            // simulate a valid user-agent otherwise IIS blocks the request
            'User-Agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X ${Math.round(
              Math.random() * 10
            )}) AppleWebKit/${Math.round(
              Math.random() * 1000
            )}.36 (KHTML, like Gecko) Chrome/61.0.${Math.round(
              Math.random() * 1000
            )}.100 Safari/${Math.round(Math.random() * 1000)}.${Math.round(
              Math.random() * 100
            )}`,
          },
        },
        options
      ),
      function(error, response, body) {
        if (error) {
          return reject(error);
        }

        return resolve({ response, body });
      }
    );
  });
}

app.all('/', function(req, res) {
  if (!req.query.url || !req.query.auth) {
    res.status(400).send('`url` and/or `auth` query parameters are missing.');
    return;
  }

  const jar = request.jar();

  const headers = {};

  // @todo should we forward every headers?
  if(req.headers['content-type']){
    headers['content-type'] = req.headers['content-type'];
  }

  login(req.query.url, req.query.auth, { jar })
    .then(() =>
      doRequest({
        method: req.method,
        url: req.query.url,
        jar: jar,
        body: req.body,
        headers: headers,
      })
    )
    .then(({ response, body }) => {
      debug('Got %s <= %s', response.statusCode, req.query.url);
      res
        .status(response.statusCode)
        .set(response.headers)
        .send(response.body);
    })
    .catch(error => {
      console.error('error', error);
      res.status(502).send(error);
    });

  function login(url, auth, options = {}) {
    const [user, pass] = auth.split(':');

    debug('Querying %s', url);

    const { protocol, host, path, pathname } = parse(url);

    return doRequest(
      Object.assign(
        {
          method: 'post',
          url: `${protocol}//${host}/CookieAuth.dll?Logon`,
          jar: jar,
          form: Object.assign(
            {
              curl: encode(path),
              flags: 0,
              forcedownlevel: 0,
              formdir: 13,
            },
            {
              username: user,
              password: pass,
            }
          ),
        },
        options
      )
    );
  }
});

const server = app.listen(PORT, function() {
  console.log('Example app listening at port %s', server.address().port);
});
module.exports = server;
