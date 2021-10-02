import Phaser from 'phaser';
import { raceConfig } from '../configs/GameConfig';
import { MarbleColors } from '../enums/Colors';
import { Directions } from '../enums/Directions';
import { EVENT_FORT_DESTORY, EVENT_FORT_FIRE, EVENT_FORT_FIREOFF, sceneEvents } from '../events/GameEvents';
import { Block } from '../sprites/Block';
import { Bullet } from '../sprites/Bullet';
import { Fort } from '../sprites/Fort';

export default class GameScene extends Phaser.Scene {

    private bullets?: Phaser.GameObjects.Group;
    private _forts: Array<Fort>;
    private _titleText?: Phaser.GameObjects.Text;
    private _gameTime: Date;

    constructor() {
        super('GameScene');
        this._forts = [];
        this._gameTime = new Date();
    }

    init(){
    }

    create()
    {
        // adjust the cameras to show game scene
        this.cameras.main.setBounds(
            - raceConfig.BlockW * raceConfig.RaceMapCols * 0.5 - raceConfig.MarbleRadius * 2, 
            - raceConfig.MarbleRadius * 2 - raceConfig.BlankH,
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

        this._forts[MarbleColors.Blue] = forts.get(raceConfig.BlockW * 2, raceConfig.BlockH * 2) as Fort;
        this._forts[MarbleColors.Blue].makeColor(MarbleColors.Blue);
        this._forts[MarbleColors.Blue].makeDirection(Directions.LeftDown);

        this._forts[MarbleColors.Red] = forts.get((raceConfig.RaceMapCols - 2) * raceConfig.BlockW, raceConfig.BlockH * 2) as Fort;
        this._forts[MarbleColors.Red].makeColor(MarbleColors.Red);
        this._forts[MarbleColors.Red].makeDirection(Directions.RightDown);
        
        this._forts[MarbleColors.Lime] = forts.get(raceConfig.BlockW * 2, (raceConfig.RaceMapRows - 2) * raceConfig.BlockH) as Fort;
        this._forts[MarbleColors.Lime].makeColor(MarbleColors.Lime);
        this._forts[MarbleColors.Lime].makeDirection(Directions.LeftUp);
        
        this._forts[MarbleColors.Yellow] = forts.get((raceConfig.RaceMapCols - 2) * raceConfig.BlockW, (raceConfig.RaceMapRows - 2) * raceConfig.BlockH) as Fort;
        this._forts[MarbleColors.Yellow].makeColor(MarbleColors.Yellow);
        this._forts[MarbleColors.Yellow].makeDirection(Directions.RightUp);

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

        this.physics.add.overlap(this.bullets, this._forts, (obj1, obj2) => {

            let bullet = obj1 as Bullet;
            let fort = obj2 as Fort;

            if (bullet.color !== fort.color && fort.active){
                fort.setActive(false);
                
                // emit events to trigger scene stop rolling
                sceneEvents.emit(
                    EVENT_FORT_DESTORY,
                    fort.color
                );

                bullet.destroy();

                fort.defeated();

                if (this.checkGameOver()){
                    let winnerColor = this.getGameWinner();

                    if (winnerColor !== -1){
                        this._titleText?.setText(
                            `        --- Marble Race ---\n--- THE WINNER IS ${MarbleColors[winnerColor].toUpperCase()}! ---`,
                        );

                        this._titleText?.setColor(`#${raceConfig.fortColors[winnerColor].toString(16).toLowerCase()}`);

                        let elapsedMinutes = Math.floor((new Date().getTime() - this._gameTime.getTime()) / 1000 / 24 / 60);
                        console.log(`Game Over! ${MarbleColors[winnerColor]} won the game! It's cost ${elapsedMinutes} mintues.`)
                        this.scene.pause();
                    }
                }
            }
        }, undefined, this);

        sceneEvents.on(
            EVENT_FORT_FIRE,
            (color: MarbleColors, count: number) => {
                //console.log(`${MarbleColors[color]} fire ${count}`);

                let remainCount = count - 1;

                if (!this._forts[color] || !this._forts[color].active){
                    return;
                }
                
                this.time.addEvent({
                    delay: raceConfig.fireDelay,
                    repeat: count - 1,
                    callback: (args: any[]) => {

                        if (this._forts[color] && this._forts[color].active){
                            this._forts[color].fire(this.bullets!);
                            
                            if (remainCount <= 0){
                                sceneEvents.emit(
                                    EVENT_FORT_FIREOFF,
                                    color
                                );
                            }
                            remainCount--;
                        }
                    }
                });
            }
        );

        const graphic = this.add.graphics(
            {
                lineStyle:{
                    width: raceConfig.MarbleRadius * 2,
                    color: 0x333333,
                },
                fillStyle:{
                    color: 0x000000
                }
            }
        );

        graphic.strokeRect(
            -raceConfig.MarbleRadius, -raceConfig.MarbleRadius, 
            raceConfig.BlockW * raceConfig.RaceMapCols + raceConfig.MarbleRadius * 2,
            raceConfig.BlockH * raceConfig.RaceMapRows + raceConfig.MarbleRadius * 2
        );

        const titleGraphic = this.add.graphics(
            {
                lineStyle: {
                    color: 0x333333,
                    width: raceConfig.MarbleRadius
                }
            }
        );

        const titleRect = new Phaser.Geom.Rectangle(
            - raceConfig.BlockW * raceConfig.RaceMapCols * 0.5 - raceConfig.MarbleRadius * 1.5, 
            - raceConfig.MarbleRadius * 1.5 - raceConfig.BlankH,
            this.scale.width - raceConfig.MarbleRadius,
            raceConfig.BlankH - raceConfig.MarbleRadius
        );

        titleGraphic.strokeRectShape(titleRect);

        this._titleText = this.add.text(
            titleRect.x + titleRect.width * 0.5,
            titleRect.y + titleRect.height * 0.5,
            '    --- Marble Race ---\n--- Which one will win? ---',
            {
                fontFamily: 'Arial Calibri',
                fontSize: '2em',
                color: '#ffffff',
                fontStyle: 'bolder',
            }
        ).setOrigin(0.5);
    }

    update() {
        
    }

    checkGameOver():boolean{
        let liveCount: number = 0;
        let i = 0;

        while(i < this._forts.length){
            liveCount += (this._forts[i].active && this._forts[i].visible) ? 1 : 0;
            i++;
        }
        
        return liveCount <= 1;
    }

    getGameWinner(): number{
        let i = 0;

        while(i < this._forts.length){
            if(this._forts[i].active && this._forts[i].visible){
                return i;
            }
            i++;
        }

        return -1;
    }
}
