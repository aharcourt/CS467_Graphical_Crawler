/* globals window, document */

window.Hercules.setUpForm = function setUpForm() {
    const VALID_URL = /^https?:\/\//;
    const validateFormData = function validateFormData(data) {
        let errors = [];
        if (!data.RootURL || !data.RootURL.match(VALID_URL)) {
            errors.push({
                field: "RootURL",
                message: "*A Url (starting from http...) is required."
            });
        }
        return errors;
    };

    const params = {};
    let searchForm;
    const handleSubmit = (event) => {
        event.preventDefault(); // don't submit the normal way
        let errors = validateFormData(params);
        searchForm.applyErrors(errors);
        if (errors.length == 0) {
            searchForm.disable();
            window.Hercules.sendFormData(params).then((json) => {
                if (!json) {
                    return;
                }
                if (json.Result.status === -1) {
                    searchForm.applyErrors([ {
                        field: "RootURL",
                        message: "This Url failed to return a valid web page."
                    } ]);
                }
                searchForm.updatePreviousSearches();
                window.Hercules.populateChart(json);
            }).then(() => {
                searchForm.enable();
            }).catch(() => {
                searchForm.enable();
            });
        }
    };

    searchForm = new window.Hercules.SearchForm({
        params: params,
        onSubmit: handleSubmit
    });
    // for debug
    window.Hercules.searchForm = searchForm;

    document.getElementById("root").appendChild(searchForm.formTag);
};
