module.exports = {
    name: "linkCollector",
    parts: [CARRY, CARRY, MOVE],
    run: function(creep) {
        // creep is run from a different method inside the supplies aspect,
        // so that it has access to the links service...
    },
    runWithRoomAI: function(creep, roomai) {
        if(roomai.links.checkOpenRequests()) {
            this.transfer(creep, roomai.room.storage, roomai.links.storage());
        } else {
            this.transfer(creep, roomai.links.storage(), roomai.room.storage);
        }
    },
    transfer: function(creep, source, target) {
        if(creep.carry.energy == 0) {
            if(creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }
        // TODO: withdraw + transfer in one step
        if(creep.carry.energy > 0){
            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
    }
};