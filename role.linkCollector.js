module.exports = {
    name: "linkCollector",
    parts: [CARRY, CARRY, MOVE],
    run: function(creep) {
        let roomai = creep.room.ai();
        if(roomai.links.checkOpenRequests()) {
            this.transfer(creep, roomai.room.storage, roomai.links.storage());
        } else {
            this.transfer(creep, roomai.links.storage(), roomai.room.storage);
        }
    },
    transfer: function(creep, source, target) {
        if(creep.store.energy == 0) {
            if(creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.goTo(source);
            }
        }

        if(creep.store.energy > 0){
            let transferResult = creep.transfer(target, RESOURCE_ENERGY);
            if(transferResult === OK) {
                creep.memory.stopped = true;
            } else if(transferResult === ERR_NOT_IN_RANGE) {
                creep.goTo(target);
            }
        }
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'linkCollector');
