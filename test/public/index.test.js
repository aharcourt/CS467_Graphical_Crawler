/* global window, describe, it, document, beforeEach, expect */
require("../../public/index");
require("../../public/serverApi");

describe("index.js", () => {
    it("defines a loadScripts function", () => {
        expect(window.Hercules.loadScripts).to.be.a("function");
    });

    describe("loadScripts", () => {
        beforeEach(() => {
        // remove script tags added by previous tests
            let scripts = document.getElementsByTagName("script");
            // store the current length since it changes as we remove scripts
            const length = scripts.length;
            for (let i = 0; i < length; i++) {
                scripts[0].parentNode.removeChild(scripts[0]);
            }
        });

        it("creates a script tag targeting the first element of the array", () => {
            window.Hercules.loadScripts([ "some", "./urls" ]);
            let scripts = document.getElementsByTagName("script");
            expect(scripts.length).to.equal(1);
            expect(scripts[0].src).to.equal("some");
        });

        describe("when the first script loads", () => {
            let scripts;
            beforeEach(() => {
                window.Hercules.loadScripts([ "some", "./urls" ]);
                scripts = document.getElementsByTagName("script");
                scripts[0].onload();
            });

            it("creates a script tag targeting the second element of the array", () => {
            // A new script tag is added, so our collection expands
                expect(scripts.length).to.equal(2);
                expect(scripts[1].src).to.equal("./urls");
            });

            describe("when the last script loads", () => {
                beforeEach(() => {
                    scripts[1].onload();
                });

                it("doesn't create another script tag", () => {
                    expect(scripts.length).to.equal(2);
                });
            });
        });
    });
});
