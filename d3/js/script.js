var margin = {top: 20, right: 10, bottom: 10, left: 10};
var width = 1500 - margin.left - margin.right, halfWidth = width / 2;
var height = 600 - margin.top - margin.bottom;
var i = 0;
var duration = 500;
var root;
var names;
var slider;

// Tick formater for slider
var tickFormatter = function(d) {
    switch(d) {
        case 2:
        return "QuarterFinals";
        case 3:
        return "SemiFinals";
        case 4:
        return "Finals";
        case 5:
        return "Winner";
        default:
        return "Round " + (d + 1);
    }
}
// Initialize slider
setupSlider();

var getChildren = function(d) {
    var a = [];
    if(d.winners) {
        for(var i = 0; i < d.winners.length; i++) {
            d.winners[i].isRight = false;
            d.winners[i].parent = d;
            a.push(d.winners[i]);
        }
    }
    if(d.challengers) {
        for(var i = 0; i < d.challengers.length; i++) {
            d.challengers[i].isRight = true;
            d.challengers[i].parent = d;
            a.push(d.challengers[i]);
        }
    }
    return a.length ? a : null;
};

var tree = d3.layout.tree()
.size([height, width]);


// Elbow connector
var connector = function(d, i) {
    var source = calcLeft(d.source);
    var target = calcLeft(d.target);
    var hy = (target.y-source.y)/2;
    if(d.isRight) {
        hy = -hy;
    }
    return  "M" + source.y + " " + source.x + " " +
    "H" + (source.y + hy) + " " +
    "V" + target.x + " " +
    "H" + target.y;
};

var calcLeft = function(d) {
    var l = d.y;
    if(!d.isRight){
        l = width- d.y;
    }
    return {x : d.x, y : l};
};

var vis = d3.select("#bracketsChart").append("svg")
.attr("width", width + margin.right + margin.left)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var yearValue  = "wc2017";
drawStructure();

var years = d3.selectAll("#yearSelection li")
.on("click", function() {
    years.classed("selected", false);
    this.classList.add("selected");
    yearValue = "wc" + this.innerHTML;
    drawStructure();

    document.querySelector("#imgContainer img").src = "images/winner_" + this.innerHTML + ".jpg";
    // Reset slider
    setupSlider();
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

        var rebuildChildren = function(node) {
            node.children = getChildren(node);
            if(node.children) {
                node.children.forEach(rebuildChildren);
            }
        }
        rebuildChildren(root);
        root.isRight = false;
        update(root);
    });
}

// JSON to array
var toArray = function(item, arr) {
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
    .on("mouseover", highlightNames)
    .on("mouseleave", dehighlightNames);

    // Append names
    names = nodeEnter.append("text")
    .attr("dy", -7)
    .attr("text-anchor", "middle")
    .text(function(d) {
        return d.name;
    });


    // Move winner up and change font-size
    names.filter(function(d) {
        return d.depth == 0;
    })
    .attr("dy", -65)
    .style("font", "1.5em sans-serif");

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
        if(d.source.isRight) {
            o.y -= halfWidth - (d.target.y - d.source.y);
        } else {
            o.y += halfWidth - (d.target.y - d.source.y);
        }
        return connector({source: o, target: o});
    })
    .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
        var p = calcLeft(d);
        d.x0 = p.x;
        d.y0 = p.y;
    });
}

function setupSlider() {
    // Remove old slider
    document.getElementById("slider").innerHTML = "";

    // Create new slider
    slider = d3.slider().
    min(0).max(5)
    .ticks(6).stepValues([0,1,2,3,4,5])
    .showRange(true)
    .tickFormat(tickFormatter)
    .value(5)
    .callback(function() {
        // show/hide image
        var imgContainer = document.getElementById("imgContainer");

        if(slider.value() == 5) {
            imgContainer.className = "imgContainer fadeIn";
        } else {
            imgContainer.className = "imgContainer fadeOut";
        }
        showHideTiers(5 - slider.value());
    });

    // Place slider inside div
    d3.select('#slider').call(slider);
}

// Show/Hide tiers depending on positions of slider
function showHideTiers(tier) {
    names.transition()
    .duration(duration)
    .style("fill-opacity", function(d) {
        var display = "none";
        var opacity = "0";

        if(d.depth >= tier) {
            display = "block";
            opacity = "1";
        }

        d3.select(".node text").filter(function() {return d.name == this.innerHTML})
        .transition()
        .delay(duration)
        .style("display", display);

        return opacity;
    });
}

// Highlight names on mouseover
function highlightNames(d) {
    d3.selectAll(".node text").filter(function() {
        return d.name == this.innerHTML;
    })
    .style("fill", function(d) {
        return d.depth == 0 ? "black" : "red";
    })
    .style("font-weight", "bold");
}

// Restore styling on mouseleave
function dehighlightNames(d) {
    d3.selectAll(".node text")
    .style("fill", "black")
    .style("font-weight", "normal");
}
