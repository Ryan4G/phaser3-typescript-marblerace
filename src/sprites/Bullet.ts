import { raceConfig } from "../configs/GameConfig";
import { MarbleColors } from "../enums/Colors";

export class Bullet extends Phaser.GameObjects.Container{

    private _circleBody: Phaser.GameObjects.Arc;
    private _color?: MarbleColors;
    private _lifeSpan?: number;
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

        // live time last 10 seconds
        this._lifeSpan = 10000;
    }

    get physicsBody(){
        return this.body as Phaser.Physics.Arcade.Body;
    }

    get color(){
        return this._color;
    }
    
    update(time: number, delta: number){
        this._lifeSpan! -= delta;

        if (this._lifeSpan! <= 0){
            this.destroy();
        }
    };

    makeColor(color: MarbleColors){
        let bodyColor = 0xffffff;

        if (color !== MarbleColors.Grey){
            bodyColor = raceConfig.bulletColors[color];
        }
        
        this._circleBody.fillColor = bodyColor;
        this._color = color;
    }
}