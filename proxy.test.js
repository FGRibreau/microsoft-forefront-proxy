const assert = require('assert');
const request = require('supertest');

assert(process.env.TEST_URL);
assert(process.env.TEST_AUTH);

describe('loading express', function() {
  var server;
  beforeEach(function() {
    server = require('./proxy.js');
  });
  afterEach(function() {
    server.close();
  });

  it('responds to /?url', function testSlash(done) {
    request(server)
      .get(
        `/?url=${encodeURIComponent(process.env.TEST_URL)}&auth=${
          process.env.TEST_AUTH
        }`
      )
      .expect(200, done);
  });
});
