
// Variablen für das Spiel
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var grid = []; // Array für das Spielfeld
var towers = []; // Array für die Türme
var enemies = []; // Array für die Gegner
var money = 100; // Startgeld
var lives = 10; // Lebenspunkte
var wave = 0; // Aktuelle Welle
var waveSize = 10; // Anzahl der Gegner pro Welle
var waveDelay = 3000; // Zeit zwischen den Wellen in ms
var enemySpeed = 0.5; // Geschwindigkeit der Gegner
var enemyHealth = 10; // Lebenspunkte der Gegner
var enemyReward = 10; // Geld für das Töten eines Gegners
var towerCost = 50; // Kosten für einen Turm
var towerRange = 200; // Reichweite eines Turms
var towerDamage = 5; // Schaden eines Turms
var towerRate = 1000; // Feuerrate eines Turms in ms
var towerAoeRadius = 70; //Tower Aoe Range
var towerSlowEffect = 0.5 //Slow in Percent
var deltaTime = 0;
var lastTime = performance.now();
var enemyToSpawn = 0;
var spawnTimer = 0;
var spawnInterval = 1000;

// Funktion zum Erstellen des Spielfelds
function createGrid() {
  // Das Spielfeld hat 10x10 Zellen
  for (var i = 0; i < 10; i++) {
    grid[i] = [];
    for (var j = 0; j < 10; j++) {
      // Jede Zelle hat eine x- und y-Koordinate, eine Breite und Höhe, und einen Typ
      // Der Typ ist entweder 0 (leer), 1 (Weg) oder 2 (Turm)
      grid[i][j] = {
        x: i * 50,
        y: j * 50,
        w: 50,
        h: 50,
        type: 0
      };
    }
  }
  // Der Weg der Gegner ist festgelegt
  grid[0][4].type = 1;
  grid[1][4].type = 1;
  grid[2][4].type = 1;
  grid[3][4].type = 1;
  grid[4][4].type = 1;
  grid[4][5].type = 1;
  grid[4][6].type = 1;
  grid[5][6].type = 1;
  grid[6][6].type = 1;
  grid[7][6].type = 1;
  grid[8][6].type = 1;
  grid[9][6].type = 1;
}

// Funktion zum Zeichnen des Spielfelds
function drawGrid() {
  // Jede Zelle wird entsprechend ihrem Typ gefärbt
  for (var i = 0; i < 10; i++) {
    for (var j = 0; j < 10; j++) {
      if (grid[i][j].type == 0) {
        ctx.fillStyle = "green"; // Leer: grün
      } else if (grid[i][j].type == 1) {
        ctx.fillStyle = "brown"; // Weg: braun
      } else if (grid[i][j].type == 2) {
        ctx.fillStyle = "gray"; // Turm: grau
      }
      // Die Zelle wird als Rechteck gezeichnet
      ctx.fillRect(grid[i][j].x, grid[i][j].y, grid[i][j].w, grid[i][j].h);
    }
  }
}

// Funktion zum Erstellen eines Turms normaler 
/*function createTower(x, y) {
  // Ein Turm hat eine x- und y-Koordinate, eine Breite und Höhe, eine Reichweite, einen Schaden, eine Feuerrate, einen Timer und ein Ziel
  var tower = {
    x: x,
    y: y,
    w: 50,
    h: 50,
    range: towerRange,
    damage: towerDamage,
    rate: towerRate,
    timer: 0,
	type: "normal",
	aoeRadius: 1,
    target: null
  };
  // Der Turm wird dem Array hinzugefügt
  towers.push(tower);
}*/

// Funktion zum Erstellen eines Turms aoe 
/*function createTower(x, y) {
  // Ein Turm hat eine x- und y-Koordinate, eine Breite und Höhe, eine Reichweite, einen Schaden, eine Feuerrate, einen Timer und ein Ziel
  var tower = {
    x: x,
    y: y,
    w: 50,
    h: 50,
    range: towerRange,
    damage: towerDamage,
    rate: towerRate,
    timer: 0,
	type: "normal",
	aoeRadius: 1,
    target: null
  };
  // Der Turm wird dem Array hinzugefügt
  towers.push(tower);
}*/

// Funktion zum Erstellen eines Turms slow single target oder stun 
function createTower(x, y) {
  // Ein Turm hat eine x- und y-Koordinate, eine Breite und Höhe, eine Reichweite, einen Schaden, eine Feuerrate, einen Timer und ein Ziel
  var tower = {
    x: x,
    y: y,
    w: 50,
    h: 50,
    range: towerRange,
    damage: towerDamage,
    rate: towerRate,
    timer: 0,
	type: "ice",
	aoeRadius: 1,
    target: null
  };
  // Der Turm wird dem Array hinzugefügt
  towers.push(tower);
}

