import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {

    constructor() {
        super('PreloadScene');
    }

	preload(){
	}

    create()
    {
		this.scene.start('GameScene');
    }

    update() {

    }
}
