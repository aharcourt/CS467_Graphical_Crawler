/* global describe, it, beforeEach, sinon, expect, isAmazing */
describe("passing test", function() {
    it("passes", function() {
        expect(true).to.equal(true);
    });
});

describe("sinon API", function() {
    let func;
    beforeEach(function() {
        func = sinon.spy();
    });

    it("spies can be called and their information read", function() {
        expect(func).to.not.have.been.called;
        func("__super secret recipe__");
        expect(func).to.have.been.called;
        expect(func).to.have.been.calledOnce;
        expect(func).to.have.been.calledWith("__super secret recipe__");
    });
});

if (isAmazing) {
    describe("Amazing, programmtically defined test", function() {
        for (let i = 0; i < 50; i++) {
            it("runs 50 times", function() {});
        }
    });
}
