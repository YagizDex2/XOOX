let currentPlayer = '🐝';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let beeCount = 0;
let honeyCount = 0;
let selectedCell = null;
let beeScore = 0;
let honeyScore = 0;

const statusDisplay = document.getElementById('status');
const cells = document.querySelectorAll('.cell');
const restartBtn = document.getElementById('restartBtn');
const clickSound = document.getElementById('clickSound');
const backgroundMusic = document.getElementById('backgroundMusic');
const volumeSlider = document.getElementById('volumeSlider');
const winnerDisplay = document.getElementById('winnerDisplay');
const winnerEmoji = document.querySelector('.winner-emoji');
const winnerText = document.querySelector('.winner-text');
const beeVictorySound = document.getElementById('beeVictorySound');
const honeyVictorySound = document.getElementById('honeyVictorySound');
const beeScoreDisplay = document.getElementById('beeScore');
const honeyScoreDisplay = document.getElementById('honeyScore');
const resetScoresBtn = document.getElementById('resetScores');
const beeMovesLeft = document.getElementById('beeMovesLeft');
const honeyMovesLeft = document.getElementById('honeyMovesLeft');
const muteButton = document.getElementById('muteButton');
let previousVolume = 0.25; // Varsayılan ses seviyesi

// Oyun durumunu takip etmek için yeni değişkenler
let isExpandedBoard = false;  // Tahta genişletildi mi?
let extraPieceAdded = false; // Ekstra taş eklendi mi?

// Tahta boyutunu takip etmek için yeni değişken
let boardSize = 3;

// Global değişkenler kısmına ekleyelim
let winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],  // Yatay
    [0, 3, 6], [1, 4, 7], [2, 5, 8],  // Dikey
    [0, 4, 8], [2, 4, 6]              // Çapraz
];

// Oyun modu değişkeni
let isClassicMode = true;

// Skorları ayrı tutmak için yeni değişkenler ekleyelim
let classicScores = { x: 0, o: 0 };
let beeScores = { bee: 0, honey: 0 };

// Üst üste kazanma sayısını tutmak için yeni değişkenler
let consecutiveWins = {
    x: 0,
    o: 0,
    bee: 0,
    honey: 0
};

// DOM elementleri
const gameModeSelect = document.getElementById('gameModeSelect');
const gameContainer = document.getElementById('gameContainer');
const classicModeBtn = document.getElementById('classicMode');
const beeModeBtn = document.getElementById('beeMode');
const switchModeBtn = document.getElementById('switchMode');
const currentModeText = document.getElementById('currentMode');
const mainMenu = document.getElementById('mainMenu');
const optionsMenu = document.getElementById('optionsMenu');
const playButton = document.getElementById('playButton');
const optionsButton = document.getElementById('optionsButton');
const backFromOptions = document.getElementById('backFromOptions');
const backToMenu = document.getElementById('backToMenu');
const backToMainMenu = document.getElementById('backToMainMenu');
const musicIcon = document.querySelector('.music-icon');
const slider = document.querySelector('.slider');
let sliderTimeout;
let isSliderDragging = false;

// Mod seçim olayları
classicModeBtn.addEventListener('click', () => startGame(true));
beeModeBtn.addEventListener('click', () => startGame(false));

// Ana menü olayları
playButton.addEventListener('click', () => {
    mainMenu.style.display = 'none';
    gameModeSelect.style.display = 'block';
});

optionsButton.addEventListener('click', () => {
    mainMenu.style.display = 'none';
    optionsMenu.style.display = 'block';
});

// Geri dönüş butonları
backFromOptions.addEventListener('click', () => {
    optionsMenu.style.display = 'none';
    mainMenu.style.display = 'block';
    document.body.classList.add('menu-open');
});

backToMenu.addEventListener('click', () => {
    gameModeSelect.style.display = 'none';
    mainMenu.style.display = 'block';
    document.body.classList.add('menu-open');
});

backToMainMenu.addEventListener('click', () => {
    document.body.classList.add('menu-open');
    gameContainer.style.display = 'none';
    mainMenu.style.display = 'block';
    // Oyunu sıfırla
    restartGameWithoutMusic();
    // Müziği durdur
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
});

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.add('menu-open');
    mainMenu.style.display = 'block';
    gameModeSelect.style.display = 'none';
    gameContainer.style.display = 'none';
    optionsMenu.style.display = 'none';
});

