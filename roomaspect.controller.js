var container = require("construction.containers");
var logistic = require('helper.logistic');
var spawnHelper = require("helper.spawning");

var carrier = require("role.carrier");
var upgrader = require("role.upgrader");

const LOW_ENERGY_LIMIT = 50000;
const HIGH_ENERGY_LIMIT = 200000;
const EXCESSIVE_ENERGY_LIMIT = 500000;

module.exports = class ControllerAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;
        this.controller = this.room.controller;
    }

    run() {
        let link = this.roomai.links.controller();
        if(link && this.roomai.links.storage()) {
            if(link.energy / link.energyCapacity <= 0.5) {
                this.roomai.links.requestEnergy(link);
            } else {
                // always canceling pending requests, in case we
                // accidentially requested too much (which happens because of
                // bad timing -.-)
                this.roomai.links.cancelRequest(link);
            }
        } else if(logistic.storeFor(this.controller)) {
            this.buildCarriers();
        } else {
            container.buildNear(this.controller);
        }

        this.buildUpgraders();
    }

    buildUpgraders() {
        let parts = spawnHelper.bestAvailableParts(this.room, upgrader.configsForEnergyPerTick(this.energyPerTick() / this.upgraderCount()));
        let spawnDuration = spawnHelper.spawnDuration(parts);
        let existingUpgraders = _.filter(spawnHelper.localCreepsWithRole(this.roomai, upgrader.name), (c) => !c.ticksToLive || c.ticksToLive > spawnDuration);
        if(!this.roomai.canSpawn() || existingUpgraders.length >= this.upgraderCount()) {
            return;
        }

        this.roomai.spawn(parts, { role: upgrader.name });
    }

    buildCarriers() {
        if(!this.roomai.canSpawn()) return;

        var existingCarriers = spawnHelper.localCreepsWithRole(this.roomai, carrier.name);
        existingCarriers = _.filter(existingCarriers, (c) => c.memory.destination == this.controller.id);
        if(this.room.storage) {
            if(existingCarriers.length > 0) return;
            this.spawnCarrier(this.room.storage);
        } else {
            for(var source of this.room.find(FIND_SOURCES)) {
                if(!_.any(existingCarriers, (m) => m.memory.source == source.id) &&
                    logistic.storeFor(source)) {
                    this.spawnCarrier(source, 300);
                }
            }
        }
    }

    spawnCarrier(source, capacityOverride) {
        // TODO: capacityOverride is a hack to ensure that my current main room isn't drained by an unneccessarily large carrier
        var capacity = capacityOverride || logistic.distanceByPath(source, this.controller) * 2 * this.energyPerTick();
        var parts = spawnHelper.bestAvailableParts(this.room, carrier.configsForCapacity(capacity));
        var memory = {
            role: carrier.name,
            source: source.id,
            destination: this.controller.id,
            resource: RESOURCE_ENERGY
        };

        this.roomai.spawn(parts, memory);
    }

    energyPerTick() {
        let energy = 10;

        if(this.room.storage) {
            if(this.room.controller.level == 7 && this.room.storage.store.energy > EXCESSIVE_ENERGY_LIMIT) {
                energy = 40;
            } else if(this.room.storage.store.energy > HIGH_ENERGY_LIMIT) {
                energy = 20;
            } else if(this.room.storage.store.energy < LOW_ENERGY_LIMIT) {
                energy = 4;
            }
        }

        if(this.room.controller.level == 8) {
            return _.min([15, energy]);
        } else {
            return energy;
        }
    }

    upgraderCount() {
        if(this.room.controller.level == 8) return 1;

        if(this.room.storage) {
            if(this.room.storage.store.energy < LOW_ENERGY_LIMIT) {
                return 1;
            }

            if(this.room.controller.level == 7 && this.room.storage.store.energy < EXCESSIVE_ENERGY_LIMIT) {
                return 1;
            }
        }

        return 2;
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'ControllerAspect');
