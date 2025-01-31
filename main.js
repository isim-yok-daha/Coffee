// Phaser.js oyun ayarları
var config = {
    type: Phaser.AUTO,
    width: window.innerWidth,  // Ekran genişliğine göre ayarlanır
    height: window.innerHeight,  // Ekran yüksekliğine göre ayarlanır
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    backgroundColor: '#cccccc' // Arka plan rengini belirleyebilirsiniz
};

// Yeni Phaser oyunu başlatılıyor
var game = new Phaser.Game(config);

var selectedFincan = null; // selectedFincan'ı globalde tanımladık

function preload() {
    // Arka plan görselini yükle
    this.load.image('background', 'assets/background.png');
    this.load.image('kupon', 'kupon.png');
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
    
}

function create() {
    // Arka planı tam ekran yapalım
    this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(window.innerWidth, window.innerHeight);

    // Altlıklar (rastgele yerine sabit bir sırada)
    var altliks = [
        {x: window.innerWidth * 0.2, y: window.innerHeight * 0.6, key: 'alt3', fincan: null},
        {x: window.innerWidth * 0.4, y: window.innerHeight * 0.6, key: 'alt1', fincan: null},
        {x: window.innerWidth * 0.6, y: window.innerHeight * 0.6, key: 'alt4', fincan: null},
        {x: window.innerWidth * 0.8, y: window.innerHeight * 0.6, key: 'alt2', fincan: null}
    ];

    // Fincanlar
    var fincanlar = [
        {x: window.innerWidth * 0.2, y: window.innerHeight * 0.2, key: 'fincan1', altlik: 'alt1', isPlaced: false},
        {x: window.innerWidth * 0.4, y: window.innerHeight * 0.2, key: 'fincan2', altlik: 'alt2', isPlaced: false},
        {x: window.innerWidth * 0.6, y: window.innerHeight * 0.2, key: 'fincan3', altlik: 'alt3', isPlaced: false},
        {x: window.innerWidth * 0.8, y: window.innerHeight * 0.2, key: 'fincan4', altlik: 'alt4', isPlaced: false}
    ];

    altliks.forEach(altlik => {
        let altlikSprite = this.add.image(altlik.x, altlik.y, altlik.key).setOrigin(0.5).setDisplaySize(300, 300);
        altlikSprite.setInteractive();

        altlikSprite.on('pointerdown', function (pointer) {
            console.log('Altlığa tıklandı:', altlik.key);

            if (selectedFincan && selectedFincan.altlik === altlik.key && !altlik.fincan) {
                selectedFincan.sprite.setPosition(altlik.x, altlik.y);
                altlik.fincan = selectedFincan.sprite;
                selectedFincan.sprite.clearAlpha(); // Şeffaflığı geri al
                selectedFincan.isPlaced = true; // Fincan doğru yere yerleştirildi
                selectedFincan = null;

                // Eşleşmeler kontrol ediliyor
                checkAllMatched();
            } else if (selectedFincan) {
                selectedFincan.sprite.setPosition(selectedFincan.originalX, selectedFincan.originalY);
                selectedFincan.sprite.clearAlpha(); // Şeffaflığı geri al
                selectedFincan = null;
            }
        });
    });

    fincanlar.forEach(fincan => {
        let fincanSprite = this.add.image(fincan.x, fincan.y, fincan.key).setOrigin(0.5).setDisplaySize(300, 300);
        fincanSprite.setInteractive();

        fincan.sprite = fincanSprite; // Fincana sprite ekliyoruz

        fincanSprite.on('pointerdown', function (pointer) {
            console.log('Fincana tıklandı:', fincan.key);

            if (selectedFincan) {
                selectedFincan.sprite.clearAlpha(); // Önceki seçimi sıfırla
            }

            // Yeni seçimi işaretle
            selectedFincan = {
                sprite: fincanSprite,
                altlik: fincan.altlik,
                originalX: fincan.x,
                originalY: fincan.y,
                isPlaced: fincan.isPlaced
            };

            fincanSprite.setAlpha(0.7); // Şeffaflığı azaltarak işaretle
        });
    });
    function showKupon(scene) {
        // Kupon görselini ekle (başlangıçta ekran dışında)
        var kuponImage = this.add.image(-300, window.innerHeight / 2, 'kupon')
            .setOrigin(0.5)
            .setScale(0.2) // Kuponu biraz küçültüyoruz
            .setAlpha(1);
        // Kuponu kaydırarak ekrana getirme
        scene.tweens.add({
            targets: kuponImage,
            x: window.innerWidth / 2, // Ekranın ortasına gelsin
            duration: 1500, // 1.5 saniye süresince kayacak
            ease: 'Power2', // Hareketin kolay ve düzgün olmasını sağlar
            onComplete: function () {
                console.log('Kupon gösterildi!');
            }
        });
    }
    
    // Kuponu gösterme fonksiyonunu checkAllMatched içinde çağır
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
    
            // Fincan resimlerini "dolu" resimlerle değiştir
            fincanlar.forEach(fincan => {
                if (fincan.sprite) {
                    const doluKey = fincan.key.replace('fincan', 'dolu');
                    fincan.sprite.setTexture(doluKey);
                } else {
                    console.error(`Fincan sprite bulunamadı: ${fincan.key}`);
                }
            });
    
            // Kuponu ekrana kaydırarak göster
            showKupon(this); // Bu kısmı böyle çağırarak 'this' bağlamını kullanıyoruz
        }
    }    
}

function update() {
    // Her frame'de yapılacak işlemler
}

// Dizi elemanlarını karıştırmak için basit bir fonksiyon
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Elemanları değiştir
    }
}
