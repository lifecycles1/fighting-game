class Sprite {
  constructor({ position, imageSrc, scale = 1, framesMax = 1, offset = { x: 0, y: 0 } }) {
    this.position = position;
    this.width = 50;
    this.height = 150;
    this.image = new Image();
    this.image.src = imageSrc;
    this.scale = scale;
    this.framesMax = framesMax;
    this.framesCurrent = 0;
    // this is detecting how many frames have passed through the crop loop
    this.framesElapsed = 0;
    // for every 10th frame we want to crop the image (will slow down the loop therefore the animation effect)
    this.framesHold = 6;
    this.offset = offset;
  }

  // draw method (called in the update method)
  draw() {
    c.drawImage(
      // draw out this image
      this.image,
      // crop starting point x position
      this.framesCurrent * (this.image.width / this.framesMax),
      // crop starting point y position
      0,
      // crop width
      this.image.width / this.framesMax,
      // crop height
      this.image.height,
      // image starting point x position
      this.position.x - this.offset.x,
      // image starting point y position
      this.position.y - this.offset.y,
      // image width
      (this.image.width / this.framesMax) * this.scale,
      // image height
      this.image.height * this.scale
    );
  }

  // animateFrames method (called in the update method)
  animateFrames() {
    // incrementing framesElapsed will allow us to slow down the animation effect
    // by recording how many frames have elapsed since the game starts
    this.framesElapsed++;
    // then we check if the elapsed frames modulus 10(frameshold value) is equal to 0
    // and we run the animation crop loop every time the modulus is equal to 0
    // basically meaning that every 10th frame we will crop the image
    if (this.framesElapsed % this.framesHold === 0) {
      // shop crop animation - incrementing framesCurrent will allow us to crop the shop image to its next portions of the image
      // we don't want the background image to be cropped so we add minus 1.
      // this loop cropping runs for both of the sprites in the app (background and shop).
      // Because our background image has a hardcoded framesMax of 1
      // and the framesCurrent starts at 0, so when the loop runs for our background image it will qualify
      // for the cropping and it will crop the background image. We don't want our background image to
      // qualify for this loop so we will add -1 to the framesMax so when it runs for the background image
      // the framesCurrent will be 0 and the framesMax will be 0 so the loop will not qualify for the background image
      // and it will not run. It will only qualify to crop and animate the shop image.
      if (this.framesCurrent < this.framesMax - 1) {
        this.framesCurrent++;
      } else {
        this.framesCurrent = 0;
      }
    }
  }

  // update method (called in the infinite animate loop)
  update() {
    this.draw();
    this.animateFrames();
  }
}

