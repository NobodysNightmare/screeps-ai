var logistic = require('helper.logistic');

module.exports = {
    name: "miner",
    energyConfigs: [
        [WORK, WORK, MOVE, WORK, WORK, MOVE, WORK, CARRY, MOVE],
        [WORK, WORK, MOVE, WORK, CARRY, MOVE],
        [WORK, WORK, CARRY, MOVE]
    ],
    mineralConfigs: [
        [WORK, WORK, MOVE, WORK, WORK, MOVE, WORK, WORK, MOVE, WORK, WORK, MOVE, WORK, CARRY, MOVE],
        [WORK, MOVE, WORK, WORK, MOVE, WORK, WORK, MOVE, WORK, CARRY, MOVE],
        [WORK, WORK, MOVE, WORK, CARRY, MOVE],
        [WORK, WORK, CARRY, MOVE]
    ],
    run: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if(!target) return;
        
        if(Game.time % 10 == 0 && creep.memory.resource == RESOURCE_ENERGY) {
            this.considerSuicide(creep);
        }
        
        var harvestResult = OK;
        if(_.sum(creep.carry) < creep.carryCapacity) {
            harvestResult = creep.harvest(target);
        }

        if(harvestResult == OK) {
            var store = logistic.storeFor(target);
            if(store) {
                if(creep.memory.selfSustaining && (store.hits / store.hitsMax) < 0.5) {
                    if(creep.repair(store) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(store);
                    }
                } else if(creep.transfer(store, creep.memory.resource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(store);
                }
            } else if(creep.memory.selfSustaining && creep.carry.energy >= _.filter(creep.body, (part) => part.type == WORK).length * 5) {
                this.buildContainer(creep, target);
            }
        } else if(harvestResult == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    },
    buildContainer: function(creep, source) {
        var constructionSite = logistic.storeFor(source, true);
        if(constructionSite) {
            if(creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                creep.moveTo(constructionSite);
            }
        } else {
            creep.pos.createConstructionSite(STRUCTURE_CONTAINER);
        }
    },
    considerSuicide: function(creep) {
        let myWorkParts = this.countWorkParts(creep);
        if(myWorkParts == 5) return;
        
        let betterMiner = creep.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (c) => c.memory.role == this.name && c.memory.target == creep.memory.target && this.countWorkParts(c) > myWorkParts });
        if(!betterMiner || creep.pos.getRangeTo(betterMiner) > 5) return;
        
        creep.suicide();
    },
    countWorkParts: function(creep) {
        return _.filter(creep.body, (p) => p.type == WORK).length;
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'miner');
