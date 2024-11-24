// Load the data
d3.csv("data/sankeyData.csv").then(data => {
    // Format the data for Sankey
    let links = data.map(d => ({
        source: d["Country of birth/nationality"].trim(),
        target: d["Country"].trim(),
        value: +d["Value"]
    }));

    // Create a graph structure
    const graph = {};
    links.forEach(link => {
        if (!graph[link.source]) graph[link.source] = [];
        graph[link.source].push(link.target);
    });

    // Function to detect and remove cycles iteratively
    const removeCycles = (links) => {
        const incomingEdges = {};
        const outgoingEdges = {};
        links.forEach(link => {
            if (!outgoingEdges[link.source]) outgoingEdges[link.source] = new Set();
            if (!incomingEdges[link.target]) incomingEdges[link.target] = new Set();
            outgoingEdges[link.source].add(link.target);
            incomingEdges[link.target].add(link.source);
        });

        const queue = [];
        const safeLinks = [];

        // Detect nodes without incoming edges
        Object.keys(outgoingEdges).forEach(node => {
            if (!incomingEdges[node] || incomingEdges[node].size === 0) {
                queue.push(node);
            }
        });

        while (queue.length > 0) {
            const node = queue.shift();
            const targets = outgoingEdges[node] || new Set();

            targets.forEach(target => {
                safeLinks.push({ source: node, target, value: links.find(l => l.source === node && l.target === target).value });

                // Remove the edge and update incoming edges
                outgoingEdges[node].delete(target);
                incomingEdges[target].delete(node);

                // Add target to queue if no incoming edges remain
                if (incomingEdges[target].size === 0) {
                    queue.push(target);
                }
            });

            // Remove processed node
            delete outgoingEdges[node];
        }

        return safeLinks;
    };

    // Remove cycles from the links
    const safeLinks = removeCycles(links);

    // Generate nodes
    const allNodes = Array.from(new Set(safeLinks.flatMap(l => [l.source, l.target])));
    const nodesArray = allNodes.map(id => ({ id }));

    // Map nodes to indices
    const nodeMap = Object.fromEntries(nodesArray.map((node, i) => [node.id, i]));
    const sankeyLinks = safeLinks.map(link => ({
        source: nodeMap[link.source],
        target: nodeMap[link.target],
        value: link.value
    }));

    // Set up dimensions and SVG container
    const width = 960;
    const height = 600;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const sankey = d3.sankey()
        .nodeWidth(15)
        .nodePadding(10)
        .extent([[1, 1], [width - 1, height - 1]]);

    const sankeyData = sankey({
        nodes: nodesArray.map(d => ({ ...d })),
        links: sankeyLinks
    });

    svg.append("g")
        .selectAll("path")
        .data(sankeyData.links)
        .enter()
        .append("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke-width", d => Math.max(1, d.width))
        .attr("stroke", "#69b3a2")
        .attr("fill", "none");

    const node = svg.append("g")
        .selectAll("g")
        .data(sankeyData.nodes)
        .enter()
        .append("g");

    node.append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("fill", "#4682b4")
        .attr("stroke", "#000");

    node.append("text")
        .attr("x", d => d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .text(d => d.id)
        .filter(d => d.x0 < width / 2)
        .attr("x", d => d.x1 + 6)
        .attr("text-anchor", "start");
});
