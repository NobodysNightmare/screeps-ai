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

        this.id = memory.id;
        this.type = memory.type;
    }

    get supportRoom() {
        return Game.rooms[this.memory.supportRoom];
    }

    set supportRoom(room) {
        this.memory.supportRoom = room ? room.name : null;
    }

    isValid() {
        return this.supportRoom && this.supportRoom.ai();
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

    toString() {
        return `[Operation ${this.type}#${this.id} from ${this.supportRoom}]`;
    }

    static get operations() {
        return operationsCache.operations();
    }

    static forSupportRoom(room)  {
        return _.filter(Operation.operations, (op) => op.supportRoom === room);
    }

    static createOperation(type, initMemory) {
        if(!Memory.operations) Memory.operations = [];

        let subclass = operationSubclasses[type];
        if(!subclass) {
            console.log(`Tried to create unknown operation type ${type}`);
            return;
        }

        if(!initMemory) initMemory = {};
        let memory = { type: type, id: Operation.generateId(), ...initMemory };
        let instance = new subclass(memory);
        Memory.operations.push(memory);
        return instance;
    }

    static removeOperation(operation) {
        Memory.operations = _.filter(Memory.operations, (o) => o.id !== operation.id);
        operationsCache.remove(operation);
    }

    // used internally to populate Operation.operations
    static loadOperation(memory) {
        let subclass = operationSubclasses[memory.type];
        if(!subclass) {
            console.log(`Tried to load unknown operation type ${type} from operation ${memory.id}.`);
            return null;
        }

        return new subclass(memory);
    }

    static generateId() {
        let id = 0;
        do {
            id = Math.floor(Math.random() * 100000);
        } while(_.any(Memory.operations, (op) => op.id === id));

        return id;
    }
}

const operationSubclasses = {
    attack: require("operation.attack"),
    claim: require("operation.claim"),
    downgrade: require("operation.downgrade"),
    drain: require("operation.drain"),
    scoop: require("operation.scoop")
};
