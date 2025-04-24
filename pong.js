// Elementos
const menu     = document.getElementById('menu');
const btnFriend= document.getElementById('btnFriend');
const btnBot   = document.getElementById('btnBot');
const selScore = document.getElementById('maxScore');
const canvas   = document.getElementById('gameCanvas');
const ctx      = canvas.getContext('2d');

// Estado
let mode       = 'friend';
let maxScore   = 10;
let player1Y   = 250, player2Y = 250;
let ballX      = 400, ballY    = 300;
let ballVX     = 5,   ballVY   = 5;
let score1     = 0,   score2   = 0;
let ballMoving = false;

// Constantes
const pw = 10, ph = 100, bs = 10;
const keys = {};

// Listeners
btnFriend.addEventListener('click', () => startGame('friend'));
btnBot   .addEventListener('click', () => startGame('bot'));
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup',   e => keys[e.key] = false);

// Inicia o jogo
function startGame(selectedMode) {
  mode       = selectedMode;
  maxScore   = parseInt(selScore.value, 10);
  menu.style.display       = 'none';
  canvas.style.display     = 'block';
  initGame();
}

// Desenha retângulo (raquete)
function drawRect(x, y, w, h) {
  ctx.fillStyle = 'white';
  ctx.fillRect(x, y, w, h);
}

// Desenha bola
function drawBall() {
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(ballX, ballY, bs/2, 0, Math.PI*2);
  ctx.fill();
}

// Exibe vencedor
function displayWinner(winner) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = '40px monospace';
  ctx.fillText(`${winner} venceu!`, 300, 250);
  ctx.font = '20px monospace';
  ctx.fillText('Pressione R para reiniciar ou M para menu', 200, 300);
  cancelAnimationFrame(loopId);
}

// Reposiciona a bola após ponto
function resetBall(winner) {
  // Posiciona na frente de quem pontuou
  if (winner === 'Jogador 1') {
    ballX = 20 + pw + 1;
    ballY = player1Y + ph/2;
    ballVX = 5;
  } else if (winner === 'Jogador 2') {
    ballX = canvas.width - 20 - pw - 1;
    ballY = player2Y + ph/2;
    ballVX = -5;
  } else {
    ballX = canvas.width/2;
    ballY = canvas.height/2;
    ballVX = -ballVX;
  }
  ballVY     = (Math.random()>0.5?1:-1)*5;
  ballMoving = false;
  if (winner) return displayWinner(winner);
}

// Lógica de atualização
function update() {
  if (!ballMoving) {
    setTimeout(() => ballMoving = true, 2000);
    return;
  }

  // Jogador 1
  if (keys['w'] && player1Y>0) player1Y-=7;
  if (keys['s'] && player1Y<canvas.height-ph) player1Y+=7;

  // Jogador 2 ou IA
  if (mode==='friend') {
    if (keys['ArrowUp'] && player2Y>0) player2Y-=7;
    if (keys['ArrowDown'] && player2Y<canvas.height-ph) player2Y+=7;
  } else {
    const speed = 5;
    player2Y += (ballY < player2Y+ph/2? -speed: speed);
    player2Y = Math.max(0, Math.min(player2Y, canvas.height-ph));
  }

  // Bola
  ballX += ballVX;
  ballY += ballVY;

  // Colisão teto/chão
  if (ballY<=0 || ballY>=canvas.height-bs) ballVY*=-1;

  // Colisão raquetes
  if ((ballX<20 && ballY>player1Y && ballY<player1Y+ph) ||
      (ballX>canvas.width-20 && ballY>player2Y && ballY<player2Y+ph)) {
    ballVX *= -1;
  }

  // Pontuação
  if (ballX<0) {
    score2++;
    if (score2>=maxScore) return resetBall('Jogador 2');
    resetBall();
  }
  if (ballX>canvas.width) {
    score1++;
    if (score1>=maxScore) return resetBall('Jogador 1');
    resetBall();
  }
}

// Desenha cada frame
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawRect(10, player1Y, pw, ph);
  drawRect(canvas.width-20, player2Y, pw, ph);
  drawBall();
  ctx.font='20px monospace';
  ctx.fillText(`${score1} : ${score2}`, canvas.width/2-30, 30);
}

// Loop principal
let loopId;
function gameLoop() {
  update();
  draw();
  loopId = requestAnimationFrame(gameLoop);
}

// Inicializa variáveis e começa
function initGame() {
  score1=0; score2=0;
  player1Y = player2Y = canvas.height/2-ph/2;
  resetBall();
  gameLoop();
}

// Reinício por teclado
document.addEventListener('keydown', e => {
  if (!ballMoving && (e.key==='r'||e.key==='R')) location.reload();
  if (!ballMoving && (e.key==='m'||e.key==='M')) location.reload();
});
