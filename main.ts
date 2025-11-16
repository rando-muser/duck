// I can't figure out how to rename the actual image files so I'm using variables 0_0
let duckImages = [assets.image`myImage`, assets.image`myImage10`, assets.image`myImage11`]
let blank = assets.image`myImage3`
let waterTile = assets.tile`myTile`
let glassWaterTile = assets.tile`myTile1`
let glassTile = assets.tile`myTile9`
let backgroundTile = assets.tile`myTile6`
let backgroundImage = assets.image`myImage4`
let backgroundImageEnd = assets.image`myImage9`
let ramuneImages = [assets.image`myImage5`, assets.image`myImage6`, assets.image`myImage7`, assets.image`myImage8`]
let blankTilemap = assets.tilemap`level0`

function makeDuck() {
    let tempNumber = duckSprites.length
    let tempNumber2 = Math.randomRange(0, 2)
    duckSprites.push(sprites.create(duckImages[tempNumber2], SpriteKind.Food))
    duckSprites[tempNumber].setPosition(80, 0 + rowsAbove * 16)
    duckSprites[tempNumber].ay = 30;
    duckSprites[tempNumber].vx = Math.randomRange(-50, 50)
    duckSprites[tempNumber].setBounceOnWall(true)
    sprites.setDataNumber(duckSprites[tempNumber], "index", tempNumber2)
}

//TITLE SCREEN
scene.setBackgroundImage(backgroundImage);
let textSprite = textsprite.create("ROBBED", 0, 15)
let textSprite2 = textsprite.create("OF SLEEP", 0, 15)
let textSprite3 = textsprite.create("Click around!", 0, 1)
textSprite.setMaxFontHeight(12)
textSprite.setPosition(40, 30)
textSprite2.setPosition(40, 45)
textSprite3.setPosition(80, 113)
textSprite.setOutline(2, 1)
textSprite2.setOutline(1, 1)
textSprite3.setOutline(1, 15)
textSprite3.z = 2
animation.runMovementAnimation(textSprite, animation.animationPresets(animation.bobbing), 2000, true)
animation.runMovementAnimation(textSprite2, animation.animationPresets(animation.bobbing), 2001, true)
let ramune = sprites.create(ramuneImages[0], SpriteKind.Player)
ramune.setPosition(114, 70)
pauseUntil(() => browserEvents.MouseAny.isPressed())
animation.stopAnimation(animation.AnimationTypes.All, textSprite)
animation.stopAnimation(animation.AnimationTypes.All, textSprite2)
for (let i = 0; i < 100; i++) {
    textSprite.y--
    textSprite2.y--
    pause(10)
}
sprites.destroy(textSprite)
sprites.destroy(textSprite2)
pause(500)
ramune.setImage(ramuneImages[1]);
pause(1000)
ramune.setImage(ramuneImages[2])
pause(1000)

//LEVEL START
scene.setTileMapLevel(assets.tilemap`level`);
// set sprite data here
let inWater = true;

// Constants
const drainSpeed = 300;
const gravity = 200;
const buoyancy = -30;
const rowsAbove = 8;

// Advance amount of cracking from least to most
let brokenGlassSprites = [assets.image`myImage0`, assets.image`myImage1`, assets.image`myImage2`];

// Initialized with a sprite in it so the array is set to 'sprite' type, then destroyed
let crackingSprites = [sprites.create(brokenGlassSprites[0], SpriteKind.Enemy)];
crackingSprites[0].destroy();
crackingSprites.pop();

let duckSprites = [sprites.create(duckImages[0], SpriteKind.Food)]
duckSprites[0].destroy();
duckSprites.pop();

//initial conditions
makeDuck()
let waterLevel = rowsAbove
ramune.setFlag(SpriteFlag.GhostThroughWalls, true)
ramune.z = -2
for (let i = 1; i < rowsAbove * 16; i++) {
    ramune.y++
    textSprite3.y++
    scene.centerCameraAt(80, 60 + i)
    pause(10)
}
textSprite3.setText("Try clicking a duck!")
textSprite3.x = 80

scene.onHitWall(SpriteKind.Food, function (sprite: Sprite, location: tiles.Location) {
    damage(location)
})