function startGame(isClassic) {
    document.body.classList.remove('menu-open');
    isClassicMode = isClassic;
    gameModeSelect.style.display = 'none';
    gameContainer.style.display = 'block';
    document.body.classList.remove('mode-select');
    
    // Oyun başlangıcında müziği başlat
    if (backgroundMusic.paused) {
        backgroundMusic.play();
    }
    
    // Oyun başlangıcında tüm consecutive win sayaçlarını sıfırla
    consecutiveWins = { x: 0, o: 0, bee: 0, honey: 0 };
    
    // İlk oyuncu seçimi
    currentPlayer = isClassic ? '❌' : '🐝';
    
    // Oyunu başlat
    restartGame();
    
    // Mod değiştirme butonunu göster
    switchModeBtn.style.display = 'flex';
    
    if (isClassic) {
        // Klasik mod ayarları
        document.body.classList.add('classic-mode');
        gameContainer.classList.add('classic-mode');
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.add('classic-mode');
        });
        
        // Skor tablosunu güncelle
        document.querySelectorAll('.score-item').forEach((item, index) => {
            const emoji = item.querySelector('.score-emoji');
            const score = item.querySelector('span:nth-child(2)');
            const text = item.lastChild;
            if (index === 0) {
                emoji.textContent = '❌';
                score.textContent = classicScores.x;
                text.textContent = ' Zafer';
            } else {
                emoji.textContent = '⭕';
                score.textContent = classicScores.o;
                text.textContent = ' Zafer';
            }
        });
        
        document.querySelector('.power-ups').style.display = 'none';
        document.querySelector('.moves-left').style.display = 'none';
        document.querySelector('.moving-title').style.display = 'none';
        document.getElementById('developmentBanner').style.display = 'none';
        currentModeText.textContent = 'Arılı Moda Geç';
        switchModeBtn.classList.add('bee');
        updateBoardLayout();
    } else {
        // Arılı mod ayarları
        document.body.classList.remove('classic-mode');
        gameContainer.classList.remove('classic-mode');
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('classic-mode');
            cell.style.backgroundImage = 'url(\'./bal_petek2.png\')';
        });
        document.querySelector('.power-ups').style.display = 'block';
        document.querySelector('.moves-left').style.display = 'block';
        document.querySelector('.moving-title').style.display = 'inline-block';
        document.getElementById('developmentBanner').style.display = 'block';
        gameContainer.classList.add('bee-mode');
        currentModeText.textContent = 'Klasik Moda Geç';
        switchModeBtn.classList.add('classic');
        updateBoardLayout();
    }
}

// Tahtayı yeniden oluşturan fonksiyon
function rebuildBoard(newSize) {
    boardSize = newSize;
    const board = document.getElementById('board');
    board.innerHTML = '';
    
    // Tahta boyutuna göre hücre boyutunu ayarla
    const maxBoardWidth = 800; // Maksimum tahta genişliği (piksel)
    const cellSize = Math.min(150, Math.floor((maxBoardWidth - (newSize-1) * 10) / newSize));
    
    // Grid yapısını güncelle
    board.style.gridTemplateColumns = `repeat(${newSize}, ${cellSize}px)`;
    board.style.width = `${newSize * cellSize + (newSize-1) * 10}px`;
    
    // Yeni gameBoard array'ini oluştur
    const totalCells = newSize * newSize;
    gameBoard = new Array(totalCells).fill('');
    
    // Yeni hücreleri oluştur
    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-index', i);
        
        // Hücre boyutunu ayarla
        cell.style.width = `${cellSize}px`;
        cell.style.height = `${cellSize}px`;
        cell.style.fontSize = `${cellSize * 0.5}px`; // Emoji boyutunu hücre boyutuna göre ayarla
        
        cell.style.backgroundImage = 'url(\'./bal_petek2.png\')';
        board.appendChild(cell);
        
        // Click event listener'ı ekle
        cell.addEventListener('click', handleBeeMove);
    }

    // Kazanma koşullarını güncelle
    updateWinConditions(newSize);
}

// Güç türlerini güncelleyelim
const POWERS = {
    EXPAND_BOARD: {
        icon: '📐',
        name: 'Tahta Genişlet',
        description: 'Tahtayı bir birim genişletir',
        effect: (player) => {
            if (boardSize < 8) { // Maksimum 8x8
                boardSize++;
                rebuildBoard(boardSize);
                showPowerNotification(`${player} tahtayı ${boardSize}x${boardSize} yaptı!`);
            }
        }
    }
    // Diğer güçler buraya eklenebilir...
};

// Aktif güçleri takip etmek için yapıyı güncelleyelim
let activePowers = [];  // {power, owner, remainingTurns} şeklinde objeler

let moveCounter = 0;
let winCondition = 3;

statusDisplay.textContent = `Sıra: ${currentPlayer}`;

function handleCellClick(e) {
    // Kazanan ekranı açıkken tıklamaları engelle
    if (winnerDisplay.classList.contains('active')) {
        return;
    }

    if (isClassicMode) {
        handleClassicMove(e);
    } else {
        handleBeeMove(e);
    }
}

