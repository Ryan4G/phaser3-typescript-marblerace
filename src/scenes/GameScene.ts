import Phaser from 'phaser';
import { raceConfig } from '~configs/GameConfig';
import { MarbleColors } from '~enums/Colors';
import { Directions } from '~enums/Directions';
import { EVENT_FORT_DESTORY, EVENT_FORT_FIRE, EVENT_FORT_FIREOFF, sceneEvents } from '~events/GameEvents';
import { Block } from '~sprites/Block';
import { Bullet } from '~sprites/Bullet';
import { Fort } from '~sprites/Fort';

export default class GameScene extends Phaser.Scene {

    private bullets?: Phaser.GameObjects.Group;

    constructor() {
        super('GameScene');
    }

    init(){
    }

    create()
    {
        this.cameras.main.setBounds(
            - raceConfig.BlockW * raceConfig.RaceMapCols, - raceConfig.BlockW * raceConfig.RaceMapCols * 0.5,
            this.scale.width, this.scale.height);

        this.scene.launch('TriggerScene');

        // create race blocks
        const blocks = this.add.group({
            classType: Block
        });

        for(let row = 0; row < raceConfig.RaceMapRows; row++){
            for (let col = 0; col < raceConfig.RaceMapCols; col++){
                let block = blocks.get(col * raceConfig.BlockW, row * raceConfig.BlockH) as Block;
                let condition1 = row < raceConfig.RaceMapRows * 0.5;
                let condition2 = col < raceConfig.RaceMapCols * 0.5;
                if (condition1){
                    if (condition2){
                        block.makeColor(MarbleColors.Blue);
                    }
                    else{
                        block.makeColor(MarbleColors.Red);
                    }
                }
                else{
                    if (condition2){
                        block.makeColor(MarbleColors.Lime);
                    }
                    else{
                        block.makeColor(MarbleColors.Yellow);
                    }
                }
            }
        }

        // create forts
        const forts = this.add.group({
            classType: Fort,
            createCallback: item => {
                
            }
        });

        let blueFort = forts.get(raceConfig.BlockW * 2, raceConfig.BlockH * 2) as Fort;
        blueFort.makeColor(MarbleColors.Blue);
        blueFort.makeDirection(Directions.LeftDown);

        let redFort = forts.get((raceConfig.RaceMapCols - 2) * raceConfig.BlockW, raceConfig.BlockH * 2) as Fort;
        redFort.makeColor(MarbleColors.Red);
        redFort.makeDirection(Directions.RightDown);
        
        let limeFort = forts.get(raceConfig.BlockW * 2, (raceConfig.RaceMapRows - 2) * raceConfig.BlockH) as Fort;
        limeFort.makeColor(MarbleColors.Lime);
        limeFort.makeDirection(Directions.LeftUp);
        
        let yellowFort = forts.get((raceConfig.RaceMapCols - 2) * raceConfig.BlockW, (raceConfig.RaceMapRows - 2) * raceConfig.BlockH) as Fort;
        yellowFort.makeColor(MarbleColors.Yellow);
        yellowFort.makeDirection(Directions.RightUp);

        // create bullets
        this.bullets = this.add.group({
            classType: Bullet,
            createCallback: item => {
                
            },
            runChildUpdate: true
        });

        this.physics.add.overlap(this.bullets, blocks, (obj1, obj2) => {

            let bullet = obj1 as Bullet;
            let block = obj2 as Block;

            if (bullet.color === block.color){
                return;
            }
            else{
                block.makeColor(bullet.color!);
                bullet.destroy();
            }
        }, undefined, this);

        this.physics.add.overlap(this.bullets, forts, (obj1, obj2) => {

            let bullet = obj1 as Bullet;
            let fort = obj2 as Fort;

            if (bullet.color !== fort.color){
                bullet.destroy();
                fort.destroy();

                // emit events to trigger scene stop rolling
                sceneEvents.emit(
                    EVENT_FORT_DESTORY,
                    fort.color
                );
            }
        }, undefined, this);

        sceneEvents.on(
            EVENT_FORT_FIRE,
            (color: MarbleColors, count: number) => {
                console.log(`${MarbleColors[color]} fire ${count}`);
                
                let fort:Fort = redFort;
                this.tweens.addCounter({
                    from: count,
                    to: 0,
                    duration: count * 100,
                    onUpdate: () => {
                        fort.fire(this.bullets!);
                    },
                    onComplete:  () => {
                        sceneEvents.emit(
                            EVENT_FORT_FIREOFF,
                            color
                        );
                    }
                })
            }
        );
    }

    update() {
        
    }

}
