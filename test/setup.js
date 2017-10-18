const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");

// expand chai to support sinon spies like expect(spy).to.have.been.called;
chai.use(sinonChai);

// define certain globals so they can be used in tests
// - expect: expect(value).to.be(condition);
global.expect = chai.expect;
// - sinon: let mockedFunction = sinon.spy();
global.sinon = sinon;
// - flag for AMAZING test reporter
global.isAmazing = false;
