
'use strict'

//set basic attribute
var margin = 100,
  	width = 1200 - margin,
  	height = 600 - margin;

var yAxisChangeTime = 500,
		AnimationTime = 5000;

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

//
chart.append('text')
	.attr('class', 'title')
	.attr('x',width/2 - 40)
	.attr('y',100)
	.text("Delays increased over years !!!")
	.style('fill','red')
	.style('font-size',18)
	.style('font-weight','bold');

// create a tooltip
var point_div = d3.select('body')
	.append('div')
	.attr('class', 'tooltip')
	.style("opacity", 0);

//create hint dashlines for tooltip
var ver_hover_line = chart.append('line')
	.attr("class", "hor_hover_line hover_line");      

var hor_hover_line = chart.append('line')
	.attr("class", "hor_hover_line hover_line");

//create groups for showing IQR 
//when mouse cursor was placed on the points of that year 
var IQRGroup = chart.append('g')
	.attr('class', 'IQRGroup');

IQRGroup.append('line')
	.attr("class", "IQRGroup_line");

IQRGroup.append('text')
	.attr("class", "IQRGroup_text");

var IQRGroup_1 = IQRGroup.append('g')
	.selectAll('g')
	.data(['first_quartile','median','third_quartile'])
	.enter()
	.append('g');

IQRGroup_1.append('line')
	.attr("class", "IQRGroup_line");

IQRGroup_1.append('text')
	.attr("class", "IQRGroup_text");

//create buttons for choosing chart catergory 
var ArrDepButton = chart.append('g')
	.attr('class','ArrDepButtonGroup')
	.selectAll('g')
	.data(['Depart', 'Arrive'])
	.enter()
	.append('g')
	.attr('class',function(d){ 
		return d ;
	})
	.attr('transform', 'translate(800,40)');

chart.append("text")
	.attr('class','choose_hint_text')
	.text('Delay Category')
	.attr({"x": 760, "y": 55});

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

//create buttons for whether showing the first and third quantile linse
var QuantileLineDisplayButton = chart.append('g')
	.attr('class', 'QuantileLineDisplayButtonGroup')
	.selectAll('g')
	.data(['Display','Disappear'])
	.enter()
	.append('g')
	.attr('class',function(d){ return d;
	})
	.attr('transform', "translate(1010,40)");

chart.append("text")
	.attr('class','choose_hint_text')
	.text('Quantile Lines')
	.attr({"x": 970, "y": 55});

chart.append("text")
	.attr('class','choose_hint_warn')
	.text('If drawing, please wait untile line drawing finished.')
	.attr({"x": 1050, "y": 85});

QuantileLineDisplayButton.append('rect')
	.attr('x', function(d, i){
		return i * 75 ; 
	})
	.attr('width', '70')
	.attr('height', '20')
	.attr("fill", "powderblue")
	.style('cursor','pointer');

QuantileLineDisplayButton.append('text')
	.attr('class', 'choose_text')
	.attr('x', function(d, i){
		return i * 75 + 35; 
	})
	.attr('y','15')
	.text(function(d){
		return d; 
	});

QuantileLineDisplayButton.append('circle')
	.attr('fill','green')
	.attr('cx',function(d, i){
		return i * 75 + 35; 
	})
	.attr('cy','30');

