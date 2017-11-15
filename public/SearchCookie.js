// Define a SearchCookie class to help manage saved searches
class SearchCookie {
    // raw: [ [cookieId,searchType,searchDepth,rootURL,keyword] ]
    constructor(raw) {
        this.raw = raw;
        this._build();
    }

    _build() {
        try {
            this._cookies = JSON.parse(this.raw).map((cookieArray) => {
                return {
                    cookieID: cookieArray[0],
                    searchType: cookieArray[1],
                    searchDepth: cookieArray[2],
                    rootURL: cookieArray[3],
                    keyword: cookieArray[4]
                };
            });
        } catch (err) {
            this._cookies = [];
        }
    }

    getCookies() {
        return this._cookies;
    }

    withID(id) {
        return this._cookies.find((cookie) => {
            return cookie.cookieID === id;
        });
    }

    addCookie(id, searchType, searchDepth, rootURL, keyword) {
        this._cookies.unshift({ // put the new cookie at the "top" of the list
            cookieID: id,
            searchType: searchType,
            searchDepth: searchDepth,
            rootURL: rootURL,
            keyword: keyword
        });
        this._cookies = this._cookies.slice(0, 20); // make sure we only have 20 cookies (there's a byte limit)
    }

    toString() {
        let values = this._cookies.map((cookie) => {
            return [
                cookie.cookieID,
                cookie.searchType,
                cookie.searchDepth,
                cookie.rootURL,
                cookie.keyword,
                cookie.count
            ];
        });
        return JSON.stringify(values);
    }
}

/* globals window, module */
// Expose the SearchCookie class to whoever is trying to consume it.
if (typeof window !== "undefined" && window.Hercules) {
    // We're on the front-end, save the class to the Hercules namespace.
    window.Hercules.SearchCookie = SearchCookie;
} else if (module) {
    // We're on the server, allow SearchCookie to be required.
    module.exports = SearchCookie;
}