// Klasik XOX hamlesi
function handleClassicMove(e) {
    const clickedCell = e.target;
    const cellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (!gameActive || gameBoard[cellIndex] !== '') return;

    gameBoard[cellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickSound.play();

    if (checkWin()) {
        handleClassicWin();
        return;
    }

    // Beraberlik kontrolü
    if (!gameBoard.includes('')) {
        handleDraw();
        return;
    }

    currentPlayer = currentPlayer === '❌' ? '⭕' : '❌';
    statusDisplay.textContent = `Sıra: ${currentPlayer}`;
}

// Beraberlik durumu için yeni fonksiyon
function handleDraw() {
    gameActive = false;
    // Tüm hücreleri tıklanamaz yap
    cells.forEach(cell => {
        cell.style.pointerEvents = 'none';
    });
    
    statusDisplay.textContent = 'Oyun Berabere!';
    winnerEmoji.textContent = '🤝';
    winnerText.textContent = "BERABERE!";
    winnerDisplay.classList.add('active');
    
    // Oyun tahtasını temizle
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    cells.forEach(cell => {
        cell.textContent = '';
        if (isClassicMode) {
            cell.style.backgroundColor = '#4CAF50';
        } else {
            cell.style.backgroundColor = '#FFF8DC';
        }
    });
}

// Klasik mod için ayrı kazanma fonksiyonu
function handleClassicWin() {
    gameActive = false;
    // Tüm hücreleri tıklanamaz yap
    cells.forEach(cell => {
        cell.style.pointerEvents = 'none';
    });
    
    // Skoru güncelle
    if (currentPlayer === '❌') {
        classicScores.x++;
        beeScoreDisplay.textContent = classicScores.x;
        consecutiveWins.x++;
        consecutiveWins.o = 0;
    } else {
        classicScores.o++;
        honeyScoreDisplay.textContent = classicScores.o;
        consecutiveWins.o++;
        consecutiveWins.x = 0;
    }

    // Kazanan ekranını göster
    statusDisplay.textContent = `Oyunu ${currentPlayer} kazandı!`;
    winnerEmoji.textContent = currentPlayer;
    winnerText.textContent = "KAZANDI!";
    winnerDisplay.classList.add('active');
    
    // Oyun tahtasını temizle
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    cells.forEach(cell => {
        cell.textContent = '';
        if (isClassicMode) {
            cell.style.backgroundColor = '#4CAF50';
        }
    });
}

// Arılı mod için kazanma fonksiyonunu güncelleyelim
function handleBeeWin() {
    gameActive = false;
    // Tüm hücreleri tıklanamaz yap
    cells.forEach(cell => {
        cell.style.pointerEvents = 'none';
    });
    
    // Skoru güncelle
    if (currentPlayer === '🐝') {
        beeScores.bee++;
        beeScoreDisplay.textContent = beeScores.bee;
        beeVictorySound.play();
        consecutiveWins.bee++;
        consecutiveWins.honey = 0;
    } else {
        beeScores.honey++;
        honeyScoreDisplay.textContent = beeScores.honey;
        honeyVictorySound.play();
        consecutiveWins.honey++;
        consecutiveWins.bee = 0;
    }

    // Kazanan ekranını göster
    statusDisplay.textContent = `Oyunu ${currentPlayer} kazandı!`;
    winnerEmoji.textContent = currentPlayer;
    winnerText.textContent = "KAZANDI!";
    winnerDisplay.classList.add('active');
    backgroundMusic.pause();
    
    // Oyun değişkenlerini sıfırla
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    beeCount = 0;
    honeyCount = 0;
    moveCounter = 0;
    selectedCell = null;
    
    // Tahtayı temizle
    cells.forEach(cell => {
        cell.textContent = '';
        cell.style.backgroundColor = '#FFF8DC';
        cell.style.pointerEvents = 'auto';
    });
    
    // Hamle sayaçlarını güncelle
    updateMovesLeft();
}

// Mevcut arılı mod hamlesi
function handleBeeMove(e) {
    const clickedCell = e.target;
    const cellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (!gameActive) return;

    // Seçili bir taş varsa ve boş bir hücreye taşınıyorsa
    if (selectedCell !== null) {
        if (gameBoard[cellIndex] === '') {
            gameBoard[cellIndex] = currentPlayer;
            gameBoard[selectedCell] = '';
            clickedCell.textContent = currentPlayer;
            cells[selectedCell].textContent = '';
            cells[selectedCell].style.backgroundColor = '#FFF8DC';
            clickSound.play();

            if (checkWin()) {
                handleBeeWin();
                return;
            }

            selectedCell = null;
            moveCounter++;
            checkForPowerSpawn();
            currentPlayer = currentPlayer === '🐝' ? '🍯' : '🐝';
            statusDisplay.textContent = `Sıra: ${currentPlayer}`;
        }
        return;
    }

    // Yeni taş koyma durumu
    if (gameBoard[cellIndex] === '') {
        // Eğer maksimum taş sayısına ulaşıldıysa, sadece taş hareket ettirmeye izin ver
        if ((currentPlayer === '🐝' && beeCount >= 3) || 
            (currentPlayer === '🍯' && honeyCount >= 3)) {
            statusDisplay.textContent = `${currentPlayer} bir taşını seç ve hareket ettir!`;
            return;
        }

        let powerUsed = false;
        // Güç kutusu kontrolü
        if (clickedCell.dataset.power) {
            const powerKey = clickedCell.dataset.power;
            if (powerKey === 'EXPAND_BOARD') {
                const power = POWERS[powerKey];
                collectPower(clickedCell, currentPlayer);
                showPowerNotification(power, currentPlayer);
                delete clickedCell.dataset.power;
                clickedCell.classList.remove('power-active');
                clickedCell.innerHTML = '';
                clickedCell.style.backgroundImage = 'url(\'./bal_petek2.png\')';
                powerUsed = true;
            }
        }

        // Yeni taş koyma
        gameBoard[cellIndex] = currentPlayer;
        clickedCell.textContent = currentPlayer;
        clickSound.play();

        if (currentPlayer === '🐝') {
            beeCount++;
        } else {
            honeyCount++;
        }

        updateMovesLeft();
        moveCounter++;
        checkForPowerSpawn();

        if (checkWin()) {
            handleBeeWin();
            return;
        }

        // Eğer her iki taraf da maksimum taş sayısına ulaştıysa, sırayı arıya ver
        if (beeCount >= 3 && honeyCount >= 3) {
            currentPlayer = '🐝';
        } else {
            // Eğer güç kullanılmadıysa sırayı değiştir
            if (!powerUsed) {
                currentPlayer = currentPlayer === '🐝' ? '🍯' : '🐝';
            }
        }
        
        statusDisplay.textContent = `Sıra: ${currentPlayer}`;
    }
    // Kendi taşını seçme durumu
    else if (gameBoard[cellIndex] === currentPlayer) {
        // Sadece maksimum taş sayısına ulaşıldığında taş seçimine izin ver
        if ((currentPlayer === '🐝' && beeCount >= 3) || 
            (currentPlayer === '🍯' && honeyCount >= 3)) {
            selectedCell = cellIndex;
            clickedCell.style.backgroundColor = '#90EE90';
        }
    }
}

function checkWin() {
    return winConditions.some(condition => {
        const requiredMatches = winCondition; // 3 veya 4
        const matches = condition.filter(index => gameBoard[index] === currentPlayer);
        return matches.length >= requiredMatches;
    });
}

function handleWin() {
    gameActive = false;
    statusDisplay.textContent = `Oyunu ${currentPlayer} kazandı!`;
    winnerEmoji.textContent = currentPlayer;
    winnerText.textContent = "KAZANDI!";
    winnerDisplay.classList.add('active');
    
    backgroundMusic.pause();
    
    if (currentPlayer === '🐝') {
        beeScore++;
        beeScoreDisplay.textContent = beeScore;
        beeVictorySound.play();
    } else {
        honeyScore++;
        honeyScoreDisplay.textContent = honeyScore;
        honeyVictorySound.play();
    }
}

function restartGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    selectedCell = null;
    
    if (isClassicMode) {
        // Klasik mod için başlangıç oyuncusunu belirle
        if (consecutiveWins.x >= 3) {
            currentPlayer = '⭕';
            consecutiveWins.x = 0;
        } else if (consecutiveWins.o >= 3) {
            currentPlayer = '❌';
            consecutiveWins.o = 0;
        } else {
            // Son kazanan başlar (ilk oyunda X başlar)
            currentPlayer = consecutiveWins.x > consecutiveWins.o ? '❌' : 
                          consecutiveWins.o > consecutiveWins.x ? '⭕' : '❌';
        }
    } else {
        // Arılı mod için başlangıç oyuncusunu belirle
        if (consecutiveWins.bee >= 3) {
            currentPlayer = '🍯';
            consecutiveWins.bee = 0;
        } else if (consecutiveWins.honey >= 3) {
            currentPlayer = '🐝';
            consecutiveWins.honey = 0;
        } else {
            // Son kazanan başlar (ilk oyunda arı başlar)
            currentPlayer = consecutiveWins.bee > consecutiveWins.honey ? '🐝' : 
                          consecutiveWins.honey > consecutiveWins.bee ? '🍯' : '🐝';
        }
    }
    
    // ... diğer sıfırlama kodları ...
    
    statusDisplay.textContent = `Sıra: ${currentPlayer}`;
    
    // Tüm hücreleri tekrar tıklanabilir yap
    cells.forEach(cell => {
        cell.style.pointerEvents = 'auto';
    });
}

