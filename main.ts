// I can't figure out how to rename the actual image files so I'm using variables 0_0
let duckImage = assets.image`myImage`;
let blank = assets.image`myImage3`
let waterTile = assets.tile`myTile`
let glassWaterTile = assets.tile`myTile1`
let glassTile = assets.tile`myTile9`
let backgroundTile = assets.tile`myTile6`
let backgroundImage = assets.image`myImage4`
let blankTilemap = assets.tilemap`level0`

////TITLE SCREEN
scene.setBackgroundImage(backgroundImage);
pauseUntil(() => controller.anyButton.isPressed())

//LEVEL START
scene.setTileMapLevel(assets.tilemap`level`);
let duck = sprites.create(duckImage, SpriteKind.Food);
// set sprite data here
let inWater = true;

// Constants
const drainSpeed = 300;
const gravity = 100;
const buoyancy = -20;
const rowsAbove = 8;

// Advance amount of cracking from least to most
let brokenGlassSprites = [assets.image`myImage0`, assets.image`myImage1`, assets.image`myImage2`];

// Initialized with a sprite in it so the array is set to 'sprite' type, then destroyed
let crackingSprites = [sprites.create(brokenGlassSprites[0], SpriteKind.Enemy)];
crackingSprites[0].destroy();
crackingSprites.pop();

//initial conditions
scene.centerCameraAt(80, 60 + rowsAbove*16)
duck.setPosition(80, 60 + rowsAbove*16)
duck.vx = Math.randomRange(-50, 50);
duck.vy = Math.randomRange(-50, 50);
duck.ay = buoyancy;
duck.setBounceOnWall(true);
let waterLevel = rowsAbove+1

//Function to crack glass when a duck hits it
scene.onHitWall(SpriteKind.Food, function (sprite: Sprite, location: tiles.Location) {
    //Boolean to check whether the duck overlapped an existing crack
    let tempBoolean = false
    for (let i = 0; i < crackingSprites.length; i++) {
        //If we hit a crack
        if (crackingSprites[i].x == location.x && crackingSprites[i].y == location.y) {
            let tempNumber = brokenGlassSprites.indexOf(crackingSprites[i].image);
            if (tempNumber < brokenGlassSprites.length - 1) {
                //If its not all the way broken, update the image
                crackingSprites[i].setImage(brokenGlassSprites[tempNumber + 1]);
            }
            else {
                //Else, break it entirely
                crackingSprites[i].setImage(blank);
                crackingSprites[i].destroy();
                crackingSprites.removeAt(i);
                tiles.setTileAt(location, backgroundTile);
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
        if (waterLevel > 4) {
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
        pause(1000)
        game.gameOver(false)
    }
}