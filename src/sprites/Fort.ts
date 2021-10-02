import { raceConfig } from "../configs/GameConfig";
import { MarbleColors } from "../enums/Colors";
import { Directions } from "../enums/Directions";
import { Bullet } from "./Bullet";

export class Fort extends Phaser.GameObjects.Container{

    private _circleBody: Phaser.GameObjects.Arc;
    private _fortRect: Phaser.GameObjects.Rectangle;
    private _color?: MarbleColors;
    private _tween: Phaser.Tweens.Tween;
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
        this._fortRect = scene.add.rectangle(raceConfig.BulletH * 1.5, 0, raceConfig.BulletH * 3, raceConfig.BulletH, 0xffffff);
       
        scene.physics.add.existing(this);
        
        this.physicsBody.setCircle(raceConfig.MarbleRadius, -raceConfig.MarbleRadius, -raceConfig.MarbleRadius);

        this.add(this._circleBody);
        this.add(this._fortRect);

        this._tween = scene.tweens.addCounter({
            from: -10,
            to: 100,
            duration: 2000,
            repeat: -1,
            yoyo: true,
            onUpdate: (tween) => 
            {
                this.setAngle(tween.getValue());
            },
            paused: true
        });
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
            bodyColor = raceConfig.fortColors[color];
        }

        this._circleBody.fillColor = bodyColor;
        this._fortRect.fillColor = bodyColor;
        this._color = color;
    }

    makeDirection(dir: Directions){
        this._tween.remove();
        switch(dir){
            case Directions.LeftDown:{
                this.setRotation(Math.PI * 0.5);

                this._tween = this.scene.tweens.addCounter({
                    from: 100,
                    to: -10,
                    duration: 3000,
                    repeat: -1,
                    yoyo: true,
                    onUpdate: (tween) => 
                    {
                        this.setAngle(tween.getValue());
                    }
                });
                break;
            }
            case Directions.RightDown:{
                this.setRotation(Math.PI);

                this._tween = this.scene.tweens.addCounter({
                    from: 190,
                    to: 80,
                    duration: 3000,
                    repeat: -1,
                    yoyo: true,
                    onUpdate: (tween) => 
                    {
                        this.setAngle(tween.getValue());
                    }
                });
                break;
            }
            case Directions.LeftUp:{
                this._tween = this.scene.tweens.addCounter({
                    from: 10,
                    to: -100,
                    duration: 3000,
                    repeat: -1,
                    yoyo: true,
                    onUpdate: (tween) => 
                    {
                        this.setAngle(tween.getValue());
                    }
                });
                break;
            }
            case Directions.RightUp:{
                this.setRotation(-Math.PI);

                this._tween = this.scene.tweens.addCounter({
                    from: -80,
                    to: -190,
                    duration: 3000,
                    repeat: -1,
                    yoyo: true,
                    onUpdate: (tween) => 
                    {
                        this.setAngle(tween.getValue());
                    }
                });
                break;
            }
        }
    }

    fire(bullets: Phaser.GameObjects.Group){
        let velX = Math.cos(this.rotation) * raceConfig.BulletH * 3;
        let velY = Math.sin(this.rotation) * raceConfig.BulletH * 3;

        let bullet = bullets.get(this.x + velX, this.y + velY) as Bullet;
        bullet.makeColor(this._color!);

        bullet.physicsBody.setVelocity(velX * 2, velY * 2);

        //bullet.physicsBody.setBounce(1, 1);
        //bullet.physicsBody.setCollideWorldBounds(true);
    }

    defeated(){
        this.setVisible(false);
        this.setActive(false);
        this._tween.stop();
    }
}