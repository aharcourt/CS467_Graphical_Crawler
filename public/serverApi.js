/* global window, fetch, Headers */
window.Hercules.postJSON = (json, url) => {
    // fetch is a Promise-based function which can be used instead of making
    // XMLHTTPRequest objects with callbacks. It is defined in most recent
    // browsers. Our code will only be tested in Chrome.
    return fetch(url, {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json" }),
        credentials: "same-origin", // enable cookies
        body: JSON.stringify(json)
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Server request returned " + response.statusText);
        }
        return response.json();
    }).catch((err) => {
        // fetch throws a network error if there was an internet issue.
        // We throw an error if there was an invalid server response like 500.
        // Additionally response.json() throws an error with invalid JSON.
        // In all cases, pretend we got a null response.
        console.error(err);
        return null;
    });
};
