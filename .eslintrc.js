module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true,
        },
    },
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ],
        // allow us to use console.log/warn/error so we can see logs
        "no-console": "off",
        // the following functions MUST be followed by a return: [callback, cb, next]
        "callback-return": "error",
        // Object shorthand means that { x: x } can be written { x }, which I
        // love, but it is unlike any other language and can be confusing
        "object-shorthand": [
             "error",
             "never"
        ],
        // The nature of callback hell is that we often define callbacks with
        // unused arguments, like "next" in the 500 page. Because it is so
        // frequent in our use case, I'll just ignore variables in arguments
        "no-unused-vars": [
             "error",
             { "args": "none" }
        ],


/*******  Just style things *********/
        "array-bracket-spacing": [
             "error",
             "always"
        ],
    }
};
