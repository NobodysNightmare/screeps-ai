const segmentImports = [
    require("segmentimport.trading")
];

module.exports = class SegmentScanner {
    static addPartner(name, segment) {
        Memory.segmentScanner.partners.push({ name: name, segment: segment });
    }

    static removePartner(name) {
        Memory.segmentScanner.partners = _.filter(Memory.segmentScanner.partners, (p) => p.name !== name);
    }

    static listPartners() {
        for(let partner of Memory.segmentScanner.partners) {
            console.log(`Scanning ${partner.name} at segment ${partner.segment}`);
        }
    }

    constructor() {
        if(!Memory.segmentScanner) {
            Memory.segmentScanner = {
                lastScan: 0,
                partners: []
            }
        }

        this.memory = Memory.segmentScanner;
        if(!this.memory.partners) this.memory.partners = [];
    }

    run() {
        if(this.memory.partners.length === 0) return;

        let segment = RawMemory.foreignSegment;
        if(segment) {
            let data = JSON.parse(segment.data);

            for(let importer of segmentImports) {
                new importer(data, segment.username).run();
            }
        } else {
            let partner = this.memory.partners[this.memory.lastScan];
            console.log(`SegmentScanner: Unexpected empty segment for partner ${partner.name}`);
        }

        this.scanNext();
    }

    scanNext() {
        let nextScan = (this.memory.lastScan + 1) % this.memory.partners.length;
        let partner = this.memory.partners[nextScan];
        RawMemory.setActiveForeignSegment(partner.name, partner.segment);
        this.memory.lastScan = nextScan;
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'SegmentScanner');
