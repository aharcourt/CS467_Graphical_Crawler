/* globals window, document */

// I don't believe it's possible to call these functions before the page is properly
// loaded, but better safe than sorry. Call a function "toCall" as soon as "when"
// returns true.
window.Hercules.eventuallyCall = function eventuallyCall(toCall, when) {
    if (when()) {
        toCall();
    } else {
        console.warn("Attempted to call a function before dependencies were loaded. Retrying in 50ms, but global dependencies could change in the mean time.");
        setTimeout(() => eventuallyCall(toCall, when), 50);
    }
};

window.Hercules.setUpForm = function setUpForm() {
    const params = {};

    const handleSubmit = (event) => {
        event.preventDefault(); // don't submit the normal way
        window.Hercules.eventuallyCall(
            () => window.Hercules.sendFormData(params),
            () => (typeof window.Hercules.sendFormData === "function")
        );
    };

    const searchForm = new window.Hercules.SearchForm({
        params: params,
        onSubmit: handleSubmit
    });

    window.Hercules.eventuallyCall(
        () => document.getElementById("root").appendChild(searchForm.formTag),
        () => Boolean(document.getElementById("root"))
    );
};
