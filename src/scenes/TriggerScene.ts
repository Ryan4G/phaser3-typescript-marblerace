import Phaser from 'phaser';
import { raceConfig } from '~configs/GameConfig';
import { MarbleColors } from '~enums/Colors';
import { EVENT_FORT_DESTORY, EVENT_FORT_FIRE, EVENT_FORT_FIREOFF, sceneEvents } from '~events/GameEvents';
import { Marble } from '~sprites/Marble';

export default class TriggerScene extends Phaser.Scene {

    private _fireState: Array<boolean>;
    private _fortState: Array<boolean>;
    private _marbleReleaseNums: Array<number>;
    private _marbleReleaseText: Array<Phaser.GameObjects.Text>;
    private _marbleReleaseTimers: Array<Phaser.Time.TimerEvent>;

    constructor() {
        super('TriggerScene');

        this._fireState = [];
        this._fortState = [];
        this._marbleReleaseNums = [];
        this._marbleReleaseText = [];
        this._marbleReleaseTimers = [];
    }

    init(){
    }

    create()
    {
        this.cameras.main.setBounds(
            - raceConfig.BlockW * raceConfig.RaceMapCols, - raceConfig.BlockW * raceConfig.RaceMapCols * 0.25,
            this.scale.width, this.scale.height);

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
        
        const triggerRectArray: Array<Phaser.Geom.Rectangle> = [];

        triggerRectArray[MarbleColors.Blue] = new Phaser.Geom.Rectangle(
            -raceConfig.BlockW * raceConfig.RaceMapCols * 0.5, 0,
            raceConfig.BlockW * raceConfig.RaceMapCols * 0.5, 
            raceConfig.BlockH * raceConfig.RaceMapRows * 0.5
        );

        triggerRectArray[MarbleColors.Red] = new Phaser.Geom.Rectangle(
            raceConfig.BlockW * raceConfig.RaceMapCols, 0,
            raceConfig.BlockW * raceConfig.RaceMapCols * 0.5, 
            raceConfig.BlockH * raceConfig.RaceMapRows * 0.5
        );
        
        triggerRectArray[MarbleColors.Lime] = new Phaser.Geom.Rectangle(
            -raceConfig.BlockW * raceConfig.RaceMapCols * 0.5, raceConfig.BlockH * raceConfig.RaceMapRows * 0.5,
            raceConfig.BlockW * raceConfig.RaceMapCols * 0.5, 
            raceConfig.BlockH * raceConfig.RaceMapRows * 0.5
        );
        
        triggerRectArray[MarbleColors.Yellow] = new Phaser.Geom.Rectangle(
            raceConfig.BlockW * raceConfig.RaceMapCols, raceConfig.BlockH * raceConfig.RaceMapRows * 0.5,
            raceConfig.BlockW * raceConfig.RaceMapRows * 0.5, 
            raceConfig.BlockH * raceConfig.RaceMapCols * 0.5
        );
        
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
        
        const colorMarbles = this.add.group(
            {
                classType: Marble,
                createCallback: item => {
                    let marble = item as Marble;
                    marble.physicsBody.setBounce(0.9, 0.9);
                    marble.physicsBody.setCollideWorldBounds(true);
                    marble.physicsBody.setGravity(0, 10);
                    marble.physicsBody.setVelocity(
                        Phaser.Math.Between(-100, 100),
                        Phaser.Math.Between(50, 100)
                    );
                }
            }
        );

        let releaseRectArray: Array<Phaser.GameObjects.Rectangle> = [];
        let multiplyRectArray: Array<Phaser.GameObjects.Rectangle> = [];

        for(let i = 0; i < triggerRectArray.length; i++){
            this._marbleReleaseNums[i] = 1;

            let triggerRect = triggerRectArray[i];
            graphic.fillRectShape(triggerRect);

            let marble = colorMarbles.get(
                triggerRect.x + triggerRect.width * 0.5,
                triggerRect.y + 10
            ) as Marble;
    
            marble.makeColor(i);
            marble.physicsBody.setBoundsRectangle(triggerRect);

            releaseRectArray[i] = this.add.rectangle(
                i % 2 === 0 ? triggerRect.x + triggerRect.width * (1 - 0.7) : triggerRect.x,
                triggerRect.y + triggerRect.height - 10,
                triggerRect.width * 0.7, 10,
                0xFF0080
            ).setOrigin(0);
            
            this.physics.add.existing(releaseRectArray[i], true);

            multiplyRectArray[i] = this.add.rectangle(
                i % 2 === 0 ? triggerRect.x : triggerRect.x + triggerRect.width * (1 - 0.3) ,
                triggerRect.y + triggerRect.height - 10,
                triggerRect.width * 0.3, 10,
                0x80ff00
            ).setOrigin(0);
            
            this.physics.add.existing(multiplyRectArray[i], true);

            this._marbleReleaseText[i] = this.add.text(
                triggerRectArray[i].x + triggerRectArray[i].width * 0.5,
                triggerRectArray[i].y + triggerRectArray[i].height * 0.5,
                '1',
                {
                    fontFamily: 'Arial Calibri',
                    fontSize: '56px',
                    color: '#ffffff',
                    fontStyle: 'bolder',
                }
            ).setAlpha(0.6).setOrigin(0.5);

            this._fireState[i] = false;
            this._fortState[i] = true;
        }

        this.physics.add.collider(colorMarbles, releaseRectArray, (obj1, obj2) => {
            let marble = obj1 as Marble;
            let releaseRect = obj2 as Phaser.GameObjects.Rectangle;
            let color = marble.color!;
            
            if (!this._fireState[color] && this._fortState[color]){
                this._fireState[color] = true;

                sceneEvents.emit(EVENT_FORT_FIRE, marble.color, this._marbleReleaseNums[color]);

                let triggerRect = triggerRectArray[color];

                marble.setRandomPosition(triggerRect.x, triggerRect.y + 10, triggerRect.width, triggerRect.height * 0.4);
                
                marble.physicsBody.setVelocity(
                    marble.physicsBody.x - Phaser.Math.Between(-10, 10),
                    marble.physicsBody.y - Phaser.Math.Between(-10, 10)
                );
                
                releaseRectArray[color].fillColor = 0X1F1F1F;
                multiplyRectArray[color].fillColor = 0X1F1F1F;

                let count = this._marbleReleaseNums[color];

                if (this._marbleReleaseTimers[color]){
                    this._marbleReleaseTimers[color].destroy();
                }
                this._marbleReleaseTimers[color] = this.time.addEvent({
                    delay: 100,
                    repeat: count - 1,
                    callback: () => {
                        if (this._fireState[color]){
                            this._marbleReleaseText[color].setText(`${count--}`);
                        }
                    }
                });
            }
        }, undefined, this);

        this.physics.add.collider(colorMarbles, multiplyRectArray, (obj1, obj2) => {
            let marble = obj1 as Marble;
            let multiplyRect = obj2 as Phaser.GameObjects.Rectangle;
            let color = marble.color!;

            if (!this._fireState[color] && this._fortState[color]){

                this._marbleReleaseNums[color] *= 2;

                this._marbleReleaseNums[color] = Math.min(512, this._marbleReleaseNums[color]);

                let triggerRect = triggerRectArray[color];

                marble.setRandomPosition(triggerRect.x, triggerRect.y + 10, triggerRect.width, triggerRect.height * 0.4);
                marble.physicsBody.setVelocity(
                    marble.physicsBody.x - Phaser.Math.Between(-10, 10),
                    marble.physicsBody.y - Phaser.Math.Between(-10, 10)
                );

                this._marbleReleaseText[color].setText(`${this._marbleReleaseNums[color]}`);
            }
        }, undefined, this);

        this.physics.add.collider(greyMarbles, colorMarbles);

        
        sceneEvents.on(
            EVENT_FORT_FIREOFF,
            (color: MarbleColors) => {
                console.log(`${MarbleColors[color]} fireoff`);
                if (this._fortState[color]){
                    this._fireState[color] = false;
                    this._marbleReleaseNums[color] = 1;

                    releaseRectArray[color].fillColor = 0xFF0080;
                    multiplyRectArray[color].fillColor = 0x80ff00;

                    this._marbleReleaseTimers[color].destroy();
                    this._marbleReleaseText[color].setText(`${this._marbleReleaseNums[color]}`);
                }
            }
        );

        sceneEvents.on(
            EVENT_FORT_DESTORY,
            (color: MarbleColors) => {
                console.log(`${MarbleColors[color]} destory`);
                console.log(this._fortState);
                if (this._fortState[color]){
                    this._marbleReleaseNums[color] = 1;
                    this._fireState[color] = true;
                    this._fortState[color] = false;
                    releaseRectArray[color].fillColor = 0X1F1F1F;
                    multiplyRectArray[color].fillColor = 0X1F1F1F;
                    
                    this._marbleReleaseTimers[color].destroy();
                    this._marbleReleaseText[color].setText(`${this._marbleReleaseNums[color]}`);
                }
            }
        );

    }

    update() {
        
    }

}
