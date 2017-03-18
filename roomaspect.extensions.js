const extensions = require("construction.extensions");

module.exports = class ExtensionsAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;

        if(!this.room.memory.extensionClusters) {
            this.room.memory.extensionClusters = [];
        }
    }

    run() {
        this.addClusterByFlag();
        this.removeClusterByFlag();

        for(let cluster of this.room.memory.extensionClusters) {
            extensions.outlineExtensionCluster(this.room, cluster.x, cluster.y);
            if(Game.time % 90 == 0) {
                extensions.buildExtensionCluster(this.room, cluster.x, cluster.y);
            }
        }
    }

    addClusterByFlag() {
        if(Game.flags.extensionCluster && Game.flags.extensionCluster.pos.roomName == this.room.name) {
            this.room.memory.extensionClusters.push({
                x: Game.flags.extensionCluster.pos.x,
                y: Game.flags.extensionCluster.pos.y
            });
            Game.flags.extensionCluster.remove();
        }
    }

    removeClusterByFlag() {
        if(Game.flags.clear && Game.flags.clear.pos.roomName == this.room.name) {
            let index = _.findIndex(this.room.memory.extensionClusters, (p) => p.x == Game.flags.clear.pos.x && p.y == Game.flags.clear.pos.y);
            if(index >= 0) this.room.memory.extensionClusters.splice(index, 1);
            Game.flags.clear.remove();
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'ExtensionsAspect');
