// ********************** Initialize server **********************************

const server = require('../index'); //TODO: Make sure the path to your index.js is correctly added

// ********************** Import Libraries ***********************************

const chai = require('chai'); // Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

// ********************** DEFAULT WELCOME TESTCASE ****************************

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });
});

// *********************** TODO: WRITE 2 UNIT TESTCASES **************************

describe('Testing register API', () => {
  it('positive : /register', done => {
    chai
      .request(server)
      .post('/register')
      .send({username: 'alex_mueller', password: 'generic_password'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('Negative : /register. Checking no password response', done => {
    chai
      .request(server)
      .post('/register')
      .send({username: "good_username"})
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
});

// ********************************************************************************

describe('Testing login API', () => {
  
  it('Negative : /login. Checking wrong username. We expect error status 500', done => {
    chai
      .request(server)
      .post('/login')
      .send({username: "bad_username", password: "some"})
      .end((err, res) => {
        expect(res).to.have.status(500);
        done();
      });
  });
});


describe('Testing base configuration redirect', () => {
  it('test route should redirect to /login with a 200 "good" status code', done => {
    chai
      .request(server)
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(200);
        res.should.redirectTo(/^.*127\.0\.0\.1.*\/aboutus$/);
        done();
      });
  });
});

describe('Testing base get /register route render', () => {
  it('/register get route should render the register page', done => {
    chai
      .request(server)
      .get('/register')
      .end((err, res) => {
        expect(res).to.have.status(200);
        res.should.be.html;
        done();
      });
  });
});

describe('Testing base get /search route', () => {
  it('/search get route should render the search page', done => {
    chai
      .request(server)
      .get('/search')
      .end((err, res) => {
        expect(res).to.have.status(200);
        res.should.be.html;
        //should add more tests
        done();
      });
  });
});

describe('Testing base get /home route', () => {
  it('/home get route should render the home page', done => {
    chai
      .request(server)
      .get('/home')
      .end((err, res) => {
        expect(res).to.have.status(200);
        res.should.be.html;
        //should add more tests
        done();
      });
  });
});

describe('Testing base get /login route', () => {
  it('/login get route should render the login page', done => {
    chai
      .request(server)
      .get('/login')
      .end((err, res) => {
        expect(res).to.have.status(200);
        res.should.be.html;
        //should add more tests
        done();
      });
  });
});