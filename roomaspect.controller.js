var container = require("construction.containers");
var logistic = require('helper.logistic');
var spawnHelper = require("helper.spawning");

var carrier = require("role.carrier");
var upgrader = require("role.upgrader");

const LOW_ENERGY_LIMIT = 50000;
const HIGH_ENERGY_LIMIT = 200000;
const EXCESSIVE_ENERGY_LIMIT = 500000;

module.exports = function(roomai) {
    var room = roomai.room;
    var controller = room.controller;
    return {
        run: function() {
            let link = roomai.links.controller();
            if(link && roomai.links.storage()) {
                if(link.energy / link.energyCapacity <= 0.5) {
                    roomai.links.requestEnergy(link);
                } else {
                    // always canceling pending requests, in case we
                    // accidentially requested too much (which happens because of
                    // bad timing -.-)
                    roomai.links.cancelRequest(link);
                }
            } else if(logistic.storeFor(controller)) {
                this.buildCarriers();
            } else {
                container.buildNear(controller);
            }

            this.buildUpgraders();
        },
        buildUpgraders: function() {
            if(!roomai.canSpawn() || spawnHelper.numberOfLocalCreeps(roomai, upgrader.name) >= this.upgraderCount()) {
                return;
            }

            var parts = spawnHelper.bestAvailableParts(room, upgrader.configsForEnergyPerTick(this.energyPerTick() / this.upgraderCount()));
            roomai.spawn(parts, { role: upgrader.name });
        },
        buildCarriers: function() {
            if(!roomai.canSpawn()) return;

            var existingCarriers = spawnHelper.localCreepsWithRole(roomai, carrier.name);
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
            let energy = 10;
            
            if(room.storage) {
                if(room.controller.level == 7 && room.storage.store.energy > EXCESSIVE_ENERGY_LIMIT) {
                    energy = 40;
                } else if(room.storage.store.energy > HIGH_ENERGY_LIMIT) {
                    energy = 20;
                } else if(room.storage.store.energy < LOW_ENERGY_LIMIT) {
                    energy = 4;
                }
            }
            
            if(room.controller.level == 8) {
                return _.min([15, energy]);
            } else {
                return energy;
            }
        },
        upgraderCount: function() {
            if(room.controller.level == 8) return 1;
            
            if(room.storage) {
                if(room.storage.store.energy < LOW_ENERGY_LIMIT) {
                    return 1;
                }
                
                if(room.controller.level == 7 && room.storage.store.energy < EXCESSIVE_ENERGY_LIMIT) {
                    return 1;
                }
            }
            
            return 2;
        }
    }
};
