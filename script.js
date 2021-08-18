const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

const mouse = {
    _x: null,
    _y: null
};
const click = {
    _x: null,
    _y: null
};

const menu = document.getElementById("menu");
const sword = document.getElementById("sword");
let swordRect = sword.getBoundingClientRect();
let topWall = document.getElementById("topWall").getBoundingClientRect();
let rightWall = document.getElementById("rightWall").getBoundingClientRect();
let bottomWall = document.getElementById("bottomWall").getBoundingClientRect();
let leftWall = document.getElementById("leftWall").getBoundingClientRect();
let centerX = 0;
let centerY = 0;
let collision = false;
let thrownSword = null;
let repulse = 30;
let swordAngle = 0;
const music = new Audio("Ludum Dare 38 - Track 2.wav");
music.volume = 0.38;
music.setAttribute("loop", "");
const playerSize = 15;
let a = false;
let w = false;
let s = false;
let d = false;
const speed = 4;
let enemiesKilled = 0;
let enemies = [];
const weps = {
    pistol: {damage: 50},
    drone: {damage: 50}
};
let bullets = [];
let particles = [];

window.addEventListener("keydown", e => {
    if(e.key.toLowerCase() == "a") a = true;
    if(e.key.toLowerCase() == "w") w = true;
    if(e.key.toLowerCase() == "s") s = true;
    if(e.key.toLowerCase() == "d") d = true;
});

window.addEventListener("keyup", e => {
    if(e.key.toLowerCase() == "a") a = false;
    if(e.key.toLowerCase() == "w") w = false;
    if(e.key.toLowerCase() == "s") s = false;
    if(e.key.toLowerCase() == "d") d = false;
});

window.addEventListener("mousemove", e => {
    mouse._x = e.clientX;
    mouse._y = e.clientY;
});

