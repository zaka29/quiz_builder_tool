$(function(){
	
    $(".drag-tool").draggable({
		start: function(event, ui){
		  	// console.log(ui.helper[0]);
		  	copyDraggable(ui.helper[0])
		},
        revert: true
	});
	
    $("#canvas").droppable({
      	drop: function(event, ui) {
        	//console.log(ui.draggable[0]);
            createShape(ui)
      	}
    });
    
    // Set some clicks
    $(".btn").on("click", function(evt){
        $("pre.output").text(submitTool());
    });
   
    function copyDraggable(draggable){
    	var $draggable = $(draggable).clone();
    	// Clear styles after jQuery
        $draggable.removeAttr("style");
    	$draggable.insertBefore(draggable);
    	$draggable.draggable({
    		start: function(event, ui){
    			copyDraggable(ui.helper[0]);
    		},
            revert: true
    	});
    }

    function createShape(ui){
        var daraggablePos = ui.offset;
        var canvasPos = $("#canvas").offset();
        var params = {};

        if (!ui.draggable.data("params")){
            // Destroy draggable
            ui.draggable.remove();
            // TO DO: Some logic here which elements 
            // we want to build
            // Build shape we want to put on canvas here
            var $shape = $("<div class='multi-choice'><p>Test</p></div>");
            $("#canvas").append($shape);

            var posX = daraggablePos.left - canvasPos.left;
            var posY = daraggablePos.top - canvasPos.top;
                    
            $shape.css({'left':posX, 'top':posY});
            //$shape.width($shape.width);
            $shape.draggable({
                containment: "#canvas", 
                scroll: false
            });

            $shape.resizable({
                containment: "#canvas",
                resize: function(event, ui){
                    updateParams(params, ui.element);
                }
            });
            // Get all styles
            updateParams(params, $shape);

        } else {
            // TO DO: Update data param here 
            updateParams(params, ui.draggable);
     
        }

        return params;        
    }

    function submitTool(){
        var $shapes = $(".multi-choice", "#canvas");
        var data = {};
        $shapes.each(function(i, shape){
            data[i] = $(shape).data("params");
        });

        return JSON.stringify(data);
    }

    function updateParams(params, shape){
        params.width = shape.width();
        params.height = shape.height();
        params.posX = shape.position().left;
        params.posY = shape.position().top;
          
        shape.data("params", params);
    }

});
