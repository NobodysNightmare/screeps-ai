const CreepMover = require("creepmover");
const PathBuilder = require("pathbuilder");
const ff = require("helper.friendFoeRecognition");

PowerCreep.prototype.goTo = function(target, options) {
    // TODO: make this the default
    if(options && options.newPathing) {
        let mover = new CreepMover(this, target, options);
        return mover.move();
    }

    let builder = new PathBuilder();
    options = options || {}
    if(options.avoidHostiles) {
        builder.avoidHostiles = true;
        if(_.some(ff.findHostiles(this.room), (c) => _.some(c.parts, (p) => p.type === ATTACK || p.type === RANGED_ATTACK))) {
            options.reusePath = 0;
        }
    }
    options.costCallback = builder.getAdditiveCallback();
    return this.moveTo(target, options);
}

PowerCreep.prototype.isCreep = true;
