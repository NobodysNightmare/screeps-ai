module.exports = {
    run: function() {
        this.refresh();
        this.draw();
    },
    refresh: function() {
        if(Game.time % 10 !== 0) return;
        
        let stats = Memory.stats;
        
        stats.creeps = Object.keys(Game.creeps).length;
        stats.energy = 0;
        for(let room of _.filter(Game.rooms, (r) => r.controller && r.controller.my)) {
            if(room.storage) {
                stats.energy += room.storage.store.energy;
            }
        }
    },
    draw: function() {
        let visual = new RoomVisual();
        
        let creeps = Memory.stats.creeps.toLocaleString("en");
        let energy = Memory.stats.energy.toLocaleString("en");
        
        visual.text("Creeps: " + creeps, 0, 48, { align: "left", color: "#fff", stroke: "#000" });
        visual.text("Energy: " + energy, 0, 49, { align: "left", color: "#fff", stroke: "#000" });
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'globalStatistics');