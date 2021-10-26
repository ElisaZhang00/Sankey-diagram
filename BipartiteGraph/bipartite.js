

// load the data
d3.json("newsAPI-paired-counts.json", function (error, graph) {
    // d3.json("sankeygreenhouse.json", function (error, graph) {
    const groupASubGroup = []; 
    
    

    console.log(graph.links);
    graph.nodes.push({"id": "CULTURAL MINORITIES", "group": 1},
    {"id": "GENDER AND SEXUALITY", "group": 2},
    {"id": "AGE", "group": 3},
    {"id": "SOCIOECONOMIC STATUS", "group": 4},
    {"id": "HEALTH STATUS", "group":5},
    {"id": "INSTITUTIONALISED PEOPLE", "group": 6},
    {"id": "OTHER", "group": 7},
    );
    

    var result = [];
    graph.links.reduce(function(res, val) {
      if (!res[val.source]) {
        res[val.source] = { source: val.source, value: 0 };
        result.push(res[val.source])
      }
      res[val.source].value += val.value;
      return res;
    }, {});
    console.log(result);

    

    // graph.links.push({"source": "CULTURAL MINORITIES", "target": 0}
    // );

    const resultGroup = result.map((item, i) => Object.assign({}, item, graph.nodes[i]));
    resultGroup.forEach(d => {
        if (d.group == 1){
            graph.links.push({"source": "CULTURAL MINORITIES", "target": d.source, "value": d.value})
        }
        else if (d.group == 2){
            graph.links.push({"source": "GENDER AND SEXUALITY", "target": d.source, "value": d.value})
        }
        else if (d.group == 3){
            graph.links.push({"source": "AGE", "target": d.source, "value": d.value})
        }
        else if (d.group == 4){
            graph.links.push({"source": "SOCIOECONOMIC STATUS", "target": d.source, "value": d.value})
        }
        else if (d.group == 5){
            graph.links.push({"source": "HEALTH STATUS", "target": d.source, "value": d.value})
        }
        else if (d.group == 6){
            graph.links.push({"source": "INSTITUTIONALISED PEOPLE", "target": d.source, "value": d.value})
        }
        else if(d.group == 7) {
            graph.links.push({"source": "OTHER", "target": d.source, "value": d.value})
        }
        
    })
    


    function FindSubGroup(target){
        groupASubGroup.length = 0 ;
          graph.nodes.forEach(d =>{
              if (target == d.id){
                groupASubGroup.push(d.group)
                  graph.nodes.forEach(j =>{
                      if (j.group == d.group){
                        groupASubGroup.push(j.id)
                      }
                  })
              }
              else{
                  console.log("not equal")
              }
          })
          console.log(groupASubGroup)
    }

    // FindSubGroup("CULTURAL MINORITIES");
   

    const update = () => {
    
    var node = graph.nodes.filter(function(d){if(d.group == groupASubGroup[0] || d.group == 8) {return d;}})
    console.log(graph.nodes)
    var link = graph.links.filter(function(d){if(
        groupASubGroup.includes(d.source)
        // d.source == "CULTURAL MINORITIES" || d.source == "First Nations" || d.source == "Migrants and refugees" || d.source == "Racial minorities" || d.source == "Religious minorities"
        ) {return d;}});
    
        var selectNoMean = [];
        link.reduce(function(res, val) {
          if (!res[val.target]) {
            res[val.target] = { target: val.target, value: 0 };
            selectNoMean.push(res[val.target])
          }
          res[val.target].value += val.value;
          return res;
        }, {});
        console.log(selectNoMean);

        const noMeanValue = [];

        selectNoMean.forEach(d =>{
            if(d.value < 10000){
            noMeanValue.push(d.target)
            }    
        })
     
        noMeanValue.forEach(d =>{
            node  = node.filter((j) => {
                return j.id  != d
            })

            link = link.filter((j) => {
                return j.target  != d
            })
        })



    // array.filter("First Nations".index, graph)
    var nodeMap = {};
    node.forEach(function (x) { nodeMap[x.id] = x; });
    link = link.map(function (x) {
        return {
            source: nodeMap[x.source],
            target: nodeMap[x.target],
            value: x.value
        };
    });

    sankey
        .nodes(node)
        .links(link)
        .layout(32);

    // add in the links
    var link = svg.append("g").selectAll(".link")
        .data(link)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", path)
        .style("stroke-width", function (d) { return Math.max(1, d.dy); })
        .sort(function (a, b) { return b.dy - a.dy; });



    // add the link titles
    link.append("title")
        .text(function (d) {
            return d.source.id + " → " +
                d.target.id + "\n" + format(d.value);
        });

    // add in the nodes
    var node = svg.append("g").selectAll(".node")
        .data(node)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
        .call(d3.behavior.drag()
            .origin(function (d) { return d; })
            .on("dragstart", function () {
                this.parentNode.appendChild(this);
            })
            .on("drag", dragmove));

    // add the rectangles for the nodes
    node.append("rect")
        .attr("height", function (d) { return d.dy; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function (d) {
            return d.color = color(d.id.replace(/ .*/, ""));
        })
        .style("stroke", function (d) {
            return d3.rgb(d.color).darker(2);
        })
        .append("title")
        .text(function (d) {
            return d.id + "\n" + format(d.value);
        });



    // add in the title for the nodes
    node.append("text")
        .attr("x", -6)
        .attr("y", function (d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function (d) { return d.id; })
        .filter(function (d) { return d.x < width / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");

  

    // the function for moving the nodes
    function dragmove(d) {
        d3.select(this).attr("transform",
            "translate(" + (
                d.x = Math.max(0, Math.min(width - d.dx, d3.event.x))
            ) + "," + (
                d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
            ) + ")");
        sankey.relayout();
        link.attr("d", path);
    }

}

    FindSubGroup('GENDER AND SEXUALITY');
    update();

    var btn1 = document.getElementById("group");
    btn1.addEventListener('change', function() {
        groupASubGroup.length = 0;
        svg.selectAll("*").remove();
        FindSubGroup(this.value);
        console.log(groupASubGroup)
        update();
      },true);

     
});





d3.sankey = function () {
    var sankey = {},
        nodeWidth = 24,
        nodePadding = 8,
        size = [1, 1],
        nodes = [],
        links = [];

    sankey.nodeWidth = function (_) {
        if (!arguments.length) return nodeWidth;
        nodeWidth = +_;
        return sankey;
    };

    sankey.nodePadding = function (_) {
        if (!arguments.length) return nodePadding;
        nodePadding = +_;
        return sankey;
    };

    sankey.nodes = function (_) {
        if (!arguments.length) return nodes;
        nodes = _;
        return sankey;
    };

    sankey.links = function (_) {
        if (!arguments.length) return links;
        links = _;
        return sankey;
    };

    sankey.size = function (_) {
        if (!arguments.length) return size;
        size = _;
        return sankey;
    };

    sankey.layout = function (iterations) {
        computeNodeLinks();
        computeNodeValues();
        computeNodeBreadths();
        computeNodeDepths(iterations);
        computeLinkDepths();
        return sankey;
    };

    sankey.relayout = function () {
        computeLinkDepths();
        return sankey;
    };

    sankey.link = function () {
        var curvature = .5;

        function link(d) {
            var x0 = d.source.x + d.source.dx,
                x1 = d.target.x,
                xi = d3.interpolateNumber(x0, x1),
                x2 = xi(curvature),
                x3 = xi(1 - curvature),
                y0 = d.source.y + d.sy + d.dy / 2,
                y1 = d.target.y + d.ty + d.dy / 2;
            return "M" + x0 + "," + y0
                + "C" + x2 + "," + y0
                + " " + x3 + "," + y1
                + " " + x1 + "," + y1;
        }

        link.curvature = function (_) {
            if (!arguments.length) return curvature;
            curvature = +_;
            return link;
        };

        return link;
    };

    // Populate the sourceLinks and targetLinks for each node.
    // Also, if the source and target are not objects, assume they are indices.
    function computeNodeLinks() {
        nodes.forEach(function (node) {
            node.sourceLinks = [];
            node.targetLinks = [];
        });
        links.forEach(function (link) {
            var source = link.source,
                target = link.target;
            if (typeof source === "number") source = link.source = nodes[link.source];
            if (typeof target === "number") target = link.target = nodes[link.target];
            source.sourceLinks.push(link);
            target.targetLinks.push(link);
        });
    }

    // Compute the value (size) of each node by summing the associated links.
    function computeNodeValues() {
        nodes.forEach(function (node) {
            node.value = Math.max(
                d3.sum(node.sourceLinks, value),
                d3.sum(node.targetLinks, value)
            );
        });
    }

    // Iteratively assign the breadth (x-position) for each node.
    // Nodes are assigned the maximum breadth of incoming neighbors plus one;
    // nodes with no incoming links are assigned breadth zero, while
    // nodes with no outgoing links are assigned the maximum breadth.
    function computeNodeBreadths() {
        var remainingNodes = nodes,
            nextNodes,
            x = 0;

        while (remainingNodes.length) {
            nextNodes = [];
            remainingNodes.forEach(function (node) {
                node.x = x;
                node.dx = nodeWidth;
                node.sourceLinks.forEach(function (link) {
                    nextNodes.push(link.target);
                });
            });
            remainingNodes = nextNodes;
            ++x;
        }

        //
        moveSinksRight(x);
        scaleNodeBreadths((size[0] - nodeWidth) / (x - 1));
    }

    function moveSourcesRight() {
        nodes.forEach(function (node) {
            if (!node.targetLinks.length) {
                node.x = d3.min(node.sourceLinks, function (d) { return d.target.x; }) - 1;
            }
        });
    }

    function moveSinksRight(x) {
        nodes.forEach(function (node) {
            if (!node.sourceLinks.length) {
                node.x = x - 1;
            }
        });
    }

    function scaleNodeBreadths(kx) {
        nodes.forEach(function (node) {
            node.x *= kx;
        });
    }

    function computeNodeDepths(iterations) {
        var nodesByBreadth = d3.nest()
            .key(function (d) { return d.x; })
            .sortKeys(d3.ascending)
            .entries(nodes)
            .map(function (d) { return d.values; });

        //
        initializeNodeDepth();
        resolveCollisions();
        for (var alpha = 1; iterations > 0; --iterations) {
            relaxRightToLeft(alpha *= .99);
            resolveCollisions();
            relaxLeftToRight(alpha);
            resolveCollisions();
        }

        function initializeNodeDepth() {
            var ky = d3.min(nodesByBreadth, function (nodes) {
                return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
            });

            nodesByBreadth.forEach(function (nodes) {
                nodes.forEach(function (node, i) {
                    node.y = i;
                    node.dy = node.value * ky;
                });
            });

            links.forEach(function (link) {
                link.dy = link.value * ky;
            });
        }

        function relaxLeftToRight(alpha) {
            nodesByBreadth.forEach(function (nodes, breadth) {
                nodes.forEach(function (node) {
                    if (node.targetLinks.length) {
                        var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
                        node.y += (y - center(node)) * alpha;
                    }
                });
            });

            function weightedSource(link) {
                return center(link.source) * link.value;
            }
        }

        function relaxRightToLeft(alpha) {
            nodesByBreadth.slice().reverse().forEach(function (nodes) {
                nodes.forEach(function (node) {
                    if (node.sourceLinks.length) {
                        var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
                        node.y += (y - center(node)) * alpha;
                    }
                });
            });

            function weightedTarget(link) {
                return center(link.target) * link.value;
            }
        }

        function resolveCollisions() {
            nodesByBreadth.forEach(function (nodes) {
                var node,
                    dy,
                    y0 = 0,
                    n = nodes.length,
                    i;

                // Push any overlapping nodes down.
                nodes.sort(ascendingDepth);
                for (i = 0; i < n; ++i) {
                    node = nodes[i];
                    dy = y0 - node.y;
                    if (dy > 0) node.y += dy;
                    y0 = node.y + node.dy + nodePadding;
                }

                // If the bottommost node goes outside the bounds, push it back up.
                dy = y0 - nodePadding - size[1];
                if (dy > 0) {
                    y0 = node.y -= dy;

                    // Push any overlapping nodes back up.
                    for (i = n - 2; i >= 0; --i) {
                        node = nodes[i];
                        dy = node.y + node.dy + nodePadding - y0;
                        if (dy > 0) node.y -= dy;
                        y0 = node.y;
                    }
                }
            });
        }

        function ascendingDepth(a, b) {
            return a.y - b.y;
        }
    }

    function computeLinkDepths() {
        nodes.forEach(function (node) {
            node.sourceLinks.sort(ascendingTargetDepth);
            node.targetLinks.sort(ascendingSourceDepth);
        });
        nodes.forEach(function (node) {
            var sy = 0, ty = 0;
            node.sourceLinks.forEach(function (link) {
                link.sy = sy;
                sy += link.dy;
            });
            node.targetLinks.forEach(function (link) {
                link.ty = ty;
                ty += link.dy;
            });
        });

        function ascendingSourceDepth(a, b) {
            return a.source.y - b.source.y;
        }

        function ascendingTargetDepth(a, b) {
            return a.target.y - b.target.y;
        }
    }

    function center(node) {
        return node.y + node.dy / 2;
    }

    function value(link) {
        return link.value;
    }

    return sankey;
};

d3.select("group").on("change", ({ target }) => {
    setGroup(target.value);
    update();
  });

