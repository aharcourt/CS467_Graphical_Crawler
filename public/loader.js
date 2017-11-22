/* global window, document */
window.Hercules.showLoader = function showLoader() {
    window.Hercules.hideLoader(); // just in case
    let loader = document.createElement("div");
    loader.classList.add("loader");
    let container = document.createElement("div");
    container.id = "loaderContainer";
    container.appendChild(loader);
    document.body.appendChild(container);
};

window.Hercules.hideLoader = function hideLoader() {
    let container = document.getElementById("loaderContainer");
    if (container) {
        container.parentNode.removeChild(container);
    }
};