// Funktion zum Zeichnen eines Turms
function drawTower(tower) {
  // Der Turm wird als Rechteck gezeichnet
  ctx.fillStyle = "gray";
  ctx.fillRect(tower.x, tower.y, tower.w, tower.h);
  // Der Turm hat einen Kreis, der seine Reichweite anzeigt
  ctx.strokeStyle = "gray";
  ctx.beginPath();
  ctx.arc(tower.x + tower.w / 2, tower.y + tower.h / 2, tower.range, 0, 2 * Math.PI);
  ctx.stroke();
  // Der Turm hat eine Linie, die sein Ziel anzeigt
  if (tower.target) {
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(tower.x + tower.w / 2, tower.y + tower.h / 2);
    ctx.lineTo(tower.target.x + tower.target.w / 2, tower.target.y + tower.target.h / 2);
    ctx.stroke();
	ctx.strokeStyle = "black";
	ctx.beginPath();
	ctx.arc(tower.target.x + tower.target.w/2, tower.target.y + tower.target.h/2 , tower.aoeRadius, 0, 2 * Math.PI);
	ctx.stroke();
  }
}

// Funktion zum Aktualisieren eines Turms normal
/*function updateTower(tower) {
  // Der Turm sucht nach einem Ziel in seiner Reichweite
  tower.target = null;
  for (var i = 0; i < enemies.length; i++) {
    var enemy = enemies[i];
    var dx = tower.x + tower.w / 2 - enemy.x - enemy.w / 2;
    var dy = tower.y + tower.h / 2 - enemy.y - enemy.h / 2;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < tower.range) {
      tower.target = enemy;
      break;
    }
  }
  // Der Turm schießt auf sein Ziel, wenn sein Timer abgelaufen ist
  if (tower.target && tower.timer <= 0) {
    tower.target.health -= tower.damage;
    tower.timer = tower.rate;
  }
  // Der Timer des Turms wird verringert
	
  if (tower.timer > 0) {
    tower.timer = tower.timer - 1*deltaTime;
  }
}*/

/* Funktion zum Aktualisieren eines Turms aoe
function updateTower(tower) {
  // Der Turm sucht nach einem Ziel in seiner Reichweite
  tower.target = null;
  for (var i = 0; i < enemies.length; i++) {
    var enemy = enemies[i];
    var dx = tower.x + tower.w / 2 - enemy.x - enemy.w / 2;
    var dy = tower.y + tower.h / 2 - enemy.y - enemy.h / 2;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < tower.range) {
      tower.target = enemy;
      break;
    }
  }
  // Der Turm schießt auf sein Ziel, wenn sein Timer abgelaufen ist
  if (tower.target && tower.timer <= 0) {
    // Flächenschaden hinzufügen
    for (var i = 0; i < enemies.length; i++) {
      var enemy = enemies[i];
      var dx = tower.target.x + tower.target.w / 2 - enemy.x - enemy.w / 2;
      var dy = tower.target.y + tower.target.h / 2 - enemy.y - enemy.h / 2;
      var dist = Math.sqrt(dx * dx + dy * dy);
      // Wenn der Feind innerhalb des Schadensradius ist, füge Schaden zu
      if (dist < tower.aoeRadius) {
        enemy.health -= tower.damage;
      }
    }
    tower.timer = tower.rate;
  }
  // Der Timer des Turms wird verringert
  if (tower.timer > 0) {
    tower.timer = tower.timer - 1*deltaTime;
  }
}*/

// Funktion zum Aktualisieren eines Turms slow
function updateTower(tower) {
  // Der Turm sucht nach einem Ziel in seiner Reichweite
  tower.target = null;
  for (var i = 0; i < enemies.length; i++) {
    var enemy = enemies[i];
    var dx = tower.x + tower.w / 2 - enemy.x - enemy.w / 2;
    var dy = tower.y + tower.h / 2 - enemy.y - enemy.h / 2;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < tower.range && !enemy.slowed) {
      // Wenn der Turm ein Eis-Turm ist, verlangsamt er alle Gegner in seiner Reichweite
      tower.target = enemy;
      break;
    }
  }
  // Der Turm schießt auf sein Ziel, wenn sein Timer abgelaufen ist
	  if (tower.target && tower.timer <= 0) {
		   if (tower.type === "ice") {
        enemy.speed *= towerSlowEffect;
		enemy.slowedTimer = 2000;
		enemy.slowed = true;
      }
		tower.target.health -= tower.damage;
		tower.timer = tower.rate;
      }
  // Der Timer des Turms wird verringert
  if (tower.timer > 0) {
    tower.timer = tower.timer - 1*deltaTime;
  }
}