function openFullscreen() {
    if(document.getElementsByTagName("html")[0].requestFullscreen) document.getElementsByTagName("html")[0].requestFullscreen();
    else if(document.getElementsByTagName("html")[0].webkitRequestFullscreen) document.getElementsByTagName("html")[0].webkitRequestFullscreen();
    else if(document.getElementsByTagName("html")[0].msRequestFullscreen) document.getElementsByTagName("html")[0].msRequestFullscreen();
}
function tryAgain(){
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    document.getElementById("youLose").style.visibility = "hidden";
    canvas.style.pointerEvents = "auto";
    document.getElementById("highscore").innerHTML = "HIGHSCORE: " + localStorage.getItem("highscore") * 1;
    a = false;
    w = false;
    s = false;
    d = false;
    bullets = [];
    particles = [];
    enemies = [];
    enemiesKilled = 0;
    player._hp = 100;
    player._x = innerWidth/2 - playerSize/2;
    player._y = innerHeight/2 - playerSize/2;
    document.getElementById("repulse").value = 30;
    document.getElementById("hp").value = 100;
    enemiesInterval = setInterval(newEnemy, 1500);
    animate();
}
function newEnemy(){
    if(enemiesKilled < 5){
        enemies.push(
            new BasicEnemy(Math.random() < 0.5 ? canvas.width * 0.075 - playerSize/2 : canvas.width - (canvas.width * 0.075 - playerSize/2),
                           Math.random() < 0.5 ? canvas.height * 0.075 - playerSize/2 : canvas.height - (canvas.height * 0.075 - playerSize/2))
        );
    } else if(enemiesKilled < 10){
        let randomNum = Math.floor(Math.random() * 2) + 1;
        if(randomNum == 1){
            enemies.push(
                new BasicEnemy(Math.random() < 0.5 ? canvas.width * 0.075 - playerSize/2 : canvas.width - (canvas.width * 0.075 - playerSize/2),
                               Math.random() < 0.5 ? canvas.height * 0.075 - playerSize/2 : canvas.height - (canvas.height * 0.075 - playerSize/2))
            );
        } else{
            enemies.push(
                new ShotgunEnemy(Math.random() < 0.5 ? canvas.width * 0.075 - playerSize/2 : canvas.width - (canvas.width * 0.075 - playerSize/2),
                                 Math.random() < 0.5 ? canvas.height * 0.075 - playerSize/2 : canvas.height - (canvas.height * 0.075 - playerSize/2))
            );
        }
    } else{
        let randomNum = Math.floor(Math.random() * 3) + 1;
        if(randomNum == 1){
            enemies.push(
                new BasicEnemy(Math.random() < 0.5 ? canvas.width * 0.075 - playerSize/2 : canvas.width - (canvas.width * 0.075 - playerSize/2),
                               Math.random() < 0.5 ? canvas.height * 0.075 - playerSize/2 : canvas.height - (canvas.height * 0.075 - playerSize/2))
            );
        } else if(randomNum == 2){
            enemies.push(
                new ShotgunEnemy(Math.random() < 0.5 ? canvas.width * 0.075 - playerSize/2 : canvas.width - (canvas.width * 0.075 - playerSize/2),
                                 Math.random() < 0.5 ? canvas.height * 0.075 - playerSize/2 : canvas.height - (canvas.height * 0.075 - playerSize/2))
            );
        } else{
            enemies.push(
                new DroneEnemy(Math.random() < 0.5 ? canvas.width * 0.075 - playerSize/2 : canvas.width - (canvas.width * 0.075 - playerSize/2),
                                 Math.random() < 0.5 ? canvas.height * 0.075 - playerSize/2 : canvas.height - (canvas.height * 0.075 - playerSize/2))
            );
        }
    }
}
function* throwSword(){
    let hit = false;
    while(!hit || !(
        Math.abs((player._x + playerSize/2) - centerX) <= 7.5 && 
        Math.abs((player._y + playerSize/2) - centerY) <= 7.5)){

        if(Math.abs(centerX - click._x) <= 4 && 
        Math.abs(centerY - click._y) <= 4) hit = true;
        if(collision){
            collision = false;
            hit = true;
        } if(hit){
            click._x = player._x + playerSize/2;
            click._y = player._y + playerSize/2;
        }
        swordAngle += Math.PI / 15;
        sword.style.transform = "rotate("+(swordAngle * 180 / Math.PI)+"deg)";
        let angle = Math.atan2(centerY - click._y, centerX - click._x);
        centerX -= Math.cos(angle) * speed * 1.8;
        centerY -= Math.sin(angle) * speed * 1.8;
        sword.style.top = (centerY - 2.5) + "px";
        sword.style.left = (centerX - 25) + "px";
        yield;

    }
}
function* forceRepulse(){
    document.getElementById("repulse").value = 0;
    let _edge = 1;
    bullets.forEach((bullet, index) => {
        if(Math.abs(player._x + playerSize/2 - (bullet._x + bullet._bulletSize/2)) <= 120 && Math.abs(player._y + playerSize/2 - (bullet._y + bullet._bulletSize/2)) <= 120){
            bullet._angle = Math.atan2(player._y + playerSize/2 - bullet._y, player._x + playerSize/2 - bullet._x);
            bullet._teamPlayer = "bounced";
        }
    });
    while(_edge <= 120){
        ctx.strokeStyle = "rgba(255, 255, 255, " + _edge/120 + ")";
        ctx.beginPath();
        ctx.arc(player._x + playerSize/2, player._y + playerSize/2, _edge, 0, Math.PI * 2);
        ctx.stroke();
        _edge += 5;
        ctx.strokeStyle = "black";
        yield;
    }
}

class Player{
    constructor(x, y){
        this._x = x;
        this._y = y;
        this._angle = 0;
        this._hp = 100;
        this._damage = 50;
        this._color = "white";
        this._target = mouse;
        this._thrown = false;
        this._shootSound = new Audio("shoot.wav");
    }