//Change from water physics to air physics
scene.onOverlapTile(SpriteKind.Food, backgroundTile, function (sprite: Sprite, location: tiles.Location) {
    if (inWater) {
        inWater = false;
        sprite.ay = gravity;
        sprite.vy += 15
        if (sprite.vy < -100) {
            sprite.vy = -100
        }
    }
})
//Matching function to change from air physics to water physics
scene.onOverlapTile(SpriteKind.Food, waterTile, function (sprite: Sprite, location: tiles.Location) {
    if (inWater == false) {
        inWater = true;
        sprite.ay = buoyancy;
        sprite.vy -= 15
        if (sprite.vy > 100) {
            sprite.vy = 100
        }
    }
})

browserEvents.MouseLeft.onEvent(browserEvents.MouseButtonEvent.Pressed, function (x: number, y: number) {
    //If left click close to duck, activate power
    let tempBoolean = false;
    let tempNumber = 0;
    for (let i = 0; i < duckSprites.length; i++) {
        if (Math.abs(duckSprites[i].x - x) < 16 && Math.abs((duckSprites[i].y - rowsAbove * 16) - y) < 16) {
            tempBoolean = true;
            tempNumber = i;
            break;
        }
    }
    if (tempBoolean) {
        duckPower(sprites.readDataNumber(duckSprites[tempNumber], "index"), duckSprites[tempNumber])
    } else if (tiles.getTileAt(Math.floor(x / 16), Math.floor((y + rowsAbove*16) / 16)) == glassWaterTile) {
        damage(tiles.getTileLocation(Math.floor(x / 16), Math.floor((y + rowsAbove*16) / 16)))
    }
})

/* FUNCTIONS */

//Function to recalculate water level when a duck breaks glass
//NOTE: Make sure to put a call to this inside of a timer.background loop, or else the entire game will pause until this finishes!!
function drainWaterLevel(level: number) {
    if (level > waterLevel) {
        for (let j = waterLevel; j <= level; j++) {
            for (let i = 0; i < 10; i++) {
                if (tiles.getTileAt(i, j) == waterTile) {
                    tiles.setTileAt(tiles.getTileLocation(i, j), backgroundTile);
                } else if (tiles.getTileAt(i, j) == glassWaterTile) {
                    tiles.setTileAt(tiles.getTileLocation(i, j), glassTile)
                }
            }
            pause(drainSpeed)
        }
        waterLevel = level;
        if (waterLevel > rowsAbove + 4) {
            gameOver(0)
        }
    }
}

//For resetting the scene
//Sprite kinds used: Enemy, Food
function clear() {
    scene.setTileMapLevel(blankTilemap)
    sprites.destroyAllSpritesOfKind(SpriteKind.Food);
    sprites.destroyAllSpritesOfKind(SpriteKind.Enemy)
}

//For game ending
function gameOver(ending: number) {
    if (ending == 0) { // Game over due to all water lost
        clear()
        scene.cameraShake(3, 200)
        scene.setBackgroundImage(backgroundImageEnd)
        ramune.setImage(ramuneImages[3])
        pause(2500)
        if (Math.round(game.runtime() / 100) / 100 < 60) {
            game.setGameOverMessage(false, "Slept for " + Math.round(game.runtime() / 100) / 100 + " minutes!")
            game.gameOver(false)
        }
        else {
            game.setGameOverMessage(true, "Slept for " + Math.round(game.runtime() / 100) / 100 / 60 + " hours!")
            game.gameOver(true)
        }
    }
}

