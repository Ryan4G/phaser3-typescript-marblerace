import Phaser from 'phaser';
import { raceConfig } from '../configs/GameConfig';
import { MarbleColors } from '../enums/Colors';
import { EVENT_FORT_DESTORY, EVENT_FORT_FIRE, EVENT_FORT_FIREOFF, sceneEvents } from '../events/GameEvents';
import { Marble } from '../sprites/Marble';

export default class TriggerScene extends Phaser.Scene {

    private _fireState: Array<boolean>;
    private _fortState: Array<boolean>;
    private _marbleReleaseNums: Array<number>;
    private _marbleReleaseText: Array<Phaser.GameObjects.Text>;
    private _marbleReleaseTimers: Array<Phaser.Time.TimerEvent>;
    private _marbleGreyLayer: Array<Array<Marble>>;
    private _triggerRectArray: Array<Phaser.Geom.Rectangle>;
    private _ratioChangeTimes: number;

    constructor() {
        super('TriggerScene');

        this._fireState = [];
        this._fortState = [];
        this._marbleReleaseNums = [];
        this._marbleReleaseText = [];
        this._marbleReleaseTimers = [];
        this._marbleGreyLayer = [];
        this._triggerRectArray = [];
        this._ratioChangeTimes = 0;
    }

    init(){
    }