    update(){
        if(a && this._x > speed && 
           !(this._y <= topWall.bottom && Math.abs(this._x + playerSize/2 - topWall.right) <= speed * 2) && 
           !(this._y + playerSize >= bottomWall.top && Math.abs(this._x + playerSize/2 - bottomWall.right) <= speed * 2) && 
           !(this._y + playerSize >= leftWall.top && this._y <= leftWall.bottom && Math.abs(this._x + playerSize/2 - leftWall.right) <= speed * 2)) this._x -= speed;
        if(w && this._y > speed && 
           !(this._x <= leftWall.right && Math.abs(this._y + playerSize/2 - leftWall.bottom) <= speed * 2) && 
           !(this._x + playerSize >= rightWall.left && Math.abs(this._y + playerSize/2 - rightWall.bottom) <= speed * 2) && 
           !(this._x + playerSize >= topWall.left && this._x <= topWall.right && Math.abs(this._y + playerSize/2 - topWall.bottom) <= speed * 2)) this._y -= speed;
        if(s && this._y + playerSize + speed < canvas.height && 
           !(this._x <= leftWall.right && Math.abs(this._y + playerSize/2 - leftWall.top) <= speed * 2) && 
           !(this._x + playerSize >= rightWall.left && Math.abs(this._y + playerSize/2 - rightWall.top) <= speed * 2) && 
           !(this._x + playerSize >= bottomWall.left && this._x <= bottomWall.right && Math.abs(this._y + playerSize/2 - bottomWall.top) <= speed * 2)) this._y += speed;
        if(d && this._x + playerSize + speed < canvas.width && 
           !(this._y <= topWall.bottom && Math.abs(this._x + playerSize/2 - topWall.left) <= speed * 2) && 
           !(this._y + playerSize >= bottomWall.top && Math.abs(this._x + playerSize/2 - bottomWall.left) <= speed * 2) && 
           !(this._y + playerSize >= rightWall.top && this._y <= rightWall.bottom && Math.abs(this._x + playerSize/2 - rightWall.left) <= speed * 2)) this._x += speed;
        this._angle = Math.atan2(this._y + playerSize/2 - this._target._y, this._x + playerSize/2 - this._target._x);
        if(!this._thrown){
            sword.style.top = (this._y + playerSize/2 - 2.5) + "px";
            sword.style.left = (this._x + playerSize/2 - 25) + "px";
            sword.style.transform = "rotate("+(this._angle * 180 / Math.PI)+"deg) translate(-32.5px)";
            swordAngle = this._angle;
            centerX = this._x + playerSize/2;
            centerY = this._y + playerSize/2;
        }
    }
    draw(){
        this._angle = Math.atan2(this._y + playerSize/2 - this._target._y, this._x + playerSize/2 - this._target._x);
        ctx.save();
        ctx.translate(this._x + playerSize/2, this._y + playerSize/2);
        ctx.rotate(this._angle);
        ctx.fillStyle = this._color;
        ctx.fillRect(-playerSize/2, -playerSize/2, playerSize, playerSize);
        ctx.restore();
    }
}
class Bullet{
    constructor(x, y, angle, teamPlayer, type, color){
        this._x = x;
        this._y = y;
        this._teamPlayer = teamPlayer;
        this._color = color;
        this._type = type;
        this._angle = angle;
        this._bulletSize = 8;
        this._cooldown = 50;
        this._lifeTime = 350;
        this._hitSound = new Audio("hit.wav");
        this._hitSound.volume = 0.7;
    }
    update(){
        this._x -= Math.cos(this._angle) * speed * 1.5;
        this._y -= Math.sin(this._angle) * speed * 1.5;
        this._lifeTime--;
        if((this._y <= topWall.bottom && Math.abs(this._x + this._bulletSize/2 - topWall.left) <= 4) ||
          (this._y <= topWall.bottom && Math.abs(this._x + this._bulletSize/2 - topWall.right) <= 4) ||
          (this._y + this._bulletSize >= bottomWall.top && Math.abs(this._x + this._bulletSize/2 - bottomWall.left) <= 4) ||
          (this._y + this._bulletSize >= bottomWall.top && Math.abs(this._x + this._bulletSize/2 - bottomWall.right) <= 4) ||
          (this._y + this._bulletSize >= leftWall.top && this._y <= leftWall.bottom && Math.abs(this._x + this._bulletSize/2 - leftWall.right) <= 4) ||
          (this._y + this._bulletSize >= rightWall.top && this._y <= rightWall.bottom && Math.abs(this._x + this._bulletSize/2 - rightWall.left) <= 4)){
            this._angle = this._angle >= 0 ? Math.PI - this._angle : -Math.PI - this._angle;
        }
        if((this._x <= leftWall.right && Math.abs(this._y + this._bulletSize/2 - leftWall.top) <= 4) ||
          (this._x <= leftWall.right && Math.abs(this._y + this._bulletSize/2 - leftWall.bottom) <= 4) ||
          (this._x + this._bulletSize >= rightWall.left && Math.abs(this._y + this._bulletSize/2 - rightWall.top) <= 4) ||
          (this._x + this._bulletSize >= rightWall.left && Math.abs(this._y + this._bulletSize/2 - rightWall.bottom) <= 4) ||
          (this._x + this._bulletSize >= topWall.left && this._x <= topWall.right && Math.abs(this._y + this._bulletSize/2 - topWall.bottom) <= 4) ||
          (this._x + this._bulletSize >= bottomWall.left && this._x <= bottomWall.right && Math.abs(this._y + this._bulletSize/2 - bottomWall.top) <= 4)){
            this._angle *= -1;
        }
        /*if(Math.abs(this._x - swordRect.left) < this._bulletSize ||
          Math.abs(this._x + this._bulletSize - swordRect.right) < this._bulletSize ||
          Math.abs(this._y - swordRect.top) < this._bulletSize ||
          Math.abs(this._y + this._bulletSize - swordRect.bottom) < this._bulletSize)*/
        for(var i = 1; i <= 10; i++){
            //const swordX = swordRect.x - Math.cos(player._angle) * 5 * i;
            //const swordY = swordRect.y + Math.sin(player._angle) * 5 * i;
            let swordX = centerX - Math.cos(player._angle) * 57.5 + Math.cos(player._angle) * 5 * i;
            let swordY = centerY - Math.sin(player._angle) * 57.5 + Math.sin(player._angle) * 5 * i;
            if(player._thrown){
                swordX = centerX - Math.cos(swordAngle) * 25 + Math.cos(swordAngle) * 5 * i;
                swordY = centerY - Math.sin(swordAngle) * 25 + Math.sin(swordAngle) * 5 * i;
            }
            if(Math.abs(this._x + this._bulletSize/2 - swordX) <= 8 && Math.abs(swordY - (this._y + this._bulletSize/2)) <= 8){
                //this._angle -= Math.PI/2 * lastSwingDirection;
                //let playerAngle = player._angle < 0 ? -player._angle + Math.PI : player._angle;
                //let bulletAngle = this._angle < 0 ? -this._angle + Math.PI : this._angle;
                //this._angle = playerAngle + bulletAngle;
                //let ratio = Math.PI/2 / (Math.abs(player._angle) - Math.abs(this._angle))
                let angle = swordAngle - this._angle;
                if(Math.PI - Math.abs(angle) <= .12) this._angle += Math.PI;
                else this._angle = swordAngle + angle;
                this._teamPlayer = "bounced";
                this._x -= Math.cos(this._angle) * speed * 1.5;
                this._y -= Math.sin(this._angle) * speed * 1.5;
                break;
            }
        }
    }
    draw(){
        let _enemy = enemies.filter((item, index) => this._x + this._bulletSize >= item._x && this._x <= item._x + playerSize && this._y + this._bulletSize >= item._y && this._y <= item._y + playerSize)[0];
        if(_enemy != undefined && (this._teamPlayer || this._teamPlayer == "bounced")){
            _enemy._hp -= weps[this._type].damage;
            this._hitSound.play();
            bullets.splice(bullets.indexOf(this), 1);
        } else if(this._x + this._bulletSize >= player._x && this._x <= player._x + playerSize && this._y + this._bulletSize >= player._y && this._y <= player._y + playerSize && (!this._teamPlayer || this._teamPlayer == "bounced")){
            player._hp -= 20;
            document.getElementById("hp").value = player._hp;
            this._hitSound.play();
            bullets.splice(bullets.indexOf(this), 1);
        } else if(this._x > canvas.width || this._y > canvas.height || this._x < 0 || this._y < 0 || this._lifeTime <= 0){
            bullets.splice(bullets.indexOf(this), 1);
        } else{
            ctx.save();
            ctx.translate(this._x + this._bulletSize/2, this._y + this._bulletSize/2);
            ctx.rotate(this._angle);
            ctx.fillStyle = this._color;
            ctx.fillRect(-this._bulletSize/2, -this._bulletSize/2, this._bulletSize, this._bulletSize);
            if(this._type == "drone"){
                if(this._cooldown == 0) {
                    bullets.push(new Bullet(this._x, this._y, Math.atan2(this._y + this._bulletSize/2 - player._y, this._x + this._bulletSize/2 - player._x), this._teamPlayer, "pistol", "blue"));
                    this._cooldown = 50;
                }
            }
            ctx.restore();
            if(this._cooldown != 0) this._cooldown--;
        }
    }
}
class Enemy extends Player{
    constructor(x, y){
        super(x, y);
        this._target = player;
        this._shootCooldown = 80;
        this._damage = 20;
        this._dieSound = new Audio("die.wav");;
    }
    update(){
        let _randomNum = Math.random() - .5;
        let moveX = Math.cos(this._angle + _randomNum) * speed * .7;
        let moveY = Math.sin(this._angle + _randomNum) * speed * .7;
        if(!(this._y <= topWall.bottom && Math.abs(this._x + playerSize/2 - topWall.right - moveX) <= speed * 2) && 
           !(this._y + playerSize >= bottomWall.top && Math.abs(this._x + playerSize/2 - bottomWall.right - moveX) <= speed * 2) && 
           !(this._y + playerSize >= leftWall.top && this._y <= leftWall.bottom && Math.abs(this._x + playerSize/2 - leftWall.right - moveX) <= speed * 2) && 
           !(this._y <= topWall.bottom && Math.abs(this._x + playerSize/2 - topWall.left - moveX) <= speed * 2) && 
           !(this._y + playerSize >= bottomWall.top && Math.abs(this._x + playerSize/2 - bottomWall.left - moveX) <= speed * 2) && 
           !(this._y + playerSize >= rightWall.top && this._y <= rightWall.bottom && Math.abs(this._x + playerSize/2 - rightWall.left - moveX) <= speed * 2)) this._x -= Math.cos(this._angle + _randomNum) * speed * .7;
        if(!(this._x <= leftWall.right && Math.abs(this._y + playerSize/2 - leftWall.bottom - moveY) <= speed * 2) && 
           !(this._x + playerSize >= rightWall.left && Math.abs(this._y + playerSize/2 - rightWall.bottom - moveY) <= speed * 2) && 
           !(this._x + playerSize >= topWall.left && this._x <= topWall.right && Math.abs(this._y + playerSize/2 - topWall.bottom - moveY) <= speed * 2) && 
           !(this._x <= leftWall.right && Math.abs(this._y + playerSize/2 - leftWall.top - moveY) <= speed * 2) && 
           !(this._x + playerSize >= rightWall.left && Math.abs(this._y + playerSize/2 - rightWall.top - moveY) <= speed * 2) && 
           !(this._x + playerSize >= bottomWall.left && this._x <= bottomWall.right && Math.abs(this._y + playerSize/2 - bottomWall.top - moveY) <= speed * 2)) this._y -= Math.sin(this._angle + _randomNum) * speed * .7;
        
        for(var i = 1; i <= 10; i++){
            let swordX = centerX - Math.cos(player._angle) * 57.5 + Math.cos(player._angle) * 5 * i;
            let swordY = centerY - Math.sin(player._angle) * 57.5 + Math.sin(player._angle) * 5 * i;
            if(player._thrown){
                swordX = centerX - Math.cos(swordAngle) * 25 + Math.cos(swordAngle) * 5 * i;
                swordY = centerY - Math.sin(swordAngle) * 25 + Math.sin(swordAngle) * 5 * i;
            }
            if(Math.abs(this._x + playerSize/2 - swordX) <= 3.2 + playerSize/2 && Math.abs(swordY - (this._y + playerSize/2)) <= 3.2 + playerSize/2){
                let _hitSound = new Audio("hit.wav");
                _hitSound.play();
                this._hp -= player._thrown ? 100 : 50;
                if(player._thrown) collision = true;
                break;
            }
        }
        this._shootCooldown--;
        if(this._shootCooldown == 0){
            this.shoot();
            this._shootCooldown = 80;
        }
        if(this._hp <= 0) {
            this._dieSound.play();
            for(var i = 0; i < 12; i++) particles.push(new Explosion(this._x + playerSize/2, this._y + playerSize/2, this._color));
            enemiesKilled++;
            enemies.splice(enemies.indexOf(this), 1);
        }
    }
}
class BasicEnemy extends Enemy{
    constructor(x, y){
        super(x, y);
        this._color = "red";
    }
    shoot(){
        this._shootSound.currentTime = 0;
        this._shootSound.play();
        bullets.push(new Bullet(this._x + 3.5, this._y + 3.5, Math.atan2(this._y + playerSize/2 - player._y, this._x + playerSize/2 - player._x), false, "pistol", this._color));
    }
}
class ShotgunEnemy extends Enemy{
    constructor(x, y){
        super(x, y);
        this._color = "yellow";
    }
    shoot(){
        this._shootSound.currentTime = 0;
        this._shootSound.play();
        for(var i = 0; i < 4; i++){
            let randomNum = Math.random() * 56 - 28;
            bullets.push(new Bullet(this._x + 3.5, this._y + 3.5, Math.atan2(this._y + playerSize/2 - player._y - randomNum, this._x + playerSize/2 - player._x - randomNum), false, "pistol", this._color));
        }
    }
}
class DroneEnemy extends Enemy{
    constructor(x, y){
        super(x, y);
        this._color = "blue";
    }
    shoot(){
        this._shootSound.currentTime = 0;
        this._shootSound.play();
        bullets.push(new Bullet(this._x + 3.5, this._y + 3.5, Math.atan2(this._y + playerSize/2 - player._y, this._x + playerSize/2 - player._x), false, "drone", this._color));
    }
}
class Explosion{
    constructor(x, y, color){
        this._x = x;
        this._y = y;
        this._color = color;
        this._speed = Math.random() * speed;
        this._angle = Math.random() * Math.PI * 2;
        this._size = Math.random() * 5 + 2;
        this._edge = 20;
    }
    update(){
        this._x -= Math.cos(this._angle) * this._speed;
        this._y -= Math.sin(this._angle) * this._speed;
    }
    draw(){
        ctx.save();
        ctx.translate(this._x + this._size/2, this._y + this._size/2);
        ctx.rotate(this._angle);
        ctx.fillStyle = this._color;
        ctx.fillRect(-this._size/2, -this._size/2, this._size, this._size);
        ctx.restore();
        this._edge--;
        if(this._edge == 0) particles.splice(particles.indexOf(this), 1);
    }
}

