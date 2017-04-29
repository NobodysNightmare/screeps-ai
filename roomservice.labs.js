const logistic = require("helper.logistic");

class Reactor {
    constructor(memory, labs) {
        this.memory = memory;
        this.labs = labs;
    }
    
    isValid() {
        return this.output && this.inputs.length === 2;
    }
    
    get output() {
        if(this._output === undefined) this._output = Game.getObjectById(this.memory.output);
        
        return this._output;
    }
    
    get inputs() {
        if(!this._inputs) {
            this._inputs = _.compact(_.map(this.memory.inputs, (id) => Game.getObjectById(id)));
            if(this._inputs.length < 2) {
                this._inputs = this.findInputs();
                this.memory.inputs = _.map(this._inputs, (lab) => lab.id);
            }
        }
        
        return this._inputs;
    }
    
    findInputs() {
        if(!this.output) return [];
        
        return _.take(_.filter(this.labs.all, (lab) => lab !== this.output && lab.pos.getRangeTo(this.output) <= 2), 2);
    }
}

module.exports = class Labs {
    constructor(room) {
        if(!room.memory.labs) {
            room.memory.labs = {
                currentReactionCompound: null,
                currentReactionAmount: 0,
                reactors: []
            };
        }
        this.room = room;
        this.memory = room.memory.labs;
        this.all = room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_LAB });
    }
    
    get reactors() {
        if(!this._reactors) {
            this._reactors = _.map(this.memory.reactors, (mem) => new Reactor(mem, this));
        }
        
        return this._reactors;
    }
    
    addReactor(outputLab) {
        let memory = { output: outputLab.id, inputs: [] };
        this.memory.reactors.push(memory);
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(Reactor, 'Labs.Reactor');
profiler.registerClass(module.exports, 'Labs');
