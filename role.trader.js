const spawnHelper = require("helper.spawning");

// exporting anything does not make sense with less than
// this amount of energy in the terminal
const EXPORT_ENERGY_THRESHOLD = 25000;

// if free space in the terminal gets below this value, we consider it overfilled
const TERMINAL_WORKING_BUFFER = 1000;

module.exports = {
    name: "trader",
    parts: spawnHelper.makeParts(10, CARRY, 5, MOVE),
    run: function(creep) {
        let trading = creep.room.ai().trading;
        let terminal = creep.room.terminal;
        let storage = creep.room.storage;
        if(creep.memory.exporting) {
            if(!this.carryTo(creep, terminal)) {
                creep.memory.exporting = false;

                let importResource = _.last(trading.resourcesImportableToStorage);
                if(importResource) {
                    let amount = Math.min(creep.store.getCapacity(), terminal.store[importResource], trading.neededImportToStorage(importResource));
                    creep.withdraw(terminal, importResource, amount);
                } else if(terminal.my && (terminal.store.getFreeCapacity() < TERMINAL_WORKING_BUFFER)) {
                    let excessResource = _.invert(terminal.store)[_.sortBy(terminal.store, (r) => -r)[0]];
                    console.log("Terminal in room " + creep.room.name + " is overfilled! Temporarily importing " + excessResource);
                    creep.withdraw(terminal, excessResource);
                }
            }
        } else {
            if(!this.carryTo(creep, storage)) {
                creep.memory.exporting = true;

                let exportResource = _.last(trading.resourcesExportableFromStorage);
                if(exportResource) {
                    let amount = Math.min(creep.store.getCapacity(), trading.possibleExportFromStorage(exportResource));

                    // overflow protection for terminal
                    // do not put further minerals in, if there is no energy to export them
                    if(terminal.store.energy < EXPORT_ENERGY_THRESHOLD) {
                        return;
                    }

                    creep.withdraw(storage, exportResource, amount);
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
profiler.registerObject(module.exports, 'trader');
