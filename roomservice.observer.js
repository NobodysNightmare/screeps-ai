module.exports = class Observer {
    constructor(room) {
        if(!room.memory.observer) {
            room.memory.observer = {
                queue: []
            };
        }
        
        this.memory = room.memory.observer;
        this.observer = room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_OBSERVER })[0];
    }

    isAvailable() {
        return !!this.observer;
    }

    observeNow(roomName) {
        this.memory.queue = _.reject(this.memory.queue, (r) => r === roomName)
        this.memory.queue.unshift(roomName);
    }
    
    observeLater(roomName) {
        if(_.any(this.memory.queue, (r) => r === roomName)) return;
        
        this.memory.queue.push(roomName);
    }

    performObservation() {
        if(!this.isAvailable()) return;
        
        let target = this.memory.queue.shift();
        if(!target) return;
        
        let result = this.observer.observeRoom(target);
        if(result !== OK) {
            this.memory.queue.push(target);
            console.log("Observer " + this.observer.room.name + ": Got unexpected result " + result);
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'Observer');
