var container = require("construction.containers");
var logistic = require('helper.logistic');
var spawnHelper = require("helper.spawning");

var carrier = require("role.carrier");
var upgrader = require("role.upgrader");

module.exports = function(roomai) {
    var room = roomai.room;
    var controller = room.controller;
    return {
        run: function() {
            if(logistic.storeFor(controller)) {
                this.buildCarriers();
            } else {
                container.buildNear(controller);
            }
            
            this.buildUpgraders();
        },
        buildUpgraders: function() {
            if(!roomai.canSpawn() || spawnHelper.numberOfCreeps(room, upgrader.name) >= 2) {
                return;
            }
            
            var parts = spawnHelper.bestAvailableParts(room, upgrader.partConfigs);
            roomai.spawn(parts, { role: upgrader.name });
        },
        buildCarriers: function() {
            var existingCarriers = spawnHelper.creepsWithRole(room, carrier.name);
            existingCarriers = _.filter(existingCarriers, (c) => c.memory.destination == controller.id);
            for(var source of room.find(FIND_SOURCES)) {
                if(!_.any(existingCarriers, (m) => m.memory.source == source.id) &&
                    logistic.storeFor(source)) {
                    var parts = spawnHelper.bestAvailableParts(room, carrier.partConfigs);
                    var memory = {
                        role: carrier.name,
                        source: source.id,
                        destination: controller.id,
                        resource: RESOURCE_ENERGY
                    };
                    
                    roomai.spawn(parts, memory);
                }
            }
        }
    }
};