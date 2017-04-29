const spawnHelper = require("helper.spawning");

module.exports = {
    name: "trader",
    parts: spawnHelper.makeParts(10, CARRY, 5, MOVE),
    run: function(creep) {
        let trading = creep.room.ai().trading;
        if(creep.memory.exporting) {
            if(!this.carryTo(creep, creep.room.terminal)) {
                let resource = trading.resourcesImportableToStorage[0];
                if(resource) {
                    let amount = Math.min(creep.carryCapacity, creep.room.terminal.store[resource], trading.neededImportToStorage(resource));
                    creep.withdraw(creep.room.terminal, resource, amount);
                }
                creep.memory.exporting = false;
            }
        } else {
            if(!this.carryTo(creep, creep.room.storage)) {
                let resource = trading.resourcesExportableFromStorage[0];
                if(resource) {
                    let amount = Math.min(creep.carryCapacity, trading.possibleExportFromStorage(resource));
                    creep.withdraw(creep.room.storage, resource, amount);
                }
                creep.memory.exporting = true;
            }
        }
    },

    carryTo: function(creep, target) {
        if(creep.pos.isNearTo(target)) {
            if(_.sum(creep.carry) == 0) return false;
            creep.transfer(target, _.last(_.keys(creep.carry)))
        } else {
            creep.moveTo(target);
        }

        return true;
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'trader');
