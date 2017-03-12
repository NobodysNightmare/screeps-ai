# NobodysNightmare's Screeps AI

This is my personal AI for the computer game [Screeps](https://screeps.com).

## Manual control

### Build Extension Cluster

Place a flag called **extensionCluster** inside a claimed room.
This will mark a permanent area for extensions.

A **clear** flag on the same spot will remove that area again.

### Draining a hostile room

To spawn some creeps that drain a hostile room by attracting the towers
fire, place a **drain** flag in the target room and a **spawnDrain** flag
in the room that shall spawn the creeps for that operation.

The color of the **spawnDrain** flag determines how many hopper/healer
pairs are spawned (red = 1; white = 10).

### Attacking a hostile room

**Work in progress**

To spawn some creeps that attack a hostile room, place an **attack** flag in the target room and a **spawnAttack** flag
in the room that shall spawn the creeps for that operation.

The color of the **spawnAttack** flag determines how many attackers are spawned (red = 1; white = 10).

### Claiming a room

To claim a room, place a **claim** flag at the position where the first spawn shall be built.
The room that should spawn the creeps needed for colonization needs a **spawnClaim** flag.

## TODOs

* Use links to collect energy from remote mines at room border
* Better defense mechanics
    * towers should attack target picked by defense aspect
    * defense aspect should actually "think" about which target to pick
    * while defending a reloader should keep towers supplied with energy
    * Better rampart/wall mechanics
        * allow higher repair levels
        * probably different levels for ramparts depending on purpose (e.g. more on Spawner?)
* Automatically start claiming as soon as room is ready (e.g. if it is currently claimed by another player)
* Improve base building
    * build storage in a good location
    * build towers
