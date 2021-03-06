/* globals window, document, HTMLElement */
const DFS_SEARCH_DEPTH = 20;
const BFS_SEARCH_DEPTH = 2;

window.Hercules.SearchForm = class SearchForm {
    constructor(options) {
        // store options
        this._formData = options.params;
        this._onSubmit = options.onSubmit;

        // set form data to initial values (will mutate provided params, but so
        // does every other method in the class, that's why it was provided)
        this._formData.RootURL = "";
        this._formData.SearchType = "DFS";
        this._formData.SearchDepth = 0;
        this._formData.Keyword = "";

        // Bind class methods so that change handlers think they're called by
        // the class instance and not the inputs they're attached to.
        this._handleUrlChange = this._handleUrlChange.bind(this);
        this._handleSearchTypeChange = this._handleSearchTypeChange.bind(this);
        this._handleSearchDepthChange = this._handleSearchDepthChange.bind(this);
        this._handleKeywordChange = this._handleKeywordChange.bind(this);
        this._handlePrevSearchChange = this._handlePrevSearchChange.bind(this);

        // Do the thing.
        this._createForm();
        this.updatePreviousSearches();
    }

    // Add error messages to fields
    applyErrors(errors) {
        // remove existing errors
        let toRemove = document.getElementsByClassName("error");
        while (toRemove.length) {
            toRemove[0].parentNode.removeChild(toRemove[0]);
        }
        // add error next to relevant field
        errors.forEach((error) => {
            switch (error.field) {
            case "RootURL": {
                if (!this.url) {
                    return;
                }
                let message = document.createElement("span");
                message.classList.add("error");
                message.textContent = error.message;
                this.url.parentNode.appendChild(message);
            }
            }
        });
    }

    disable() {
        if (!this.submit) {
            return;
        }
        this.submit.disabled = true;
    }

    enable() {
        if (!this.submit) {
            return;
        }
        this.submit.disabled = false;
    }

    updatePreviousSearches() {
        if (this.prevSearches) {
            this.prevSearches.update();
            if (this.prevSearches.empty()) {
                this.prevSearchesWrapper.style.display = "none";
            } else {
                this.prevSearchesWrapper.style.display = "block";
            }
        }
    }

    // Build a <form> HTML tag with references to all its inputs. Bind appropriate
    // change handlers to all the fields. This is essentially a super simple
    // version of the React API with none of the relevant reconciliation
    _createForm() {
        // <form>
        this.formTag = this._createElement("form", {
            id: "searchForm",
            onsubmit: this._onSubmit
        });

        // Inital Url input field
        let urlField = this._createField();
        this.url = this._createElement("input", {
            type: "text",
            name: "url",
            id: "url",
            value: "",
            onchange: this._handleUrlChange
        });
        let urlLabel = this._createElement("label", {
            for: "url",
            textContent: "Initial Url"
        });
        urlField.appendChild(urlLabel);
        urlField.appendChild(this.url);
        this.formTag.appendChild(urlField);

        // Search Type radio buttons
        let searchTypeField = this._createField();
        this.bfs = this._createElement("input", {
            type: "radio",
            name: "searchType",
            id: "bfs",
            value: "bfs",
            onchange: this._handleSearchTypeChange
        });
        let bfsLabel = this._createElement("label", {
            for: "bfs",
            textContent: "Breadth First"
        });
        this.dfs = this._createElement("input", {
            type: "radio",
            name: "searchType",
            id: "dfs",
            value: "dfs",
            onchange: this._handleSearchTypeChange,
            checked: true // Depth first is the default search type
        });
        let dfsLabel = this._createElement("label", {
            for: "dfs",
            textContent: "Depth First"
        });
        let searchTypeLabel = this._createElement("label", {
            textContent: "Search Type"
        });
        searchTypeField.appendChild(searchTypeLabel);
        searchTypeField.appendChild(this.bfs);
        searchTypeField.appendChild(bfsLabel);
        searchTypeField.appendChild(this.dfs);
        searchTypeField.appendChild(dfsLabel);
        this.formTag.appendChild(searchTypeField);

        // Search depth number input
        let searchDepthField = this._createField();
        this.searchDepth = this._createElement("input", {
            type: "number",
            name: "searchDepth",
            id: "searchDepth",
            onchange: this._handleSearchDepthChange,
            min: 0,
            max: DFS_SEARCH_DEPTH,
            value: 0
        });
        let searchDepthLabel = this._createElement("label", {
            for: "searchDepth",
            textContent: "Depth of Search"
        });
        searchDepthField.appendChild(searchDepthLabel);
        searchDepthField.appendChild(this.searchDepth);
        this.formTag.appendChild(searchDepthField);

        // Keyword text input
        let keywordField = this._createField();
        this.keyword = this._createElement("input", {
            type: "text",
            name: "keyword",
            id: "keyword",
            value: "",
            onchange: this._handleKeywordChange,
        });
        let keywordLabel = this._createElement("label", {
            for: "keyword",
            textContent: "Keyword (stops search when encountered)"
        });
        keywordField.appendChild(keywordLabel);
        keywordField.appendChild(this.keyword);
        this.formTag.appendChild(keywordField);

        // wrapper for previous searches which is hidden when there are none
        this.prevSearchesWrapper = this._createElement("div", { id: "prevSearches" });
        this.formTag.appendChild(this.prevSearchesWrapper);

        let separator = this._createElement("i", {
            id: "separator",
            textContent: "-OR-"
        });
        this.prevSearchesWrapper.appendChild(separator);

        let prevSearchesField = this._createField();
        this.prevSearches = new window.Hercules.PreviousSearches({
            id: "searches",
            onchange: this._handlePrevSearchChange
        });
        let prevSearchesLabel = this._createElement("label", {
            for: "searches",
            textContent: "Saved Searches"
        });
        prevSearchesField.appendChild(prevSearchesLabel);
        prevSearchesField.appendChild(this.prevSearches.domElement);
        this.prevSearchesWrapper.appendChild(prevSearchesField);

        // Submit button
        this.submit = this._createElement("input", {
            type: "submit",
            value: "Search"
        });
        this.formTag.appendChild(this.submit);

        // Perform any updates. Called whenever something changes
        this.update();
    }

    // Creates/extends an element with whatever attributes were passed in.
    _createElement(tagName, attributes) {
        let tag = (tagName instanceof HTMLElement) ? tagName : document.createElement(tagName);
        for (let prop in attributes) {
            if (attributes.hasOwnProperty(prop)) {
                tag[prop] = attributes[prop];
            }
        }
        return tag;
    }

    _createField() {
        const divTag = document.createElement("div");
        divTag.classList.add("field");
        return divTag;
    }

    // Update form data with new value from inputs.
    _handleUrlChange(ev) {
        const value = ev.target.value;
        this.update({ RootURL: value });
    }
    _handleSearchTypeChange(ev) {
        const value = ev.target.value;
        if (value === "dfs") {
            this.update({ SearchType: "DFS" });
        } else if (value === "bfs") {
            this.update({ SearchType: "BFS" });
        }
    }
    _handleSearchDepthChange(ev) {
        let value = ev.target.valueAsNumber;
        this.update({ SearchDepth: value });
    }
    _handleKeywordChange(ev) {
        let value = ev.target.value;
        this.update({ Keyword: value });
    }
    _handlePrevSearchChange(prevSearchParams) {
        this.update(prevSearchParams);
    }

    // Validate the state, store it, and update the HTML
    update(newState) {
        this._updateFormData(newState);
        this._updateHTMLState();
    }

    // Update the form data with new values. NEVER reassign this._formData, it
    // is a reference to the value sent to the server.
    _updateFormData(additionalState) {
        if (!(additionalState && additionalState.ExistingSearch)) {
            // If anything other than the previous searches dropdown is touched,
            // we are no longer submitting an existing search.
            delete this._formData.ExistingSearch;
        }
        const newState = Object.assign({}, this._formData, additionalState);

        this._formData.RootURL = newState.RootURL;

        let type = newState.SearchType;
        if (type === "DFS") {
            this._formData.SearchType = "DFS";
            this.searchDepth.max = DFS_SEARCH_DEPTH;
        } else {
            this._formData.SearchType = "BFS";
            this.searchDepth.max = BFS_SEARCH_DEPTH;
        }

        let depth = newState.SearchDepth;
        // make sure value conforms to expectations (min, max, and step)
        depth = Math.max(depth, this.searchDepth.min);
        depth = Math.min(depth, this.searchDepth.max);
        depth = Math.floor(depth);
        this._formData.SearchDepth = depth;

        this._formData.Keyword = newState.Keyword;
        this._formData.ExistingSearch = newState.ExistingSearch;
    }

    _updateHTMLState() {
        this.url.value = this._formData.RootURL;
        this.dfs.checked = (this._formData.SearchType === "DFS");
        this.bfs.checked = (this._formData.SearchType === "BFS");
        this.searchDepth.value = this._formData.SearchDepth;
        this.keyword.value = this._formData.Keyword;
        this.prevSearches.setSelected(this._formData.ExistingSearch);
    }
};
