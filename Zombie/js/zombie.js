
var x = 100
var y = 100
var numZombies = 10;
var startTime;
var endTime;
var zombies = [];
var players = [];
var currentScore = 0;
var enable = false;
var level = 1;
var backgroundAudio = new Audio('sounds/zombiesAround.mp3');
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
var numPlayers = parseInt(urlParams.get('players'));


function start() {
  // Räkna fram start tid och den tid som spelaren har på sig att klara nivån
  startTime = new Date();
  endTime = new Date(startTime.getTime() + 1 * 60000);
  currentScore = 0;



  //Skapa zombies och spelare
  initPlayersAndZombies();

  // Sätt score till noll eftersom nytt spel är startat
  for (let i = 0; i < numPlayers; i++) {
    players[i].score = 0;
  }

  // Visa välkomstmeddelande. Anvvändaren behöver trycka på startkanppen i den dialogen vilket gör att Chrome sedan tillåter att vi spelar ljud
  welcome();
}

/* Funktion som skapar spelare och zombies 
 * Arayen zombies kommer innehålla alla zombies
 * Arryen players kommer innehålla spelarna ( 1 eller 2)
 */
function initPlayersAndZombies() {
  startTime = new Date();
  endTime = new Date(startTime.getTime() + 1 * 60000);


  for (let i = 0; i < numZombies + level * 5; i++) {
    zombies[i] = {
      x: random(totalWidth - 50),
      y: random(totalHeight - 50),
      height: 156,
      width: 95,
      dead: false,
      score: 25,
      damage: 40,
      health: 100,
      // Explosion variablerna används när zombien är dör  
      showExplosion: false,
      explosionTime: 0.3,
      exposionStartTime: null,
      speed: random(1, 5 + level)
    };
  }

  players[0] = {
    x: random(totalWidth - 20),
    y: random(totalHeight - 20),
    deltaX: 0,
    deltaY: 0,
    height: 146,
    width: 69,
    // Spelaren kan avfyra en och endast en misil. Det gör att vi kan lagra info om misilen tillsammans med spelarens info
    misile: true,
    misileFired: false,
    misileX: -1,
    misileY: -1,
    misileSpeedX: -1,
    misileSpeedY: -1,
    imageLeft: "images/steveLeft.png",
    imageRight: "images/steveRight.png",
    health: 500
  };
  if (numPlayers > 1) {
    players[1] = {
      x: random(totalWidth - 20),
      y: random(totalHeight - 20),
      deltaX: 0,
      deltaY: 0,
      height: 146,
      width: 69,
      misile: true,
      misileFired: false,
      misileX: -1,
      misileY: -1,
      misileSpeedX: -1,
      misileSpeedY: -1,
      imageLeft: "images/steveLeft.png",
      imageRight: "images/steveRight.png",
      health: 500
    };
  }
}

/*
 * Kontrollerar om två objekt överlappar */
function isColliding(x1, y1, w1, h1, x2, y2, w2, h2) {
  if (x1 < x2 + w2 &&
    x1 + w1 > x2 &&
    y1 < y2 + h2 &&
    h1 + y1 > y2) {
    return true;
  } else {
    return false;
  }
}

/*
 * Visar välkomst meddelande. Tvingar också användaren att trycka på starknappen. Det gör att Chrome tillåter oss att spela ljud
 */
function welcome() {
  // HTML dokumentet innehåller en div för dialogen som normalt är gömd. Vi hämtar den och visar diven
  var modal = document.getElementById("welcome");

  var startbutton = document.getElementById("startButton");
  startbutton.onclick = function () {
    // Spelare har valt att starta
    enable = true; // Aktiverar uppdateringarna i update funktionen
    modal.style.display = "none";


    // Starta bakgrundsljud. Spela ljud med functionen i simple.js var buggigt, så använder teknik hittad på nätet
    if (typeof backgroundAudio.loop == 'boolean') {
      backgroundAudio.loop = true;
    }
    else {
      backgroundAudio.addEventListener('ended', function () {
        this.currentTime = 0;
        this.play();
      }, false);
    }
    backgroundAudio.play();
  }

  modal.style.display = "block";
}

/*
 * StopGame andropas när spelaren har dött
 */
function stopGame() {
  backgroundAudio.pause();
  stopUpdate();

  // HTML dokumentet innehåller en div för dialogen som normalt är gömd. Vi hämtar den och visar diven
  var modal = document.getElementById("endGame");

  var endButton = document.getElementById("endButton");

  endButton.onclick = function () {
    modal.style.display = "none";
    location.href = "index.html"; // Tillbaka till huvudmenyn
  }
  modal.style.display = "block";
}

/*
 * Update functionen som anropas för att uppdatera skärmen
 * Kontrollerar tangent bord och must och uppdaterar spelare om zombies
 */
