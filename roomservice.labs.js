const logistic = require("helper.logistic");

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

function decompose(compound) {
    return DECOMPOSITIONS[compound];
}

class Reactor {
    constructor(memory, labs) {
        this.memory = memory;
        this.labs = labs;
    }

    isValid() {
        return this.output && this.inputs.length === 2;
    }

    reactionPossible() {
        if(!this.isValid()) return false;
        if(!this.compound) return false;

        if(this.inputs[0].mineralType === null || !this.inputSatisfied(0)) return false;
        if(this.inputs[1].mineralType === null || !this.inputSatisfied(1)) return false;

        return true;
    }

    inputSatisfied(index) {
        return this.inputs[index].mineralType === null || this.inputs[index].mineralType === this.baseMinerals[index];
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

    setupReaction(compound, targetAmount) {
        this.memory.compound = compound;
        this.memory.targetAmount = targetAmount;
    }

    get compound() {
        return this.memory.compound;
    }

    get baseMinerals() {
        return decompose(this.compound);
    }

    get targetAmount() {
        return this.memory.targetAmount;
    }

    react() {
        if(!this.isValid()) return false;
        if(!this.reactionPossible()) return false;

        this.output.runReaction(...this.inputs);
        return true;
    }

    renderVisuals() {
        if(!this.isValid()) return;
        if(!this.compound) return;

        this.renderMineral(this.output, this.compound, true);
        this.renderMineral(this.inputs[0], this.baseMinerals[0]);
        this.renderMineral(this.inputs[1], this.baseMinerals[1]);
    }

    findInputs() {
        if(!this.output) return [];

        return _.take(_.filter(this.labs.all, (lab) => lab !== this.output && lab.pos.getRangeTo(this.output) <= 2), 2);
    }

    renderMineral(lab, resource, emptyIsGood) {
        let color = "#f00";
        if(resource === lab.mineralType || (lab.mineralType === null && emptyIsGood)) color = "#0f0";
        lab.room.visual.text(resource, lab.pos.x, lab.pos.y + 0.2, {
            color: color,
            stroke: "#000",
            align: "center",
            font: 0.5
        });
    }
}

module.exports = class Labs {
    constructor(room) {
        if(!room.memory.labs) {
            room.memory.labs = {
                reactors: []
            };
        }
        this.room = room;
        this.memory = room.memory.labs;
        this.all = room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_LAB });
        this.decompose = decompose;
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
