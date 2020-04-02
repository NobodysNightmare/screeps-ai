const CreepMover = require("creepmover");
const PathBuilder = require("pathbuilder");
const ff = require("helper.friendFoeRecognition");

PowerCreep.prototype.goTo = function(target, options) {
    let mover = new CreepMover(this, target, options);
    return mover.move();
}

PowerCreep.prototype.isCreep = true;
