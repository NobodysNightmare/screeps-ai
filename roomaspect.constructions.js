const BuildProxy = require("construction.buildproxy");

module.exports = class ConstructionsAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;
    }

    run() {
        this.roomai.constructions.addBuildings();
        this.roomai.constructions.removeBuildings();

        let buildProxy = new BuildProxy(this.room);
        for(let building of this.roomai.constructions.buildings) {
            building.outline();
            if(this.roomai.intervals.buildStructure.isActive()) {
                building.build(buildProxy);
            }
        }

        if(this.roomai.intervals.buildStructure.isActive()) {
            buildProxy.commit();
        }

        this.roomai.constructions.drawDebugMarkers();
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'ConstructionsAspect');
