var MochaSuit = require("mocha-suit");
var Suit = MochaSuit("Your first test suit");
Suit.before(function() { ... });
Suit.it("test it!",function() { ... });
Suit.after(function() { ... });
new Suit();
/* ----------- will generate ----------- */
describe("Your first test suit",function() {
    before(function() { ... });
    it("test it!",function() { ... });
    after(function() { ... });
});