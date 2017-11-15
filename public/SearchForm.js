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

        // Bind class methods so that change handlers think they're called by
        // the class instance and not the inputs they're attached to.
        this._handleUrlChange = this._handleUrlChange.bind(this);
        this._handleSearchTypeChange = this._handleSearchTypeChange.bind(this);
        this._handleSearchDepthChange = this._handleSearchDepthChange.bind(this);

        // Do the thing.
        this._createForm();
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

    // Validate the state, store it, and update the HTML
    update(newState) {
        this._updateFormData(newState);
        this._updateHTMLState();
    }

    // Update the form data with new values. NEVER reassign this._formData, it
    // is a reference to the value sent to the server.
    _updateFormData(additionalState) {
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
    }

    _updateHTMLState() {
        this.url.value = this._formData.RootURL;
        this.dfs.checked = (this._formData.SearchType === "DFS");
        this.bfs.checked = (this._formData.SearchType === "BFS");
        this.searchDepth.value = this._formData.SearchDepth;

        this.submit.disabled = (
            !this._formData.RootURL
        );
    }
};
