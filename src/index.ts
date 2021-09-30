import Phaser from 'phaser';
import TriggerScene from '~scenes/TriggerScene';
import GameScene from './scenes/GameScene'
import PreloadScene from './scenes/PreloadScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	scale: {
		parent: '#phaser-main',
		mode: Phaser.Scale.FIT,
		width: 720,
		height: 420
	},
	width: 720,
	height: 420,
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
