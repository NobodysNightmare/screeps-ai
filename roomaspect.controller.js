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
            
            var parts = spawnHelper.bestAvailableParts(room, upgrader.configsForEnergyPerTick(this.energyPerTick() / 2));
            roomai.spawn(parts, { role: upgrader.name });
        },
        buildCarriers: function() {
            if(!roomai.canSpawn()) return;
            
            var existingCarriers = spawnHelper.creepsWithRole(room, carrier.name);
            existingCarriers = _.filter(existingCarriers, (c) => c.memory.destination == controller.id);
            if(room.storage) {
                if(existingCarriers.length > 0) return;
                this.spawnCarrier(room.storage);
            } else {
                for(var source of room.find(FIND_SOURCES)) {
                    if(!_.any(existingCarriers, (m) => m.memory.source == source.id) &&
                        logistic.storeFor(source)) {
                        this.spawnCarrier(source, 300);
                    }
                }
            }
        },
        spawnCarrier: function(source, capacityOverride) {
            // TODO: capacityOverride is a hack to ensure that my current main room isn't drained by an unneccessarily large carrier
            var capacity = capacityOverride || logistic.distanceByPath(source, controller) * 2 * this.energyPerTick();
            var parts = spawnHelper.bestAvailableParts(room, carrier.configsForCapacity(capacity));
            var memory = {
                role: carrier.name,
                source: source.id,
                destination: controller.id,
                resource: RESOURCE_ENERGY
            };
            
            roomai.spawn(parts, memory);
        },
        energyPerTick: function() {
            // TODO: this should adapt based on number of carriers and demand
            if(room.storage && room.storage.store.energy > 50000) {
                return 20;
            } else {
                return 10;
            }
        }
    }
};