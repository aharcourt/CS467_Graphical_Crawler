/* globals window, document */
window.Hercules.PreviousSearches = class PreviousSearches {
    constructor(options) {
        this.domElement = document.createElement("select");
        this.domElement.id = options.id;
        this.changeHandler = options.onchange;

        // bind _buildOption to maintain context
        this._handleChange = this._handleChange.bind(this);
        this.domElement.onchange = this._handleChange;

        this.update();
    }

    update() {
        let HERC_COOKIE = /hercules=([^;]*)/;
        let herculesCookie = document.cookie.match(HERC_COOKIE);
        if (herculesCookie) {
            herculesCookie = decodeURIComponent(herculesCookie[1]);
        } else {
            herculesCookie = "";
        }
        let searchCookie = new window.Hercules.SearchCookie(herculesCookie);
        this.searches = [ { id: 0, text: "--" } ];
        searchCookie.getCookies().forEach((cookie) => {
            this.searches.push({
                id: cookie.cookieID,
                text: cookie.rootURL,
                data: {
                    ExistingSearch: cookie.cookieID,
                    SearchType: cookie.searchType,
                    SearchDepth: cookie.searchDepth,
                    RootURL: cookie.rootURL,
                    keyword: cookie.keyword
                }
            });
        });

        this.options = this.searches.map((search) => {
            let option = document.createElement("option");
            option.value = search.id;
            option.textContent = search.text;
            return option;
        });

        this.domElement.innerHTML = "";
        this.options.forEach((option) => {
            this.domElement.appendChild(option);
        });
    }

    empty() {
        return this.options.length <= 1;
    }

    setSelected(value) {
        this.options.forEach((option) => {
            option.selected = false;
        });
        let selectedOption = this.options.find((option) => option.value == String(value));
        if (!selectedOption) {
            selectedOption = this.options[0];
        }
        selectedOption.selected = true;
    }

    _handleChange(ev) {
        let value = ev.target.value;
        value = +value; // cast to number;
        let search = this.searches.find((val) => val.id == value);
        if (!search) {
            search = this.searches[0];
        }
        this.changeHandler(search.data);
    }
};
