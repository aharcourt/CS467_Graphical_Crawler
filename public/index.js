/* global window, document, cytoscape */

window.__debugGlobals = {};

const DEFAULT_JSON = {
    container: document.getElementById("cyChart"),
    style: [
        {
            selector: "node",
            style: {
                "background-color": "#555",
                "label": "data(label)", // call data("label") on the node
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
    maxZoom: 5,
    layout: {
        name: "cose",
        animate: false,
    },
};

function main() {
    // Initialize cytoscape. TODO: take it off of window
    const cy = cytoscape(DEFAULT_JSON);
    window.__debugGlobals.cy = cy;

    // Make the url show up above the node when it is hovered
    cy.on("mouseover", "node", (ev) => {
        let node = ev.target;
        let label = node.data("url") || "[undefined]";
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

    /*
  *****************************************************************************
  TODO: make the JSON come from the server, not from pasting it into a textarea
  */
    let test = document.getElementById("test");
    test.onchange = function (ev) {
        let value = ev.target.value;
        try {
            value = JSON.parse(value.trim());
        } catch (err) {
            console.log("invalid json: " + value);
            return; // don't waste time with invalid JSON
        }
        cy.json({ ...DEFAULT_JSON, ...value });
        setTimeout(() => {
            // lay out the nodes more cleanly
            let coseLayout = cy.layout({ name: "cose" });
            coseLayout.run();
        });
    };
}

main();
