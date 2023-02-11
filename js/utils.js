// generic function to detect for collisions (when attackboxes collide with opposite fighters)
function rectangularCollision({ rectangle1, rectangle2 }) {
  return (
    // end of weapon is greater than start of enemy
    rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x &&
    // and start of weapon is less than end of enemy
    rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width &&
    // and bottom of weapon is greater than top of enemy (attacking from above)
    rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y &&
    // and top of the weapon is less than the bottom of the enemy (attacking from below)
    rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
  );
}

// generic function to determine the winner (called once in the timer function when time runs out and once in the animate function whenever one of the fighters health bars drops to 0)
function determineWinner({ player, enemy, timerId }) {
  clearTimeout(timerId);
  document.querySelector("#displayText").style.display = "flex";
  if (player.health === enemy.health) {
    document.querySelector("#displayText").innerHTML = "Tie";
  } else if (player.health > enemy.health) {
    document.querySelector("#displayText").innerHTML = "Player 1 Wins";
  } else if (enemy.health > player.health) {
    document.querySelector("#displayText").innerHTML = "Player 2 Wins";
  }
}

// timer function responsible for the countdown timer functionality and also calls determineWinner() when the timer runs out
let timer = 60;
let timerId;
function decreaseTimer() {
  // only if the timer is greater than 0 we want to decrease the timer each second and display it on the screen
  // basically since we added a clearTimeout in determineWinner() and we are calling it
  // when timer reaches === 0 this "if" check is a bit redundant
  if (timer > 0) {
    timerId = setTimeout(decreaseTimer, 1000);
    timer--;
    document.querySelector("#timer").innerHTML = timer;
  }
  if (timer === 0) {
    determineWinner({ player, enemy, timerId });
  }
}