// Sayfa yüklendiğinde ses ayarlarını yapılandır
document.addEventListener('DOMContentLoaded', function() {
    const allSoundElements = [
        backgroundMusic,
        clickSound,
        beeVictorySound,
        honeyVictorySound
    ];

    // Başlangıçta sesi kapalı olarak ayarla
    volumeSlider.value = 0; // Slider en aşağıda
    previousVolume = 25; // Önceki ses seviyesini sakla

    // Tüm ses elementlerinin başlangıç seviyesini 0 yap
    allSoundElements.forEach(sound => {
        sound.volume = 0;
    });

    // Ses simgesini ayarla
    muteButton.textContent = '🔈';
    muteButton.classList.add('muted');
});

// Volume slider'ı hareket ettirildiğinde
volumeSlider.addEventListener('input', (e) => {
    e.stopPropagation();
    clearTimeout(sliderTimeout);
    const volume = (100 - e.target.value) / 100; // Slider ters çevrildiği için değeri de ters çevir
    
    // Ses seviyesini ayarla
    const allSoundElements = [
        backgroundMusic,
        clickSound,
        beeVictorySound,
        honeyVictorySound
    ];

    // Eğer ses yeni açılıyorsa (0'dan farklı bir değere geçiş)
    if (muteButton.classList.contains('muted') && volume > 0) {
        volumeSlider.value = 75; // %25 ses için 75 değeri (ters çalıştığı için)
        allSoundElements.forEach(sound => {
            sound.volume = 0.25; // %25 ses seviyesi
        });
        muteButton.classList.remove('muted');
        muteButton.textContent = '🔊';
        return; // Fonksiyondan çık
    }

    // Normal ses ayarı
    allSoundElements.forEach(sound => {
        sound.volume = volume;
    });

    // Ses kapalıysa hoparlör ikonunu güncelle
    if (volume === 0) {
        muteButton.classList.add('muted');
        muteButton.textContent = '🔈';
    } else {
        muteButton.classList.remove('muted');
        muteButton.textContent = '🔊';
    }
});

