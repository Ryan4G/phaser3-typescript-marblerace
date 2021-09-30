import { raceConfig } from "~configs/GameConfig";
import { MarbleColors } from "~enums/Colors";
import { IPoint } from "~interfaces/IPoint";

export class Bullet extends Phaser.GameObjects.Container{

    private _circleBody: Phaser.GameObjects.Arc;
    private _color?: MarbleColors;
    // private _graphic: Phaser.GameObjects.Graphics;
    // private _points: Array<IPoint>;
    /**
     * 
     * @param scene The Scene to which this Game Object belongs. A Game Object can only belong to one Scene at a time.
     * @param x The horizontal position of this Game Object in the world. Default 0.
     * @param y The vertical position of this Game Object in the world. Default 0.
     * @param children An optional array of Game Objects to add to this Container.
     */
     constructor(scene: Phaser.Scene, x?: number, y?: number, children?: Phaser.GameObjects.GameObject[]){
        super(scene, x, y, children);
        this._circleBody = scene.add.circle(0, 0, raceConfig.BulletW * 0.5, 0xffffff);

        scene.physics.add.existing(this);
        
        this.physicsBody.setCircle(raceConfig.BulletW * 0.5, - raceConfig.BulletW * 0.5, - raceConfig.BulletW * 0.5);
        this.physicsBody.setBounce(1, 1);
        this.physicsBody.setCollideWorldBounds(true);
        this.physicsBody.setBoundsRectangle(new Phaser.Geom.Rectangle(
            0, 0, 
            raceConfig.BlockW * raceConfig.RaceMapCols, raceConfig.BlockH * raceConfig.RaceMapRows
        ));

        this.add(this._circleBody);

        // this._graphic = scene.add.graphics();
        // this._points = [];
    }

    get physicsBody(){
        return this.body as Phaser.Physics.Arcade.Body;
    }

    get color(){
        return this._color;
    }
    
    update(time: number, delta: number){

        // this._points.push(
        //     {
        //         x: this.x, y: this.y, time: 10
        //     }
        // );

        // this._graphic.clear();

        // if (this._points.length > 4){
        //     let count = this._points.length - 4;

        //     for(let i = count; i > 0; i--){
        //         this._graphic.fillStyle(0x1C1AFF, i / count);
        //         this._graphic.fillCircle(this._points[i].x, this._points[i].y, raceConfig.BulletW * 0.5);
        //     }
        // }

        // for(let i = 0; i < this._points.length; i++){
        //     this._points[i].time -= 0.5;

        //     if (this._points[i].time < 0){
        //         this._points.splice(0, 1);
        //         i--;
        //     }
        // }
    }

    makeColor(color: MarbleColors){
        let bodyColor = 0xffffff;

        switch(color){
            case MarbleColors.Blue:{
                bodyColor = 0x1C1AFF;
                break;
            }
            case MarbleColors.Red:{
                bodyColor = 0xFF1A1B;
                break;
            }
            case MarbleColors.Lime:{
                bodyColor = 0x10FF15;
                break;
            }
            case MarbleColors.Yellow:{
                bodyColor = 0xFEFF1A;
                break;
            }
        }

        this._circleBody.fillColor = bodyColor;
        this._color = color;
    }
}