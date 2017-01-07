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
        return _.find(partConfigs, function(config) {
                    return _.sum(_.map(config, (part) => BODYPART_COST[part])) <= room.energyCapacityAvailable;
                });
    },
    bestAffordableParts: function(room, partConfigs) {
        return _.find(partConfigs, function(config) {
                    return _.sum(_.map(config, (part) => BODYPART_COST[part])) <= room.energyAvailable;
                });
    },
    numberOfCreeps: function(room, role) {
        return room.find(FIND_MY_CREEPS, { filter: (creep) => creep.memory.role == role }).length;
    }
};