// Volume slider'da mouse basılı tutulduğunda
volumeSlider.addEventListener('mousedown', () => {
    isSliderDragging = true;
    clearTimeout(sliderTimeout);
});

// Mouse bırakıldığında
document.addEventListener('mouseup', () => {
    if (isSliderDragging) {
        isSliderDragging = false;
    }
});

// Slider'ı kapatma fonksiyonu
function closeSlider() {
    // Mouse slider üzerinde değilse VE slider sürüklenmiyorsa kapat
    if (!slider.matches(':hover') && !isSliderDragging) {
        slider.classList.remove('open');
        musicIcon.classList.remove('hidden');
        clearTimeout(sliderTimeout);
    }
}

// Ses kontrollerini güncelleyelim
muteButton.addEventListener('click', () => {
    const isMuted = muteButton.classList.contains('muted');
    if (!isMuted) {
        // Sesi kapat
        previousVolume = volumeSlider.value;
        volumeSlider.value = 100; // Sesi tamamen kıs
        muteButton.classList.add('muted');
        muteButton.textContent = '🔈';
        const allSoundElements = [
            backgroundMusic,
            clickSound,
            beeVictorySound,
            honeyVictorySound
        ];
        allSoundElements.forEach(sound => {
            sound.volume = 0;
        });
    } else {
        // Sesi aç
        volumeSlider.value = previousVolume;
        muteButton.classList.remove('muted');
        muteButton.textContent = '🔊';
        const volume = (100 - previousVolume) / 100;
        const allSoundElements = [
            backgroundMusic,
            clickSound,
            beeVictorySound,
            honeyVictorySound
        ];
        allSoundElements.forEach(sound => {
            sound.volume = volume;
        });
    }
});

// Volume slider'da mouse basılı tutulduğunda timeout'u durdur
volumeSlider.addEventListener('mousedown', () => {
    isSliderDragging = true;
    clearTimeout(sliderTimeout);
});

// Mouse bırakıldığında timeout'u başlatma
document.addEventListener('mouseup', () => {
    if (isSliderDragging) {
        isSliderDragging = false;
        // Slider'ı kullanırken timeout'u başlatma
    }
});

// Slider'a tıklandığında
slider.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isSliderDragging) {
        resetSliderTimeout();
    }
    
    if (e.offsetX < 0) {
        closeSlider();
    }
});

// Slider'ın üzerinde fare hareket ettiğinde
slider.addEventListener('mousemove', () => {
    if (isSliderDragging) {
        clearTimeout(sliderTimeout);
    }
});

// Document'a tıklandığında slider'ı kapat
document.addEventListener('click', () => {
    // Mouse slider üzerinde değilse VE slider sürüklenmiyorsa kapat
    if (!slider.matches(':hover') && !isSliderDragging) {
        closeSlider();
    }
});

// Volume slider'ı hareket ettirildiğinde
volumeSlider.addEventListener('input', (e) => {
    e.stopPropagation();
    clearTimeout(sliderTimeout);
    const volume = (100 - e.target.value) / 100; // Değeri ters çevir
    
    // Ses seviyesini ayarla
    const allSoundElements = [
        backgroundMusic,
        clickSound,
        beeVictorySound,
        honeyVictorySound
    ];
    allSoundElements.forEach(sound => {
        sound.volume = volume;
    });

    // Ses kapalıysa hoparlör ikonunu güncelle
    if (volume === 0) {
        muteButton.classList.add('muted');
        muteButton.textContent = '🔈';
    } else {
        muteButton.classList.remove('muted');
        muteButton.textContent = '🔊';
    }
});

// Slider'ı kapatma fonksiyonu
function closeSlider() {
    slider.classList.remove('open');
    musicIcon.classList.remove('hidden');
    clearTimeout(sliderTimeout);
}

// Slider timeout'unu sıfırlama fonksiyonu
function resetSliderTimeout() {
    // Mouse slider üzerinde değilse VE slider sürüklenmiyorsa timeout'u başlat
    if (!slider.matches(':hover') && !isSliderDragging) {
        clearTimeout(sliderTimeout);
        sliderTimeout = setTimeout(() => {
            closeSlider();
        }, 3000);
    }
}

// Slider'ın üzerinde mouse varken süreyi durdur
slider.addEventListener('mouseenter', () => {
    clearTimeout(sliderTimeout); // Mouse üzerindeyken süreyi temizle
});

