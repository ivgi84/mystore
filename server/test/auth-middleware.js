const expect = require('chai').expect;
const authMiddleware = require('../middleware/is-auth');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');

describe('Auth middleware', function(){
  it('should throw an error if no auth header passed', function(){
    const req = {
      get: function(){
        return null;
      }
    };
  
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw('not authanticated');
  });
  
  it('should throw an error if the auth header is only 1 string', function(){
  
    const req = {
      get: function(){
        return 'xyz';
      }
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw('asd');
  });

if('should yield a userId after decoding the token', function(){
  const req = {
    get: function(){
      return 'Bearer asdasdasdasda';
    }
  };
  sinon.stub(jwt, 'verify'); //overriding a function MOCK
  jwt.verify.returns({userId:'abc'})
  authMiddleware(req, {}, ()=>{});

  jwt.verify.restore(); //restring real function

  expect(req).to.have.property('userId');
})


})

