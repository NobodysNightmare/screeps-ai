const operationsCache = {
    operations: function(key) {
        this.ensureList();
        return this.opsList;
    },

    add: function(operation) {
        this.ensureList();
        this.opsList.push(operation);
    },

    remove: function(operation) {
        this.ensureList();

        let index = this.opsList.indexOf(operation);
        if (index > -1) {
          this.opsList.splice(index, 1);
        }
    },

    ensureList: function() {
        if(!this.opsList || Game.time !== this.currentTick) {
            this.opsList = _.compact(_.map((Memory.operations || []), (mem) => Operation.loadOperation(mem)));
            this.currentTick = Game.time;
        }
    }
}

global.Operation = class Operation {
    constructor(memory) {
        this.memory = memory;

        this.name = memory.name;
        this.type = memory.type;
        this.supportRoom = Game.rooms[memory.supportRoom];

        if(!this.supportRoom || !this.supportRoom.ai()) {
            console.log(`Operation ${this.name} should be supported by ${memory.supportRoom}, which does not seem to belong to the empire.`);
        }
    }

    run() {
        // TODO: call this method for all operations in main.js

        // should be overridden in operations to run code once per tick for the operation
        // (that is independent from rooms supporting the operation)
        // e.g. picking a common target for creeps, figuring out whether the operation
        // is finished/canceled, etc
    }

    supportRoomCallback(room) {
        // should be overridden in operations to run code specific to the room supporting this operation,
        // e.g. spawning creeps, setting up boosts, using observers, etc.
    }

    drawVisuals() {
        // can be overridden to draw visuals to aid in understanding what this operation
        // is doing
    }

    static get operations() {
        return operationsCache.operations();
    }

    static forSupportRoom(room)  {
        return _.filter(Operation.operations, (op) => op.supportRoom === room);
    }

    static createOperation(type) {
        if(!Memory.operations) Memory.operations = [];

        let subclass = operationSubclasses[type];
        if(!subclass) throw `Tried to create unknown operation type ${type}`;

        let memory = { type: type, name: Operation.generateName(type) };
        let instance = new subclass(memory);
        Memory.operations.push(memory);
        return instance;
    }

    static removeOperation(operation) {
        Memory.operations = _.filter(Memory.operations, (o) => o.name !== operation.name);
        operationsCache.remove(operation);
    }

    // used internally to populate Operation.operations
    static loadOperation(memory) {
        let subclass = operationSubclasses[memory.type];
        if(!subclass) {
            console.log(`Tried to load unknown operation type ${type} from ${memory.name}.`);
            return null;
        }

        return new subclass(memory);
    }

    static generateName(type) {
        let name = null;
        do {
            name = `${type}-${Math.floor(Math.random() * 10000)}R`
        } while(_.any(Memory.operations, (op) => op.name === name));

        return name;
    }
}

const operationSubclasses = {
    // "type": require("operation.subclass") // TODO: real implementation
};
