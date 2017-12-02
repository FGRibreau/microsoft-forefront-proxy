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
          jar: true,
          // add this cipthers otherwise ISS yield socket hang up error.
          ciphers: 'DES-CBC3-SHA',
          headers: {
            // simulate a valid user-agent otherwise IIS blocks the request
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
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

app.get('/', function(req, res) {
  if (!req.query.url || !req.query.auth) {
    res.status(400).send('`url` and/or `auth` query parameters are missing.');
    return;
  }

  const jar = request.jar();

  login(req.query.url, req.query.auth)
    .then(() =>
      doRequest({
        method: 'get',
        url: req.query.url,
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

  function login(url, auth) {
    const [user, pass] = auth.split(':');

    debug('Querying %s', url);

    const { protocol, host, path, pathname } = parse(url);

    return doRequest({
      method: 'post',
      url: `${protocol}//${host}/CookieAuth.dll?Logon`,
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
      headers: {
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
    });
  }
});

const server = app.listen(PORT, function() {
  console.log('Example app listening at port %s', server.address().port);
});
module.exports = server;
