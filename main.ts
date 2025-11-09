scene.setTileMapLevel(assets.tilemap`level`);
let duckImage = assets.image`myImage`;
let duck = sprites.create(duckImage, SpriteKind.Food);
// bottom, left right, bottom-left, bottom-right
let glassSprites = [assets.tile`myTile0`, assets.tile`myTile2`, assets.tile`myTile3`, assets.tile`myTile4`, assets.tile`myTile5`];
let brokenGlassSprites = [assets.image`myImage0`, assets.image`myImage1`, assets.image`myImage2`];
let crackingSprites = [sprites.create(brokenGlassSprites[0], SpriteKind.Enemy)];
crackingSprites[0].destroy();
crackingSprites.pop();
duck.ay = 100;
duck.vx = 15;
duck.setBounceOnWall(true)

scene.onHitWall(SpriteKind.Food, function (sprite: Sprite, location: tiles.Location) {
    let tempBoolean = false
    for (let i = 0; i < crackingSprites.length; i++) {
        let tempSprite = crackingSprites[i];
        if (tempSprite.tilemapLocation() == location) {
            let tempNumber = brokenGlassSprites.indexOf(tempSprite.image);
            if (tempNumber < brokenGlassSprites.length) {
                tempSprite.setImage(brokenGlassSprites[tempNumber + 1]);
            }
            else {
                tempSprite.destroy();
                crackingSprites.removeAt(i)
            }
            let tempBoolean = true;
        }
    } 
    if (tempBoolean == false) {
        crackingSprites.push(sprites.create(brokenGlassSprites[0], SpriteKind.Enemy))
        tiles.placeOnTile(crackingSprites[crackingSprites.length - 1], location);
    }
})
