module.exports = {
    initialize: function() {
      if(!Memory.stats) Memory.stats = {
          skippedTicks: 0
      }
    },
    run: function() {
        this.refresh();
        this.draw();
    },
    refresh: function() {
        if(Game.time % 5 !== 0) return;
        
        let stats = Memory.stats;
        let myRooms = _.filter(Game.rooms, (r) => r.controller && r.controller.my);
        
        stats.gameTime = Game.time;
        stats.gcl = Game.gcl;
        stats.empire = this.empireStats(myRooms);
        stats.rooms = this.roomStats(myRooms);
        stats.memory = {
            main_used: RawMemory.get().length
        };
        stats.cpu = Game.cpu;
        stats.cpu.used = Game.cpu.getUsed();
    },
    empireStats: function(myRooms) {
        myRooms = _.filter(myRooms, (r) => r.storage);
        
        return {
            resources: {
                energy: _.sum(myRooms, (r) => r.storage.store.energy),
                H: _.sum(myRooms, (r) => r.storage.store.H || 0),
                O: _.sum(myRooms, (r) => r.storage.store.O || 0),
                Z: _.sum(myRooms, (r) => r.storage.store.Z || 0),
                K: _.sum(myRooms, (r) => r.storage.store.K || 0),
                L: _.sum(myRooms, (r) => r.storage.store.L || 0),
                U: _.sum(myRooms, (r) => r.storage.store.U || 0),
                X: _.sum(myRooms, (r) => r.storage.store.X || 0),
                power: _.sum(myRooms, (r) => r.storage.store.power || 0)
            },
            creeps: Object.keys(Game.creeps).length
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
                wallStrength: wallHits.length > 0 ? _.min(wallHits) : 0
            };
            if(room.storage) {
                result[room.name].resources = {
                    energy: room.storage.store.energy,
                    H: room.storage.store.H || 0,
                    O: room.storage.store.O || 0,
                    Z: room.storage.store.Z || 0,
                    K: room.storage.store.K || 0,
                    L: room.storage.store.L || 0,
                    U: room.storage.store.U || 0,
                    X: room.storage.store.X || 0,
                    power: room.storage.store.power || 0
                };
            }
            if(room.terminal) {
                result[room.name].terminalSpace = room.terminal.storeCapacity - _.sum(room.terminal.store);
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