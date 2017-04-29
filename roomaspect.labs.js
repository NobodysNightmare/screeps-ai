const trading = require("helper.trading");

const DECOMPOSITIONS = {
    G: ["ZK", "UL"],
    
    ZK: ["Z", "K"],
    UL: ["U", "L"],
    OH: ["H", "O"],
    LH: ["L", "H"],
    GH: ["G", "H"],
    
    LH2O: ["LH", "OH"],
    GH2O: ["GH", "OH"],
    
    XLH2O: ["X", "LH2O"],
    XGH2O: ["X", "GH2O"]
}

const targetCompounds = ["G", "XLH2O", "XGH2O"];
const reactionCycleAmount = 2500;

module.exports = class LabsAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;
        this.labs = roomai.labs.all;
        
        if(!this.room.memory.labs) {
            this.room.memory.labs = {
                currentReactionCompound: null,
                currentReactionAmount: 0,
                reactors: []
            };
        }
        this.memory = this.room.memory.labs;
    }

    run() {
        if(!this.room.storage || this.labs.length === 0) return;
        
        this.setCurrentReaction();
        this.buildScientists();
    }
    
    setCurrentReaction() {
        if(!this.isCurrentReactionFinished()) return;
        
        let nextReaction = this.findNextReaction();
        this.memory.currentReactionCompound = nextReaction;
        this.memory.currentReactionAmount = this.amount(nextReaction) + reactionCycleAmount;
    }
    
    isCurrentReactionFinished() {
        let currentReaction = this.memory.currentReactionCompound;
        if(!currentReaction) return true;
        if(_.any(DECOMPOSITIONS[currentReaction], (r) => this.amount(r) == 0)) return true;
        
        return this.amount(currentReaction) >= this.memory.currentReactionAmount;
    }
    
    findNextReaction() {
        let targets = _.sortBy(_.filter(targetCompounds, (r) => this.amount(r) < trading.baselineAmount), (r) => this.amount(r));
        for(let target of targets) {
            let missing = [target];
            while(missing.length > 0) {
                let nextReaction = missing[0];
                missing = _.filter(DECOMPOSITIONS[nextReaction], (r) => this.amount(r) === 0);
                if(missing.length === 0) return nextReaction;
             
                // filter uncookable resources (e.g. H). Can't get those using reactions.
                missing = _.filter(missing, (r) => DECOMPOSITIONS[r]);
            }
        }
        
        return null;
    }
    
    amount(resource) {
        if(!resource) return 0;
        let storageAmount = this.room.storage.store[resource] || 0;
        let labAmount = _.sum(_.filter(this.labs, (l) => l.mineralType == resource), (l) => l.mineralAmount);
        
        // TODO: amount on scientists?
        return storageAmount + labAmount;
    }
    
    buildScientists() {
        // TODO: build creeps that will take care of lab duties
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'LabsAspect');
