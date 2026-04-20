let sonOkunanMetin = "";
function sesliOku(metin) {
    if (metin === sonOkunanMetin) return;
    window.speechSynthesis.cancel();
    const mesaj = new SpeechSynthesisUtterance(metin);
    mesaj.lang = 'tr-TR';
    mesaj.onend = () => {
        setTimeout(() => {
            sonOkunanMetin = "";
        }, 1000);
    };
    sonOkunanMetin = metin;
    window.speechSynthesis.speak(mesaj);
}
function linkAnalizEt(url, suAnkiSite) {
    try {
        const hedef = new URL(url, window.location.origin);
        const suAnki = new URL(suAnkiSite);
        if (hedef.hostname !== suAnki.hostname && hedef.hostname !== "") {
            let siteIsmi = hedef.hostname.replace('www.', '').split('.')[0];
            return siteIsmi.charAt(0).toUpperCase() + siteIsmi.slice(1) + " dış bağlantısı";
        }
        const yolParcalari = hedef.pathname.split('/').filter(p => p !== "");
        if (yolParcalari.length > 0) {
            let sayfaAdi = yolParcalari[yolParcalari.length - 1];
            sayfaAdi = sayfaAdi.split('.')[0];
            sayfaAdi = sayfaAdi.replace(/[-_]/g, ' ');
            return sayfaAdi + " sayfası";
        }
        return "Ana sayfa";
    } catch (e) {
        return "Bağlantı";
    }
}
document.addEventListener('focusin', (e) => {
    let eleman = e.target;
    let mesaj = "";
    let icindekiResim = eleman.tagName === 'IMG' ? eleman : eleman.querySelector('img');
    if (icindekiResim) {
        const altMetni = icindekiResim.alt ? icindekiResim.alt : "Açıklama metni bulunamadı";
        if (eleman.tagName === 'A' || eleman.closest('a')) {
            mesaj = `Resim: ${altMetni}. Haberin detayını görmek için tıklayın.`;
        } else {
            mesaj = `Resim: ${altMetni}`;
        }
    } 
    else {
        let text = eleman.ariaLabel || eleman.innerText;
        if ((!text || text.trim() === "") && (eleman.href || eleman.closest('a'))) {
            const linkUrl = eleman.href || eleman.closest('a').href;
            text = linkAnalizEt(linkUrl, window.location.href);
        }
        mesaj = text || "Tanımlanamayan öğe";
    }
    sesliOku(mesaj);
    eleman.style.outline = "5px solid yellow";
});
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
                const text = node.innerText ? node.innerText.toLowerCase() : "";
                if (text.includes("çerez") || text.includes("izin") || text.includes("cookie")) {
                    sesliOku("Yeni bir bildirim veya onay penceresi açıldı. İçeriği duymak için Tab tuşuna basınız.");
                    const ilkButon = node.querySelector('button, a');
                    if (ilkButon) ilkButon.focus();
                }
            }
        });
    });
});
observer.observe(document.body, {
    childList: true,
    subtree: true
});