define(["zepto", "lodash", "react", "robots.cards", "robots.audio", "robots.edit", "robots.gui"], 
	function($, _, React, cards, audio, edit, gui)
{
    'use strict';
	
    var audio_player;
	var history;
	var run_context = null;
	var card_layout;
	
    function preloadAudio(audio_player) {
		_.values(cards.action).forEach(function (c) {
			audio_player.load("actions/" + c.action);
		});
	};
	
	function enable(id, flag) {
		document.getElementById(id).disabled = !flag;
	}
	
    function viewToRunMode() {
		$("body").removeClass("editing").addClass("running");
	}
    
    function viewToEditMode() {
		$("body").addClass("editing").removeClass("running");
		
		card_layout.deactivateCards();
		
		enable("again", false);
		enable("next", false);
	}
	
	function performAction(action_id, action_description, done_callback) {
		this.next_step_callback = done_callback;
		enablePlayButtons(false);
		audio_player.play("actions/" + action_id, audioClipFinished);
		
		this.action_count++;
		$("#description").text(action_description);
		$("#steps").text(this.action_count);
		$("#saving").text(Math.max(0, this.action_count - this.card_count));
	}
	
	function enablePlayButtons(flag) {
		enable("again", flag);
		enable("next", flag);
	}
	
	function audioClipFinished() {
		enablePlayButtons(true);
	}
	
	function playAudioClipAgain() {
		enablePlayButtons(false);
		audio_player.replay(audioClipFinished);
	}
	
	function nextStep() {
		enablePlayButtons(false);
		run_context.next_step_callback();
	}
	
    function runProgram() {
		viewToRunMode();
		
		run_context = {
			next_step_callback: _.noop,
			card_count: cards.programSize(history.current()),
			action_count: 0,
			
			activate: card_layout.activateCard,
			deactivate: card_layout.deactivateCard,
			annotate: card_layout.annotateCard,
			performAction: performAction
		};
		
		cards.run(history.current(),
				  run_context,
				  programFinished);
	}
	
	function programFinished() {
		run_context = null;
		viewToEditMode();
	}
    
    function stopProgram() {
		console.log("stop");
		audio_player.stop();
		programFinished();
	}
	
	function onEdit(new_program) {
		updateHistory(history.push(new_program));
	}
	
	function clearProgram() {
		onEdit([]);
	}
	
	function updateHistory(new_history) {
		history = new_history;
		
		card_layout.programChanged(history.current());
		
		var cardCount =	cards.programSize(history.current());
		
		document.getElementById("card-count").innerText = cardCount;
		enable("undo", history.canUndo());
		enable("redo", history.canRedo());
		enable("run", cardCount > 0);
		enable("clear", cardCount > 0);
	}
	
	function undo() {
		updateHistory(history.undo());
	}
	
	function redo() {
		updateHistory(history.redo());
	}
	
	function play() {
		if (audio_player == null) {
			audio_player = new audio.AudioPlayer();
			preloadAudio(audio_player);
		}
		
		updateHistory(edit.undoStartingWith(cards.newProgram()));
		
		$("body").removeClass("starting").addClass("playing");
		viewToEditMode();
	}
	
	function start() {
		card_layout = gui.CardLayout({onEdit: onEdit});
		
		$("#play").on("click", play);
		$("#clear").on("click", clearProgram);
		$("#undo").on("click", undo);
		$("#redo").on("click", redo);
		$("#run").on("click", runProgram);
		$("#stop").on("click", stopProgram);
		$("#again").on("click", playAudioClipAgain);
		$("#next").on("click", nextStep);
		
		React.renderComponent(card_layout, document.getElementById("program"));
		React.renderComponent(gui.CardStacks({cards: cards}), document.getElementById("stacks"));
		
		$("body").removeClass("loading").addClass("starting");
	}
	
    return {
		start: start
	};
});
