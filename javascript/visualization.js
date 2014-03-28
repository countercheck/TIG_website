$(document).ready(function(){
function renderVisualization(matrix_json){
  var width = 750,
      height = 750,
      outerRadius = Math.min(width, height) / 2 - 10,
      innerRadius = outerRadius - 20;

  var formatPercent = d3.format(".1%");

  var arc = d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

  var layout = d3.layout.chord()
      .padding(.06)
      .sortSubgroups(d3.descending)
      .sortChords(d3.ascending);

  var path = d3.svg.chord()
      .radius(innerRadius-5);

  var svg = d3.select("#visualization").append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("id", "circle")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  svg.append("circle")
      .attr("r", innerRadius);

  d3.csv("regions.csv", function(regionNames) {
    d3.json(matrix_json, function(matrix) {

      // Compute the chord layout.
      layout.matrix(matrix);

      

      var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(function(d, i) {
        return "<strong>" + regionNames[i].name + "</strong>" ;
        });
        // <br> <span style='color:red'>" + formatPercent(d.value) + " of all friendships originate here" + "</span>"

        svg.call(tip);

        

      // Add a group per neighborhood.
      var group = svg.selectAll(".group")
          .data(layout.groups)
          .enter()
          .append("g")
          .attr("class", "group")
          .on("mouseover", mouseover);
          

      // Add a mouseover title.
      // group.append("title")
      // .text(function(d, i) {
      //   return regionNames[i].name + " : " + formatPercent(d.value) + " of origins";
      // });

      // Add the group arc.
      var groupPath = group.append("path")
          .attr("id", function(d, i) { return "group" + i; })
          .attr("d", arc)
          .style("fill", function(d, i) { return regionNames[i].color; })
          .style("stroke", function(d, i){return regionNames[i].color; })
          .style("stroke-width", 10)
          .attr("class", "arcs");

      var section = d3.selectAll(".arcs")
          .on("mouseover", tip.show)
          .on("mouseout", tip.hide);

      // Add a text label.
      var groupText = group.append("text")
          .attr("x", 6)
          .attr("dy", 15)
          .attr("pointer-events", "none");


      groupText.append("textPath")
          .attr("xlink:href", function(d, i) { return "#group" + i; })
          .text(function(d, i) { return regionNames[i].name; });


      // Remove the labels that don't fit. :(
      groupText.filter(function(d, i) { return groupPath[0][i].getTotalLength() / 2 - 20 < this.getComputedTextLength(); })
          .remove();
          //Here, we need to truncate or abbreviate. Maybe add another column with an abbreviated name

      // Add the chords.
      var chord = svg.selectAll(".chord")
          .data(layout.chords)
          .enter().append("path")
          .attr("class", "chord")
          .style("fill", function(d) { return regionNames[d.source.index].color; })
          .attr("d", path);

      // Add an elaborate mouseover title for each chord.
      chord.append("title").text(function(d) {
        return regionNames[d.source.index].name
            + " → " + regionNames[d.target.index].name
            + ": " + formatPercent(d.source.value)
            + "\n" + regionNames[d.target.index].name
            + " → " + regionNames[d.source.index].name
            + ": " + formatPercent(d.target.value);
      });

      function mouseover(d, i) {
        chord.classed("fade", function(p) {
          return p.source.index != i
              && p.target.index != i;
        });
      }

//Table Variables

      var region = 0;
      var percent = true;

      function generateFromArray(region, matrix){
          return matrix[region];
      }

      function generateToArray(region, matrix){
          var toArray = [];
          for (var i = 0; i < matrix.length; i++) {
             toArray.push(matrix[i][region]);
          };
          return toArray;
      }

      function populateTableNumbers(region, matrix) {
          var fromArray = generateFromArray(region, matrix);
          var toArray = generateToArray(region, matrix);
          $('#region_name').text($("#r" + (region+1) + " .name").text());
          for (var i = 0; i < fromArray.length; i++) {
              $("#r" + (i + 1) + " .from").text(fromArray[i]);
              $("#r" + (i + 1) + " .to").text(toArray[i]);
          };
      }

      function populateTablePercent(region, matrix) {
          var fromArray = generateFromArray(region, matrix);
          var toArray = generateToArray(region, matrix);
          $('#region_name').text($("#r" + (region+1) + " .name").text());
          for (var i = 0; i < fromArray.length; i++) {
              $("#r" + (i + 1) + " .from").text( arrayEntryToPercentOfArray(i, fromArray));
              $("#r" + (i + 1) + " .to").text(arrayEntryToPercentOfArray(i, toArray));
          };
      };

      function sumArray(array){
         return array.reduce(function(previousValue, currentValue, index, array){
                return previousValue + currentValue;
              });
      }

      function arrayEntryToPercentOfArray(i, array){
        var value = array[i] / sumArray(array) * 100;
        if (value < 1) {return "<1%"} else{return Math.round(value) + "%";};
      }

      $(".arcs").on("click", function () {
          var buttonid = $(this).attr("id");
          var regionid = buttonid.substring(buttonid.length - 1, buttonid.length);
          region = parseInt(regionid);
          if (percent){
              populateTablePercent(region, matrix);
          } else {
              populateTableNumbers(region, matrix);
          };
      });

      $("#toggle").on("click", function () {
          if (percent) {
              percent = false;
              $(this).text('Show %')
          } else{
              percent = true;
              $(this).text('Show #')
          };

          if (percent){
              populateTablePercent(region, matrix);
          } else {
              populateTableNumbers(region, matrix);
          };
      });

      populateTablePercent(region, matrix);

    });
  });
  };

  var friendship_matrix = "friendship_matrix.json",
      inspiration_matrix = "inspiration_matrix.json",
      friendship = true

    renderVisualization(friendship_matrix);

    $("#friendship_or_inspiration").on('click', function(){
        $('svg').remove();
        if (friendship){
          friendship = false;
          $(this).text('Display the friendship visualization!');
          renderVisualization(inspiration_matrix);
          $('#subtitle').text("Inspirations sent and received");
        } else{
          friendship = true;
          $(this).text('Display the inspiration visualization!');
          renderVisualization(friendship_matrix);
          $('#subtitle').text('Friendships sent and recieved');
        };
    })

});