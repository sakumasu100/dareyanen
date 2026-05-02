const game = document.getElementById("game");
const playerEl = document.getElementById("player");
const hpEl = document.getElementById("hp");
const statusEl = document.getElementById("status");

// ゲーム全体で使う値
const state = {
  playerX: 80,
  playerWidth: 44,
  playerHeight: 72,
  moveSpeed: 5,
  hp: 5,
  punching: false,
  gameOver: false,
  keys: {
    left: false,
    right: false,
  },
  enemies: [],
  enemySpeed: 2,
  spawnTimer: 0,
  spawnInterval: 90, // 約1.5秒ごと(60fps想定)
};

// プレイヤー位置を画面に反映
function drawPlayer() {
  playerEl.style.left = `${state.playerX}px`;
}

// 敵を作る
function spawnEnemy() {
  const enemyEl = document.createElement("div");
  enemyEl.className = "enemy";

  const enemy = {
    x: game.clientWidth,
    width: 44,
    height: 72,
    el: enemyEl,
    hitCooldown: 0, // 連続ダメージ防止
  };

  enemyEl.style.left = `${enemy.x}px`;
  game.appendChild(enemyEl);
  state.enemies.push(enemy);
}

// 当たり判定(長方形同士)
function isHit(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x;
}

// パンチ開始
function startPunch() {
  if (state.punching || state.gameOver) return;

  state.punching = true;
  playerEl.classList.add("punching");

  // パンチ判定は前方に少し広げる
  const punchBox = {
    x: state.playerX + state.playerWidth,
    width: 28,
  };

  // 当たった敵を消す
  state.enemies = state.enemies.filter((enemy) => {
    const hit = isHit(punchBox, enemy);
    if (hit) {
      enemy.el.remove();
      return false;
    }
    return true;
  });

  // パンチは短時間で終了
  setTimeout(() => {
    state.punching = false;
    playerEl.classList.remove("punching");
  }, 180);
}

// ダメージ処理
function damagePlayer() {
  state.hp -= 1;
  hpEl.textContent = String(state.hp);

  if (state.hp <= 0) {
    state.gameOver = true;
    statusEl.textContent = "ゲームオーバー";
  }
}

// 毎フレーム更新
function update() {
  if (state.gameOver) return;

  // 左右移動
  if (state.keys.left) state.playerX -= state.moveSpeed;
  if (state.keys.right) state.playerX += state.moveSpeed;

  // 画面外に出ないようにする
  const maxX = game.clientWidth - state.playerWidth;
  state.playerX = Math.max(0, Math.min(maxX, state.playerX));
  drawPlayer();

  // 敵の出現タイマー
  state.spawnTimer += 1;
  if (state.spawnTimer >= state.spawnInterval) {
    state.spawnTimer = 0;
    spawnEnemy();
  }

  // 敵移動と当たり判定
  state.enemies = state.enemies.filter((enemy) => {
    enemy.x -= state.enemySpeed;
    enemy.el.style.left = `${enemy.x}px`;

    // プレイヤーと敵の横判定
    const playerBox = { x: state.playerX, width: state.playerWidth };
    if (enemy.hitCooldown > 0) enemy.hitCooldown -= 1;

    if (isHit(playerBox, enemy) && enemy.hitCooldown === 0) {
      damagePlayer();
      enemy.hitCooldown = 45; // 連続ヒットを少し抑える
    }

    // 画面左へ消えたら削除
    if (enemy.x + enemy.width < 0) {
      enemy.el.remove();
      return false;
    }

    // HP0になった瞬間、敵を全消し
    if (state.gameOver) {
      enemy.el.remove();
      return false;
    }

    return true;
  });

  requestAnimationFrame(update);
}

// キー入力
window.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft") state.keys.left = true;
  if (e.code === "ArrowRight") state.keys.right = true;

  if (e.code === "Space") {
    e.preventDefault();
    startPunch();
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft") state.keys.left = false;
  if (e.code === "ArrowRight") state.keys.right = false;
});

// 初期化
hpEl.textContent = String(state.hp);
drawPlayer();
requestAnimationFrame(update);
