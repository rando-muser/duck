scene.setTileMapLevel(assets.tilemap`level`);
let duckImage = assets.image`myImage`;
let blank = assets.image`myImage3`
let waterTile = assets.tile`myTile`
let backgroundTile = assets.tile`myTile6`
let duck = sprites.create(duckImage, SpriteKind.Food);

// bottom, left right, bottom-left, bottom-right glass tiles
let glassSprites = [assets.tile`myTile0`, assets.tile`myTile2`, assets.tile`myTile3`, assets.tile`myTile4`, assets.tile`myTile5`];
// Advance amount of cracking from least to most
let brokenGlassSprites = [assets.image`myImage0`, assets.image`myImage1`, assets.image`myImage2`];

// Initialized with a sprite in it so the array is set to 'sprite' type, then destroyed
let crackingSprites = [sprites.create(brokenGlassSprites[0], SpriteKind.Enemy)];
crackingSprites[0].destroy();
crackingSprites.pop();

//initial conditions
duck.vx = 50
duck.ay = 10
duck.vy = 40
duck.setBounceOnWall(true)

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
                tiles.setTileAt(location, assets.tile`myTile`);
                tiles.setWallAt(location, false);
                //And make the water drain
                waterLevel(location.y);
            }
            tempBoolean = true;
        }
    } 
    if (tempBoolean == false) {
        //If no crack exists, make a new one
        crackingSprites.push(sprites.create(brokenGlassSprites[0], SpriteKind.Enemy))
        tiles.placeOnTile(crackingSprites[crackingSprites.length - 1], location);
    }
})

//Function to recalculate water level when a duck breaks glass
function waterLevel(level: number) {
    //Then drain water animation
    let tempArray = tiles.getTilesByType(waterTile);
    for (let i = 0; i < tempArray.length; i++) {
        if (tempArray[i].y <= level) {
            tiles.setTileAt(tempArray[i], backgroundTile)
        }
    }
}