// Slider'dan mouse çıkınca süreyi başlat
slider.addEventListener('mouseleave', () => {
    resetSliderTimeout(); // Mouse çıkınca süreyi başlat
});

// Document'a tıklandığında slider'ı kapat
document.addEventListener('click', () => {
    if (!slider.matches(':hover')) { // Mouse slider üzerinde değilse kapat
        closeSlider();
    }
});

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', restartGame);
winnerDisplay.addEventListener('click', function() {
    this.classList.remove('active');
    restartGame();
});

resetScoresBtn.addEventListener('click', function() {
    if (isClassicMode) {
        classicScores.x = 0;
        classicScores.o = 0;
        beeScoreDisplay.textContent = '0';
        honeyScoreDisplay.textContent = '0';
    } else {
        beeScores.bee = 0;
        beeScores.honey = 0;
        beeScoreDisplay.textContent = '0';
        honeyScoreDisplay.textContent = '0';
    }
});

function updateMovesLeft() {
    beeMovesLeft.textContent = Math.max(0, 3 - beeCount);
    honeyMovesLeft.textContent = Math.max(0, 3 - honeyCount);
}

function checkForPowerSpawn() {
    if (isClassicMode || moveCounter <= 6) return; // Klasik modda güç çıkmasın
    
    if (moveCounter % 2 === 0) {
        const emptyCells = Array.from(cells).filter(cell => 
            !cell.textContent && !cell.dataset.power && !cell.classList.contains('power-active')
        );
        
        if (emptyCells.length > 0) {
            const randomPower = getRandomPower();
            if (randomPower) {
                const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                
                // Güç ataması başarılı olduğunda soru işareti ekle
                if (randomCell && POWERS[randomPower]) {
                    randomCell.dataset.power = randomPower;
                    randomCell.classList.add('power-active');
                    
                    const questionMark = document.createElement('div');
                    questionMark.className = 'power-icon';
                    questionMark.textContent = '❓';
                    randomCell.appendChild(questionMark);
                    
                    console.log('Güç oluşturuldu:', randomPower);
                }
            }
        }
    }
}

function spawnPowerUp() {
    const powerCells = document.querySelectorAll('.power-cell');
    powerCells.forEach(cell => {
        if (!cell.dataset.power) {
            const randomPower = getRandomPower();
            cell.dataset.power = randomPower;
            cell.style.opacity = '1';
        }
    });
}

function getRandomPower() {
    // Şu anki duruma göre çıkabilecek güçleri filtrele
    const availablePowers = Object.entries(POWERS).filter(([key, power]) => power.condition());
    
    if (availablePowers.length === 0) return null;
    
    // Tahta genişletme buff'ı için özel olasılık
    const random = Math.random();
    if (random < 0.4 && !isExpandedBoard) {  // %40 olasılıkla tahta genişletme çıksın
        return 'EXPAND_BOARD';
    }
    
    // Diğer güçler için rastgele seçim
    const randomIndex = Math.floor(Math.random() * availablePowers.length);
    return availablePowers[randomIndex][0];
}

function collectPower(cell, player) {
    const powerKey = cell.dataset.power;
    const power = POWERS[powerKey];
    if (power) {
        power.effect(player);
        // Güç kullanıldıktan sonra hücreyi temizle
        delete cell.dataset.power;
        cell.classList.remove('power-active');
        cell.textContent = '';
    }
}

function updateActivePowersDisplay() {
    const powersList = document.querySelector('.active-powers');
    powersList.innerHTML = '';
    activePowers.forEach((powerInstance, index) => {
        const powerElement = document.createElement('div');
        powerElement.className = 'power-item';
        powerElement.innerHTML = `
            <span class="power-owner">${powerInstance.owner}</span>
            <span class="power-name">${powerInstance.name}</span>
            ${powerInstance.remainingTurns ? 
                `<span class="power-duration">${powerInstance.remainingTurns} tur</span>` : 
                '<span class="power-duration">∞</span>'}
        `;
        powerElement.onclick = () => usePower(index);
        powersList.appendChild(powerElement);
    });
}

function usePower(index) {
    const powerInstance = activePowers[index];
    let used = false;

    if (powerInstance.targetOpponent) {
        // ... mevcut rakip hedefli güç kodu ...
        return;
    }

    switch(powerInstance.name) {
        case 'Tahta Genişletme':
            if (!isExpandedBoard) {
                isExpandedBoard = true;
                const newSize = boardSize + 1; // 3x3'ten 4x4'e
                rebuildBoard(newSize);
                
                // Kazanma koşullarını güncelle
                updateWinConditions(newSize);
                
                used = true;
                showPowerNotification({
                    name: 'Tahta Genişletildi',
                    description: `Oyun tahtası ${newSize}x${newSize} boyutuna genişletildi!`,
                    type: 'buff'
                });
            }
            break;
        // ... diğer güçler ...
    }

    if (used) {
        activePowers.splice(index, 1);
        updateActivePowersDisplay();
    }
}

