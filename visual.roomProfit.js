module.exports = {
    run: function() {
        this.refresh();
        this.draw();
    },
    refresh: function() {
        // not resetting anymore
    },
    draw: function() {
        for(let roomName in Memory.stats.profits) {
            let visual = new RoomVisual(roomName);
            
            let profit = Memory.stats.profits[roomName];
            let ticks = Game.time % 30000;
            let profitPerTick = Math.round(100 * profit / _.max([ticks, 1])) / 100;
            
            visual.text("Profit: " + profit.toLocaleString("en") + " (" + profitPerTick + " E/tick; " + ticks + " ticks)", 0, 47, { align: "left", color: "#fff", stroke: "#000" });
        }
    },
    addRevenue: function(roomName, revenue) {
        this.ensureRoomStats(roomName);
        Memory.stats.profits[roomName] += revenue;
    },
    addCost: function(roomName, cost) {
        this.ensureRoomStats(roomName);
        Memory.stats.profits[roomName] -= cost;
    },
    ensureRoomStats: function(roomName) {
        if(!Memory.stats.profits) Memory.stats.profits = {};
        if(!Memory.stats.profits[roomName]) Memory.stats.profits[roomName] = 0;
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'roomProfit');