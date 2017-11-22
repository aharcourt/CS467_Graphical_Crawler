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
    function buildNode(id, url, title, host) {
        nodeMap[id] = true;
        return {
            group: "nodes",
            data: {
                id: id,
                url: url,
                title: title,
                color: window.Hercules.getColorForHost(host),
            },
        };
    }
    function buildNodes(edge) {
        let nodes = [];
        // if there is no node with the same ID, create it
        if (!nodeMap[edge.SourceId]) {
            nodes.push(buildNode(edge.SourceId, edge.SourceUrl, edge.SourceTitle, edge.SourceHost));
        }
        if (!nodeMap[edge.DestinationId]) {
            nodes.push(buildNode(edge.DestinationId, edge.DestinationUrl, edge.DestinationTitle, edge.DestinationHost));
        }
        return nodes;
    }

    json.Edges.forEach((edge) => {
        graphEdges.push(buildEdge(edge));
        let nodes = buildNodes(edge);
        if (nodes[0]) {
            graphNodes.push(nodes[0]);
        }
        if (nodes[1]) {
            graphNodes.push(nodes[1]);
        }
    });

    // TODO: what about cached (status: 3) results?
    if (json.Result.status === 2) {
        // The search detected the keyword, change the color of that node.
        let keywordNode = graphNodes.find((node) => node.data.url === json.Result.keywordURL);
        keywordNode.data.color = window.Hercules.KEYWORD_COLOR;
    }

    // Assume the N/A node is the first node, and same for edge. Remove them.
    // (we happen to know they are, and iterating through the edges is slow)
    let naEdge = graphEdges.shift();
    let naNode = graphNodes.shift();
    if (naNode.data.url !== "N/A") {
        // If not, do a search
        graphNodes.unshift(naNode);
        let naNodeIndex = graphNodes.findIndex((node) => node.data.url === "N/A");
        let removed = graphNodes.splice(naNodeIndex, 1);
        naNode = removed[0];
    }
    if (naEdge.data.source !== naNode.data.id) {
        graphEdges.unshift(naEdge);
        let naEdgeIndex = graphEdges.findIndex((edge) => edge.data.source === naNode.data.id);
        graphEdges.splice(naEdgeIndex, 1);
    }

    return {
        "elements": [
            ...graphNodes,
            ...graphEdges
        ]
    };
};
