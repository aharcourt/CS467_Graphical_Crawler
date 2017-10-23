/* global window */
window.Hercules.transformJSON = function transformJSON(json) {
    let graphEdges = [];
    let graphNodes = [];

    function buildEdge(edge) {
        return {
            group: "edges",
            data: {
                // TODO: use database id instead of meaningless number
                id: String(Math.random()),
                source: edge.SourceUrl,
                target: edge.DestinationUrl
            }
        };
    }

    let nodeMap = {}; // so we can check node existence in constant time
    function buildNode(url) {
        nodeMap[url] = true;
        // TODO: use the database id instead of a huge string for the id
        return {
            group: "nodes",
            data: {
                id: url,
                url: url
            }
        };
    }
    function buildNodes(edge) {
        let nodes = [];
        // if there is not a node with a particular URL, make it
        if (!nodeMap[edge.SourceUrl]) {
            nodes.push(buildNode(edge.SourceUrl));
        }
        if (!nodeMap[edge.DestinationUrl]) {
            nodes.push(buildNode(edge.DestinationUrl));
        }
        return nodes;
    }

    json.forEach((edge) => {
        graphEdges.push(buildEdge(edge));
        let nodes = buildNodes(edge);
        if (nodes[0]) {
            graphNodes.push(nodes[0]);
        }
        if (nodes[1]) {
            graphNodes.push(nodes[1]);
        }
    });

    console.log(graphNodes);
    console.log(graphEdges);
    return {
        "elements": [
            ...graphNodes,
            ...graphEdges
        ]
    };
};
