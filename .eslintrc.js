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
        "no-debugger": "off",
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
        // "var" in javascript creates a variable in the function scope, even
        // if the declaration happens inside a for or while loop. "let" behaves
        // more like we expect variable assignment to work from other languages:
        // a variable defined in a loop is not available out of the loop. If
        // you will need it, you have to define it before the loop, like in C.
        "no-var": "error",

/*******  Just style things *********/
        "array-bracket-spacing": [
             "error",
             "always"
        ],
        "block-spacing": "error",
        "brace-style": [
            "error",
            "1tbs",
            { "allowSingleLine": true }
        ],
        "no-tabs": "error",
        "no-trailing-spaces": "error"
    }
};
