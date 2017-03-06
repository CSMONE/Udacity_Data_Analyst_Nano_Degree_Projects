
'use strict'
//set basic attribute
var margin = 100,
  	width = 1200 - margin,
  	height = 600 - margin;

var Category = 'Depart';

//create a svg object
var chart = d3.select('body')
	.append('svg')
	.attr('width', width + margin)
	.attr('height', height + margin);

//set title
chart.append('text')
	.attr('class', 'title')
	.attr('x',width/2)
	.attr('y',20)
	.text("Flight Delay Trend");

// create a tooltip
var point_div = d3.select('body').append('div')
	.attr('class', 'tooltip')
	.style("opacity", 0);

//create hint dashlines for tooltip
var ver_hover_line = chart.append('line')
	.attr("class", "hor_hover_line hover_line");      

var hor_hover_line = chart.append('line')
	.attr("class", "hor_hover_line hover_line");


//create buttons for choosing chart catergory 
var ArrDepButton = chart.append('g')
	.attr('class','ArrDepButtonGroup')
	.selectAll('g')
	.data(['Depart', 'Arrive'])
	.enter()
	.append('g')
	.attr('class',function(d){ 
		return d;
	})
	.attr('transform', 'translate(1000,40)');

chart.append("text")
	.attr('class','choose_hint_text')
	.text('Delay Category')
	.attr({"x": 960, "y": 55});

ArrDepButton.append('rect')
	.attr('x', function(d, i){
		return i * 60 ; 
	})
	.attr('width', '50')
	.attr('height', '20')
	.attr("fill", "gray")
	.style('cursor','pointer');

ArrDepButton.append("text")
	.attr('class', 'choose_text')
	.attr('x', function(d, i){
		return i * 60 + 25 ; 
	})
	.attr('y','15')
	.text(function(d){
		return d;
	});

ArrDepButton.append('circle')
	.attr('r',0)
	.attr('fill','skyblue')
	.attr('cx',function(d, i){
		return i * 60 + 25; 
	})
	.attr('cy','30');

chart.select('.ArrDepButtonGroup')
	.select('.Depart')
	.select('circle')
	.attr('r',5);

//create chart category choosing function for buttons
ArrDepButton.on('click' , function(d){
	Category = d;	
	if (d === 'Depart'){
		d3.csv('Flight_DepDelay_Trend.csv',draw); 
		chart.select('.ArrDepButtonGroup')
			.select('.Arrive')
			.select('circle')
			.attr('r',0);
		chart.select('.ArrDepButtonGroup')
			.select('.Depart')
			.select('circle')
			.attr('r',5);
	}
	else if (d === 'Arrive'){
		d3.csv('Flight_ArrDelay_Trend.csv',draw); 
		chart.select('.ArrDepButtonGroup')
			.select('.Depart')
			.select('circle')
			.attr('r',0);
		chart.select('.ArrDepButtonGroup')
			.select('.Arrive')
			.select('circle')
			.attr('r',5);
	};			
});