function update() {
  // enabled kan sättas till false. Då stoppas all uppdatering. Används tex när en dialog skall visas
  if (enable == false) {
    return;
  }

  // Hantera styrning av spelare mha tangentbord
  var misilePlayerSpeedX = 0;
  var misilePlayerSpeedY = 0;
  if (keyboard.a) {
    players[0].deltaX = - 5;
    misilePlayerSpeedX = -5;
  }

  if (keyboard.d) {
    players[0].deltaX = 5;
    misilePlayerSpeedX = 5;
  }

  if (keyboard.w) {
    players[0].deltaY = -5;
    misilePlayerSpeedY = -5;
  }
  if (keyboard.s) {
    players[0].deltaY = 5;
    misilePlayerSpeedY = 5;
  }
  players[0].y += players[0].deltaY;
  players[0].x += players[0].deltaX;
  if (players.length > 1) {
    if (keyboard.left) {
      players[1].deltaX = -5;
    }
    if (keyboard.right) {
      players[1].deltaX = 5;
    }
    if (keyboard.up) {
      players[1].deltaY = -5;
    }
    if (keyboard.down) {
      players[1].deltaY = 5;
    }
    players[1].y += players[1].deltaY;
    players[1].x += players[1].deltaX;
  }
  if (keyboard.space && players[0].misile == true) {
    // Avfyra misil
    players[0].misileFired = true;
    players[0].misileSpeedX = misilePlayerSpeedX;
    players[0].misileSpeedY = misilePlayerSpeedY;
    players[0].misileX = players[0].x;
    players[0].misileY = players[0].y;
    players[0].misile = false;
  }

  // Kontrollera så att speelarne inte går utanför skärmen 
  for (let i = 0; i < numPlayers; i++) {
    if (players[i].x >= totalWidth) {
      players[i].x = totalWidth;
    } else if (players[i].x <= 0) {
      players[i].x = 0;
    }

    if (players[i].y >= (totalHeight - 40 - 50)) {
      players[i].y = totalHeight - 40 - 50;
    } else if (players[i].y <= 40) {
      players[i].y = 40;
    }
  }

  clearScreen();

  // Visa spelare på ny position
  for (let i = 0; i < numPlayers; i++) {
    if (players[i].deltaX < 0) {
      picture(players[i].x, players[i].y, players[i].imageLeft);
    } else {
      picture(players[i].x, players[i].y, players[i].imageRight);
    }
    players[i].deltaX = 0;
    players[i].deltaY = 0;
  }

  // Omn spelaren har avfyrat sin misik skall vi uppdatera misilens position
  if (players[0].misileFired == true) {
    players[0].misileX += players[0].misileSpeedX;
    players[0].misileY += players[0].misileSpeedY;
    if (players[0].misileX > totalWidth) {
      players[0].misileFired = false;
    } else if (players[0].misileX < 0) {
      players[0].misileFired = false;
    }
    if (players[0].misileY > totalHeight) {
      players[0].misileFired = false;
    } else if (players[0].misileY < 0) {
      players[0].misileFired = false;
    }
    picture(players[0].misileX, players[0].misileY, "images/missile.png");
  }

  // Spela explosionsljud om spelaren har tryckt på musknappen 
  if (mouse.left === true) {
    shotgunSound = new Audio('sounds/shotgun.mp3');
    shotgunSound.play();
  }

  // Uppdatera alla zombies
  for (let i = 0; i < numZombies; i++) {
    // Hittade den spelare som är närmast den här zombien
    var closestPlayerX;
    var closestPlayerY;
    if (players.length > 1) {
      if (distance(players[0].x, players[0].y, zombies[i].x, zombies[i].y) < distance(players[1].x, players[1].y, zombies[i].x, zombies[i].y)) {
        closestPlayerX = players[0].x;
        closestPlayerY = players[0].y;
      } else {
        closestPlayerX = players[1].x;
        closestPlayerY = players[1].y;
      }
    } else {
      closestPlayerX = players[0].x;
      closestPlayerY = players[0].y;
    }

    // Kolla om det är en döend zombie då skall vi visa en explosion
    if (zombies[i].dead && zombies[i].showExplosion == true) {
      var now = new Date();
      if (zombies[i].exposionStartTime.getTime() + zombies[i].explosionTime * 1000 > now.getTime()) {
        picture(zombies[i].x, zombies[i].y, "images/animExplosion.gif");
      } else {
        zombies[i].showExplosion = false;
      }
    } else if (zombies[i].dead == false) {
      //Zombin lever. Kolla om den har fångat någon spelare
      for (let j = 0; j < numPlayers; j++) {
        if (isColliding(players[j].x, players[j].y, players[j].width, players[j].height, zombies[i].x, zombies[i].y, zombies[i].width, zombies[i].height)) {
          // Spelaren fångad av zombin. Minska health och kolla om spelaren nu är död
          zombies[i].dead = true;
          players[j].health -= zombies[i].damage;
          if (players[j].health <= 0) {
            stopGame();
          }
        }
      }
      // Flytta zombin mot närmaste spelaren
      if (zombies[i].x > closestPlayerX) {
        zombies[i].x -= zombies[i].speed;
        if (zombies[i].x < 0) {
          zombies[i].x = 0;
        }
      }

      if (zombies[i].x < closestPlayerX) {
        zombies[i].x += zombies[i].speed;
        if (zombies[i].x > (totalWidth - zombies[i].width)) {
          zombies[i].x = totalWidth - zombies[i].width;
        }
      }

      if (zombies[i].y > closestPlayerY) {
        zombies[i].y -= zombies[i].speed;
        if (zombies[i].y < 0) {
          zombies[i].y = 0;
        }
      }

      if (zombies[i].y < closestPlayerY) {
        zombies[i].y += zombies[i].speed;
        if (zombies[i].y > (totalHeight - 40 - zombies[i].height)) {
          zombies[i].y = totalHeight - 40 - zombies[i].height;
        }
      }

      // Kolla om spelaren har klickat på zombin
      if (mouse.left === true) {
        if (mouse.x > zombies[i].x && mouse.x < (zombies[i].x + zombies[i].width)) {
          if (mouse.y > zombies[i].y && mouse.y < (zombies[i].y + zombies[i].height)) {
            zombies[i].health -= 5;
            if (zombies[i].health <= 0) {
              zombies[i].dead = true;
              zombies[i].showExplosion = true;
              zombies[i].exposionStartTime = new Date();
              currentScore += zombies[i].score;

            }
          }
        }
      }

      // Misil är avfyrad. Kolla om zombin är träffas
      if (players[0].misileFired == true) {
   //     if (players[0].misileX > zombies[i].x && players[0].misileX < (zombies[i].x + zombies[i].width)) {
   //       if (players[0].misileY > zombies[i].y && players[0].misileY < (zombies[i].y + zombies[i].height)) {
        if(isColliding(players[0].misileX ,players[0].misileY, 50,80, zombies[i].x,zombies[i].y, zombies[i].width, zombies[i].height)) {
            zombies[i].dead = true;
            zombies[i].showExplosion = true;
            zombies[i].exposionStartTime = new Date();
            currentScore += zombies[i].score;
            players[0].misileFired = false;
          }
      }
      if (zombies[i].dead == false) {
        // Rita ut zombiens healthbar
        rectangle(zombies[i].x, zombies[i].y - 15, zombies[i].health / 2, 10, "red")
        // Rita ut zombien. Olika bilder beroende på om zombien går åt vänster eller höger
        if (zombies[i].x > closestPlayerX) {
          picture(zombies[i].x, zombies[i].y, "images/zombieLeft.png");
        } else {
          picture(zombies[i].x, zombies[i].y, "images/zombieRight.png");
        }
      }
    }
  }


  // Rita ut poäng, tid kvar att klara level  och health för spelarna
  rectangle(0, totalHeight - 40, totalWidth, 40, "green")

  now = new Date();
  millisecsToDeath = endTime.getTime() - now.getTime();
  timeToDeath = new Date(millisecsToDeath);
  if (timeToDeath < 0) {
    stopGame();
  }

  text(20, totalHeight - 12, 20, "TIME LEFT - " + timeToDeath.getMinutes() + " : " + timeToDeath.getSeconds(), "black");
  text(400, totalHeight - 12, 20, "SCORE " + currentScore);
  if (players.length == 1) {
    text(800, totalHeight - 12, 20, "HEALTH " + players[0].health);
  } else {
    text(600, totalHeight - 12, 20, "P1 HEALTH " + players[0].health);
    text(900, totalHeight - 12, 20, "P2 HEALTH " + players[1].health);
  }

  // Kolla om alla zombies nu är döda. Om alla är döda så är level klar och vi visar dialog om att level är klar
  if (isAllZombiesDead() == true) {
    backgroundAudio.pause();
    enable = false;
    // HTML dokumentet innehåller en div för dialogen som normalt är gömd. Vi hämtar den och visar diven
    var modal = document.getElementById("levelDone");

    // Användaren kan välja att spelanästa nivå eller avasluta
    var startbutton = document.getElementById("playAgainButton");
    startbutton.onclick = function () {
      level++;
      modal.style.display = "none";

      // Skapa om zombies och spelare (spelarens poäng behålls)
      initPlayersAndZombies();

      enable = true;
    }
    var closbutton = document.getElementById("closeGame");
    closbutton.onclick = function () {
      modal.style.display = "none";
      location.href = "index.html";
    }
    
    modal.style.display = "block";

  }
}

/*
 * Kontrollerar om alla zombies är döda
 */
function isAllZombiesDead() {
  for (let i = 0; i < numZombies; i++) {
    if (zombies[i].dead == false) {
      return false;
    }
  }
  return true;
}

