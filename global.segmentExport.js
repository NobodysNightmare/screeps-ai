const segmentExports = [
    require("segmentexport.trading")
];

module.exports = class SegmentExport {
    run() {
        let data = { updated: Game.time };
        for(let exporter of segmentExports) {
            let exported = new exporter().run();
            data = { ...data, ...exported };
        }

        RawMemory.segments[98] = JSON.stringify(data);
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'SegmentExport');
