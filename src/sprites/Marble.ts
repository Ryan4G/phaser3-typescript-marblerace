import { raceConfig } from "../configs/GameConfig";
import { MarbleColors } from "../enums/Colors";

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
        
        bodyColor = raceConfig.marbleColors[color];

        this._circleBody.fillColor = bodyColor;
        this._color = color;
    }

    makeEntranceAnims(){
        this._circleBody.setScale(5);
        this._circleBody.setAlpha(0);
        let tmpV = new Phaser.Math.Vector2(this.physicsBody.velocity.x, this.physicsBody.velocity.y);
        let tmpG = new Phaser.Math.Vector2(this.physicsBody.gravity.x, this.physicsBody.gravity.y);
        
        this.scene.add.tween(
            {
                targets: this._circleBody,
                scale: 1,
                alpha: 1,
                ease: 'Sine.easeInOut',
                duration: 1000,
                onStart: () =>{
                    this.physicsBody.stop();
                    this.physicsBody.setGravity(0 ,0);
                    this.physicsBody.setImmovable(true);
                },
                onComplete: ()=>{
                    this.physicsBody.setImmovable(false);
                    this.physicsBody.setVelocity(tmpV.x ,tmpV.y);
                    this.physicsBody.setGravity(tmpG.x ,tmpG.y);
                }
            }
        )
    }
}