class Fighter extends Sprite {
  constructor({
    position,
    velocity,
    color = "red",
    imageSrc,
    scale = 1,
    framesMax = 1,
    offset = {
      x: 0,
      y: 0,
    },
    sprites,
    attackBox = { offset: { x, y }, width: undefined, height: undefined },
  }) {
    super({ position, imageSrc, scale, framesMax, offset });
    this.velocity = velocity;
    this.width = 50;
    this.height = 150;
    this.lastKey;
    this.attackBox = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      offset: attackBox.offset,
      width: attackBox.width,
      height: attackBox.height,
    };
    this.color = color;
    this.isAttacking;
    this.health = 100;
    this.framesCurrent = 0;
    this.framesElapsed = 0;
    this.framesHold = 6;
    this.sprites = sprites;
    this.dead = false;
    for (const sprite in this.sprites) {
      sprites[sprite].image = new Image();
      sprites[sprite].image.src = sprites[sprite].imageSrc;
    }
  }

  // update method (called in the infinite animate loop)
  update() {
    this.draw();
    // only if this.dead is not true then we infinitely animate our character frames
    if (!this.dead) this.animateFrames();
    // adjusting the position of the attack box to be updated to the position of the fighter
    this.attackBox.position.x = this.position.x + this.attackBox.offset.x; // adding so we can set a negative offset when instantiating the enemy fighter to make the attack box appear in front of the fighter
    this.attackBox.position.y = this.position.y + this.attackBox.offset.y;
    // this next line was drawing the attack box rectangle so we can adjust it to the image
    // c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
    // this.velocity.y is what is making the fighter fall
    // gravity is what is making the fighter fall faster
    // we are applying the velocity with the added gravity to the position of the fighter to make it fall
    this.position.y = this.position.y + this.velocity.y;
    // by adding velocity.x to position.x of the fighter we are making it move on the x axis
    this.position.x = this.position.x + this.velocity.x;
    // this stops the fighter falling when it reaches the bottom of the canvas (minus 45 which places the fighters on the height of the ground in the background sprite)
    if (this.position.y + this.height + this.velocity.y >= canvas.height - 45) {
      // by setting the velocity.y to 0
      this.velocity.y = 0;
      // this line is under review - it confirms that the fighter is on the ground but I don't know why it is needed
      // i researched it - it prevents a quick glitch where the players stretches his arm when he lands on the ground
      this.position.y = 374;
      // and we are only adding gravity to the velocity when the fighter is falling within the canvas dimensions
      // otherwise when we set velocity.y to 0 at the bottom of the canvas the gravity will still run and the fighter will continue its fall
    } else this.velocity.y = this.velocity.y + gravity;
  }

  // attack method (called when pressing buttons)
  attack() {
    this.switchSprite("attack1");
    this.isAttacking = true;
    // when detecting for a collision in index.js, we added a new condition that delays the collision
    // to make it occur only on the 4th frame so that it doesn't subtract opponent health too early when we
    // hit the attack button and rather see first that the player draws out his sword and hits the opponent.
    // That happens approximately on the 4th frame of the attack spritesheet for both fighters.
    // This successfully delays it but because we had a Timeout function here that sets the isAttacking to
    // false after 1 millisecond, to prevent an infinite loop if we we don't detect a collision (if we miss),
    // the animation was never reaching the 4th frame within this 1 millisecond. So we could've increased
    // the time but it was going to be difficult to determine the exact time so we removed the timeout
    // completely and went back to an infite loop of the attack1 animation whenever we miss. And finally to
    // stop the infinite loop when we miss, we duplicated the new collision detection conditional in index.js
    // without the collision detection check so that it sets is.Attacking to false even if there is no
    // collision detected and when the frames are equal to 4.
    // setTimeout(() => {
    //   this.isAttacking = false;
    // }, 100);
  }

  takeHit() {
    this.health = this.health - 20;
    if (this.health <= 0) this.switchSprite("death");
    else this.switchSprite("takeHit");
  }

  // switchSprite method (called when pressing buttons)
  switchSprite(sprite) {
    // if we death occurs we don't want to switch to any other sprite (come back to life unless we reset the game)
    if (this.image === this.sprites.death.image) {
      // and because the death animation runs in an infinite loop we need to add a "this.dead" property
      // to the class and set it to true on the last frame of the death animation. Then in the update()
      // method, the animateFrames() for the fighter class is changed to only run if this.dead is false.
      // (notes: animateFrames() is animating all of the sprites by running an infinite loop)
      if (this.framesCurrent === this.sprites.death.framesMax - 1) this.dead = true;
      return;
    }
    if (
      // if image evaluates to attack1 so it doesn't immediatelly loop back to other sprites
      // by doing this we can see the full attack1 animation.
      // An issue with this is that this causes the attack1 animation to run in an infinite loop
      this.image === this.sprites.attack1.image &&
      // to make sure the attack1 animation runs only once we add the line below which states that
      // while the framescurrent is less than the framesmax - keep returning and as soon as the framescurrent
      // goes above the framesmax then we are going to continue (allowing us to switch back to the other sprites)
      // the "minus -1" part is the trick that cancels the infinite loop
      // because attack1 has 6 frames and if we add -1 to the check, on the 6th frame framesCurrent will
      // not be less and it will stop returning and the function will continue on to the switch statement
      // to render other sprites
      this.framesCurrent < this.sprites.attack1.framesMax - 1
    ) {
      console.log(this.framesCurrent, this.sprites.attack1.framesMax);
      return;
    }

    // if image evalutes to takeHit we also want to return early so that it plays out the full animation
    // before it switches back to any other sprite
    if (this.image === this.sprites.takeHit.image && this.framesCurrent < this.sprites.takeHit.framesMax - 1)
      // return early
      return;

    switch (sprite) {
      case "idle":
        if (this.image !== this.sprites.idle.image) {
          // changes the image to the idle sprite
          this.image = this.sprites.idle.image;
          // changes the framesMax to the idle sprite framesMax
          this.framesMax = this.sprites.idle.framesMax;
          // resets the framesCurrent to 0 in every case so that every sprite loop starts from 0 rather than from
          // the number it was on (because if a sprite with 8 frames is currently on frame 5 and switches
          // to a sprite with 2 frames only, the sprite with 2 frames only wont have a frame to show on
          // frame 5
          this.framesCurrent = 0;
        }
        break;
      case "run":
        if (this.image !== this.sprites.run.image) {
          this.image = this.sprites.run.image;
          this.framesMax = this.sprites.run.framesMax;
          this.framesCurrent = 0;
        }
        break;
      case "jump":
        if (this.image !== this.sprites.jump.image) {
          this.image = this.sprites.jump.image;
          this.framesMax = this.sprites.jump.framesMax;
          this.framesCurrent = 0;
        }
        break;
      case "fall":
        if (this.image !== this.sprites.fall.image) {
          this.image = this.sprites.fall.image;
          this.framesMax = this.sprites.fall.framesMax;
          this.framesCurrent = 0;
        }
        break;
      case "attack1":
        if (this.image !== this.sprites.attack1.image) {
          this.image = this.sprites.attack1.image;
          this.framesMax = this.sprites.attack1.framesMax;
          this.framesCurrent = 0;
        }
        break;
      case "takeHit":
        if (this.image !== this.sprites.takeHit.image) {
          this.image = this.sprites.takeHit.image;
          this.framesMax = this.sprites.takeHit.framesMax;
          this.framesCurrent = 0;
        }
        break;
      case "death":
        if (this.image !== this.sprites.death.image) {
          this.image = this.sprites.death.image;
          this.framesMax = this.sprites.death.framesMax;
          this.framesCurrent = 0;
        }
        break;
    }
  }
}
