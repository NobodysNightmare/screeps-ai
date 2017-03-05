const extensions = require("construction.extensions");

module.exports = function(roomai) {
    var room = roomai.room;
    if(!room.memory.extensionClusters) {
        room.memory.extensionClusters = [];
    }
    
    return {
        run: function() {
            this.addClusterByFlag();
            this.removeClusterByFlag();
            
            for(let cluster of room.memory.extensionClusters) {
                extensions.outlineExtensionCluster(room, cluster.x, cluster.y);
                if(Game.time % 90 == 0) {
                    extensions.buildExtensionCluster(room, cluster.x, cluster.y);
                }
            }
        },
        addClusterByFlag: function() {
            if(Game.flags.extensionCluster && Game.flags.extensionCluster.pos.roomName == room.name) {
                room.memory.extensionClusters.push({
                    x: Game.flags.extensionCluster.pos.x,
                    y: Game.flags.extensionCluster.pos.y
                });
                Game.flags.extensionCluster.remove();
            }
        },
        removeClusterByFlag: function() {
            if(Game.flags.clear && Game.flags.clear.pos.roomName == room.name) {
                let index = _.findIndex(room.memory.extensionClusters, (p) => p.x == Game.flags.clear.pos.x && p.y == Game.flags.clear.pos.y);
                if(index >= 0) room.memory.extensionClusters.splice(index, 1);
                Game.flags.clear.remove();
            }
        }
    }
};
