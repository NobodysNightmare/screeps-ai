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
        return _.find(partConfigs, function(config) {
                    return _.sum(_.map(config, (part) => BODYPART_COST[part])) <= price;
                });
    },
    localCreepsWithRole: function(roomai, role) {
        let creeps = roomai.room.find(FIND_MY_CREEPS);
        creeps = creeps.concat(_.compact(_.map(roomai.spawns, (spawn) => spawn.spawning && Game.creeps[spawn.spawning.name])));
        return _.filter(creeps, (creep) => creep.memory.role == role);
    },
    numberOfLocalCreeps: function(roomai, role) {
        return this.localCreepsWithRole(roomai, role).length;
    },
    globalCreepsWithRole: function(role) {
        let creeps = _.values(Game.creeps);
        creeps = creeps.concat(_.compact(_.map(Game.spawns, (spawn) => spawn.spawning && Game.creeps[spawn.spawning.name])));
        return _.filter(creeps, (creep) => creep.memory.role == role);
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'spawning');
