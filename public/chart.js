/* global window, document, cytoscape */
window.Hercules.setUpChart = function setUpChart() {
    const DEFAULT_JSON = {
        container: document.getElementById("cyChart"),
        style: [
            {
                selector: "node",
                style: {
                    "label": "data(label)", // call data("label") on the node
                    "background-color": "data(color)",
                    "text-wrap": "wrap",
                    "border-color": "#ccc",
                    "border-width": 4,
                    "border-opacity": 0.5,
                },
            },
            {
                selector: "edge",
                style: {
                    "width": 3,
                    "background-color": "#ccc",
                },
            },
        ],
        minZoom: 0.2,
        maxZoom: 4,
        layout: {
            name: "cose",
            animate: false,
        },
    };
    window.Hercules.DEFAULT_JSON = DEFAULT_JSON;

    // Initialize cytoscape.
    const cy = cytoscape(DEFAULT_JSON);
    window.Hercules.cy = cy;

    // Make the url show up above the node when it is hovered
    cy.on("mouseover", "node", (ev) => {
        let node = ev.target;
        let label = node.data("title") || "[undefined]";
        label += "\n";
        label += node.data("url") || "[undefined]";
        // The "label" field of the data object is usually empty. Give it a value.
        node.data("label", label);
    });
    cy.on("mouseout", "node", (ev) => {
        let node = ev.target;
        node.data("label", null); // remove the label from the field
    });

    // Make the selected page open in a new tab when clicked
    cy.on("click", "node", (ev) => {
        let url = ev.target.data("url");
        if (!url) {
            // The node is displaying [undefined] right now, so the user will not be
            // surprised if this does nothing.
            return;
        }
        window.open(url);
    });

    // show the "legend" now that the chart is visible
    document.getElementById("legend").classList.remove("hidden");
};

window.Hercules.populateChart = function populateChart(json) {
    if (json == null) {
        return;
    }
    let chartJSON = {
        ...window.Hercules.DEFAULT_JSON,
        ...window.Hercules.transformJSON(json)
    };
    window.Hercules.cy.json(chartJSON);
    setTimeout(() => {
        // lay out the nodes more cleanly
        let coseLayout = window.Hercules.cy.layout({ name: "cose" });
        coseLayout.run();
    });
};
