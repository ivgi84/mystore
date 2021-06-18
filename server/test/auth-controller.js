const expect = require('chai').expect;
const sinon = require('sinon');

const User = require('../model/user');
const AuthController = require('../contollers/auth');

describe('AuthController - login', function () {
  it('should throw error with 500 if db failes', function (done) {
    sinon.stub(User, 'findOne');
    User.findOne.throws();

    const req = {
      body:{
        email:'asdasd@asdas.co',
        password: '1232131'
      }
    }

    AuthController.login(req, {}, () => {}).then(result => {
      expect(result).to.be.an('error');
      expect(result).to.have.property('statusCode', 500);
      done();
    })

    expect();

    User.findOne.restore();
  })
  
});