define(["lodash", "chai"], function(_, chai) {
	'use strict';
    
	var assert = chai.assert;
    
    function FakeContext() {
		this.trace = [];
		this.played = [];
		this.active = {};
		this.isDone = false;
	}
	FakeContext.prototype.performAction = function(action_id, action_description, onfinished) {
		this.trace.push({event:'action', action: action_id, description: action_description});
		this.played.push(action_id);
		onfinished();
	};
    FakeContext.prototype.activate = function(card_id) {
		this.trace.push({event:'activate', card_id:card_id});
		this.active[card_id] = true;
	};
	FakeContext.prototype.annotate = function(card_id, annotation) {
		this.trace.push({event:'annotate', card_id:card_id, annotation: annotation});
	};
    FakeContext.prototype.deactivate = function(card_id) {
		this.trace.push({event:'deactivate', card_id:card_id});
		delete this.active[card_id];
	};
	FakeContext.prototype.done = function() {
		this.trace.push({event:'done'});
		this.isDone = true;
	};
    FakeContext.prototype.assertTraceEquals = function(expectedTrace) {
		assert.deepEqual(this.trace, expectedTrace);
	};
    FakeContext.prototype.assertTraceContains = function(event) {
		assert.include(this.trace, event);
	};
	
    return FakeContext;
});