function showPowerNotification(power, owner) {
    const notification = document.createElement('div');
    notification.className = 'power-notification';
    notification.innerHTML = `
        <div class="power-info">
            <span class="power-owner">${owner}</span>
            <h4>${power.name}</h4>
            <p>${power.description}</p>
            <span class="power-type">${power.type === 'buff' ? '💪 Buff' : '💀 Debuff'}</span>
            ${power.duration ? `<span class="power-duration">${power.duration} tur</span>` : ''}
        </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 2000);
}

// Her tur sonunda güçlerin süresini azalt
function updatePowerDurations() {
    activePowers = activePowers.filter(powerInstance => {
        if (powerInstance.remainingTurns === null) return true;
        powerInstance.remainingTurns--;
        return powerInstance.remainingTurns > 0;
    });
    updateActivePowersDisplay();
}

// Kazanma koşullarını güncelleyen fonksiyon
function updateWinConditions(size) {
    winConditions = [];
    
    // Yatay kazanma koşulları
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            row.push(i * size + j);
        }
        winConditions.push(row);
    }
    
    // Dikey kazanma koşulları
    for (let i = 0; i < size; i++) {
        const col = [];
        for (let j = 0; j < size; j++) {
            col.push(j * size + i);
        }
        winConditions.push(col);
    }
    
    // Çapraz kazanma koşulları
    const diag1 = [];
    const diag2 = [];
    for (let i = 0; i < size; i++) {
        diag1.push(i * size + i);
        diag2.push(i * size + (size - 1 - i));
    }
    winConditions.push(diag1);
    winConditions.push(diag2);
}

// Mod değiştirme olayını ekleyelim
switchModeBtn.addEventListener('click', () => {
    isClassicMode = !isClassicMode;
    switchGameMode();
});

function switchGameMode() {
    // Oyunu sıfırla
    restartGameWithoutMusic();
    
    if (isClassicMode) {
        document.body.classList.add('classic-mode');
        // Klasik mod ayarları
        currentPlayer = '❌';
        currentModeText.textContent = 'Arılı Moda Geç';
        gameContainer.classList.add('classic-mode');
        
        // Görünüm ayarları
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.add('classic-mode');
        });
        
        // Skor tablosunu güncelle
        document.querySelectorAll('.score-item').forEach((item, index) => {
            const emoji = item.querySelector('.score-emoji');
            const score = item.querySelector('span:nth-child(2)');
            const text = item.lastChild;
            if (index === 0) {
                emoji.textContent = '❌';
                score.textContent = classicScores.x;
                text.textContent = ' Zafer';
            } else {
                emoji.textContent = '⭕';
                score.textContent = classicScores.o;
                text.textContent = ' Zafer';
            }
        });
        
        document.querySelector('.power-ups').style.display = 'none';
        document.querySelector('.moves-left').style.display = 'none';
        document.querySelector('.moving-title').style.display = 'none';
        document.getElementById('developmentBanner').style.display = 'none';
        switchModeBtn.classList.remove('classic');
        switchModeBtn.classList.add('bee');
        updateBoardLayout();
    } else {
        document.body.classList.remove('classic-mode');
        // Arılı mod ayarları
        currentPlayer = '🐝';
        currentModeText.textContent = 'Klasik Moda Geç';
        gameContainer.classList.remove('classic-mode');
        
        // Görünüm ayarları
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('classic-mode');
            cell.style.backgroundImage = 'url(\'./bal_petek2.png\')';
        });
        
        // Gizlenen elementleri göster
        document.querySelector('.power-ups').style.display = 'block';
        document.querySelector('.moves-left').style.display = 'block';
        document.querySelector('.power-spawn-points').style.display = 'block';
        
        // Skor tablosunu güncelle
        document.querySelectorAll('.score-emoji').forEach((emoji, index) => {
            emoji.textContent = index === 0 ? '🐝' : '🍯';
        });
        
        // Arılı mod skorlarını göster
        beeScoreDisplay.textContent = beeScores.bee;
        honeyScoreDisplay.textContent = beeScores.honey;
        
        document.querySelectorAll('.score-item').forEach((item, index) => {
            const emoji = item.querySelector('.score-emoji');
            const score = item.querySelector('span:nth-child(2)');
            if (index === 0) {
                emoji.textContent = '🐝';
                score.textContent = beeScores.bee;
            } else {
                emoji.textContent = '🍯';
                score.textContent = beeScores.honey;
            }
        });
        
        document.querySelector('.moving-title').style.display = 'inline-block';
        document.getElementById('developmentBanner').style.display = 'block';
        gameContainer.classList.add('bee-mode');
        switchModeBtn.classList.remove('bee');
        switchModeBtn.classList.add('classic');
        updateBoardLayout();
    }
    
    // Durum metnini güncelle
    statusDisplay.textContent = `Sıra: ${currentPlayer}`;
}

// Müziği başlatmadan oyunu yeniden başlatan fonksiyon
function restartGameWithoutMusic() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    selectedCell = null;
    
    if (isClassicMode) {
        currentPlayer = '❌';
    } else {
        currentPlayer = '🐝';
        beeCount = 0;
        honeyCount = 0;
        moveCounter = 0;
        activePowers = [];
    }
    
    cells.forEach(cell => {
        cell.textContent = '';
        if (isClassicMode) {
            cell.style.backgroundColor = '#4CAF50';  // Klasik modda yeşil
        } else {
            cell.style.backgroundColor = '#FFF8DC';  // Arılı modda orijinal renk
        }
    });
    
    statusDisplay.textContent = `Sıra: ${currentPlayer}`;
    winnerDisplay.classList.remove('active');
}

// Sayfa yüklendiğinde mode-select sınıfını ekle
document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.add('mode-select');
    // ... diğer kodlar ...
});

// HTML'deki board yapısını güncelleyelim
function updateBoardLayout() {
    const board = document.getElementById('board');
    const powerSpawnPoints = document.querySelector('.power-spawn-points');
    
    if (isClassicMode) {
        // Klasik modda power-spawn-points'i gizle ve board boyutunu ayarla
        if (powerSpawnPoints) {
            powerSpawnPoints.style.display = 'none';
        }
        board.style.width = '470px';  // Normal 3x3 boyutu
    } else {
        // Arılı modda power-spawn-points'i göster
        if (powerSpawnPoints) {
            powerSpawnPoints.style.display = 'block';
        }
        board.style.width = '470px';  // Normal boyut
    }
}

// Müzik ikonuna tıklandığında
musicIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    slider.classList.toggle('open');
    musicIcon.classList.toggle('hidden');
    resetSliderTimeout();
});

// Volume slider'da mouse basılı tutulduğunda
volumeSlider.addEventListener('mousedown', () => {
    isSliderDragging = true;
    clearTimeout(sliderTimeout);
});

// Mouse bırakıldığında
document.addEventListener('mouseup', () => {
    if (isSliderDragging) {
        isSliderDragging = false;
    }
});

// Slider'ın üzerinde fare hareket ettiğinde
slider.addEventListener('mousemove', () => {
    if (isSliderDragging) {
        clearTimeout(sliderTimeout);
    }
});

// Document'a tıklandığında slider'ı kapat
document.addEventListener('click', () => {
    // Mouse slider üzerinde değilse VE slider sürüklenmiyorsa kapat
    if (!slider.matches(':hover') && !isSliderDragging) {
        closeSlider();
    }
});

// Volume slider'ı hareket ettirildiğinde
volumeSlider.addEventListener('input', (e) => {
    e.stopPropagation();
    clearTimeout(sliderTimeout);
    const volume = (100 - e.target.value) / 100; // Slider ters çevrildiği için değeri de ters çevir
    
    // Ses seviyesini ayarla
    const allSoundElements = [
        backgroundMusic,
        clickSound,
        beeVictorySound,
        honeyVictorySound
    ];
    allSoundElements.forEach(sound => {
        sound.volume = volume;
    });

    // Ses kapalıysa hoparlör ikonunu güncelle
    if (volume === 0) {
        muteButton.classList.add('muted');
        muteButton.textContent = '🔈';
    } else {
        // Eğer ses yeni açılıyorsa (0'dan farklı bir değere geçiş)
        if (muteButton.classList.contains('muted')) {
            volumeSlider.value = 75; // Slider ters olduğu için 75 yapıyoruz (%25 ses için)
            allSoundElements.forEach(sound => {
                sound.volume = 0.25;
            });
        }
        muteButton.classList.remove('muted');
        muteButton.textContent = '🔊';
    }
});

// Slider'ı kapatma fonksiyonu
function closeSlider() {
    slider.classList.remove('open');
    musicIcon.classList.remove('hidden');
    clearTimeout(sliderTimeout);
}

// Slider timeout'unu sıfırlama fonksiyonu
function resetSliderTimeout() {
    // Mouse slider üzerinde değilse VE slider sürüklenmiyorsa timeout'u başlat
    if (!slider.matches(':hover') && !isSliderDragging) {
        clearTimeout(sliderTimeout);
        sliderTimeout = setTimeout(() => {
            closeSlider();
        }, 3000);
    }
}

// Slider'ın üzerinde mouse varken süreyi durdur
slider.addEventListener('mouseenter', () => {
    clearTimeout(sliderTimeout); // Mouse üzerindeyken süreyi temizle
});

// Slider'dan mouse çıkınca süreyi başlat
slider.addEventListener('mouseleave', () => {
    resetSliderTimeout(); // Mouse çıkınca süreyi başlat
});

// Document'a tıklandığında slider'ı kapat
document.addEventListener('click', () => {
    if (!slider.matches(':hover')) { // Mouse slider üzerinde değilse kapat
        closeSlider();
    }
});

// Oyun başlangıcında board'u oluştur
function initializeBoard() {
    const board = document.getElementById('board');
    board.style.gridTemplateColumns = 'repeat(3, 150px)'; // Başlangıçta 3x3
    board.style.width = '470px'; // 3 hücre + boşluklar

    // Diğer başlangıç ayarları...
}

// Sayfa yüklendiğinde çağır
document.addEventListener('DOMContentLoaded', initializeBoard); 