/* global window */
window.Hercules.transformJSON = function transformJSON(json) {
    let graphEdges = [];
    let graphNodes = [];

    function buildEdge(edge) {
        return {
            group: "edges",
            data: {
                id: `${edge.SourceId},${edge.DestinationId}`,
                source: edge.SourceId,
                target: edge.DestinationId
            }
        };
    }

    let nodeMap = {}; // so we can check node existence in constant time
    function buildNode(id, url, title) {
        nodeMap[id] = true;
        return {
            group: "nodes",
            data: {
                id: id,
                url: url,
                title: title
            }
        };
    }
    function buildNodes(edge) {
        let nodes = [];
        // if there is not a node with a particular URL, make it
        if (!nodeMap[edge.SourceId]) {
            nodes.push(buildNode(edge.SourceId, edge.SourceUrl, edge.SourceTitle));
        }
        if (!nodeMap[edge.DestinationId]) {
            nodes.push(buildNode(edge.DestinationId, edge.DestinationUrl, edge.DestinationTitle));
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
