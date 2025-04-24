export function saveHighScore(name, score) {
  let list = JSON.parse(localStorage.getItem('pongHighscores')||'[]');
  list.push({name,score});
  list.sort((a,b)=>b.score-a.score);
  if(list.length>5) list.pop();
  localStorage.setItem('pongHighscores', JSON.stringify(list));
}
export function getHighScores() {
  return JSON.parse(localStorage.getItem('pongHighscores')||'[]');
}
