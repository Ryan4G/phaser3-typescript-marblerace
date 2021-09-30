import { raceConfig } from "~configs/GameConfig";
import { MarbleColors } from "~enums/Colors";

export class Marble extends Phaser.GameObjects.Container{

    private _circleBody: Phaser.GameObjects.Arc;
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

        this._circleBody = scene.add.circle(0, 0, raceConfig.MarbleRadius, 0xffffff);

        scene.physics.add.existing(this);
        
        this.physicsBody.setCircle(raceConfig.MarbleRadius, -raceConfig.MarbleRadius, -raceConfig.MarbleRadius);

        this.add(this._circleBody);
    }

    get physicsBody(){
        return this.body as Phaser.Physics.Arcade.Body;
    }

    get color(){
        return this._color;
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
            case MarbleColors.Grey:{
                bodyColor = 0x343334;
                break;
            }
        }

        this._circleBody.fillColor = bodyColor;
        this._color = color;
    }
}