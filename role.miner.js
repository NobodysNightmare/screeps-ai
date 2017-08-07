const logistic = require('helper.logistic');
const spawnHelper = require("helper.spawning");

module.exports = {
    name: "miner",
    energyConfigs: [
        [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
        [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE],
        [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE],
        [WORK, WORK, WORK, CARRY, MOVE, MOVE],
        [WORK, WORK, WORK, CARRY, MOVE],
        [WORK, WORK, CARRY, MOVE]
    ],
    mineralConfigs: function(mineral) {
        let configs = [];
        
        let workNeeded = Math.ceil(mineral.mineralAmount * EXTRACTOR_COOLDOWN / CREEP_LIFE_TIME);
        workNeeded = Math.max(workNeeded, 5);
        for(let parts = Math.min(workNeeded, 32); parts > 2; parts -= 1) {
            configs.push(spawnHelper.makeParts(parts, WORK, 2, CARRY, Math.ceil(parts / 2), MOVE));
        }
        
        return configs;
    },
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
                let harvestPower = creep.memory.resource === RESOURCE_ENERGY ? HARVEST_POWER : HARVEST_MINERAL_POWER;
                if(creep.memory.selfSustaining && (store.hits / store.hitsMax) < 0.5) {
                    if(creep.repair(store) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(store);
                    }
                } else if(creep.carry[creep.memory.resource] >=  creep.carryCapacity - (harvestPower * creep.getActiveBodyparts(WORK))) {
                    if(creep.transfer(store, creep.memory.resource) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(store);
                    }
                }
            } else if(creep.memory.selfSustaining && creep.carry.energy >= _.filter(creep.body, (part) => part.type == WORK).length * 5) {
                this.buildContainer(creep, target);
            }
        } else if(harvestResult == ERR_NOT_IN_RANGE) {
            let maxRooms = creep.room == target.room ? 1 : 16;
            creep.moveTo(target, { maxRooms: maxRooms });
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
