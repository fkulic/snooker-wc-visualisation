var margin = {top: 20, right: 10, bottom: 10, left: 10},
width = 1500 - margin.left - margin.right,
halfWidth = width / 2,
height = 550 - margin.top - margin.bottom,
i = 0,
duration = 500,
root;

var getChildren = function(d){
    var a = [];
    if(d.winners) for(var i = 0; i < d.winners.length; i++){
        d.winners[i].isRight = false;
        d.winners[i].parent = d;
        a.push(d.winners[i]);
    }
    if(d.challengers) for(var i = 0; i < d.challengers.length; i++){
        d.challengers[i].isRight = true;
        d.challengers[i].parent = d;
        a.push(d.challengers[i]);
    }
    return a.length?a:null;
};

var tree = d3.layout.tree()
.size([height, width]);

var diagonal = d3.svg.diagonal()
.projection(function(d) { return [d.y, d.x]; });
var elbow = function (d, i){
    var source = calcLeft(d.source);
    var target = calcLeft(d.target);
    var hy = (target.y-source.y)/2;
    if(d.isRight) hy = -hy;
    return "M" + source.y + "," + source.x
    + "H" + (source.y+hy)
    + "V" + target.x + "H" + target.y;
};
var connector = elbow;

var calcLeft = function(d){
    var l = d.y;
    if(!d.isRight){
        l = d.y-halfWidth;
        l = halfWidth - l;
    }
    return {x : d.x, y : l};
};

var vis = d3.select("#chart").append("svg")
.attr("width", width + margin.right + margin.left)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var yearValue  = "wc2017";
drawStructure();

$("#yearSelection").change(function() {
    yearValue = this.value;
    drawStructure();
});

function drawStructure() {
    d3.json("json-data/" + yearValue + ".json", function(json) {
        root = json;
        root.x0 = height / 2;
        root.y0 = width / 2;

        var t1 = d3.layout.tree().size([height, halfWidth]).children(function(d){return d.winners;}),
        t2 = d3.layout.tree().size([height, halfWidth]).children(function(d){return d.challengers;});
        t1.nodes(root);
        t2.nodes(root);

        var rebuildChildren = function(node){
            node.children = getChildren(node);
            if(node.children) node.children.forEach(rebuildChildren);
        }
        rebuildChildren(root);
        root.isRight = false;
        update(root);
    });
}

var toArray = function(item, arr){
    arr = arr || [];
    var i = 0, l = item.children?item.children.length:0;
    arr.push(item);
    for(; i < l; i++){
        toArray(item.children[i], arr);
    }
    return arr;
};

function update(source) {
    // Compute the new tree layout.
    var nodes = toArray(source);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * 120 + halfWidth; });

    // Update the nodes…
    var node = vis.selectAll("g.node")
    .data(nodes, function(d) { return d.id || (d.id = ++i); });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
    .attr("class", "node")
    .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
    .on("click", click);

    nodeEnter.append("text")
    .attr("dy", -7)
    .attr("text-anchor", "middle")
    .text(function(d) { return d.name; })
    .style('fill', function() {
        // TODO: color text according to result of a match
        return "black";
    });

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
    .duration(duration)
    .attr("transform", function(d) { p = calcLeft(d); return "translate(" + p.y + "," + p.x + ")"; });


    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
    .duration(duration)
    .attr("transform", function(d) { p = calcLeft(d.parent||source); return "translate(" + p.y + "," + p.x + ")"; })
    .remove();

    // Update the links...
    var link = vis.selectAll("path.link")
    .data(tree.links(nodes), function(d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
    .attr("class", "link")
    .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return connector({source: o, target: o});
    });

    // Transition links to their new position.
    link.transition()
    .duration(duration)
    .attr("d", connector);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
    .duration(duration)
    .attr("d", function(d) {
        var o = calcLeft(d.source||source);
        if(d.source.isRight) o.y -= halfWidth - (d.target.y - d.source.y);
        else o.y += halfWidth - (d.target.y - d.source.y);
        return connector({source: o, target: o});
    })
    .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
        var p = calcLeft(d);
        d.x0 = p.x;
        d.y0 = p.y;
    });

    // Toggle children on click.
    function click(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        update(source);
    }
}
