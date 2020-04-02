const logistic = require('helper.logistic');
const profitVisual = require("visual.roomProfit");

module.exports = {
    name: "carrier",
    partConfigs: [
        [CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE],
        [CARRY, CARRY, MOVE, CARRY, CARRY, MOVE],
        [CARRY, CARRY, MOVE]
    ],
    configsForCapacity: function(capacity, options) {
        var workParts = (options && options.workParts) || 0;
        var configs = [];
        for(var carries = Math.max(2, Math.ceil(capacity / 50)); carries >= 2; carries -= 1) {
            let config = Array(workParts).fill(WORK).concat(Array(carries).fill(CARRY)).concat(Array(Math.ceil((carries + workParts) / 2)).fill(MOVE));
            // maximum creep size is 50 parts
            if(config.length <= 50) configs.push(config);
        }

        return configs;
    },
    run: function(creep) {
        if(creep.memory.resource == RESOURCE_ENERGY) {
            logistic.pickupSpareEnergy(creep);
        }

        if(_.sum(creep.store) > 0 && !this.shouldWait(creep)) {
            if(this.deliver(creep)) this.pickup(creep);
        }
        else {
            if(this.pickup(creep)) this.deliver(creep);
        }
    },
    deliver: function(creep) {
        if(creep.memory.selfSustaining && !(creep.room.controller && creep.room.controller.owner)) {
            var road = _.find(creep.pos.lookFor(LOOK_STRUCTURES), (s) => s.structureType == STRUCTURE_ROAD);
            if(road) {
                if(road.hits / road.hitsMax <= 0.6) {
                    creep.repair(road);
                }
            } else if(creep.pos.x > 0 && creep.pos.x < 49 && creep.pos.y > 0 && creep.pos.y < 49) {
                if(this.buildRoad(creep)) {
                    return false; // stop on pending construction sites
                };
            }
        }

        var target = logistic.storeFor(this.destination(creep)) || this.destination(creep);
        let transferResult = creep.transfer(target, creep.memory.resource);
        if(transferResult == OK) {
            creep.memory.waitStart = null;
            if(creep.memory.registerRevenueFor && creep.memory.resource == RESOURCE_ENERGY) {
                // assuming we always transfer all our energy
                profitVisual.addRevenue(creep.memory.registerRevenueFor, creep.store.energy);
            }

            return true;
        } else if(transferResult == ERR_NOT_IN_RANGE) {
            creep.goTo(target);
        }
    },
    pickup: function(creep) {
        // TODO: also collect raw resources lying around the source
        if(!this.source(creep)) return;
        let target = this.source(creep).isCreep ? this.source(creep) : (logistic.storeFor(this.source(creep)) || this.source(creep));

        if(creep.pos.isNearTo(target)) {
            let result = this.withdraw(creep, target);
            if(result == OK) {
                return this.startWait(creep);
            }
        } else {
            creep.goTo(target);
        }
    },
    buildRoad: function(creep) {
        var constructionSite = _.find(creep.pos.lookFor(LOOK_CONSTRUCTION_SITES), (cs) => cs.structureType == STRUCTURE_ROAD);
        if(constructionSite) {
            return creep.build(constructionSite) == OK;
        } else {
            creep.pos.createConstructionSite(STRUCTURE_ROAD);
            return true;
        }
    },
    source: function(creep) {
      return Game.getObjectById(creep.memory.source);
    },
    destination: function(creep) {
      return Game.getObjectById(creep.memory.destination);
    },
    withdraw: function(creep, source) {
        if(source.isCreep) {
            return source.transfer(creep, creep.memory.resource);
        } else {
            return creep.withdraw(source, creep.memory.resource);
        }
    },
    shouldWait: function(creep) {
        if(!creep.memory.waitTicks) return false;
        if(creep.store.getFreeCapacity() == 0) return false;
        if(!creep.memory.waitStart) return true;
        return creep.memory.waitStart + creep.memory.waitTicks > Game.time;
    },
    // starts waiting at source (if necessary), returns true if creep can go
    // to destination immediately.
    startWait: function(creep) {
        if(!creep.memory.waitTicks) return true;

        if(!creep.memory.waitStart) creep.memory.waitStart = Game.time;

        return !this.shouldWait(creep);
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'carrier');
