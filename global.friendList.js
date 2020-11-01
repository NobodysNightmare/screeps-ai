module.exports = class FriendList {
    static get friends() {
        return Memory.friendList || [];
    }

    static addFriend(username) {
        if(!Memory.friendList) Memory.friendList = [];

        Memory.friendList.push(username);
        Memory.friendList = _.uniq(_.sortBy(Memory.friendList, (u) => u));
    }

    static removeFriend(username) {
        if(!Memory.friendList) return;

        Memory.friendList = _.filter(Memory.friendList, (u) => u !== username);
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'FriendList');
