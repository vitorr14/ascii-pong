import { saveHighScore, getHighScores } from './highscore.js';

const canvas = document.getElementById('gameCanvas'),
      ctx    = canvas.getContext('2d'),
      menu   = document.getElementById('menu');
let mode='friend', maxScore=10, difficulty='medium';
let p1Y,p2Y,ballX,ballY,ballVX,ballVY,score1,score2,ballMoving, playerName='Anon';
let ballSpeed = 5;
const PW=10,PH=100,BS=10;
const keys={};
let paused = false;

window.addEventListener('resize', resizeCanvas);
document.addEventListener('keydown', e=>{
  keys[e.key]=true;
  if(e.key==='p' || e.key==='P') paused = !paused;
});
document.addEventListener('keyup', e=>keys[e.key]=false);

function resizeCanvas(){
  canvas.width  = Math.min(window.innerWidth-20,800);
  canvas.height = Math.min(window.innerHeight-40,600);
}
resizeCanvas();

function startGame(m){
  mode=m;
  maxScore  = +document.getElementById('maxScore').value;
  difficulty= document.getElementById('difficultySelect').value;
  const inputName = document.getElementById('playerName');
  if (inputName) playerName = inputName.value || 'Anon';
  menu.style.display='none';
  canvas.style.display='block';
  init();
}
function updateMaxScore(){ maxScore=+event.target.value; }

function init(){
  p1Y=p2Y=canvas.height/2-PH/2;
  score1=score2=0;
  ballSpeed = 5;
  resetBall();
  gameLoop();
}

function resetBall(winner){
  ballMoving=false;
  setTimeout(()=>ballMoving=true,2000);
  if(winner){
    displayWinner(winner);
    return;
  }
  ballX=canvas.width/2; ballY=canvas.height/2;
  const angle = (Math.random() * Math.PI/2 - Math.PI/4);
  ballVX = ballSpeed * (Math.random()>0.5?1:-1);
  ballVY = ballSpeed * Math.sin(angle);
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='white';
  ctx.font = '20px monospace';
  ctx.fillRect(0,0,canvas.width,2);
  ctx.fillRect(0,canvas.height-2,canvas.width,2);
  ctx.fillText(`${score1}`,canvas.width*0.25,30);
  ctx.fillText(`${score2}`,canvas.width*0.75,30);
  ctx.fillRect(10,p1Y,PW,PH);
  ctx.fillRect(canvas.width-20,p2Y,PW,PH);
  ctx.beginPath();
  ctx.arc(ballX,ballY,BS/2,0,2*Math.PI);
  ctx.fill();
  if (paused) {
    ctx.fillText('Pausado', canvas.width/2 - 40, canvas.height/2);
  }
}

function update(){
  if(!ballMoving || paused) return;
  if(keys['w'] && p1Y>2)               p1Y-=7;
  if(keys['s'] && p1Y<canvas.height-PH-2) p1Y+=7;
  if(mode==='friend'){
    if(keys['ArrowUp']   && p2Y>2)               p2Y-=7;
    if(keys['ArrowDown'] && p2Y<canvas.height-PH-2) p2Y+=7;
  } else {
    const speed = difficulty==='hard'?8:(difficulty==='medium'?5:3);
    const targetY = ballY + Math.random()*30 - 15;
    p2Y += (targetY > p2Y+PH/2? speed : -speed);
    p2Y = Math.max(2, Math.min(p2Y,canvas.height-PH-2));
  }
  ballX += ballVX; ballY += ballVY;
  if(ballY <= PH/2 || ballY >= canvas.height-PH/2) ballVY*=-1;
  if( (ballX<20 && ballY>p1Y && ballY<p1Y+PH) ||
      (ballX>canvas.width-20 && ballY>p2Y && ballY<p2Y+PH) ){
    ballVX*=-1;
  }
  if(ballX<0){
    score2++;
    ballSpeed += 0.5;
    if(score2>=maxScore){ saveHighScore(playerName,score2); return resetBall('Jogador 2'); }
    resetBall();
  }
  if(ballX>canvas.width){
    score1++;
    ballSpeed += 0.5;
    if(score1>=maxScore){ saveHighScore(playerName,score1); return resetBall('Jogador 1'); }
    resetBall();
  }
}

function displayWinner(w){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillText(`${w} venceu!`,canvas.width/2-100,canvas.height/2);
  ctx.fillText('R = reiniciar, M = menu',canvas.width/2-140,canvas.height/2+40);
  // Mostrar highscores
  const highs = getHighScores();
  highs.forEach((item, i) => {
    ctx.fillText(`${i+1}. ${item.name}: ${item.score}`, canvas.width/2-100, canvas.height/2 + 80 + i*30);
  });
}

document.addEventListener('keydown',e=>{
  if(!ballMoving && (e.key==='r'||e.key==='R')) init();
  if(!ballMoving && (e.key==='m'||e.key==='M')){
    canvas.style.display = 'none';
    menu.style.display = 'flex';
  }
});

window.onTouchMove = (ev, side)=>{
  ev.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const y = ev.touches[0].clientY - rect.top - PH/2;
  if(side==='left')  p1Y = Math.max(2, Math.min(y,canvas.height-PH-2));
  if(side==='right') p2Y = Math.max(2, Math.min(y,canvas.height-PH-2));
};

let loopId;
function gameLoop(){
  update(); draw();
  loopId = requestAnimationFrame(gameLoop);
}
