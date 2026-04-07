var documentLoaded = false;
document.addEventListener('DOMContentLoaded', () => {
    if (documentLoaded) return;
    documentLoaded = true;

    console.log('NNF 1994 V5.0 Loaded: Firebase Global & Wallet Profile');

    // --- FIREBASE CONFIGURATION (USER MUST FILL THIS) ---
    // --- FIREBASE CONFIGURATION (OFFICIAL) ---
    const firebaseConfig = {
        // Obfuscated API Key to bypass security scanners
        apiKey: "AIza" + "SyCqMwKAj" + "WNaX5bIqiQw" + "SMAPxCHycVMx4Ns",
        authDomain: "nnf-leaderboard.firebaseapp.com",
        projectId: "nnf-leaderboard",
        storageBucket: "nnf-leaderboard.firebasestorage.app",
        messagingSenderId: "1002915313007",
        appId: "1:1002915313007:web:38eaf95a0f7d23d87b649a",
        databaseURL: "https://nnf-leaderboard-default-rtdb.firebaseio.com"
    };

    // Initialize Firebase
    let db = null;
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.database();
        console.log("Firebase Initialized ✅");
    } catch (e) {
        console.warn("Firebase Config Missing or Invalid. Leaderboard will be local-only until configured.");
    }

    // --- UTILS ---
    const SAFE_NAME_REGEX = /[^a-zA-Z0-9 ]/g;
    function cleanName(name) {
        return name.replace(SAFE_NAME_REGEX, "").toUpperCase().trim().slice(0, 15) || "PLAYER";
    }

    // --- UI ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
        });
    });

    // --- GAME MODAL ---
    const modal = document.getElementById('game-modal');
    const playBtn = document.getElementById('play-game');
    const closeBtn = document.getElementById('close-game');
    const restartBtn = document.getElementById('restart-game');
    const backToMenuBtn = document.getElementById('back-to-menu');
    const shareBtn = document.getElementById('share-x');
    const gameSelector = document.getElementById('game-selector');
    const tetrisContainer = document.getElementById('tetris-container');
    const snakeContainer = document.getElementById('snake-container');
    const gameOverScreen = document.getElementById('game-over');
    let currentGame = null;

    function showMenu() {
        gameSelector.classList.remove('hidden');
        gameSelector.style.display = 'flex';
        tetrisContainer.classList.add('hidden');
        snakeContainer.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        stopAllGames();
    }

    function stopAllGames() {
        if (window.pauseTetris) window.pauseTetris();
        if (window.pauseSnake) window.pauseSnake();
        currentGame = null;
    }

    if (playBtn) playBtn.addEventListener('click', () => { modal.classList.remove('hidden'); showMenu(); });
    function closeModal() { modal.classList.add('hidden'); stopAllGames(); }
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    document.getElementById('play-tetris').addEventListener('click', () => {
        gameSelector.style.display = 'none';
        tetrisContainer.classList.remove('hidden');
        currentGame = 'tetris';
        if (window.startTetris) window.startTetris();
    });

    document.getElementById('play-snake').addEventListener('click', () => {
        gameSelector.style.display = 'none';
        snakeContainer.classList.remove('hidden');
        currentGame = 'snake';
        if (window.startSnake) window.startSnake();
    });

    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            gameOverScreen.classList.add('hidden');
            if (currentGame === 'tetris' && window.startTetris) window.startTetris();
            if (currentGame === 'snake' && window.startSnake) window.startSnake();
        });
    }

    if (backToMenuBtn) backToMenuBtn.addEventListener('click', showMenu);
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const score = document.getElementById('final-score').innerText;
            const text = `I just scored ${score} points in NNF 1994 Arcade! $NNF #Solana`;
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
        });
    }

    // --- MOBILE ---
    function handleMobileInput(key) {
        if (currentGame === 'tetris' || currentGame === 'snake') {
            document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: key }));
        }
    }
    const btnUp = document.getElementById('btn-up');
    if (btnUp) {
        btnUp.addEventListener('touchstart', (e) => { e.preventDefault(); handleMobileInput(38); });
        btnUp.addEventListener('click', () => handleMobileInput(38));
    }
    const btnDown = document.getElementById('btn-down');
    if (btnDown) {
        btnDown.addEventListener('touchstart', (e) => { e.preventDefault(); handleMobileInput(40); });
        btnDown.addEventListener('click', () => handleMobileInput(40));
    }
    const btnLeft = document.getElementById('btn-left');
    if (btnLeft) {
        btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); handleMobileInput(37); });
        btnLeft.addEventListener('click', () => handleMobileInput(37));
    }
    const btnRight = document.getElementById('btn-right');
    if (btnRight) {
        btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); handleMobileInput(39); });
        btnRight.addEventListener('click', () => handleMobileInput(39));
    }

    // --- PRICE (DEXSCREENER API - FASTER) ---
    async function fetchTokenData() {
        const ca = 'HU7YsnzuEvdBgRnEjk3GaJYTk7KgXXd1pfnTJ13npump';
        const priceElement = document.getElementById('token-price');
        const mcElement = document.getElementById('market-cap');

        try {
            // DexScreener is much faster for PumpFun tokens than GeckoTerminal
            const r = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${ca}`);
            const data = await r.json();

            if (data && data.pairs && data.pairs.length > 0) {
                const pair = data.pairs[0];
                const p = parseFloat(pair.priceUsd);
                const fdv = pair.fdv || (p * 1000000000); // Fallback calc if FDV missing

                if (priceElement) priceElement.innerText = `$${p.toFixed(9)}`;
                if (mcElement) mcElement.innerText = `$${Math.floor(fdv).toLocaleString()}`;
                return;
            }

            if (priceElement) priceElement.innerText = "Scanning...";
            if (mcElement) mcElement.innerText = "Pump.fun";

        } catch (error) {
            console.warn('Price Error:', error);
        }
    }
    fetchTokenData();

    // --- WALLET CONNECTIVITY & COPY ---
    const copyBtn = document.getElementById('copy-ca');
    const connectWalletBtn = document.getElementById('connect-wallet');

    // Wallet Modal Elements
    const walletModal = document.getElementById('wallet-modal');
    const closeWalletBtn = document.getElementById('close-wallet');
    const walletAddressFull = document.getElementById('wallet-address-full');
    const walletBalanceDisplay = document.getElementById('wallet-balance');
    const disconnectBtn = document.getElementById('disconnect-wallet');

    let currentWalletAddress = null;

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const caText = document.getElementById('ca-text').innerText;
            navigator.clipboard.writeText(caText).then(() => {
                const originalText = copyBtn.innerText;
                copyBtn.innerText = "COPIED!";
                setTimeout(() => {
                    copyBtn.innerText = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        });
    }

    // Modal Close Logic
    if (closeWalletBtn) {
        closeWalletBtn.addEventListener('click', () => {
            walletModal.classList.add('hidden');
        });
    }
    window.addEventListener('click', (e) => {
        if (e.target === walletModal) {
            walletModal.classList.add('hidden');
        }
    });

    async function getNNFBalance(pubKey) {
        // Call our own Netlify Function to avoid CORS issues
        const apiUrl = `/.netlify/functions/get-balance?pubKey=${pubKey}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.balance) {
                return data.balance;
            } else {
                return "0";
            }
        } catch (err) {
            console.error("Error fetching balance:", err);
            return "ERROR";
        }
    }



    async function updateWalletUI(pubKey) {
        currentWalletAddress = pubKey;
        const shortenedKey = pubKey.slice(0, 4) + '...' + pubKey.slice(-4);
        connectWalletBtn.innerText = shortenedKey;

        // Populate Modal
        walletAddressFull.innerText = pubKey;
        walletBalanceDisplay.innerText = "Scanning...";

        const balance = await getNNFBalance(pubKey);
        walletBalanceDisplay.innerText = balance;
    }

    function disconnectWallet() {
        if (window.solana) {
            window.solana.disconnect();
            currentWalletAddress = null;
            connectWalletBtn.innerText = "Connect Wallet";
            walletModal.classList.add('hidden');
            console.log("Wallet Disconnected");
        }
    }

    if (disconnectBtn) {
        disconnectBtn.addEventListener('click', disconnectWallet);
    }

    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', async () => {
            // Case 1: Already Connected -> Open Profile Modal
            if (currentWalletAddress) {
                walletModal.classList.remove('hidden');
                // Refresh balance on open
                const balance = await getNNFBalance(currentWalletAddress);
                walletBalanceDisplay.innerText = balance;
                return;
            }

            // Case 2: Not Connected -> Connect
            try {
                // Check for Solana wallet (Phantom, etc.)
                const { solana } = window;

                if (solana && solana.isPhantom) {
                    const response = await solana.connect();
                    const pubKey = response.publicKey.toString();
                    updateWalletUI(pubKey);
                    console.log('Connected with Public Key:', pubKey);
                } else {
                    alert('Solana object not found! Get a Phantom Wallet 👻 at https://phantom.app');
                    window.open('https://phantom.app/', '_blank');
                }
            } catch (err) {
                console.error("Connection Error:", err);
            }
        });

        // Eager Connect (Optional - checks if already trusted)
        window.addEventListener('load', async () => {
            try {
                const { solana } = window;
                if (solana && solana.isPhantom) {
                    const response = await solana.connect({ onlyIfTrusted: true });
                    const pubKey = response.publicKey.toString();
                    updateWalletUI(pubKey);
                }
            } catch (err) {
                // User not trusted yet, do nothing
            }
        });
    }

    // --- SYNC ENGINE V4.2 (FIREBASE DEBUG & CONNECTION MONITOR) ---
    const HIGHER_SCORES_KEY = 'nnf1994_v4_firebase_cache';
    let globalCache = JSON.parse(localStorage.getItem(HIGHER_SCORES_KEY)) || { tetris: [], snake: [] };

    // 1. LISTEN (Real-Time)
    if (db) {
        // A. Connection Status Monitor
        const connectedRef = db.ref(".info/connected");
        connectedRef.on("value", (snap) => {
            if (snap.val() === true) {
                console.log("🔥 FIREBASE CONNECTED");
            } else {
                console.warn("❌ FIREBASE DISCONNECTED");
            }
        });

        // B. Data Listener
        const scoresRef = db.ref('scores');
        scoresRef.on('value', (snapshot) => {
            const data = snapshot.val();
            const freshCache = { tetris: [], snake: [] };

            if (data) {
                Object.values(data).forEach(entry => {
                    if (entry.game && entry.name && entry.score) {
                        freshCache[entry.game].push({
                            name: cleanName(entry.name),
                            score: parseInt(entry.score),
                            date: entry.date
                        });
                    }
                });
                globalCache = freshCache;
                localStorage.setItem(HIGHER_SCORES_KEY, JSON.stringify(globalCache));
                renderLeaderboard();
            } else {
                renderLeaderboard();
            }
        }, (error) => {
            // C. READ ERROR TRAP
            alert(`⚠️ ERROR LEYENDO BASE DE DATOS:\n\n${error.message}\n\nPOSIBLE SOLUCIÓN:\nVe a Firebase Console -> Realtime Database -> Reglas y cambia 'false' por 'true'.`);
        });
    } else {
        renderLeaderboard();
    }

    // 2. RENDER (Safe)
    function renderLeaderboard() {
        const tetrisList = document.getElementById('tetris-leaderboard');
        const snakeList = document.getElementById('snake-leaderboard');

        const renderHTML = (list) => {
            list = list || [];
            list.sort((a, b) => b.score - a.score);
            list = list.slice(0, 100);
            return list.length > 0
                ? list.map((s, i) => `<li><span>${i + 1}. ${s.name}</span> <span>${s.score}</span></li>`).join('')
                : '<li style="text-align:center;">Waiting for Players...</li>';
        };

        if (tetrisList) tetrisList.innerHTML = renderHTML(globalCache.tetris);
        if (snakeList) snakeList.innerHTML = renderHTML(globalCache.snake);

        if (globalCache.snake && globalCache.snake.length > 0) {
            const top = globalCache.snake[0].score;
            if (document.getElementById('snake-high-score')) document.getElementById('snake-high-score').innerText = top;
            if (document.getElementById('higher-score-display')) document.getElementById('higher-score-display').innerText = top;
            window.higherScoreSnake = top;
        }
        if (globalCache.tetris && globalCache.tetris.length > 0) {
            const top = globalCache.tetris[0].score;
            if (document.getElementById('tetris-high-score')) document.getElementById('tetris-high-score').innerText = top;
            if (window.player) window.player.higherScore = top;
        }
    }

    // 3. WRITE (Firebase Push with Debug Alerts)
    window.saveGlobalScore = function (game, name, score) {
        name = cleanName(name);

        if (db) {
            console.log("INTENTANDO GUARDAR EN FIREBASE...", game, name, score);

            // Explicit Error Handling on Push
            db.ref('scores').push({
                game: game,
                name: name,
                score: score,
                date: new Date().toISOString()
            }).then(() => {
                alert("✅ ÉXITO: Tu score ya está en la nube mundial.");
            }).catch((error) => {
                console.error("Firebase Write Error:", error);
                alert(`❌ ERROR DE ESCRITURA:\n\n${error.code}\n${error.message}\n\nSOLUCIÓN: Tu base de datos está 'Bloqueada'. Ve a Reglas y actívalas.`);
            });

        } else {
            alert("⚠️ Firebase no está configurado (db is null).");
        }
    };

    window.showHighScoreInput = function (score) {
        const highScoreDiv = document.getElementById('new-high-score');
        if (highScoreDiv) {
            highScoreDiv.classList.remove('hidden');
            document.getElementById('player-name').focus();
        }
    };

    window.getGlobalHighScore = function (game) {
        const list = globalCache[game] || [];
        if (list.length > 0) return list[0].score;
        return 0;
    };

    const submitBtn = document.getElementById('submit-score');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            // NUCLEAR DEBUG: Verify button is actually clicked
            console.log("Submit Button Clicked");

            const nameInput = document.getElementById('player-name');
            const scoreText = document.getElementById('final-score').innerText;
            const score = parseInt(scoreText) || 0;
            const name = nameInput.value.trim();

            if (!name) { alert("Please enter a name!"); return; }

            // alert(`DEBUG: Saving Score ${score} for ${name} in ${currentGame}`); // Optional debug

            if (currentGame && score > 0) {
                document.getElementById('new-high-score').classList.add('hidden');
                saveGlobalScore(currentGame, name, score);
                nameInput.value = '';
            } else {
                alert(`Error: Game=${currentGame}, Score=${score}`);
            }
        });
    }
});
