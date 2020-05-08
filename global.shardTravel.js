const sourceShardRegex = /-([A-Za-z0-9]+)$/;

// used to test whether we are on the public MMO server
// or (e.g.) a private server
const publicShardRegex = /^shard[0-9]+$/;

// TODO: proper caching:
// * only load remote shard memory once per Tick
// * only load local shard memory once per Tick

function loadLocalTravelMemory() {
    let segment = JSON.parse(InterShardMemory.getLocal() || "{}");
    return segment.travels || { departures: {} };
}

function loadRemoteTravelMemory(shardId) {
    let segment = JSON.parse(InterShardMemory.getRemote(shardId) || "{}");
    return segment.travels || { departures: {} };
}

function storeLocalTravelMemory(memory) {
    let segment = JSON.parse(InterShardMemory.getLocal() || "{}");
    segment.travels = memory;
    InterShardMemory.setLocal(JSON.stringify(segment));
}

function interShardAvailable() {
    return publicShardRegex.exec(Game.shard.name);
}

module.exports = class ShardTravel {
    static loadArrivals() {
        if(!interShardAvailable()) return;

        let arrivals = _.filter(Game.creeps, (c) => !c.memory.role);
        for(let creep of arrivals) {
            let sourceShard = (sourceShardRegex.exec(creep.name) || [])[1];
            if(!sourceShard) continue;
            if(sourceShard === Game.shard.name) continue;

            let departures = loadRemoteTravelMemory(sourceShard).departures;
            if(!departures[creep.name]) continue;

            creep.memory = departures[creep.name].memory;
        }
    }

    static announceDepartures() {
        if(!interShardAvailable()) return;

        let travels = loadLocalTravelMemory();
        let departingCreeps = _.filter(Game.creeps, (c) => c.memory.destinationShard && c.memory.destinationShard !== Game.shard.name);

        for(let creep of departingCreeps) {
            travels.departures[creep.name] = {
                memory: creep.memory,
                eol: Game.time + creep.ticksToLive
            };
        }

        let endOfLifeCreeps = _.compact(_.map(travels.departures, (info, name) => info.eol < Game.time && name));
        for(let creepName of endOfLifeCreeps) {
            delete travels.departures[creepName];
        }

        storeLocalTravelMemory(travels);
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'ShardTravel');
