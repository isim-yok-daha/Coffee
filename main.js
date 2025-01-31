// Phaser.js oyun ayarları
var config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    backgroundColor: '#cccccc'
};

var game = new Phaser.Game(config);

var selectedFincan = null; // Seçilen fincan global değişkeni

function preload() {
    // Görselleri yüklüyoruz
    this.load.image('background', 'assets/background.png');
    this.load.image('kupon', 'assets/kupon.png');
    
    // Fincan görselleri
    this.load.image('fincan1', 'assets/fincan1.png');
    this.load.image('fincan2', 'assets/fincan2.png');
    this.load.image('fincan3', 'assets/fincan3.png');
    this.load.image('fincan4', 'assets/fincan4.png');
    
    // Dolu fincan görselleri
    this.load.image('dolu1', 'assets/dolu1.png');
    this.load.image('dolu2', 'assets/dolu2.png');
    this.load.image('dolu3', 'assets/dolu3.png');
    this.load.image('dolu4', 'assets/dolu4.png');
    
    // Altlık görselleri
    this.load.image('alt1', 'assets/alt1.png');
    this.load.image('alt2', 'assets/alt2.png');
    this.load.image('alt3', 'assets/alt3.png');
    this.load.image('alt4', 'assets/alt4.png');
    
    // Tutorial için el imleci
    this.load.image('hand', 'assets/hand.png');
}

function create() {
    // Arka planı tam ekran yapıyoruz
    this.add.image(0, 0, 'background')
        .setOrigin(0, 0)
        .setDisplaySize(window.innerWidth, window.innerHeight);

    // Altlıklar (sabit konumda)
    var altliks = [
        {x: window.innerWidth * 0.2, y: window.innerHeight * 0.6, key: 'alt3', fincan: null},
        {x: window.innerWidth * 0.4, y: window.innerHeight * 0.6, key: 'alt1', fincan: null},
        {x: window.innerWidth * 0.6, y: window.innerHeight * 0.6, key: 'alt4', fincan: null},
        {x: window.innerWidth * 0.8, y: window.innerHeight * 0.6, key: 'alt2', fincan: null}
    ];

    // Fincanlar (başlangıçta üst kısımda)
    var fincanlar = [
        {x: window.innerWidth * 0.2, y: window.innerHeight * 0.2, key: 'fincan1', altlik: 'alt1', isPlaced: false},
        {x: window.innerWidth * 0.4, y: window.innerHeight * 0.2, key: 'fincan2', altlik: 'alt2', isPlaced: false},
        {x: window.innerWidth * 0.6, y: window.innerHeight * 0.2, key: 'fincan3', altlik: 'alt3', isPlaced: false},
        {x: window.innerWidth * 0.8, y: window.innerHeight * 0.2, key: 'fincan4', altlik: 'alt4', isPlaced: false}
    ];

    // Altlıkları oluşturuyoruz
    altliks.forEach(altlik => {
        let altlikSprite = this.add.image(altlik.x, altlik.y, altlik.key)
            .setOrigin(0.5)
            .setDisplaySize(300, 300)
            .setInteractive();

        altlikSprite.on('pointerdown', () => {
            console.log('Altlığa tıklandı:', altlik.key);

            // Eğer seçili fincanın hedef altlığı doğruysa
            if (selectedFincan && selectedFincan.altlik === altlik.key && !altlik.fincan) {
                selectedFincan.sprite.setPosition(altlik.x, altlik.y);
                altlik.fincan = selectedFincan.sprite;
                selectedFincan.sprite.clearAlpha(); // Şeffaflığı geri al
                selectedFincan.isPlaced = true;
                selectedFincan = null;
                checkAllMatched.call(this);
            }
        });
    });

    // Fincanları oluşturuyoruz
    fincanlar.forEach(fincan => {
        let fincanSprite = this.add.image(fincan.x, fincan.y, fincan.key)
            .setOrigin(0.5)
            .setDisplaySize(300, 300)
            .setInteractive();

        fincan.sprite = fincanSprite;

        fincanSprite.on('pointerdown', () => {
            console.log('Fincana tıklandı:', fincan.key);

            // Eğer bu fincan zaten seçiliyse, seçimi iptal et
            if (selectedFincan && selectedFincan.sprite === fincanSprite) {
                fincanSprite.clearAlpha();
                selectedFincan = null;
                return;
            }

            // Önceki seçimi temizle
            if (selectedFincan) {
                selectedFincan.sprite.clearAlpha();
            }

            // Yeni seçimi işaretle
            selectedFincan = {
                sprite: fincanSprite,
                altlik: fincan.altlik,
                originalX: fincan.x,
                originalY: fincan.y,
                isPlaced: fincan.isPlaced
            };

            fincanSprite.setAlpha(0.7);
        });
    });

    // Tutorial: Oyuna başlamadan önce önce 1. fincanı, sonra 2. altlığı vurgulayan el imleci
    showTutorial.call(this, fincanlar, altliks);

    // Eşleşme kontrol fonksiyonu
    function checkAllMatched() {
        const allMatched = altliks.every(altlik => {
            if (altlik.fincan) {
                const expectedFincanKey = altlik.key.replace('alt', 'fincan');
                return altlik.fincan.texture && altlik.fincan.texture.key === expectedFincanKey;
            }
            return false;
        });

        if (allMatched) {
            console.log('Tüm fincanlar doğru eşleşti!');
            fincanlar.forEach(fincan => {
                if (fincan.sprite) {
                    const doluKey = fincan.key.replace('fincan', 'dolu');
                    fincan.sprite.setTexture(doluKey);
                } else {
                    console.error(`Fincan sprite bulunamadı: ${fincan.key}`);
                }
            });
            showKupon(this);
        }
    }
    
    // Arka plan için ekstra efekt (isteğe bağlı)
    this.add.rectangle(window.innerWidth / 2, window.innerHeight / 2, window.innerWidth, window.innerHeight, 0xffffff, 0.1)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(-1);
}