//create draw function
function draw(data){
	//every time drawing lines, do cleaning first 
	chart.select('.xaxis').remove();
	chart.select('.yaxis').remove();
	chart.select('.x_axis_title').remove();
	chart.select('.y_axis_title').remove();
	chart.select('.median').remove();

	//set x_axis
	var x_extent = d3.extent(data, function(d) {
			return d['year'];
		}); 	

	var x_axis_trans = d3.scale.linear()
		.domain(x_extent)
		.nice()
		.range([margin, width]);

	var x_axis = d3.svg.axis()
		.scale(x_axis_trans)
		.tickFormat(d3.format("d"))
		.orient("bottom");

	chart.append('g')
		.attr('transform', 'translate(0, ' + height + ')')
		.attr('class', 'xaxis axis')
		.call(x_axis);

	//set y axis
	var y_extent = d3.extent(data, function(d){	
			return d['median'];
		});

	y_extent[0] = parseInt(y_extent[0]) - 2;
	y_extent[1] = parseInt(y_extent[1]) + 2;

	var y_axis_trans = d3.scale.linear()
		.domain(y_extent)
		.range([height, margin]);	

	var y_axis = d3.svg.axis()
		.scale(y_axis_trans)
		.orient("left");

	var chart_yaxis = chart.append('g')
		.attr('transform', 'translate('+ margin + ' ,0)')
		.attr('class', 'yaxis axis')
		.call(y_axis);	

	//set axis label
	chart.append('text')
		.attr('class', 'x_axis_title')
		.attr('transform', 'translate(' + (margin + width/2) + ',' 
			+ (height + 50) + ')')
		.attr("text-anchor","middle")
		.text('Year');

	chart.append('text')
		.attr('class', 'y_axis_title')
		.attr('transform', 'translate(' + (margin/2 ) + ',' 
			+ (height/2) + ')rotate(-90)')
		.attr("text-anchor","middle")
		.text(function(d){
			return Category + 'Delay(min)';
		});

	//append a group of the line and circles for median line
	var MedianGroup = chart.append('g')
		.attr('class', 'median');
	MedianGroup.append('path')
		.attr('class','Line');
	MedianGroup.append('g')
		.attr('class','Circles');

	//create a line for drawing
	var Line = d3.svg
		.line()
		.interpolate('linear')
		.x(function(d) { 
			return x_axis_trans(d['year']);
		});
				
	var UseLine = Line.y(function(d) { 
			return y_axis_trans(d['median']);
		});				

	var Path = chart.select('.median')
		.select('path')
		.attr("d", UseLine(data))
		.attr('stroke-width',2)
		.attr("stroke", "steelblue")
    .attr("fill", "none");      

  //create circles
	var Circles = chart.select( '.median' )
		.select('g')
		.selectAll('circle')
		.data(data)
		.enter()
		.append('circle')
		.attr('cx', function(d){
			return x_axis_trans(d['year']);
		})
		.attr('cy', function(d){
			return y_axis_trans(d['median']);
		})
		.attr('r', 4)
		.attr('fill', 'black')

	//create mouseover function to show tooltip
  Circles.on('mouseover',function(d,i){

  	var x_value = d['year'];
  	var y_value = d['median'];

  	d3.select(this)
	  	.transition()
	  	.duration(100)
	  	.attr('r',8)
	  	.attr('stroke-width',8);

  	point_div.transition()		
      .duration(200)		
      .style("opacity", 8);	

    point_div.html('year: ' + x_value + '<br/>' 
    		+ 'median: '+ y_value + 'min')	
      .style('width',('median'.length * 5 + 80) + 'px')
      .style("left", (d3.event.pageX + 10) + "px")		
      .style("top", (d3.event.pageY - 40 ) + "px");

    hor_hover_line.attr('x1',x_axis_trans.range()[0])
			.attr('x2' , x_axis_trans.range()[1])
      .attr('y1', function(d){
      	return y_axis_trans( y_value );
      })
      .attr('y2', function(d){
      	return y_axis_trans( y_value );
      })
      .style("display", null);  

    ver_hover_line.attr('x1',function(d){
      	return x_axis_trans(x_value);
      })
			.attr('x2' , function(d){
      	return x_axis_trans(x_value);
      })
      .attr('y1', y_axis_trans.range()[0])
      .attr('y2', y_axis_trans.range()[1])
      .style("display", null); 
  });
    
  //create mouseout function for points
  Circles.on('mouseout',function(){
  	d3.select(this)
	  	.transition()
	  	.duration(100)
	  	.attr('r',4)
	  	.attr('stroke-width',5);

  	point_div.transition()		
      .duration(100)		
      .style("opacity", 0);	

    hor_hover_line.style("display", 'none');
    ver_hover_line.style("display", 'none');

  });       	               
};
d3.csv('Flight_DepDelay_Trend.csv',draw);