    create()
    {        
        const camera = this.cameras.main;
        camera.centerOn(
            raceConfig.BlockW * raceConfig.RaceMapCols * 0.5, 
            (raceConfig.BlockW * raceConfig.RaceMapCols + raceConfig.BlankH) * 0.5
        );

        // adjust the cameras to show game scene
        // this.cameras.main.setBounds(
        //     - raceConfig.BlockW * raceConfig.RaceMapCols * 0.5 - raceConfig.MarbleRadius * 2, 
        //     - raceConfig.MarbleRadius * 2 - raceConfig.BlankH,
        //     this.scale.width, this.scale.height);

        const graphic = this.add.graphics(
            {
                lineStyle:{
                    width: raceConfig.MarbleRadius,
                    color: 0x333333,
                },
                fillStyle:{
                    color: 0x000000
                }
            }
        );

        this._triggerRectArray[MarbleColors.Blue] = new Phaser.Geom.Rectangle(
            -raceConfig.BlockW * raceConfig.RaceMapCols * 0.5 - raceConfig.MarbleRadius, - raceConfig.MarbleRadius,
            raceConfig.BlockW * raceConfig.RaceMapCols * 0.5, 
            raceConfig.BlockH * raceConfig.RaceMapRows * 0.5
        );

        this._triggerRectArray[MarbleColors.Red] = new Phaser.Geom.Rectangle(
            raceConfig.BlockW * raceConfig.RaceMapCols + raceConfig.MarbleRadius, - raceConfig.MarbleRadius,
            raceConfig.BlockW * raceConfig.RaceMapCols * 0.5, 
            raceConfig.BlockH * raceConfig.RaceMapRows * 0.5
        );
        
        this._triggerRectArray[MarbleColors.Lime] = new Phaser.Geom.Rectangle(
            -raceConfig.BlockW * raceConfig.RaceMapCols * 0.5 - raceConfig.MarbleRadius, raceConfig.BlockH * raceConfig.RaceMapRows * 0.5 + raceConfig.MarbleRadius,
            raceConfig.BlockW * raceConfig.RaceMapCols * 0.5, 
            raceConfig.BlockH * raceConfig.RaceMapRows * 0.5
        );
        
        this._triggerRectArray[MarbleColors.Yellow] = new Phaser.Geom.Rectangle(
            raceConfig.BlockW * raceConfig.RaceMapCols + raceConfig.MarbleRadius, raceConfig.BlockH * raceConfig.RaceMapRows * 0.5 + raceConfig.MarbleRadius,
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
                    marble.physicsBody.setBounce(0.9, 0.8);
                    marble.physicsBody.setCollideWorldBounds(true);
                    marble.physicsBody.setGravity(0, 100);
                    marble.physicsBody.setVelocityX(Phaser.Math.Between(-10, 10) * 20);
                }
            }
        );

        let releaseRectArray: Array<Phaser.GameObjects.Rectangle> = [];
        let multiplyRectArray: Array<Phaser.GameObjects.Rectangle> = [];
        let splitRectArray: Array<Phaser.GameObjects.Rectangle> = [];
        
        for(let i = 0; i < this._triggerRectArray.length; i++){
            this._marbleReleaseNums[i] = 1;

            let triggerRect = this._triggerRectArray[i];
            graphic.fillRectShape(triggerRect);

            let greyArr: Array<Marble> = [];

            for(let grow = 0; grow < 4; grow++){
                for(let gcol = 0; gcol < 4; gcol++){
                    if (grow % 2 == 0){
                        greyArr.push(
                            greyMarbles.get(
                                triggerRect.x + triggerRect.width * 0.333 * gcol, 
                                triggerRect.y + triggerRect.height * 0.25 * grow
                            )
                        );
                    }
                    else{
                        if (gcol < 3)
                        {
                            greyArr.push(
                                greyMarbles.get(
                                    triggerRect.x + triggerRect.width * (0.333 * gcol + 0.1667), 
                                    triggerRect.y + triggerRect.height * 0.25 * grow
                                )
                            );
                        }
                    }
                }
            }

            this._marbleGreyLayer[i] = greyArr;
            
            let marble = colorMarbles.get(
                triggerRect.x + triggerRect.width * 0.5,
                triggerRect.y + raceConfig.MarbleRadius * 3
            ) as Marble;
    
            marble.makeColor(i);
            marble.physicsBody.setBoundsRectangle(triggerRect);

            multiplyRectArray[i] = this.add.rectangle(
                i % 2 === 0 ? triggerRect.x : triggerRect.x + triggerRect.width * 0.7,
                triggerRect.y + triggerRect.height - 10,
                triggerRect.width * 0.3, 10,
                raceConfig.multiplyRectColors
            ).setOrigin(0).setDepth(1);
            
            splitRectArray[i] = this.add.rectangle(
                i % 2 === 0 ? triggerRect.x + triggerRect.width * 0.3 : triggerRect.x + triggerRect.width * 0.65,
                triggerRect.y + triggerRect.height - 20,
                triggerRect.width * 0.05, 20,
                raceConfig.disableRectColors
            ).setOrigin(0).setDepth(1);
            
            releaseRectArray[i] = this.add.rectangle(
                i % 2 === 0 ? triggerRect.x + triggerRect.width * 0.35 : triggerRect.x,
                triggerRect.y + triggerRect.height - 10,
                triggerRect.width * 0.65, 10,
                raceConfig.releaseRectColors
            ).setOrigin(0).setDepth(1);
            
            this.physics.add.existing(multiplyRectArray[i], true);

            this.physics.add.existing(splitRectArray[i], true);

            this.physics.add.existing(releaseRectArray[i], true);

            this._marbleReleaseText[i] = this.add.text(
                this._triggerRectArray[i].x + this._triggerRectArray[i].width * 0.5,
                this._triggerRectArray[i].y + this._triggerRectArray[i].height * 0.5,
                '1',
                {
                    fontFamily: 'Arial Calibri',
                    fontSize: '8em',
                    color: '#ffffff',
                    fontStyle: 'bolder',
                }
            ).setAlpha(0.6).setOrigin(0.5);

            // cover the grey marbles wrap border
            graphic.strokeRect(
                triggerRect.x - raceConfig.MarbleRadius * 0.5, 
                triggerRect.y - raceConfig.MarbleRadius * 0.5,
                triggerRect.width + raceConfig.MarbleRadius, 
                triggerRect.height + raceConfig.MarbleRadius
            );

            this._fireState[i] = false;
            this._fortState[i] = true;
        }

        this.physics.add.collider(colorMarbles, splitRectArray);

        this.physics.add.collider(colorMarbles, releaseRectArray, (obj1, obj2) => {
            let marble = obj1 as Marble;
            let releaseRect = obj2 as Phaser.GameObjects.Rectangle;
            let color = marble.color!;
            
            if (!this._fortState[color]){
                return;
            }

            let triggerRect = this._triggerRectArray[color];

            marble.setPosition(triggerRect.x + triggerRect.width * 0.5, triggerRect.y + raceConfig.MarbleRadius * 3);
                
            if (!this._fireState[color]){
                this._fireState[color] = true;

                sceneEvents.emit(EVENT_FORT_FIRE, marble.color, this._marbleReleaseNums[color]);

                marble.physicsBody.setVelocity(
                    marble.physicsBody.velocity.x * Phaser.Math.Between(-2, -9),
                    marble.physicsBody.velocity.y + Phaser.Math.Between(-30, 30)
                );
                
                releaseRectArray[color].fillColor = raceConfig.disableRectColors;
                multiplyRectArray[color].fillColor = raceConfig.disableRectColors;

                let count = this._marbleReleaseNums[color];

                if (this._marbleReleaseTimers[color]){
                    this._marbleReleaseTimers[color].destroy();
                }
                this._marbleReleaseTimers[color] = this.time.addEvent({
                    delay: raceConfig.fireDelay,
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

            if (!this._fortState[color]){
                return;
            }

            let triggerRect = this._triggerRectArray[color];

            marble.setPosition(triggerRect.x + triggerRect.width * 0.5, triggerRect.y + raceConfig.MarbleRadius * 3);

            if (!this._fireState[color]){

                this._marbleReleaseNums[color] *= 2;

                this._marbleReleaseNums[color] = Math.min(512, this._marbleReleaseNums[color]);

                marble.physicsBody.setVelocity(
                    marble.physicsBody.velocity.x * Phaser.Math.Between(-2, -9),
                    marble.physicsBody.velocity.y + Phaser.Math.Between(-30, 30)
                );

                this._marbleReleaseText[color].setText(`${this._marbleReleaseNums[color]}`);
            }
        }, undefined, this);

        this.physics.add.collider(greyMarbles, colorMarbles);

        this.physics.add.collider(colorMarbles, colorMarbles);

        sceneEvents.on(
            EVENT_FORT_FIREOFF,
            (color: MarbleColors) => {
                //console.log(`${MarbleColors[color]} fireoff`);
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
                // console.log(`${MarbleColors[color]} destory`);
                // console.log(this._fortState);
                if (this._fortState[color]){
                    this._marbleReleaseNums[color] = 1;
                    this._fireState[color] = true;
                    this._fortState[color] = false;
                    releaseRectArray[color].fillColor = raceConfig.disableRectColors;
                    multiplyRectArray[color].fillColor = raceConfig.disableRectColors;
                    
                    this._marbleReleaseTimers[color].destroy();
                    this._marbleReleaseText[color].setText(`${this._marbleReleaseNums[color]}`);
                }
            }
        );

        // per minutes add a new marble (if trigger is still avaliable)
        this.time.addEvent(
            {
                delay: 30000,
                callback: () => {
                    this._ratioChangeTimes++;

                    for(let i = 0; i < this._triggerRectArray.length; i++){
                        let triggerRect = this._triggerRectArray[i];
                        
                        if (!this._fortState[i]){
                            continue;
                        }

                        let marble = colorMarbles.get(
                            triggerRect.x + triggerRect.width * 0.5,
                            triggerRect.y + raceConfig.MarbleRadius * 3
                        ) as Marble;
                
                        marble.makeColor(i);
                        marble.makeEntranceAnims();
                        marble.physicsBody.setBoundsRectangle(triggerRect);
                        
                        // change the ratio width
                        if (this._ratioChangeTimes < 5){
                            let ratioChangeOffset = this._ratioChangeTimes * 0.075;

                            releaseRectArray[i].width = triggerRect.width * (0.65 - ratioChangeOffset);
                            multiplyRectArray[i].width = triggerRect.width * (0.3 + ratioChangeOffset);

                            multiplyRectArray[i].x = i % 2 === 0 ? triggerRect.x : triggerRect.x + triggerRect.width * (0.7 - ratioChangeOffset);
                            splitRectArray[i].x = i % 2 === 0 ? triggerRect.x + triggerRect.width * (0.3 + ratioChangeOffset) : triggerRect.x + triggerRect.width * (0.65 - ratioChangeOffset);
                            releaseRectArray[i].x = i % 2 === 0 ? triggerRect.x + triggerRect.width * (0.35 + ratioChangeOffset) : triggerRect.x;
                        
                            (releaseRectArray[i].body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
                            (splitRectArray[i].body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
                            (multiplyRectArray[i].body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
                        }
                    }
                },
                repeat: 4
            }
        );

        // fill up the bottom wrap border
        let noticeRect = new Phaser.Geom.Rectangle(
            this._triggerRectArray[MarbleColors.Lime].x - raceConfig.MarbleRadius * 0.5,
            this._triggerRectArray[MarbleColors.Lime].y + this._triggerRectArray[MarbleColors.Lime].width + raceConfig.MarbleRadius,
            this._triggerRectArray[MarbleColors.Lime].width * 4 + raceConfig.MarbleRadius * 3,
            raceConfig.BlankH * 1.5,
        );

        graphic.strokeRectShape(noticeRect);

        let noticeBody = '';
        noticeBody += 'GameNotice:\n1. A new marble trigger will be added when 30 seconds elapsed, and maximum is 6.\n';
        noticeBody += '2. The bullet\'s life span was setting to 10 seconds, it will destory when the life times up.\n';
        noticeBody += '3. The MAX bullet\'s quantity is 512 when the fort fired each time.';

        const noticeText = this.add.text(
            noticeRect.x + raceConfig.MarbleRadius,
            noticeRect.y + raceConfig.MarbleRadius * 1.25,
            noticeBody,
            {
                fontFamily: 'Arial Calibri',
                color: '#ffffff'
            }
        )
    }

    update(time: number, delta: number) {
        //console.log(time, delta);
        
        Phaser.Actions.IncXY(this._marbleGreyLayer[MarbleColors.Blue], 0, -0.8);
        Phaser.Actions.IncXY(this._marbleGreyLayer[MarbleColors.Red], 0, -0.8);
        Phaser.Actions.IncXY(this._marbleGreyLayer[MarbleColors.Lime], 0, -0.8);
        Phaser.Actions.IncXY(this._marbleGreyLayer[MarbleColors.Yellow], 0, -0.8);
        Phaser.Actions.WrapInRectangle(this._marbleGreyLayer[MarbleColors.Blue], this._triggerRectArray[MarbleColors.Blue], raceConfig.MarbleRadius * 0.5);
        Phaser.Actions.WrapInRectangle(this._marbleGreyLayer[MarbleColors.Red], this._triggerRectArray[MarbleColors.Red], raceConfig.MarbleRadius * 0.5);
        Phaser.Actions.WrapInRectangle(this._marbleGreyLayer[MarbleColors.Lime], this._triggerRectArray[MarbleColors.Lime], raceConfig.MarbleRadius * 0.5);
        Phaser.Actions.WrapInRectangle(this._marbleGreyLayer[MarbleColors.Yellow], this._triggerRectArray[MarbleColors.Yellow], raceConfig.MarbleRadius * 0.5);
    }

}
