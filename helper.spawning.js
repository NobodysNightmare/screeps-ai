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
    creepsWithRole: function(room, role) {
        return room.find(FIND_MY_CREEPS, { filter: (creep) => creep.memory.role == role })
    },
    numberOfCreeps: function(room, role) {
        return this.creepsWithRole(room, role).length;
    }
};