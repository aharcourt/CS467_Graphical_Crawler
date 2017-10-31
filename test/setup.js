const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const chaiHttp = require("chai-http");

// expand chai to support sinon spies like expect(spy).to.have.been.called;
chai.use(sinonChai);
// expand chai to have "request" which gives us an api for testing HTTP calls
chai.use(chaiHttp);

// define certain globals so they can be used in tests
// - expect: expect(value).to.be(condition);
global.expect = chai.expect;
// - sinon: let mockedFunction = sinon.spy();
global.sinon = sinon;
// - request: request(server).get("/")
global.request = chai.request;
// - flag for AMAZING test reporter
global.isAmazing = false;

// Set up a fake DOM in node so that we can use browser things like document
// and window.
const { JSDOM: DOMConstructor } = require("jsdom");
const dom = new DOMConstructor(`
  <!DOCTYPE html>
  <html>
    <body>
    </body>
  </html>
`);
global.window = dom.window;
global.document = global.window.document;
global.HTMLElement = global.window.HTMLElement;

// - Hercules: we need this because we're doing globally namespaced front-end
//   code instead of bundling
global.window.Hercules = {};
// - fetch: we explicity do NOT mock fetch here. window.fetch needs its own
//   helper since we probably want to mock the HTTP calls for each function.