//For activating a duck's power
function duckPower(index: number, sprite: Sprite) {
    if (index == 0) {
        if (crackingSprites.length > 0) {
            //Find closest sprite
            let tempNumber = closestSprite(sprite, crackingSprites);
            if (spriteutils.distanceBetween(sprite, crackingSprites[tempNumber]) < 16 * 3) {
                let tempNumber2 = brokenGlassSprites.indexOf(crackingSprites[tempNumber].image)
                if (tempNumber2 > 0) {
                    crackingSprites[tempNumber].setImage(brokenGlassSprites[tempNumber2 - 1])
                }
                else {
                    crackingSprites[tempNumber].destroy()
                    crackingSprites.removeAt(tempNumber)
                }
                sprite.startEffect(effects.hearts, 250)
                music.play(music.melodyPlayable(music.magicWand), music.PlaybackMode.UntilDone)
            }
        }
    } else if (index == 1) {
        let tempBoolean = true;
        for (let i = 0; i < 100; i++) {
            let tempNumber = Math.randomRange(1, 8);
            let tempNumber2 = rowsAbove + Math.randomRange(1, 6)
            if (tiles.tileAtLocationEquals(tiles.getTileLocation(tempNumber, tempNumber2), backgroundTile)) {
                tiles.setWallAt(tiles.getTileLocation(tempNumber, tempNumber2), true)
                tiles.setTileAt(tiles.getTileLocation(tempNumber, tempNumber2), glassTile)
                tempBoolean = false;
            } else if (tiles.tileAtLocationEquals(tiles.getTileLocation(tempNumber, tempNumber2), waterTile)) {
                tiles.setTileAt(tiles.getTileLocation(tempNumber, tempNumber2), glassWaterTile)
                tempBoolean = false;
                tiles.setWallAt(tiles.getTileLocation(tempNumber, tempNumber2), true)
            }
            if (tempBoolean == false) {
                break;
            }
        }
        sprite.startEffect(effects.hearts, 250)
        music.play(music.melodyPlayable(music.magicWand), music.PlaybackMode.UntilDone)
    } else if (index == 2) {
            let i = waterLevel;
            //positions of the two glass blocks
            let tempNumber = -1
            let tempNumber2 = -1
            //loop through each column of the row
            for (let j = 0; j < 10; j++) {
                if (tiles.tileAtLocationEquals(tiles.getTileLocation(j, i), glassTile)) {
                    if (tempNumber == -1) {
                        tempNumber = j;
                    }
                    else if (tempNumber2 == -1) {
                        tempNumber2 = j;
                        break;
                        //Found!
                    }
                }
            }
            if (tempNumber == -1) {
                tiles.setTileAt(tiles.getTileLocation(1, i), glassTile)
                tiles.setWallAt(tiles.getTileLocation(1, i), true)
                tempNumber = 1;
            }
            if (tempNumber2 == -1) {
                tiles.setTileAt(tiles.getTileLocation(8, i), glassTile)
                tiles.setWallAt(tiles.getTileLocation(8, i), true)
                tempNumber2 = 8;
            }
            if (true) {
                for (let k = tempNumber; k <= tempNumber2; k++) {
                    if (tiles.getTileAt(k, i) == backgroundTile) {
                        tiles.setTileAt(tiles.getTileLocation(k, i), waterTile);
                    } else if (tiles.getTileAt(k, i) == glassTile) {
                        tiles.setTileAt(tiles.getTileLocation(k, i), glassWaterTile)
                    }
                }
                waterLevel = i - 1;
                sprite.startEffect(effects.hearts, 250)
                music.play(music.melodyPlayable(music.magicWand), music.PlaybackMode.UntilDone)
                //Found!
            }
    } 
    if (Math.percentChance(15)) {
        makeDuck()
    }
}

function closestSprite(sprite: Sprite, list: Sprite[]) {
    let tempNumber = 0;
        for (let i = 1; i < list.length; i++) {
            if (spriteutils.distanceBetween(sprite, list[i]) < spriteutils.distanceBetween(sprite, list[tempNumber])) {
                tempNumber = i;
            }
        }
    return (tempNumber);
}

function spin(sprite: Sprite, speed: Number, time: Number) {
    if (time == -1) {
        //placeholder
    }
}

function damage(location: tiles.Location) {
    //Boolean to check whether the duck overlapped an existing crack
    let tempBoolean = false
    for (let i = 0; i < crackingSprites.length; i++) {
        //If we hit a crack
        if (crackingSprites[i].x == location.x && crackingSprites[i].y == location.y) {
            let sprite = crackingSprites[i]
            let tempNumber = brokenGlassSprites.indexOf(sprite.image);
            if (tempNumber < brokenGlassSprites.length - 1) {
                //If its not all the way broken, update the image
                sprite.setImage(brokenGlassSprites[tempNumber + 1]);
            } else {
                //Else, break it entirely
                sprite.setImage(blank);
                sprite.destroy();
                crackingSprites.removeAt(i);
                tiles.setTileAt(location, backgroundTile);
                tiles.setWallAt(location, false)
                //And make the water drain
                timer.background(function() {
                    drainWaterLevel(location.row);
                })
            }
            tempBoolean = true;
        }
    } 
    if (tempBoolean == false && (tiles.tileAtLocationEquals(location, glassWaterTile) || tiles.tileAtLocationEquals(location, glassTile))) {
        //If no crack exists, make a new one
        crackingSprites.push(sprites.create(brokenGlassSprites[0], SpriteKind.Enemy))
        tiles.placeOnTile(crackingSprites[crackingSprites.length - 1], location);
    }
}

game.onUpdate(function () {
    
})