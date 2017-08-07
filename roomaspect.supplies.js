var spawnHelper = require("helper.spawning");
var carrier = require("role.carrier");
var harvester = require("role.harvester");
var linkCollector = require("role.linkCollector");
var miner = require("role.miner");
var logistic = require('helper.logistic');

module.exports = class SuppliesAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;
        this.linksEnabled = this.room.storage && this.roomai.links.storage();
    }

    run() {
        var primarySpawn = this.roomai.spawns[0];
        if(!primarySpawn) return;

        let source = primarySpawn.pos.findClosestByRange(FIND_SOURCES);

        this.buildHarvesters(source);

        if(this.linksEnabled) {
            let collector = spawnHelper.localCreepsWithRole(this.roomai, linkCollector.name)[0];
            if(!collector) {
                this.buildLinkCollector();
            }

            this.runLinks();
            if(this.roomai.links.checkOpenRequests()) {
                this.roomai.links.fullfillRequests();
            }
        }

        this.buildCollectors();
    }

    buildHarvesters(source) {
        var partConfigs = harvester.carryConfigs;
        var neededHarvesters = 1;
        if(!logistic.storeFor(source) && !(this.room.storage && this.room.storage.store.energy)) {
            partConfigs = harvester.miningConfigs;
            neededHarvesters = 2;
        }

        if(!this.roomai.canSpawn() || spawnHelper.numberOfLocalCreeps(this.roomai, harvester.name) >= neededHarvesters) {
            return;
        }

        var parts = null;
        if(spawnHelper.numberOfLocalCreeps(this.roomai, harvester.name) == 0) {
             parts = spawnHelper.bestAffordableParts(this.room, partConfigs);
        } else {
             parts = spawnHelper.bestAvailableParts(this.room, partConfigs);
        }

        this.roomai.spawn(parts, { role: harvester.name, source: source.id });
    }

    buildCollectors() {
        let storage = this.room.storage;
        if(!storage) return;

        let sources = this.room.find(FIND_SOURCES);

        // FIXME: ordering duplicated with miners
        let roomai = this.roomai;
        sources = _.sortBy(sources, (s) => s.pos.getRangeTo(roomai.spawns[0]));

        let existingCollectors = spawnHelper.localCreepsWithRole(this.roomai, carrier.name);
        let existingMiners = spawnHelper.localCreepsWithRole(this.roomai, miner.name);
        for(let source of sources) {
            if(this.roomai.canSpawn() &&
                !_.any(existingCollectors, (m) => m.memory.source == source.id && m.memory.destination == storage.id) &&
                (!this.linksEnabled || !this.roomai.links.linkAt(source)) &&
                _.any(existingMiners, (m) => m.memory.target == source.id)) {
                let parts = spawnHelper.bestAffordableParts(this.room, carrier.configsForCapacity(this.neededCollectorCapacity(source)), true);
                this.roomai.spawn(parts, { role: carrier.name, source: source.id, destination: storage.id, resource: RESOURCE_ENERGY });
            }
        }
    }

    neededCollectorCapacity(source) {
        // back and forth while 10 energy per tick are generated
        var needed = logistic.distanceByPath(source, this.room.storage) * 20;
        // adding at least one extra CARRY to make up for inefficiencies
        return needed + 60;
    }

    buildLinkCollector() {
        if(!this.roomai.canSpawn()) {
            return;
        }

        this.roomai.spawn(linkCollector.parts, { role: linkCollector.name });
    }

    runLinks() {
        for(let link of this.roomai.links.sources()) {
            if(link.energy / link.energyCapacity >= 0.5) {
                link.transferEnergy(this.roomai.links.storage());
            }
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'SuppliesAspect');