window.addEventListener("resize", _ => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    topWall = document.getElementById("topWall").getBoundingClientRect();
    rightWall = document.getElementById("rightWall").getBoundingClientRect();
    bottomWall = document.getElementById("bottomWall").getBoundingClientRect();
    leftWall = document.getElementById("leftWall").getBoundingClientRect();
});
const player = new Player(innerWidth/2 - playerSize/2, innerHeight/2 - playerSize/2);
function animate(){
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.update();
    player.draw();
    if(thrownSword != null){
        let nextValue = thrownSword.next();
        if(nextValue.done == true){
            thrownSword = null;
            player._thrown = false;
        }
    }
    if(typeof repulse == "number" && repulse != 30){
        repulse++;
        document.getElementById("repulse").value = repulse;
    }
    else if(typeof repulse != "number"){
        let nextValue = repulse.next();
        if(nextValue.done == true) repulse = 0;
        else{
            let nextValue = repulse.next();
            if(nextValue.done == true) repulse = 0;
            else{
                let nextValue = repulse.next();
                if(nextValue.done == true) repulse = 0;
            }
        }
    }
    for(var i = 0; i < bullets.length; i++){
        bullets[i].update();
        bullets[i].draw();
    }
    for(var i = 0; i < enemies.length; i++){
        enemies[i].update();
        if(enemies[i] != undefined) enemies[i].draw();
    }
    for(var i = 0; i < particles.length; i++){
        particles[i].update();
        particles[i].draw();
    }
    if(player._hp <= 0){
        canvas.style.pointerEvents = "none";
        document.getElementById("enemiesDestroyed").innerHTML = enemiesKilled;
        document.getElementById("youLose").style.visibility = "visible";
        if(enemiesKilled > localStorage.getItem("highscore") * 1) localStorage.setItem("highscore", enemiesKilled);
        clearInterval(enemiesInterval);
    } else requestAnimationFrame(animate);
}
document.getElementById("play").addEventListener("click", function(){
    animate();
    enemiesInterval = setInterval(newEnemy, 1500);
    document.getElementById("highscore").innerHTML = "HIGHSCORE: " + localStorage.getItem("highscore") * 1;
    menu.style.visibility = 'hidden';
    document.querySelector("footer").style.visibility = 'hidden';
    document.getElementById("info").style.visibility = 'hidden';
    music.play();
    openFullscreen();
    
    canvas.addEventListener("click", e => {
        if(!player._thrown){
            player._shootSound.currentTime = 0;
            player._shootSound.play();
            click._x = e.clientX;
            click._y = e.clientY;
            player._thrown = true;
            thrownSword = throwSword();
        }
    });
    canvas.addEventListener("contextmenu", e => {
        e.preventDefault();
        if(repulse == 30) repulse = forceRepulse();
        return false;
    });
});
document.getElementById("tryAgain").addEventListener("click", tryAgain);