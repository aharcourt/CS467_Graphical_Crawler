module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
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


/*******  Just style things *********/
        "array-bracket-spacing": [
             "error",
             "always"
        ]
    }
};
