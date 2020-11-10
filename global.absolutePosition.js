module.exports = class AbsolutePosition {
    static deserialize(o) {
        let pos = new RoomPosition(o.x, o.y, o.r);
        return new AbsolutePosition(pos, o.s);
    }

    constructor(pos, shard) {
        this.pos = pos;
        this.shard = shard || Game.shard.name;
    }

    get x() {
        return this.pos.x;
    }

    get y() {
        return this.pos.y;
    }

    get roomName() {
        return this.pos.roomName;
    }

    get room() {
        return Game.rooms[this.roomName];
    }

    toJSON() {
        return {
            x: this.x,
            y: this.y,
            r: this.roomName,
            s: this.shard
        };
    }

    isEqual(otherPos) {
        return otherPos.shard === this.shard && otherPos.roomName === this.roomName && otherPos.x === this.x && otherPos.y === this.y;
    }

    toString() {
        return `${this.shard}#${this.roomName}(${this.x}, ${this.y})`;
    }
}
