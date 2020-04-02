module.exports = {
    accept: function(creep) {
        if(!creep.room.ai()) return false;
        if(creep.memory.boosts === undefined) creep.memory.boosts = [];
        if(!creep.memory.boosts) return false;

        let resources = _.drop(arguments);
        for(let resource of resources) {
            if(creep.memory.boosts.includes(resource)) continue;

            let booster = _.find(creep.room.ai().labs.boosters, (b) => b.resource === resource && b.isReady());
            if(booster) {
                if(creep.pos.isNearTo(booster.lab)) {
                    booster.lab.boostCreep(creep);
                    creep.memory.boosts.push(resource);
                    // TODO: verify that we get no problems when two boosters are in range
                    // or we move out of range because of a second boost
                } else {
                    creep.goTo(booster.lab);
                    return true;
                }
            } else {
                // giving up on that boost, because it is not available
                creep.memory.boosts.push(resource);
            }
        }

        return false;
    },
    decline: function(creep) {
        if(creep.memory.boosts === undefined) creep.memory.boosts = [];
        if(!creep.memory.boosts) return;

        let resources = _.drop(arguments);
        for(let resource of resources) {
            if(!creep.memory.boosts.includes(resource)) {
                creep.memory.boosts.push(resource);
            }
        }
    },
    disable: function(memory) {
        memory.boosts = false;
        return memory;
    }
};
