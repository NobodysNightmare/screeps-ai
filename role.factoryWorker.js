const spawnHelper = require("helper.spawning");

module.exports = {
    name: "factoryWorker",
    parts: spawnHelper.makeParts(10, CARRY, 5, MOVE),
    run: function(creep) {
        let factory = creep.room.ai().factory;
        let storage = creep.room.storage;
        if(creep.memory.importing) {
            if(!this.carryTo(creep, factory.structure)) {
                creep.memory.importing = false;

                let exportResource = _.first(factory.exportableResources());
                if(exportResource) {
                    creep.withdraw(factory.structure, exportResource);
                }
            }
        } else {
            if(!this.carryTo(creep, storage)) {
                creep.memory.importing = true;

                let importResource = _.filter(factory.importableResources(), (r) => storage.store[r] > 0)[0];
                if(importResource) {
                    creep.withdraw(storage, importResource);
                }
            }
        }
    },

    carryTo: function(creep, target) {
        if(creep.pos.isNearTo(target)) {
            if(_.sum(creep.store) == 0) return false;
            creep.transfer(target, _.last(_.keys(creep.store)))
        } else {
            creep.goTo(target);
        }

        return true;
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'factoryWorker');
