##Summary
This project contains one chart. It shows the trend of flights delays from 1989 to 2008, including arrival delays and departure delays. The line with gradually upward trend on chart shows that flight delays were increased over years.
 
##Design 
###Data exploration
I downloaded data from RITA, which contains information on United State flight delays and performance. After some exploration by R, I find that the medians of delay(including departure delays and arrival delays) time per year becoming larger and larger over years from 1989 to 2008. So I want to show this increased trend by a time series line chart.   

###Design choice
Since I want to show the trend over time, I choose a line chart with x axis as time and y axis as delay time to show the trend over time. In the chart, I use lines to emphasize overall pattern, and points which represent median values of every year connected by lines to slightly emphasize individual values while still highlighting the overall pattern. In order to seperate departure delay and arrival delay in one chart, I set buttons for users to choose delay catergory.   

###Changes on design
* My initial designed chart only contains a median line over years with points on it. When I share my design with first person, he suggested me to add both first quantile line and third quantile line on the chart. Which will show the overall trend over years more clearly. Then I adopted his suggestion and plotted these two lines on the chart. I find that both quantiles had the same trend with median over years, and the gap between third and first quantiles became larger and larger too.   
* After that, I share my design to the second person. He suggested me to use animation when showing those lines, and just show median line without first and third quantile lines on the first time for chart's sentenious. I thought it makes sense. In order to do that, I changed my design and set buttons for user to choose whether showing the other two quantile lines. Besides, I used animation technology on lines' demonstration.   
* Finally, the third person I shared my design with, suggestted that it's better to show all three quantiles and the gap between the third and first quantiles when mouse cursor was placed on one of three quantile points if there were all three quantile lines on chart. Since my initial design only shows one value of the point on which the mouse cursor was placed, I think it can make users more clear about the specific circumstances. So I  adopted his suggestion and changed my design for that. 

##Feedback

* **Feedback One**: Just a median line on the chart can not show the overall trend sufficiently. You can add both first quantile line and third quantile line on the chart. Which will show the overall trend over years more clearly.     

* **Feedback Two**: You can use animation when showing those lines, and just show median line without first and third quantile lines for the first time, which will make the graphic more sentenious. For the third and first quantil lines, you can supply a choose of whether showing the other two quantile lines. 

* **Feedback Three**: Instead of showing one value of the point on which the mouse cursor was placed, you can show all three quantiles and the gap between the third and first quantiles, if there were all three quantile lines on chart

##Resources
* <https://github.com/d3/d3/wiki>
* <https://developer.mozilla.org/zh-CN/docs/Web/SVG>
* <http://bl.ocks.org>
* <http://stackoverflow.com/questions/20384719/why-does-javascript-settimeout-not-work-in-a-loop>
* <http://duspviz.mit.edu/d3-workshop/transitions-animation/>