/* global window, document */

// Define a place in the global namespace where all our code can go without poluting
// the rest of the namespace with a bunch of name-collide-y variables.
window.Hercules = {};

// Load each new file after the previous one is done (so that all the globals
// are defined, since I'm using globals instead of bower/webpack/AMD).
// https://stackoverflow.com/questions/1866717/document-createelementscript-adding-two-scripts-with-one-callback/1867135#1867135
window.Hercules.loadScripts = function loadScripts(scripts) {
    function loader(src, handler) {
        let script = document.createElement("script");
        script.src = src;
        script.onload = script.onreadystatechange = function() {
            script.onreadystatechange = script.onload = null;
            handler();
        };
        document.body.appendChild(script);
    }

    function run(){
        if (scripts.length == 0) {
            return;
        }
        loader(scripts.shift(), run);
        return;
    }

    run();
};

window.Hercules.loadScripts([
    "./chart",
    "./form"
]);
