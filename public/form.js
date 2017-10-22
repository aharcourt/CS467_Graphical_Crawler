/* globals window, document */
class SearchForm {
    constructor(options) {
        // store options
        this._formData = options.params;
        this._onSubmit = options.onSubmit;

        // Bind class methods so that change handlers think they're called by
        // the class instance and not the inputs they're attached to.
        this._handleUrlChange = this._handleUrlChange.bind(this);

        // Do the thing.
        this._createForm();
    }

    // Build a <form> HTML tag with references to all its inputs. Bind appropriate
    // change handlers to all the fields.
    _createForm() {
        this.formTag = document.createElement("form");
        this.formTag.id = "searchForm";
        this.formTag.onsubmit = this._onSubmit;

        this._addInput("text", "url", "Initial Url", this._handleUrlChange);
        this._addInput("submit", "submit", "Search", this._onSubmit);
    }

    // Helper to create an input with a label in the form.
    _addInput(type, name, label, onChange) {
        const input = document.createElement("input");
        this[name]     = input;
        input.type     = type;
        input.id       = name;
        input.name     = name;
        input.onchange = onChange;

        const labelTag = document.createElement("label");
        labelTag.for         = name;
        labelTag.textContent = label;

        this.formTag.appendChild(labelTag);
        this.formTag.appendChild(input);
    }

    // Update form data with new value from input.
    _handleUrlChange(ev) {
        const value = ev.target.value;
        this._formData.RootURL = value;
        this.renderSubmitButton();
    }

    // Enable or disable submit button based on the values on the form data
    renderSubmitButton() {
        this.submit.disabled = (
            !this._formData.RootURL
        );
    }
}

// I don't believe it's possible to call these functions before the page is properly
// loaded, but better safe than sorry. Call a function "toCall" as soon as "when"
// returns true.
window.Hercules.eventuallyCall = function eventuallyCall(toCall, when) {
    if (when()) {
        toCall();
    } else {
        console.warn("Attempted to call a function before dependencies were loaded. Retrying in 50ms, but global dependencies could change in the mean time.");
        setTimeout(eventuallyCall, 50);
    }
};

window.Hercules.setUpForm = function setUpForm() {
    const params = {};

    const handleSubmit = (event) => {
        event.preventDefault(); // don't submit the normal way
        window.Hercules.eventuallyCall(
            window.Hercules.sendFormData,
            () => (typeof window.Hercules.sendFormData === "function")
        );
    };

    const searchForm = new SearchForm({
        params: params,
        onSubmit: handleSubmit
    });

    window.Hercules.eventuallyCall(
        () => document.getElementById("root").appendChild(searchForm.formTag),
        () => Boolean(document.getElementById("root"))
    );
};

window.Hercules.setUpForm();