// Tutorial adımlarını gösteren fonksiyon (el imleci fincanda yeniden belirir, kullanıcı tıkladığında kapanır)
function showTutorial(sceneFincanlar, sceneAltliks) {
    // Tutorial'ın aktif olup olmadığını kontrol eden bayrak
    this.tutorialActive = true;
    
    // Tutorial el imlecinin referansını saklamak için
    this.currentTutorialHand = null;
    
    // Kullanıcı herhangi bir yere tıkladığında tutorial'ı kapatacak bir event listener ekliyoruz.
    // Bu listener sadece ilk tıklamayı alacak (once) ve tutorialActive bayrağını false yapacak.
    this.input.once('pointerdown', function() {
        this.tutorialActive = false;
        if (this.currentTutorialHand) {
            this.currentTutorialHand.destroy();
            this.currentTutorialHand = null;
        }
    }, this);
    
    // 1. fincan (index 0) ve 2. altlık (index 1) konumları belirleniyor
    var firstCup = sceneFincanlar[0].sprite;
    var targetAltlik = sceneAltliks[1];

    // Tutorial döngüsünü başlatan fonksiyon
    var startTutorialCycle = () => {
        // Eğer tutorial aktif değilse, döngüye devam etme
        if (!this.tutorialActive) return;
        
        // El imleci, 1. fincanın konumunda oluşturuluyor
        var hand = this.add.image(firstCup.x, firstCup.y, 'hand')
            .setOrigin(0.5)
            .setScale(0.5)
            .setAlpha(1);
        // El imlecinin referansını kaydediyoruz
        this.currentTutorialHand = hand;
        
        // El imlecini 1 saniye beklettikten sonra 2. altlığa doğru hareket ettiriyoruz
        this.tweens.add({
            targets: hand,
            delay: 1000, // fincanda bekleme süresi
            x: targetAltlik.x,
            y: targetAltlik.y,
            ease: 'Power1',
            duration: 1000,
            onComplete: () => {
                // Eğer tutorial hala aktifse, el imlecini yok edip döngüyü tekrarlıyoruz
                hand.destroy();
                this.currentTutorialHand = null;
                // 500ms gecikme sonrası tekrar başlat
                this.time.delayedCall(500, startTutorialCycle, [], this);
            }
        });
    };

    // İlk döngüyü başlatıyoruz
    startTutorialCycle();
}

function showKupon(scene) {
    // Kuponun orijinal boyutlarını alıyoruz
    const couponTexture = scene.textures.get('kupon').getSourceImage();
    // İstenen genişlik: ekran genişliğinin %70'i
    const desiredWidth = window.innerWidth * 0.7;
    const scaleFactor = desiredWidth / couponTexture.width;

    var kuponImage = scene.add.image(window.innerWidth / 2, window.innerHeight / 2, 'kupon')
        .setOrigin(0.5)
        .setScale(0)
        .setAlpha(0);

    scene.tweens.add({
        targets: kuponImage,
        scale: { from: 0, to: scaleFactor },
        alpha: { from: 0, to: 1 },
        duration: 1200,
        ease: 'Power2.out',
        onComplete: function () {
            console.log('Kupon gösterildi!');
        }
    });
}

function update() {
    // Her frame'de yapılacak işlemler
}

// Dizi elemanlarını karıştırmak için basit fonksiyon
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
