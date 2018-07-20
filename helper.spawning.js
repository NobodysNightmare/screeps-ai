/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('helper.spawning');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    bestAvailableParts: function(room, partConfigs) {
        return this.bestPartsForPrice(partConfigs, room.energyCapacityAvailable);
    },
    bestAffordableParts: function(room, partConfigs, includeStorage) {
        var energy = room.energyAvailable;
        if(includeStorage && room.storage) {
            energy += room.storage.store.energy;
            energy = _.min([energy, room.energyCapacityAvailable]);
        }
        return this.bestPartsForPrice(partConfigs, energy);
    },
    bestPartsForPrice: function(partConfigs, price) {
        let spawnHelper = this;
        let config = _.find(partConfigs, function(config) {
                    return spawnHelper.costForParts(config) <= price;
                });
        return config || _.last(partConfigs);
    },
    costForParts: function(parts) {
        return _.sum(_.map(parts, (part) => BODYPART_COST[part]))
    },
    makeParts: function() {
        let parts = [];
        for (let i = 0; i < arguments.length; i += 2) {
            let count = arguments[i];
            let type = arguments[i + 1];
            parts = parts.concat(Array(count).fill(type));
        }

        return parts;
    },
    spawnDuration: function(config) {
        if(!config) return 0;
        return config.length * CREEP_SPAWN_TIME;
    },
    localCreepsWithRole: function(roomai, role) {
        let creeps = roomai.room.find(FIND_MY_CREEPS);
        creeps = creeps.concat(_.compact(_.map(roomai.spawns.spawns, (spawn) => spawn.spawning && Game.creeps[spawn.spawning.name])));
        return _.filter(creeps, (creep) => creep.memory.role == role);
    },
    numberOfLocalCreeps: function(roomai, role) {
        return this.localCreepsWithRole(roomai, role).length;
    },
    globalCreepsWithRole: function(role) {
        if(!this._globalCreepCache || this._globalCreepCacheTime !== Game.time) {
            this._globalCreepCacheTime = Game.time;
            this._globalCreepCache = _.groupBy(Game.creeps, (c) => c.memory.role);
        }

        return this._globalCreepCache[role] || [];
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'spawning');
