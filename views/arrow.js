setInterval(loading, 5000); //every 5 seconds the get function is called
   var myArrow = $('.arrow'); //class of arrow image
   function loading(){
    var angleDeg
    $.get('http://localhost:8080/', function(data, status) {
         data = JSON.parse(data);
         c1_x= parseFloat(data.current1);  //turning all parsed data into FLOAT type
         c1_y=parseFloat(data.current2);
         c2_x=parseFloat(data.end1);
         c2_y = parseFloat(data.end2);   
        
         angleDeg = (Math.atan2(c2_y - c1_y, c2_x - c1_x) * 180 )/ Math.PI; //this is the agreed function for fetching an angle between 2 locations
        
        
        $({deg: 0}).animate({deg: angleDeg}, { //CSS animation starting from a degree of zero
            duration: 3000,
            step: function(now) {
                // in the step-callback (that is fired each step of the animation),
                // you can use the `now` paramter which contains the current
                // animation-position (`0` up to `angle`)
                myArrow.css({
                    transform: 'rotate(' + now + 'deg)'
                });
            }
        });
        console.log(c2_x + ',' + c2_y);
        console.log(angleDeg);
      });

      
      }

