import { raceConfig } from "../configs/GameConfig";
import { MarbleColors } from "../enums/Colors";

export class Block extends Phaser.GameObjects.Container{

    private _rectBody: Phaser.GameObjects.Rectangle;
    private _color?: MarbleColors;
    /**
     * 
     * @param scene The Scene to which this Game Object belongs. A Game Object can only belong to one Scene at a time.
     * @param x The horizontal position of this Game Object in the world. Default 0.
     * @param y The vertical position of this Game Object in the world. Default 0.
     * @param children An optional array of Game Objects to add to this Container.
     */
     constructor(scene: Phaser.Scene, x?: number, y?: number, children?: Phaser.GameObjects.GameObject[]){
        super(scene, x, y, children);
        this._rectBody = scene.add.rectangle(raceConfig.BlockW * 0.5, raceConfig.BlockH * 0.5, raceConfig.BlockW, raceConfig.BlockH, 0xffffff);
        this._rectBody.setStrokeStyle(0.25, 0x000000);

        scene.physics.add.existing(this);
        
        this.physicsBody.setCircle(raceConfig.BlockW * 0.5);
        
        this.add(this._rectBody);
    }

    get physicsBody(){
        return this.body as Phaser.Physics.Arcade.Body;
    }

    get color(){
        return this._color;
    }

    makeColor(color: MarbleColors){
        let bodyColor = 0xffffff;

        if (color !== MarbleColors.Grey){
            bodyColor = raceConfig.blockColors[color];
        }
        
        this._rectBody.fillColor = bodyColor;
        this._color = color;
    }
}