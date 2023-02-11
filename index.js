const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
// canvas.width = innerWidth;
// canvas.height = innerHeight;
canvas.width = 1280;
canvas.height = 569;
c.fillRect(0, 0, canvas.width, canvas.height);
const gravity = 0.7;

const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/background.png",
});

const shop = new Sprite({
  position: {
    x: 800,
    y: 171.5,
  },
  imageSrc: "./img/shop.png",
  scale: 2.75,
  framesMax: 6,
});

const player = new Fighter({
  position: {
    x: 0,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/samuraiMack/Idle.png",
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 215,
    y: 157,
  },
  sprites: {
    idle: {
      imageSrc: "./img/samuraiMack/Idle.png",
      framesMax: 8,
    },
    run: {
      imageSrc: "./img/samuraiMack/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./img/samuraiMack/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./img/samuraiMack/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./img/samuraiMack/Attack1.png",
      framesMax: 6,
    },
    takeHit: {
      imageSrc: "./img/samuraiMack/Take Hit - white silhouette.png",
      framesMax: 4,
    },
    death: {
      imageSrc: "./img/samuraiMack/Death.png",
      framesMax: 6,
    },
  },
  attackBox: {
    offset: {
      x: 100,
      y: 50,
    },
    width: 160,
    height: 50,
  },
});

const enemy = new Fighter({
  position: {
    x: 400,
    y: 100,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/kenji/Idle.png",
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/kenji/Idle.png",
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 215,
    y: 167,
  },
  sprites: {
    idle: {
      imageSrc: "./img/kenji/Idle.png",
      framesMax: 4,
    },
    run: {
      imageSrc: "./img/kenji/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./img/kenji/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./img/kenji/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./img/kenji/Attack1.png",
      framesMax: 4,
    },
    takeHit: {
      imageSrc: "./img/kenji/Take hit.png",
      framesMax: 3,
    },
    death: {
      imageSrc: "./img/kenji/Death.png",
      framesMax: 7,
    },
  },
  attackBox: {
    offset: {
      x: -170,
      y: 50,
    },
    width: 170,
    height: 50,
  },
});

const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
};

decreaseTimer();

function animate() {
  // this rect painted the background black before we had the background image
  // c.fillStyle = "black";
  // c.fillRect(0, 0, canvas.width, canvas.height);
  window.requestAnimationFrame(animate);
  background.update();
  shop.update();
  // fillRect adds a slight transparency to the background screen so that the fighters contrast better
  c.fillStyle = "rgba(255, 255, 255, 0.15)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  enemy.update();

  // makes sure the fighters stop moving when we are not holding down any of the keys
  player.velocity.x = 0;
  enemy.velocity.x = 0;

  // player movement
  // if "a" move left and switch to run sprite
  if (keys.a.pressed && player.lastKey === "a") {
    player.velocity.x = -5;
    player.switchSprite("run");
    // if "d" move right and switch to run sprite
  } else if (keys.d.pressed && player.lastKey === "d") {
    player.velocity.x = 5;
    player.switchSprite("run");
    // else idle
  } else {
    player.switchSprite("idle");
  }
  // detects when player jumps and adds the jump sprite plus its framesMax (number of total crops on the sprite sheet)
  if (player.velocity.y < 0) {
    player.switchSprite("jump");
    // detects when player falls
  } else if (player.velocity.y > 0) {
    player.switchSprite("fall");
  }

  // enemy movement
  if (keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft") {
    enemy.velocity.x = -5;
    enemy.switchSprite("run");
  } else if (keys.ArrowRight.pressed && enemy.lastKey === "ArrowRight") {
    enemy.velocity.x = 5;
    enemy.switchSprite("run");
  } else {
    enemy.switchSprite("idle");
  }
  if (enemy.velocity.y < 0) {
    enemy.switchSprite("jump");
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite("fall");
  }

  // detect for collision on the player attack box  (player attacks)
  if (
    rectangularCollision({ rectangle1: player, rectangle2: enemy }) &&
    // and the player is indeed attacking
    player.isAttacking &&
    // and the player is on the 4th frame of the attack animation so that we don't deduct health too early
    // we rather want to subtract health on the 4th frame because that is when the player draws his sword and actually swings with it
    player.framesCurrent === 4
  ) {
    // the above line "player.isAttacking" by itself fires off an attack by setting isAttacking to true
    // and sets it back to false in a timeout function after 1 millisecond. To prevent the attack from
    // firing off multiple times during that 1 millisecond we need to set below isAttacking to false.
    // set back immediatelly to false and in this case the attack collision evaluates to true only once
    // therefore the attack occurs only once
    enemy.takeHit(); // also switching the opponent to the takeHit sprite and deducting his health
    player.isAttacking = false;
    // the old way of displaying the decrease of the opponent's health
    // document.querySelector("#enemyHealth").style.width = enemy.health + "%";
    // the new way using gsap library to add an animation
    gsap.to("#enemyHealth", {
      width: enemy.health + "%",
    });
  }
  // if no collision (when attack misses) set back to false on 4th frame to prevent infinite attack loop
  // after we stopped using the timeout function from classes.js that was setting isAttacking to false
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false;
  }

  // detect for collision on the enemy attack box  (enemy attacks)
  if (
    rectangularCollision({ rectangle1: enemy, rectangle2: player }) &&
    // and the enemy is indeed attacking
    enemy.isAttacking &&
    // enemy animation sprite attacks on its 2nd frame
    enemy.framesCurrent === 2
  ) {
    player.takeHit();
    enemy.isAttacking = false;
    // document.querySelector("#playerHealth").style.width = player.health + "%";
    gsap.to("#playerHealth", {
      width: player.health + "%",
    });
  }
  // if enemy misses
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false;
  }

  // end game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId });
  }
}

animate();

window.addEventListener("keydown", (e) => {
  // if player is not dead, enable movement
  if (!player.dead) {
    // player movement
    switch (e.key) {
      // move right
      case "d":
        keys.d.pressed = true;
        player.lastKey = "d";
        break;
      //move left
      case "a":
        keys.a.pressed = true;
        player.lastKey = "a";
        break;
      // jump
      case "w":
        player.velocity.y = -20;
        break;
      // attack
      case " ":
        player.attack();
        break;
    }
  }

  // if enemy is not dead, enable movement
  if (!enemy.dead) {
    // enemy movement
    switch (e.key) {
      case "ArrowRight":
        keys.ArrowRight.pressed = true;
        enemy.lastKey = "ArrowRight";
        break;
      case "ArrowLeft":
        keys.ArrowLeft.pressed = true;
        enemy.lastKey = "ArrowLeft";
        break;
      case "ArrowUp":
        enemy.velocity.y = -20;
        break;
      case "Enter":
        enemy.attack();
        break;
    }
  }
});

window.addEventListener("keyup", (e) => {
  // player movement
  switch (e.key) {
    case "d":
      keys.d.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
    case "w":
      break;
  }

  // enemy movement
  switch (e.key) {
    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;
  }
});
