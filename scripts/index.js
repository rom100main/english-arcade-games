const channelGrid = document.getElementById('channelGrid');

games.forEach(game => {
    const gameElement = document.createElement('a');
    gameElement.href = game.link;
    gameElement.className = 'channel-item';
    
    gameElement.innerHTML = `
        <div class="channel-preview">
            <div class="channel-icon">${game.icon}</div>
        </div>
        <div class="channel-label">${game.name}</div>
    `;
    
    channelGrid.appendChild(gameElement);
});