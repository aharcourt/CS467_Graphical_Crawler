/* globals describe, request, it, expect, before, after, beforeEach */
let cheerio = require("cheerio");

describe("crawler.js", () => {
    let server;
    // called once before the suite
    before(() => {
        server = require("../crawler");
    });

    // called once after the suite
    after(() => {
        server.close();
    });

    it("responds to GET /", (done) => {
        // request comes from chai-http: https://github.com/chaijs/chai-http
        request(server)
            .get("/")
            .end((err, response) => {
                expect(err).to.be.null;
                expect(response).to.have.status(200);
                done();
            });
    }).timeout(5000); // test fails if the argument "done" to the test is not called within timeout (default 2000)

    describe("GET /", () => {
        let getRequest;
        // called once before every test
        beforeEach(() => {
            getRequest = request(server).get("/");
        });

        it("serves an HTML page which loads the index.js script", (done) => {
            getRequest.end((err, response) => {
                expect(response).to.be.html;
                let $ = cheerio.load(response.text);
                let scripts = $("script");
                expect(scripts.last().attr("src")).to.equal("./index.js");
                done();
            });
        });
    });

    it("responds to POST /crawl", (done) => {
        request(server)
            .post("/crawl")
            .send({
                SearchType: "DFS",
                SearchDepth: 0,
                RootURL: "http://www.google.com",
            })
            .end((err, response) => {
                expect(err).to.be.null;
                expect(response).to.have.status(200);
                done();
            });
    });

    describe("POST /crawl", () => {
        let postRequest;
        beforeEach(() => {
            postRequest = request(server).post("/crawl");
        });

        // this test spams the console with the error message since both our server
        // and the test log to stdout. There are ways around this, but I haven't
        // cared enough to do it.
        it("responds with 500 if search type is invalid", (done) => {
            postRequest.send({
                SearchType: "bogus",
                SearchDepth: 0,
                RootURL: "http://www.google.com",
            }).end((err, response) => {
                expect(err).to.not.be.null;
                expect(response).to.have.status(500);
                done();
            });
        });

        it("responds with JSON for the search result when search type is DFS", (done) => {
            postRequest.send({
                SearchType: "DFS",
                SearchDepth: 0,
                RootURL: "http://www.google.com",
            }).end((err, response) => {
                expect(response).to.be.json;
                let json = JSON.parse(response.text);
                expect(json).to.be.an.instanceOf(Array);
                expect(json.length).to.equal(0);
                done();
            });
        });

        it("responds with JSON for the search result when search type is BFS", (done) => {
            postRequest.send({
                SearchType: "BFS",
                SearchDepth: 0,
                RootURL: "http://www.google.com",
            }).end((err, response) => {
                expect(response).to.be.json;
                let json = JSON.parse(response.text);
                expect(json).to.be.an.instanceOf(Array);
                expect(json.length).to.equal(0);
                done();
            });
        });

        it("responds with more JSON for a search result with more searchDepth", (done) => {
            postRequest.send({
                SearchType: "DFS", /// use DFS because it's faster
                SearchDepth: 1,
                RootURL: "http://www.google.com",
            }).end((err, response) => {
                let json = JSON.parse(response.text);
                expect(json.length).to.be.above(0);
                done();
            });
        });

        describe("JSON response", () => {
            // This test is inaccurate, but it passes. It should reflect the database JSON eventually.
            it("has an array of source and destination urls", (done) => {
                postRequest.send({
                    SearchType: "DFS",
                    SearchDepth: 1,
                    RootURL: "http://www.google.com",
                }).end((err, response) => {
                    let json = JSON.parse(response.text);
                    expect(json).to.be.an.instanceOf(Array);
                    expect(json[0]).to.have.keys("SourceUrl", "DestinationUrl", "SourceTitle", "Level");
                    done();
                });
            });
        });
    });
});
