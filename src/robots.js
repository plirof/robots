define(["d3", "underscore", "robots.cards", "robots.audio"], function(d3, _, cards, AudioPlayer) {
    var audio_player = new AudioPlayer();
    var program = cards.newProgram();
	var is_running = false;
    var dragged_card = null;
    
    function attr(name) {
		return function(obj) {
			return obj[name];
		};
	}
    
    cards.preload(audio_player);
    
    function viewToRunMode() {
		d3.select("body")
			.classed("editing", false)
			.classed("running", true);
	}
    
    function viewToEditMode() {
		d3.select("body")
			.classed("editing", true)
			.classed("running", false);
	}
    
    function runProgram() {
		function pauseBetweenInstructions(next_step) {
			setTimeout(function() { if (is_running) next_step(); }, 
					   250);
		}
		
		is_running = true;
		viewToRunMode();
		program.run(audio_player, viewToEditMode);
	}
    
    function stopProgram() {
		console.log("stop");
		is_running = false;
		audio_player.stop();
		viewToEditMode();
	}
	
	function addNewCard(stack) {
		var card = stack.newCard();
		program.append(card);
		
		var cardCount =	program.totalCardCount();
		d3.select("#card-count").text(cardCount);
		
		bindProgramToHtml(d3.select("#program"));
		
		d3.select("#run").attr("enabled", cardCount > 0);
	}
	
    function bindProgramToHtml(group) {
		var cards = group.selectAll(".card").data(program.toArray(), attr("id"));
		cards.enter().insert("div", "#cursor")
		    .attr("id", attr("id"))
			.classed("card", true)
			.classed("action", function(card) { return card.isAtomic; })
			.classed("control", function(card) { return !card.isAtomic; })
			.text(attr("text"));
		cards.exit().remove();
	}
	
    function newCardDragStarted(card_type) {
		var dt = d3.event.dataTransfer;
		dt.effectAllowed = 'copy';
		dt.setData("application/x-robot-card", "");
		
		dragged_card = card_type;
	}
	
    function newCardDragEnded(card_type) {
		dragged_card = null;
	}
    
    function newCardDragEnter() {
		d3.event.preventDefault();
		return true;
	}
	
    function newCardDragOver() {
		d3.event.preventDefault();
		return true;
	}
    
    function newCardDropped() {
		addNewCard(dragged_card);
		d3.event.stopPropagation();
	}
	
	function start() {
		d3.select("div").on("touchmove", function() {
		    d3.event.preventDefault();
		});
		
		d3.select("#run").on("click", runProgram);
		d3.select("#stop").on("click", stopProgram);
		
		d3.selectAll("#keyboard #control").selectAll(".card")
			.data(_.values(cards.control))
			.enter()
		    .append("div")
		    .attr("draggable", true)
			.classed("card", true)
			.classed("control", true)
			.text(attr("text"))
		    .on("dragstart", newCardDragStarted)
		    .on("dragend", newCardDragEnded);
		
		d3.selectAll("#keyboard #actions").selectAll(".card")
			.data(_.values(cards.actions))
			.enter()
		    .append("div")
		    .attr("draggable", true)
			.classed("card", true)
			.classed("action", true)
			.text(attr("text"))
		    .on("dragstart", newCardDragStarted)
		    .on("dragend", newCardDragEnded);

		d3.select("#cursor")
		    .on("dragenter", newCardDragEnter)
		    .on("dragover", newCardDragOver)
			.on("drop", newCardDropped);
		
		d3.select("body").classed("loading", false);
		viewToEditMode();
	}
	
    return {
		start: start
	};
});