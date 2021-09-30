const sceneEvents = new Phaser.Events.EventEmitter();

const EVENT_FORT_FIRE = Symbol('EVENT_FORT_FIRE');
const EVENT_FORT_FIREOFF = Symbol('EVENT_FORT_FIREOFF');
const EVENT_FORT_DESTORY = Symbol('EVENT_FORT_DESTORY');

export {
    sceneEvents,
    EVENT_FORT_FIRE,
    EVENT_FORT_FIREOFF,
    EVENT_FORT_DESTORY
}