// Funktion zum Erstellen eines Gegners
function createEnemy() {
  // Ein Gegner hat eine x- und y-Koordinate, eine Breite und Höhe, eine Geschwindigkeit, eine Richtung, eine Lebenspunkte und eine Belohnung
  var enemy = {
    x: 12,
    y: 213,
    w: 25,
    h: 25,
    speed: enemySpeed,
	normalSpeed : enemySpeed,
    dir: "right",
    health: enemyHealth,
	slowed: false,
	slowedTimer : 0,
    reward: enemyReward
  };
  // Der Gegner wird dem Array hinzugefügt
  enemies.push(enemy);
}

// Funktion zum Zeichnen eines Gegners
function drawEnemy(enemy) {
  // Der Gegner wird als Rechteck gezeichnet
  ctx.fillStyle = "blue";
  ctx.fillRect(enemy.x , enemy.y, enemy.w, enemy.h);
  // Der Gegner hat einen Balken, der seine Lebenspunkte anzeigt
  ctx.fillStyle = "black";
  ctx.fillRect(enemy.x, enemy.y - 10, enemy.w, 5);
  ctx.fillStyle = "green";
  ctx.fillRect(enemy.x, enemy.y - 10, enemy.w * enemy.health / enemyHealth, 5);
}

// Funktion zum Aktualisieren eines Gegners
function updateEnemy(enemy) {
  // Der Gegner bewegt sich entsprechend seiner Richtung
  if (enemy.slowed){
	  enemy.slowedTimer -= deltaTime;
	  if (enemy.slowedTimer <= 0){
		  enemy.slowed = false;
		  enemy.slowedTimer = 0;
		  enemy.speed = enemy.normalSpeed;
	  }
  }
  
  
  if (enemy.dir == "right") {
    enemy.x += enemy.speed;
  } else if (enemy.dir == "down") {
    enemy.y += enemy.speed;
  }
  // Der Gegner ändert seine Richtung, wenn er eine Zelle erreicht
  var i = Math.floor((enemy.x - 12.5) / 50);
  var j = Math.floor((enemy.y - 12.5) / 50);
  if(i> 0 && j>0 &&i<grid.length - 1 && j < grid[0].length - 1){
	  if (grid[i][j].type == 1) {
		if (grid[i + 1][j].type == 1 && enemy.dir != "right") {
		  enemy.dir = "right";
		} else if (grid[i][j + 1].type == 1 && enemy.dir != "down") {
		  enemy.dir = "down";
		}
	  }else if (grid[i][j].type == 2) {
		
	  }
  }
  // Der Gegner wird entfernt, wenn er das Ende des Weges erreicht oder keine Lebenspunkte mehr hat
  if (enemy.x + 25> canvas.width || enemy.health <= 0) {
    // Der Spieler bekommt Geld für das Töten eines Gegners
    if (enemy.health <= 0) {
      money += enemy.reward;
    }
    // Der Spieler verliert ein Leben, wenn ein Gegner das Ende des Weges erreicht
    else {
      lives--;
    }
    // Der Gegner wird aus dem Array entfernt
    var index = enemies.indexOf(enemy);
    enemies.splice(index, 1);
  }
}

// Funktion zum Erstellen einer Welle von Gegnern
function createWave() {
  // Die Welle wird erhöht
  wave++;
  // Die Anzahl der Gegner wird erhöht
  waveSize += 1;
  // Die Eigenschaften der Gegner werden erhöht
  enemySpeed += 0.1;
  enemyHealth += 5;
  enemyToSpawn = waveSize;
}

//löschen
var frameRate = 1000 / 60; // 60 fps
var once = true;

// Erstellen Sie eine Game Loop, die die updateGame und drawGame Funktionen aufruft
var gameLoop = setInterval(function() {
  var now = performance.now();
  deltaTime = now - lastTime;
  lastTime = now;
  spawnTimer += deltaTime;
  ctx.clear
  if(lives > 0){
	  if (once){
		 createGrid();
		 createWave();
		 createEnemy();
		 once=false;
	  }
	 
	if(enemies.length == 0 && enemyToSpawn == 0){
		createWave();
		
	}

	if(enemyToSpawn > 0 && spawnTimer >= spawnInterval){
		createEnemy();
		enemyToSpawn--;
		spawnTimer = 0;
	}
	
	  drawGrid()
	  towers.forEach(element => {
		 updateTower(element)
	  });

	  enemies.forEach(element => {
		 updateEnemy(element)
	  });

	  
	  towers.forEach(element => {
		 drawTower(element)
	  });
	  
	  enemies.forEach(element => {
		 drawEnemy(element)
	  });
	}
}, frameRate);

canvas.addEventListener('click', function(event) {
  // Ermittelt die x- und y-Koordinaten des Klicks relativ zum Canvas
  var rect = canvas.getBoundingClientRect();
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;

  // Ermittelt das Feld, auf das geklickt wurde
  var i = Math.floor(x / 50);
  var j = Math.floor(y / 50);

  // Gibt das geklickte Feld aus
  createTower(i * 50,j * 50);
 
});

