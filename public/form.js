/* globals window, document */

window.Hercules.setUpForm = function setUpForm() {
    const buildSearchForm = (prevSearches) => {
        const formParams = {};
        const handleSearch = (event) => {
            event.preventDefault(); // don't submit the normal way, it refreshes the page
            window.Hercules.postJSON(formParams, "/crawl").then((json) => {
                window.Hercules.populateChart(json); // null JSON is ignored in cytoscape
            });
        };

        const searchForm = new window.Hercules.SearchForm({
            params: formParams,
            prevSearches: prevSearches,
            onSubmit: handleSearch
        });
        window.Hercules.searchForm = searchForm;

        document.getElementById("root").appendChild(searchForm.formTag);
    };

    const nameParams = {};
    const handleNameSubmit = (event) => {
        event.preventDefault();
        window.Hercules.postJSON(nameParams, "/signin").then((prevSearches) => {
            buildSearchForm(prevSearches);

            // remove the name form
            let nameForm = window.Hercules.nameForm;
            window.Hercules.nameForm = null;
            nameForm.formTag.parentNode.removeChild(nameForm.formTag);
        });
    };

    const nameForm = new window.Hercules.NameForm({
        params: nameParams,
        onSubmit: handleNameSubmit
    });
    window.Hercules.nameForm = nameForm;

    document.getElementById("root").appendChild(nameForm.formTag);
};
