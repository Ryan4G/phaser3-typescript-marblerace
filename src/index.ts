import Phaser from 'phaser';
import TriggerScene from '~scenes/TriggerScene';
import GameScene from './scenes/GameScene'
import PreloadScene from './scenes/PreloadScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	scale:{
		mode: Phaser.Scale.RESIZE,
        parent: 'phaser-main',
	},
	width: 640,
	height: 400,
    backgroundColor: '#7d7d7d',
	physics: {
		default: 'arcade',
		arcade: {
			debug: false
		}
	},
	scene: [PreloadScene, GameScene, TriggerScene]
}

export default new Phaser.Game(config)
