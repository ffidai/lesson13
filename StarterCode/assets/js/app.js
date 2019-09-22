// SVG wrapper dimensions 
  var svgWidth = 960;
  var svgHeight = 600;
  
  var margin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 100
  };

  var height = svgHeight - margin.top - margin.bottom;
  var width = svgWidth - margin.left - margin.right;

  // Append SVG element
  var svg = d3.select("#scatter")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);
 
  // Append group element
var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);


  // Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv")
.then(function(axData) {

// parse data
axData.forEach(function(data) {
data.poverty = +data.poverty;
data.age = +data.age;
data.income = +data.income;
data.healthcare = +data.healthcare;
data.obesity = +data.obesity;
data.smokes = +data.smokes;
});

// x and y LinearScale function above csv import
//var xLinearScale = xScale(axData, chosenXAxis);
//var yLinearScale = yScale(axData, chosenYAxis);

var xLinearScale = d3.scaleLinear()
.domain([4, 20])
.range([0, width]);

var yLinearScale = d3.scaleLinear()
.domain([4, 20])
.range([height, 0]);

// Create initial axis functions
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);

// append x axis
var xAxis = chartGroup.append("g")
.classed("x-axis", true)
.attr("transform", `translate(0, ${height})`)
.call(bottomAxis);

// append y axis
var yAxis = chartGroup.append("g")
.classed("y-axis", true)
.call(leftAxis);


 // Initial Params
  var chosenXAxis = "poverty";
  var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(axData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(axData, d => d[chosenXAxis]) * 0.8,
      d3.max(axData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

  // function used for updating y-scale var upon click on axis label
  function yScale(axData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(axData, d => d[chosenYAxis]) * 0.8,
        d3.max(axData, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
      
    return yLinearScale;

}
// function used for updating xAxis var upon click on axis label
function renderXaxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYaxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]))

  return circlesGroup;
}

// function used for updating text
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]))
    .attr("text-anchor", "middle");

  return textGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup) {

  if (chosenXAxis === "poverty") {
    var xLabel = "In Poverty (%)";
  }
  else if (chosenXAxis === "age") {
    var xLabel = "Age (Median)";
  }
  else {
    var xLabel = "Household Income (Median)";
  }
  if (chosenYAxis === "healthcare") {
    var yLabel = "Lacks Healthcare (%)";
  }
  else if (chosenYAxis === "obesity") {
    var yLabel = "Obese (%)";
  }
  else {
    var yLabel = "Smokes (%)";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`<strong>${d.abbr}</strong><br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(axData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.num_hits))
    .attr("r", 20)
    .attr("class", "circle")
    .attr("opacity", ".5");

  // append text group
  var textGroup = chartGroup.selectAll("textgroup")
  .data(axData)
  .enter()
  .append("text")
  .attr("x", d => xLinearScale(d[chosenXAxis]))
  .attr("y", d => yLinearScale(d[chosenYAxis]))
  .text(d => (d.abbr))
  .attr("class", "textgroup")
  .attr("font-size", "10px")
  .attr("text-anchor", "middle")
  .attr("fill", "gray");

  // create group for  3 x- axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povlabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var agelabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var inclabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

// create group for 3 y- axis Labels
var ylabelsGroup = chartGroup.append("g")
.attr("transform", `translate(-25, ${height / 2})`);

var healthlabel = ylabelsGroup.append("text")
.attr("transform", "rotate(-90)")
.attr("y", -30)
.attr("x", 0)
.attr("value", "healthcare")
.attr("dy", "1em")
.classed("axis-text", true)
.classed("active", true)
.text("Lacks Healthcare (%)");

var smokeslabel = ylabelsGroup.append("text") 
.attr("transform", "rotate(-90)")
.attr("y", -50)
.attr("x", 0)
.attr("value", "smokes")
.attr("dy", "1em")
.classed("axis-text", true)
.classed("inactive", true)
.text("Smokes (%)");

var obesitylabel = ylabelsGroup.append("text")
.attr("transform", "rotate(-90)")
.attr("y", -70)
.attr("x", 0)
.attr("value", "obesity")
.attr("dy", "1em")
.classed("axis-text", true)
.classed("inactive", true)
.text("Obese (%)");


  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(axData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXaxes(xLinearScale, xAxis);

        // updates circles 
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates textgroup
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup, circlesGroup, textGroup);

        // changes classes to change bold text
        if  (chosenXAxis === "poverty") {
  povlabel
    .classed("active", true)
    .classed("inactive", false);
  agelabel
    .classed("active", false)
    .classed("inactive", true);
  inclabel
    .classed("active", false)
    .classed("inactive", true);
}
else if (chosenXAxis === "age") {
  povlabel
    .classed("active", false)
    .classed("inactive", true);
  agelabel
    .classed("active", true)
    .classed("inactive", false);
  inclabel
    .classed("active", false)
    .classed("inactive", true);
}
else {
  povlabel
    .classed("active", false)
    .classed("inactive", true);
  agelabel
    .classed("active", false)
    .classed("inactive", true);
  inclabel
    .classed("active", true)
    .classed("inactive", false);
}
}
});

// y axis labels event listener
ylabelsGroup.selectAll("text")
.on("click", function() {
  // get value of selection
  var value = d3.select(this).attr("value");
  if (value !== chosenYAxis) {

    // replaces chosenYAxis with value
    chosenYAxis = value;

    // console.log(chosenYAxis)

    // functions here found above csv import
    // updates x scale for new data
    yLinearScale = yScale(axData, chosenYAxis);

    // updates y axis with transition
    yAxis = renderYaxes(yLinearScale, yAxis);

    // updates circles 
    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

    // updates textgroup
    textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)

    // updates tooltips with new info
    circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup, textGroup);

    // changes classes to change bold text
    if (chosenYAxis === "healthcare") {
      healthlabel
        .classed("active", true)
        .classed("inactive", false);
      obesitylabel
        .classed("active", false)
        .classed("inactive", true);
      smokeslabel
        .classed("active", false)
        .classed("inactive", true);
    }
    else if (chosenYAxis === "obesity") {
      healthlabel
        .classed("active", false)
        .classed("inactive", true);
      obesitylabel
        .classed("active", true)
        .classed("inactive", false);
      smokeslabel
        .classed("active", false)
        .classed("inactive", true);
    }
    else {
      healthlabel
        .classed("active", false)
        .classed("inactive", true);
      obesitylabel
        .classed("active", false)
        .classed("inactive", true);
      smokeslabel
        .classed("active", true)
        .classed("inactive", false);
    }
  }
});
});
