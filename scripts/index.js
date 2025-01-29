const field = document.getElementById('field');
const player = document.getElementById('player');
const npcs = document.querySelectorAll('.npc');
const arcades = document.querySelectorAll('.arcade');
const dialog = document.getElementById('dialog');
const dialogText = document.getElementById('dialog-text');
const npcImage = document.getElementById('npc-image');
const playerImage = document.getElementById('player-image');

let lastKeyPressed = null;

let playerPosition = { x: 400, y: 300 };
let playerVelocity = { x: 0, y: 0 };
const speed = 10;

let hintElm = null;
let currentDialogIndex = 0;

let nearest = null;

function updatePlayerPosition() {
    playerPosition.x += playerVelocity.x;
    playerPosition.y += playerVelocity.y;
    player.style.left = `${playerPosition.x}px`;
    player.style.top = `${playerPosition.y}px`;
}

function checkInteraction() {
    nearest = null;
    let minDistance = Infinity;

    npcs.forEach(npc => {
        const maxDistance = Math.max(npc.clientWidth, npc.clientHeight) + Math.max(player.clientWidth, player.clientHeight);
        const distanceToNpc = Math.sqrt(
            Math.pow(playerPosition.x - npc.offsetLeft, 2) + Math.pow(playerPosition.y - npc.offsetTop, 2)
        );
        if (distanceToNpc < maxDistance && distanceToNpc < minDistance) {
            nearest = { type: 'npc', object: npc };
            minDistance = distanceToNpc;
        }
    });

    arcades.forEach(arcade => {
        const maxDistance = Math.max(arcade.clientWidth, arcade.clientHeight) + Math.max(player.clientWidth, player.clientHeight);
        const distanceToArcade = Math.sqrt(
            Math.pow(playerPosition.x - arcade.offsetLeft, 2) + Math.pow(playerPosition.y - arcade.offsetTop, 2)
        );
        if (distanceToArcade < maxDistance && distanceToArcade < minDistance) {
            nearest = { type: 'arcade', object: arcade };
            minDistance = distanceToArcade;
        }
    });

    if (nearest) {
        if (nearest.type === 'arcade') {
            showHint("Press 'E' to play", nearest.object);
        } else {
            showHint('E', nearest.object);
        }
    } else {
        hideHint();
        hideDialog();
    }
}

function showHint(key, element) {
    if (!hintElm) {
        hintElm = document.createElement('div');
        hintElm.classList.add('hint');
        field.appendChild(hintElm);
    }
    hintElm.textContent = key;
    hintElm.style.left = `${element.offsetLeft}px`;
    hintElm.style.top = `${element.offsetTop - element.clientHeight}px`;
}

function hideHint() {
    if (hintElm) {
        field.removeChild(hintElm);
        hintElm = null;
    }
}

function handleInteraction() {
    if (nearest) {
        if (nearest.type === 'npc') {
            showDialog(nearest.object.id);
        } else if (nearest.type === 'arcade') {
            window.location.href = arcadesInfo[nearest.object.id].link;
        }
    }
}

function showDialog(npcId) {
    if (dialogs[npcId] && dialogs[npcId][currentDialogIndex]) {
        const currentDialog = dialogs[npcId][currentDialogIndex];
        dialogText.textContent = currentDialog.text;
        npcImage.src = `assets/npc/${npcId}.png`;
        if (currentDialog.talking === 'npc') {
            playerImage.style.filter = 'grayscale(100%)';
            npcImage.style.filter = 'none';
        } else if (currentDialog.talking === 'player') {
            playerImage.style.filter = 'none';
            npcImage.style.filter = 'grayscale(100%)';
        }
        dialog.classList.remove('hidden');
        currentDialogIndex++;
    } else {
        hideDialog();
    }
}

function hideDialog() {
    dialog.classList.add('hidden');
    currentDialogIndex = 0;
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            playerVelocity.y = -speed;
            break;
        case 'ArrowDown':
            playerVelocity.y = speed;
            break;
        case 'ArrowLeft':
            playerVelocity.x = -speed;
            break;
        case 'ArrowRight':
            playerVelocity.x = speed;
            break;
        case 'e':
        case 'E':
            if (lastKeyPressed === 'e') {
                return;
            }
            lastKeyPressed = 'e';
            handleInteraction();
            break;
    }
    updatePlayerPosition();
    checkInteraction();
});

document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'ArrowUp':
        case 'ArrowDown':
            playerVelocity.y = 0;
            break;
        case 'ArrowLeft':
        case 'ArrowRight':
            playerVelocity.x = 0;
            break;
        case 'e':
        case 'E':
            lastKeyPressed = null;
            break;
    }
});

updatePlayerPosition();
checkInteraction();
