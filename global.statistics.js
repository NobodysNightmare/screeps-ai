const refreshInterval = 5;

function totalAmount(room, resource) {
    if(room.terminal) {
        return room.storage.store[resource] + room.terminal.store[resource];
    } else {
        return room.storage.store[resource];
    }
}

module.exports = {
    initialize: function() {
      if(!Memory.stats) Memory.stats = {
          skippedTicks: 0,
          avgCpu: 0
      };
    },
    run: function() {
        this.refresh();
        this.draw();
    },
    refresh: function() {
        Memory.stats.avgCpu += Game.cpu.getUsed() / refreshInterval; // TODO: calculate on regular memory

        if(Game.time % refreshInterval !== 0) return;

        let stats = {}

        let myRooms = _.filter(Game.rooms, (r) => r.controller && r.controller.my);
        let heapStats = Game.cpu.getHeapStatistics();

        stats.gameTime = Game.time;
        stats.gcl = Game.gcl;
        stats.gpl = Game.gpl;
        stats.credits = Game.market.credits;
        stats.empire = this.empireStats(myRooms);
        stats.rooms = this.roomStats(myRooms);
        stats.memory = {
            main_used: RawMemory.get().length,
            heap_used: heapStats.used_heap_size
        };
        stats.cpu = Game.cpu;
        stats.cpu.used = Memory.stats.avgCpu;
        Memory.stats.avgCpu = 0;

        RawMemory.segments[99] = JSON.stringify(stats);
    },
    empireStats: function(myRooms) {
        myRooms = _.filter(myRooms, (r) => r.storage);

        return {
            resources: {
                energy: _.sum(myRooms, (r) => totalAmount(r, "energy")),
                H: _.sum(myRooms, (r) => totalAmount(r, "H")),
                O: _.sum(myRooms, (r) => totalAmount(r, "O")),
                Z: _.sum(myRooms, (r) => totalAmount(r, "Z")),
                K: _.sum(myRooms, (r) => totalAmount(r, "K")),
                L: _.sum(myRooms, (r) => totalAmount(r, "L")),
                U: _.sum(myRooms, (r) => totalAmount(r, "U")),
                X: _.sum(myRooms, (r) => totalAmount(r, "X")),
                power: _.sum(myRooms, (r) => totalAmount(r, "power"))
            },
            creeps: Object.keys(Game.creeps).length,
            playerTrades: Memory.tradeLogs && Memory.tradeLogs.players
        };
    },
    roomStats: function(myRooms) {
        let result = {};
        for(let room of myRooms) {
            let wallHits = _.map(room.ai().defense.borderStructures, (s) => s.hits);
            result[room.name] = {
                deficits: room.ai().labs.deficits,
                rcl: {
                    level: room.controller.level,
                    progress: room.controller.progress,
                    progressTotal: room.controller.progressTotal
                },
                wallStrength: wallHits.length > 0 ? _.min(wallHits) : 0,
                defcon: room.ai().defense.defcon
            };
            if(room.storage) {
                result[room.name].resources = {
                    energy: room.storage.store.energy,
                    H: room.storage.store.H,
                    O: room.storage.store.O,
                    Z: room.storage.store.Z,
                    K: room.storage.store.K,
                    L: room.storage.store.L,
                    U: room.storage.store.U,
                    X: room.storage.store.X,
                    power: room.storage.store.power
                };
            }
            if(room.terminal) {
                result[room.name].terminalSpace = room.terminal.store.getFreeCapacity();
            }
        }
        return result;
    },
    draw: function() {
        let visual = new RoomVisual();

        let creeps = Memory.stats.empire.creeps.toLocaleString("en");
        let energy = Memory.stats.empire.resources.energy.toLocaleString("en");

        visual.text("Creeps: " + creeps, 0, 48, { align: "left", color: "#fff", stroke: "#000" });
        visual.text("Energy: " + energy, 0, 49, { align: "left", color: "#fff", stroke: "#000" });
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'globalStatistics');
