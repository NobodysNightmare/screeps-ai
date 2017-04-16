const spawnHelper = require("helper.spawning");
const trading = require("helper.trading");

module.exports = {
    name: "trader",
    parts: spawnHelper.makeParts(10, CARRY, 5, MOVE),
    run: function(creep) {
        if(creep.memory.exporting) {
            if(!this.carryTo(creep, creep.room.terminal)) {
                let resource = trading.findImportableResource(creep.room);
                if(resource) {
                    let amount = _.min([creep.carryCapacity, trading.baselineAmount - creep.room.storage.store[resource]]);
                    creep.withdraw(creep.room.terminal, resource, amount);
                }
                creep.memory.exporting = false;
            }
        } else {
            if(!this.carryTo(creep, creep.room.storage)) {
                let resource = trading.findExportableResource(creep.room);
                if(resource) {
                    let amount = _.min([creep.carryCapacity, creep.room.storage.store[resource] - trading.baselineAmount]);
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
