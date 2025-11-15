// I can't figure out how to rename the actual image files so I'm using variables 0_0
let duckImage = assets.image`myImage`;
let blank = assets.image`myImage3`
let waterTile = assets.tile`myTile`
let glassWaterTile = assets.tile`myTile1`
let glassTile = assets.tile`myTile9`
let backgroundTile = assets.tile`myTile6`
let backgroundImage = assets.image`myImage4`
let backgroundImageEnd = assets.image`myImage9`
let ramuneImages = [assets.image`myImage5`, assets.image`myImage6`, assets.image`myImage7`, assets.image`myImage8`]
let blankTilemap = assets.tilemap`level0`

////TITLE SCREEN
scene.setBackgroundImage(backgroundImage);

let ramune = sprites.create(ramuneImages[0], SpriteKind.Player)
ramune.setPosition(114, 70)
pauseUntil(() => controller.anyButton.isPressed())
pause(500)
ramune.setImage(ramuneImages[1]);
pause(1000)
ramune.setImage(ramuneImages[2])
pause(1000)

//LEVEL START
scene.setTileMapLevel(assets.tilemap`level`);
let duck = sprites.create(duckImage, SpriteKind.Food);
sprites.setDataNumber(duck, "index", 0)
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

//initial conditions
duck.setPosition(80, 60 + rowsAbove*16)
duck.vx = Math.randomRange(-50, 50);
duck.vy = Math.randomRange(-50, 50);
duck.ay = buoyancy;
duck.setBounceOnWall(true);
let waterLevel = rowsAbove
ramune.setFlag(SpriteFlag.GhostThroughWalls, true)
ramune.z = -2
for (let i = 0; i < rowsAbove * 16; i++) {
    scene.centerCameraAt(80, 60 + i)
    ramune.y++
    pause(10)
}

scene.onHitWall(SpriteKind.Food, function (sprite: Sprite, location: tiles.Location) {
    damage(location)
})

//Change from water physics to air physics
scene.onOverlapTile(SpriteKind.Food, backgroundTile, function (sprite: Sprite, location: tiles.Location) {
    if (inWater) {
        inWater = false;
        sprite.ay = gravity;
    }
})
//Matching function to change from air physics to water physics
scene.onOverlapTile(SpriteKind.Food, waterTile, function (sprite: Sprite, location: tiles.Location) {
    if (inWater == false) {
        inWater = true;
        sprite.ay = buoyancy;
    }
})

browserEvents.MouseLeft.onEvent(browserEvents.MouseButtonEvent.Pressed, function (x: number, y: number) {
    //If left click close to duck, activate power
    if (Math.abs(duck.x - x) < 16 && Math.abs((duck.y - rowsAbove*16) - y) < 16) {
        duckPower(sprites.readDataNumber(duck, "index"))
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
        pause(1000)
        game.gameOver(false)
    }
}

//For activating a duck's power
function duckPower(index: number) {
    if (index == 0) {
        if (crackingSprites.length > 0) {
            //Find closest sprite
            let tempNumber = closestSprite(duck, crackingSprites);
            let tempNumber2 = brokenGlassSprites.indexOf(crackingSprites[tempNumber].image)
            if (tempNumber2 > 0) {
                crackingSprites[tempNumber].setImage(brokenGlassSprites[tempNumber2 - 1])
            }
            else {
                crackingSprites[tempNumber].destroy()
                crackingSprites.removeAt(tempNumber)
            }
        }
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
    //placeholder
})