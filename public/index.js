const DEFAULT_JSON = {
  container: document.getElementById("cyChart"),
  style: [
    {
      selector: "node",
      style: {
        "background-color": "#555",
        "label": "data(id)", // define node labels to be their ids
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
};

function main() {
  // Initialize cytoscape
  let cy = cytoscape(DEFAULT_JSON);

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
  }
}

main();
