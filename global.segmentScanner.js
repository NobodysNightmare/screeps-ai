const partners = [
    { name: "Geir1983", segment: 99 },
    { name: "likeafox", segment: 99 },
    { name: "admon", segment: 99 }
];

const segmentImports = [
    require("segmentimport.trading")
];

module.exports = class SegmentScanner {
    constructor() {
        if(!Memory.segmentScanner) {
            Memory.segmentScanner = {
                lastScan: 0
            }
        }

        this.memory = Memory.segmentScanner;
    }

    run() {
        let segment = RawMemory.foreignSegment;
        if(segment) {
            let data = JSON.parse(segment.data);

            for(let importer of segmentImports) {
                new importer(data, segment.username).run();
            }
        } else {
            let partner = partners[this.memory.lastScan];
            console.log(`SegmentScanner: Unexpected empty segment for partner ${partner.name}`);
        }

        this.scanNext();
    }

    scanNext() {
        let nextScan = (this.memory.lastScan + 1) % partners.length;
        let partner = partners[nextScan];
        RawMemory.setActiveForeignSegment(partner.name, partner.segment);
        this.memory.lastScan = nextScan;
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'SegmentScanner');