chart.select('.QuantileLineDisplayButtonGroup')
	.select('.Disappear')
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
	else if ( d === 'Arrive'){
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
	chart.select('.first_quartile').remove();
	chart.select('.third_quartile').remove();

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

	var QuantileShow = false; 
	var DrawFinshed = false;

	//append three groups of lines and circles for each quantile line
	var MedianGroup = chart.append('g')
		.attr('class', 'median');

	MedianGroup.append('path')
		.attr('class','MedianLine');

	MedianGroup.append('g')
		.attr('class','MedianCircles');

	MedianGroup.append('text')
		.attr('class','MedianText')
		.text('Median')
		.style('display','none');
	
	var FirstQGroup = chart.append('g')
		.attr('class', 'first_quartile');

	FirstQGroup.append('path')
		.attr('class','FirstQLine');

	FirstQGroup.append('g')
		.attr('class','FirstQCircles');

	FirstQGroup.append('text')
		.attr('class','FirstQText')
		.text('Frist Quantile')
		.style('display','none');
	
	var ThirdQGroup = chart.append('g')
		.attr('class', 'third_quartile');

	ThirdQGroup.append('path')
		.attr('class','ThirdQLine');

	ThirdQGroup.append('g')
		.attr('class','ThirdQCircles');

	ThirdQGroup.append('text')
		.attr('class','ThirdQText')
		.text('Third Quantile')
		.style('display','none');

	//create a line for drawing
	var Line = d3.svg
		.line()
		.interpolate('linear')
		.x(function(d) { 
			return x_axis_trans(d['year']);
		});

	//create a function for drawing a line with its points
	function DrawLine(kind){

		DrawFinshed = false; 
		var TotalLen = 0 ,
				GapArray = [];
					
		var UseLine = Line.y(function(d){ 
				return y_axis_trans(d[kind]);
			});				

		var Path = chart.select( '.' + kind )
			.select('path')
			.attr("d", UseLine(data))
			.attr('stroke-width',2)
			.attr("stroke", "steelblue")
      .attr("fill", "none");      

    //create circles
		var Circles = chart.select( '.' + kind )
			.select('g')
			.selectAll('circle')
			.data(data)
			.enter()
			.append('circle')
			.attr('cx', function(d){
				return x_axis_trans(d['year']);
			})
			.attr('cy', function(d){
				return y_axis_trans(d[kind]);
			})
			.attr('fill', 'red')
			.attr("r", 0);

		//create line animation
		var totalLength = Path.node().getTotalLength();

    Path.attr("stroke-dasharray", totalLength + " " + totalLength)
	    .attr("stroke-dashoffset", totalLength)
	    .transition()
	    .duration(AnimationTime)
	    .ease("linear")
	    .attr("stroke-dashoffset", 0);

		for (var i = 0; i <= data.length - 2; i++){
			var x_gap = x_axis_trans(data[i+1]['year']) 
			  - x_axis_trans(data[i]['year']);
			var y_gap = y_axis_trans( data[i+1][kind]) 
	      - y_axis_trans(data[i][kind]);
			var gap_line_len = Math.sqrt( x_gap**2 + y_gap**2 );
			GapArray.push(gap_line_len);
			TotalLen = TotalLen + gap_line_len ; 
		};

		//create circle animation
    Circles.transition().duration(0)
      .delay(function(d, i) { 
      	var sum = 0;
      	for (var j = 0; j <= i-1 ; j++) {
      		sum = sum + GapArray[j];
      	};
      	return sum / TotalLen * AnimationTime; 
      })
      .attr("r", 4);

    //set the name of line disappearing before drawing finshed
    chart.select( '.' + kind )
			.select('text')
			.attr('x',parseInt(x_axis_trans(data[data.length-1]['year'])) + 20 )
			.attr('y',parseInt(y_axis_trans(data[data.length-1][kind])) + 5 )
			.transition()
			.duration(0)
			.delay(AnimationTime + 50 )
			.style('display',  null)
			.attr('font-size','12');

		//create mouseover function to show tooltip and IQR for points
    Circles.on('mouseover',function(d,i){
    	var x_value = d['year'];
    	var y_value = d[kind];

    	d3.select(this)
      	.transition()
      	.duration(100)
      	.attr('r',8)
      	.attr('stroke-width',8);

    	point_div.transition()		
        .duration(200)		
        .style("opacity", 8);	

      point_div.html('year: ' + x_value + '<br/>' 
      		+ kind +': '+ y_value + 'min')	
        .style('width',(kind.length * 5 + 80) + 'px')
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

      //create function to show IQR for the specific year
      function DrawAssistLine(data){
				IQRGroup_1.selectAll('line')
					.attr('x1',x_axis_trans(x_value) - 5)
        	.attr('x2' , x_axis_trans(x_value) - 15 )
          .attr('y1', function(d){
          	return y_axis_trans(data[d]);
          })
          .attr('y2', function(d){
          	return y_axis_trans(data[d]);
          })
          .style("display", null);  

        IQRGroup_1.selectAll('text')
        	.attr('x',x_axis_trans(x_value) - 40 )
        	.attr('y',function(d){
        		return y_axis_trans(data[d]) + 5;
        	})
        	.text(function(d){
        		return data[d];
        	})
        	.style("display", null); 	

          IQRGroup.select('line')
          	.attr('x1',x_axis_trans(x_value) - 17)
        		.attr('x2' , x_axis_trans(x_value) - 17 )
            .attr('y1', y_axis_trans(data['first_quartile']))
            .attr('y2', y_axis_trans(data['third_quartile']))
            .style("display", null);

          IQRGroup.select('text')
            .attr('x',x_axis_trans(x_value) - 50)
            .attr('y', (y_axis_trans(data['first_quartile'])
            	+ y_axis_trans(data['third_quartile'])) / 2 )
            .text('IQR:' + (data['third_quartile'] - data['first_quartile']))
            .style("display", null);
      };

      var tmp = chart.select( '.first_quartile')
        .select('g')
        .selectAll('circle')[0];

      // IQR can only shows when all three quantile points of this year 
      //has been showed up 
      if(tmp.length === 20 && tmp[i].attributes.r.value === '4'){
      	DrawAssistLine(d);
      };
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
      IQRGroup.selectAll('line')
      	.style('display', 'none');
      IQRGroup.selectAll('text')
      	.style('display', 'none');
    });

    //when animation finished, set DrawFinshed true
    setTimeout(
    	function(){
    		DrawFinshed = true; 
    	},AnimationTime);       
  };

  //create a function to move median line 
  //when the other quantile lines showing up or disappearing
  function MoveLine(OldRange){
  	DrawFinshed === false;
   	var StepTime = 5;
   	var StepInd = 1;
   	var StepNum = yAxisChangeTime / StepTime ;
   	var MoveLine = chart.select('.median')
   		.select('path');

   	var MoveCircle = chart.select('.median')
   		.selectAll('circle');

   	var MoveText = chart.select('.median')
   		.select('text');

   	var OldTrans = d3.scale.linear()
			.domain(OldRange)
			.range([height, margin]);	

		var move_interval = setInterval(
			//create function to draw points and lines,
			//according to the animation interval
			function(){
				var UseLine = Line.y(function(d){
						var StepLen = (y_axis_trans(d['median']) 
							- OldTrans(d['median'])) / StepNum;
						return OldTrans(d['median']) + StepInd * StepLen ;
					});

				MoveLine.attr("d", UseLine(data));

				MoveCircle.attr('cy', function(d){
					var StepLen = (y_axis_trans(d['median']) 
						- OldTrans(d['median'])) / StepNum;
					return OldTrans(d['median']) + StepInd * StepLen ;
				});
		
				MoveText.attr('y', function(){
					var StepLen = (y_axis_trans(data[data.length-1]['median']) 
						- OldTrans(data[data.length-1]['median'])) / StepNum;
					return OldTrans(data[19]['median']) + StepInd * StepLen ;
				});

				StepInd++;
				if(StepInd > StepNum) {
					clearInterval(move_interval);

					var UseLine = Line.y(function(d){
							return y_axis_trans(d['median']);
						});

					MoveLine.attr("d", UseLine(data));

					MoveCircle.attr('cy', function(d){
						return y_axis_trans(d['median']);
					});

					DrawFinshed === true;
				};
			},StepTime);
	};

	//create a function to change y axis 
  //when the other quantile lines showing up or disappearing
	function yAxisChange(Range){				
  	y_axis_trans.domain(Range); 
 		chart_yaxis.transition()
 			.duration(yAxisChangeTime)
 			.ease("sin-in-out")
 			.call(y_axis);
  };

	//create a function to remove lines 
	//when user click the disappearing button for quantile lines
	function RemoveLine(kind){
		chart.select( '.' + kind )
			.select('path')
			.attr('d', null);

		chart.select( '.' + kind )
			.select('g')
			.selectAll('circle')
			.remove();

		chart.select( '.' + kind )
			.select('text')
			.style('display', 'none');

	};


	//create a click function to show up or or remove the quantile lines
	QuantileLineDisplayButton.on('click' , function(d){
		if (d === 'Display'){
			chart.select('.QuantileLineDisplayButtonGroup')
				.select('.Display')
				.select('circle')
				.attr('r',5);
			chart.select('.QuantileLineDisplayButtonGroup')
				.select('.Disappear')
				.select('circle')
				.attr('r',0);

			if (QuantileShow === true && DrawFinshed === true){
				RemoveLine('first_quartile');
				RemoveLine('third_quartile');
				DrawLine('first_quartile');
    		DrawLine('third_quartile');
			}
			else if (QuantileShow === false && DrawFinshed === true){
  			var median_range = d3.extent(data, function(d){
						return d['median'];
					});

				var OldRange = [parseInt(median_range[0]) - 2, 
				parseInt(median_range[1]) + 2];

  			var NewRange = [d3.min(data, function(d){
						return parseInt(d['first_quartile']) - 2;
					}),
	  			d3.max(data, function(d){
						return parseInt(d['third_quartile']) + 2;
					})];

  			yAxisChange(NewRange);
  			MoveLine(OldRange);

  			setTimeout(
  				function(){
  					DrawLine('first_quartile');
  					DrawLine('third_quartile');
  				}, yAxisChangeTime + 10); 
  			QuantileShow = true ; 
  		}
    }
		else if (d === 'Disappear'){
			chart.select('.QuantileLineDisplayButtonGroup')
				.select('.Display')
				.select('circle')
				.attr('r',0);
			chart.select('.QuantileLineDisplayButtonGroup')
				.select('.Disappear')
				.select('circle')
				.attr('r',5);

			if (QuantileShow === true && DrawFinshed === true){
				RemoveLine('first_quartile');
				RemoveLine('third_quartile');
				QuantileShow = false;

				var OldRange = [d3.min(data, function(d){
						return parseInt(d['first_quartile']) - 2;
					}),
	    		d3.max(data, function(d){
						return parseInt(d['third_quartile']) + 2;
					})];

				var median_range = d3.extent(data, function(d){
						return d['median'];
					});

				var NewRange = [parseInt(median_range[0]) - 2, 
					parseInt(median_range[1]) + 2];

				yAxisChange(NewRange);
				MoveLine(OldRange);
			};					
		};
	});
	DrawLine('median'); 	               
};
d3.csv('Flight_DepDelay_Trend.csv',draw);
