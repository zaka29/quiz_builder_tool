;(function () {
	'use strict';
	var multiChoiceTool = {
		toolName: ko.observable("Multy choice"),
		onDropHandler: function(){
			alert("Muty choice tool dropped!");
		}
	}
	
	var trueFalseTool = {
		toolName: ko.observable("True false"),
		onDropHandler: function(){
			alert("True false tool dropped!");
		}
	}
	
	var textEntryTool = {
		toolName: ko.observable("Text entry"),
		onDropHandler: function(){
			alert("Text entry tool dropped!");
		}
	}
	
	var builderTools = {
		tools: ko.observableArray([multiChoiceTool, trueFalseTool, textEntryTool]),
		callHandler: function(evnt, ui){
			console.log(evnt)
			console.log(ui.target)
			console.log($(ui.target).data("handler"))
		}
	} 

	ko.applyBindings(builderTools);

}());