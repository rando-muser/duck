scene.setTileMapLevel(assets.tilemap`level`);
let duckImage = assets.image`myImage`;
let duck = sprites.create(duckImage, SpriteKind.Food);
// bottom, left right, bottom-left, bottom-right
let glassSprites = [assets.tile`myTile0`, assets.tile`myTile2`, assets.tile`myTile3`, assets.tile`myTile4`, assets.tile`myTile5`];
let brokenGlassSprites = [assets.image`myImage0`, assets.image`myImage1`, assets.image`myImage2`];
let crackingSprites = [sprites.create(brokenGlassSprites[0], SpriteKind.Enemy)];
let blank = assets.image`myImage3`
crackingSprites[0].destroy();
crackingSprites.pop();
duck.ay = 100;
duck.vx = 15
duck.setBounceOnWall(true)

scene.onHitWall(SpriteKind.Food, function (sprite: Sprite, location: tiles.Location) {
    let tempBoolean = false
    for (let i = 0; i < crackingSprites.length; i++) {
        let tempSprite = crackingSprites[i];
        if (tempSprite.x == location.x && tempSprite.y == location.y) {
            let tempNumber = brokenGlassSprites.indexOf(tempSprite.image);
            if (tempNumber < brokenGlassSprites.length - 1) {
                tempSprite.setImage(brokenGlassSprites[tempNumber + 1]);
            }
            else {
                crackingSprites[i].setImage(blank)
                crackingSprites[i].destroy()
                crackingSprites.removeAt(i)
                tiles.setTileAt(location, assets.tile`myTile`)
            }
            let tempBoolean = true;
        }
    } 
    if (tempBoolean == false) {
        crackingSprites.push(sprites.create(brokenGlassSprites[0], SpriteKind.Enemy))
        tiles.placeOnTile(crackingSprites[crackingSprites.length - 1], location);
    }
})
