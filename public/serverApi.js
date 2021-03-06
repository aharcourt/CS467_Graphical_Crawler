/* global window, fetch, Headers */
window.Hercules.sendFormData = function sendFormData(params) {
    window.Hercules.showLoader();
    // fetch is a Promise-based function which can be used instead of making
    // XMLHTTPRequest objects with callbacks. It is defined in most recent
    // browsers. Our code will only be tested in Chrome.
    return fetch("/crawl", {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json" }),
        credentials: "same-origin", // enable cookies
        body: JSON.stringify(params)
    }).then((response) => {
        window.Hercules.hideLoader();
        if (!response.ok) {
            throw new Error("Server request returned " + response.statusText);
        }
        return response.json();
    }).catch((err) => {
        window.Hercules.hideLoader();
        // fetch throws a network error if there was an internet issue.
        // We throw an error if there was an invalid server response like 500.
        // Additionally response.json() throws an error with invalid JSON.
        // In all cases, pretend we got a null response, which is ignored by cytoscape.
        console.error(err);
        return null;
    });
};
