import Phaser from 'phaser';
import { raceConfig } from '~configs/GameConfig';
import { MarbleColors } from '~enums/Colors';
import { EVENT_FORT_DESTORY, EVENT_FORT_FIRE, EVENT_FORT_FIREOFF, sceneEvents } from '~events/GameEvents';
import { Marble } from '~sprites/Marble';

export default class TriggerScene extends Phaser.Scene {

    private _fireState: Array<boolean>;

    constructor() {
        super('TriggerScene');

        this._fireState = [];
    }

    init(){
    }

    create()
    {
        this.cameras.main.setBounds(
            - raceConfig.BlockW * raceConfig.RaceMapCols, - raceConfig.BlockW * raceConfig.RaceMapCols * 0.5,
            this.scale.width, this.scale.height);

        sceneEvents.on(
            EVENT_FORT_FIREOFF,
            (color: MarbleColors) => {
                console.log(`${MarbleColors[color]} fireoff`);
                this._fireState[color] = false;
            }
        );

        sceneEvents.on(
            EVENT_FORT_DESTORY,
            (color: MarbleColors) => {

                console.log(`${MarbleColors[color]} destory`);
            }
        );

        const graphic = this.add.graphics(
            {
                lineStyle:{
                    width: 1,
                    color: 0x333333
                },
                fillStyle:{
                    color: 0x000000
                }
            }
        );
        
        const blueRect = new Phaser.Geom.Rectangle(
            -raceConfig.BlockW * raceConfig.RaceMapCols * 0.5, 0,
            raceConfig.BlockW * raceConfig.RaceMapCols * 0.5, 
            raceConfig.BlockH * raceConfig.RaceMapRows * 0.5
        );

        const redRect = new Phaser.Geom.Rectangle(
            raceConfig.BlockW * raceConfig.RaceMapCols, 0,
            raceConfig.BlockW * raceConfig.RaceMapCols * 0.5, 
            raceConfig.BlockH * raceConfig.RaceMapRows * 0.5
        );
        
        const limeRect = new Phaser.Geom.Rectangle(
            -raceConfig.BlockW * raceConfig.RaceMapCols * 0.5, raceConfig.BlockH * raceConfig.RaceMapRows * 0.5,
            raceConfig.BlockW * raceConfig.RaceMapCols * 0.5, 
            raceConfig.BlockH * raceConfig.RaceMapRows * 0.5
        );
        
        const yellowRect = new Phaser.Geom.Rectangle(
            raceConfig.BlockW * raceConfig.RaceMapCols, raceConfig.BlockH * raceConfig.RaceMapRows * 0.5,
            raceConfig.BlockW * raceConfig.RaceMapRows * 0.5, 
            raceConfig.BlockH * raceConfig.RaceMapCols * 0.5
        );
        
        graphic.fillRectShape(blueRect);
        graphic.fillRectShape(redRect);
        graphic.fillRectShape(limeRect);
        graphic.fillRectShape(yellowRect);

        const greyMarbles = this.add.group(
            {
                classType: Marble,
                createCallback: item => {
                    let marble = item as Marble;
                    marble.makeColor(MarbleColors.Grey);
                    marble.physicsBody.setImmovable(true);
                }
            }
        );
        
        // greyMarbles.get(
        //     raceConfig.BlockW * raceConfig.RaceMapCols + raceConfig.BlockW * 2,
        //     raceConfig.BlockW * 3
        // );
        
        // greyMarbles.get(
        //     raceConfig.BlockW * raceConfig.RaceMapCols + raceConfig.BlockW * 7,
        //     raceConfig.BlockW * 5
        // );

        // greyMarbles.get(
        //     raceConfig.BlockW * raceConfig.RaceMapCols + raceConfig.BlockW * 4,
        //     raceConfig.BlockW * 7
        // );

        const colorMarbles = this.add.group(
            {
                classType: Marble,
                createCallback: item => {
                    let marble = item as Marble;
                    marble.physicsBody.setBounce(1, 1);
                    marble.physicsBody.setCollideWorldBounds(true);
                    marble.physicsBody.setGravity(0, 10);
                    marble.physicsBody.setVelocity(
                        Phaser.Math.Between(-100, 100),
                        Phaser.Math.Between(50, 100)
                    );
                }
            }
        );

        let marble0 = colorMarbles.get(
            blueRect.x + blueRect.width * 0.5,
            blueRect.y
        ) as Marble;

        marble0.makeColor(MarbleColors.Blue);
        marble0.physicsBody.setBoundsRectangle(blueRect);

        
        let marble1 = colorMarbles.get(
            redRect.x + redRect.width * 0.5,
            blueRect.y
        ) as Marble;

        marble1.makeColor(MarbleColors.Red);
        marble1.physicsBody.setBoundsRectangle(redRect);

        
        let marble2 = colorMarbles.get(
            limeRect.x + limeRect.width * 0.5,
            blueRect.y
        ) as Marble;

        marble2.makeColor(MarbleColors.Lime);
        marble2.physicsBody.setBoundsRectangle(limeRect);

        
        let marble3 = colorMarbles.get(
            yellowRect.x + yellowRect.width * 0.5,
            blueRect.y
        ) as Marble;

        marble3.makeColor(MarbleColors.Yellow);
        marble3.physicsBody.setBoundsRectangle(yellowRect);

        const redShotRect = this.add.rectangle(
            redRect.x + redRect.width * 0.5,
            redRect.y + redRect.height - 10,
            redRect.width * 0.5, 10,
            0xff0000
        ).setOrigin(0);
        
        this.physics.add.existing(redShotRect, true);
        
        this.physics.add.collider(colorMarbles, redShotRect, (obj1, obj2) => {
            let marble = obj1 as Marble;
            
            if (!this._fireState[marble.color!]){
                this._fireState[marble.color!] = true;
                sceneEvents.emit(EVENT_FORT_FIRE, marble.color, 1);

                marble.setPosition(
                    redRect.x + redRect.width * 0.5,
                    blueRect.y
                );
            }
        }, undefined, this);

        this.physics.add.collider(greyMarbles, colorMarbles);
    }

    update() {
        
    }

}
