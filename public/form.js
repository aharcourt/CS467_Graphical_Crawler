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
            window.Hercules.sendFormData(params);
        }
    };

    searchForm = new window.Hercules.SearchForm({
        params: params,
        previousSearchCookie: new window.Hercules.SearchCookie(document.cookie),
        onSubmit: handleSubmit
    });
    // for debug
    window.Hercules.searchForm = searchForm;

    document.getElementById("root").appendChild(searchForm.formTag);
};
