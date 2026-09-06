# rss-ozet — Part 3 starter paketi

Bu paket, Periskop'taki **"İlk 30 Dakika: Sıfırdan Kendini Doğrulayan Bir
Döngü"** (Claude Code ile Loop & Harness Engineering, Part 3) yazısında
kurulan iskelenin birebir kopyasıdır. Bütün dosyalar yazıdaki kod
bloklarından üretilmiştir; kavramların *neden* böyle kurulduğunu merak
ettiğinizde başvuru kaynağı yazının kendisidir. Bu README ise *nasıl*
sorusunu uçtan uca cevaplar: aşağıdaki adımları sırayla uygularsanız,
sonunda kendi kodunu kendi doğrulayan çalışan bir döngünüz olur.

---

## Adım 1 — Ön koşulları doğrulayın

Üç şeye ihtiyacınız var:

**Node 24 veya üzeri** (güncel LTS). Kontrol:

    node --version

Çıktı `v24.x.x` ya da üzeri olmalı. Değilse https://nodejs.org üzerinden
LTS sürümünü kurun. Sürüm önemli: paketteki `@types/node ^24` bu
sürümle hizalıdır; daha eski bir Node ile tip tanımları gerçek
runtime'ın önüne geçebilir.

**git.** Kontrol: `git --version`. Herhangi bir güncel sürüm yeterli.

**Claude Code** (güncel sürüm). Kontrol: `claude --version`. Kurulu
değilse https://code.claude.com/docs adresindeki kurulum adımlarını
izleyin. `/goal` ve `/loop` komutları ile hook/skill desteği için
güncel bir sürümde olduğunuzdan emin olun.

---

## Adım 2 — Projeyi edinin

    git clone https://github.com/mndemirel-byte/rss-ozet.git
    cd rss-ozet

Repo git geçmişiyle gelir; ek bir başlatma adımı gerekmez.

---

## Adım 3 — Bağımlılıkları kurun

    npm install

30–60 saniye sürer; `node_modules/` dizini oluşur (git'e girmez,
`.gitignore`'da). Ağ hatası alırsanız proxy/registry ayarlarınızı
kontrol edin — paketin kendisi yalnızca npm registry'ye çıkar.

---

## Adım 4 — İskelenin sağlığını doğrulayın ("yeşil zemin")

Üç komutu sırayla çalıştırın; üçü de temiz geçmelidir:

    npx tsc --noEmit

Beklenen: hiçbir çıktı vermeden biter (sıfır tip hatası).

    npm run lint

Beklenen: hiçbir çıktı vermeden biter (sıfır lint hatası).

    npm test

Beklenen: `Tests  2 passed (2)` — `tests/summarize.test.ts`'teki iki
test yeşil.

Bu üçlü, Adım 6'da devreye girecek hook'un (`.claude/hooks/check.mjs`)
elle koşulmuş hâlidir. Şimdi temiz geçmesi önemlidir: döngü sırasında
sensör öttüğünde, sorunun ajanın değişikliğinden geldiğini bilirsiniz —
iskeleden değil.

---

## Adım 5 — Server smoke testi (isteğe bağlı ama önerilir)

    npm run dev

Beklenen çıktı: `rss-ozet: http://localhost:3000`

İkinci bir terminalden:

    curl -sS -w "\nHTTP %{http_code}\n" http://localhost:3000/api/items

Beklenen: tek öğelik bir JSON array ("rss-ozet kuruldu" tohum kaydı)
ve son satırda `HTTP 200`.

    curl -sS http://localhost:3000/

Beklenen: HTML içinde tohum kaydın başlığı — liste server tarafında
render edilir, JavaScript gerekmez. Tarayıcıdan http://localhost:3000
açarak da görebilirsiniz.

Bitince ilk terminalde Ctrl+C ile server'ı kapatın.

Sık soru: *data/ dizininde tek kayıt var, feed'ler nerede?* Henüz yok —
bu bilinçli. Aşağıda "Bilinçli boşluk" bölümüne bakın.

---

## Adım 6 — Claude Code'u proje kökünde başlatın

    claude

Oturum `rss-ozet/` dizininde açıldığı anda harness kendiliğinden
devreye girer; ek kurulum, kayıt ya da aktivasyon adımı yoktur:

- `CLAUDE.md` proje talimatı olarak yüklenir,
- `.claude/settings.json`'daki permission kuralları uygulanır
  (standart `git push` komut yolu kapalı; built-in dosya erişim
  yollarında `.env` okuması engelli),
- Edit/Write sonrası `check.mjs` hook'u otomatik tetiklenir,
- `verify-app` skill'i çağrılabilir durumdadır.

**Permission notu (önemli):** `/goal` permission modeline dokunmaz.
Varsayılan modda döngünün ortasındaki Bash/test/edit çağrıları tek tek
onayınıza takılabilir. Döngüyü müdahalesiz izlemek için iki seçenek:

1. Oturumu auto mode'da açın, ya da
2. İlk sorulduğunda `npm test`, `npx tsc`, `npm run lint` gibi
   komutları dar kapsamlı `allow` kurallarıyla kalıcı onaylayın.

`settings.json`'daki `deny` kuralları her iki durumda da geçerli kalır.

---

## Adım 7 — İlk döngüyü çalıştırın: /goal

Aşağıdaki prompt'u Claude Code oturumuna **olduğu gibi** yapıştırın
(yazıdaki Adım 4 ile birebir aynı metin):

    /goal Şu iki durumdan biri gerçekleşene kadar devam et.
    
    A — kabul kriterlerinin TAMAMI sağlandı:
    (1) src/feeds.ts, TASK.md'deki üç RSS kaynağından öğeleri çekiyor,
        summarize'dan geçiriyor ve data/items.json'a yazıyor;
    (2) tests/feeds.test.ts bunu ağa çıkmadan, fixture verisiyle
        doğruluyor;
    (3) fixture tabanlı bir integration test, feed katmanının ürettiği
        kayıtların data/items.json → /api/items → SSR ana sayfa
        zincirinden uçtan uca geçtiğini kanıtlıyor;
    (4) npm test çıktısında en az 8 test var ve hepsi geçiyor — çıktıyı
        olduğu gibi göster;
    (5) npm run lint ve npx tsc --noEmit sıfır hata veriyor — çıktıları
        göster;
    (6) verify-app skill'i altı adımın tamamı için GEÇTİ raporu üretiyor.
    
    B — kontrollü devir: 15 turn'e ulaşıldı; kalan işler PROGRESS.md'ye
    yazıldı ve tek satırlık bir ESKALASYON raporu üretildi.

Ne olacağını bilerek izleyin:

- Ajan `src/feeds.ts`'i, fixture'lı testleri ve integration testini
  yazar — bu üç dosyayı siz yazmazsınız, döngü yazar.
- Her Edit/Write sonrası hook öter; tip/lint/test kıran bir değişiklik
  stderr üzerinden ajana geri beslenir ve ajan kendini düzeltir.
- Ajan her durmayı denediğinde ayrı bir evaluator, transcript'teki
  kanıta bakarak koşulları değerlendirir; kanıtı gösterilmemiş koşul
  "sağlanmadı" sayılır.
- Döngü ya A'dan (bütün kriterler + verify-app 6/6 GEÇTİ) ya da B'den
  (15 turn + PROGRESS.md'ye devir + ESKALASYON satırı) durur.

Döngü B'den durursa panik yok: PROGRESS.md'deki devir notunu okuyun,
eksik kalan işi ya elle tamamlayın ya da daraltılmış bir /goal ile
devam edin.

Bittiğinde durumu kendiniz de teyit edebilirsiniz:

    npm test          # ≥ 8 test, tamamı yeşil
    git add -A && git commit -m "feed katmanı: /goal döngüsü"

(Hatırlatma: push sizde — ajan push edemez, etmemeli de.)

---

## Adım 8 — Periyodik döngüye geçin: /loop

Feed katmanı çalışır durumdayken, aynı oturumda:

    /loop 30m TASK.md'deki kaynak listesindeki feed'lerde yeni öğe var mı
    kontrol et. Öğe kimliği: RSS guid varsa guid, yoksa link;
    data/items.json'da aynı kimlik zaten varsa öğe yeni sayılmaz ve
    tekrar eklenmez. Yeni öğe varsa: çek, summarize stub'ından geçir,
    data/items.json'a ekle ve PROGRESS.md'ye "N yeni öğe işlendi
    (kaynak: ...)" satırı ekle. Yeni öğe yoksa hiçbir dosyaya dokunma ve
    tek satırla "değişiklik yok" raporla.

Bilinmesi gerekenler:

- `/loop` oturum kapsamlıdır: aktif oturum yokken çalışmaz; kalıcı bir
  scheduler değildir. Esc ile iptal edilir; oturumu uygun biçimde
  resume ederseniz süresi dolmamış görevler geri yüklenir ve sabit
  aralıklı görevler yedi günlük ömre tabidir.
- Sessiz turlarda ("değişiklik yok") hiçbir dosyaya dokunulmaz.
- Öğe kimliği kuralı (guid varsa guid, yoksa link) aynı öğenin her
  turda yeniden eklenmesini önler.

---

## Bilinçli boşluk

`src/feeds.ts`, `tests/feeds.test.ts` ve `tests/integration.test.ts`
pakette **yok** — eksik değil, tasarım böyle. Yazının tezi gereği feed
katmanını Adım 7'deki `/goal` döngüsü yazar; iskele ile hedef
arasındaki mesafe, döngüye verilen işin ta kendisidir.

`src/summarize.ts` bir extractive stub'dır (metnin ilk iki cümlesi).
CLAUDE.md bunun LLM çağrısıyla değiştirilmesini açıkça yasaklar; gerçek
LLM özetleme serinin Part 4'ünün konusudur. `PROGRESS.md` boş şablonla
gelir; yazıdaki dolu hâli, Adım 7 sonrası örnek geçmişi gösterir.

Kendi döngünüzü çalıştırmadan tamamlanmış hâli görmek isterseniz:
`git show reference-solution:src/feeds.ts` — bu dal, spoiler
içerdiğinden `master`'a hiç karışmaz.

---

## Dosya haritası

    CLAUDE.md                            guide — proje talimatı
    TASK.md                              aktif işin tanımı + kabul kriterleri
    PROGRESS.md                          append-only ilerleme kaydı (boş başlar)
    .claude/settings.json                permission boundary + hook kaydı
    .claude/hooks/check.mjs              computational sensor (tip+lint+test)
    .claude/skills/verify-app/SKILL.md   inferential sensor (uçtan uca doğrulama)
    src/index.ts                         entrypoint (yalnızca listen)
    src/server.ts                        Express + SSR (app'i export eder)
    src/summarize.ts                     extractive stub
    src/public/index.html                SSR şablonu
    data/items.json                      uygulama verisi (tohum kayıtla gelir)
    tests/summarize.test.ts              başlangıç testleri

---

## Sorun giderme

**"Port 3000 already in use":** Başka bir süreç portu tutuyor.
`lsof -i :3000` (macOS/Linux) ile bulup kapatın ya da `src/index.ts`
içindeki portu geçici olarak değiştirin.

**Hook hiç ötmüyor:** Oturumu `rss-ozet/` kökünde açtığınızdan emin
olun; `.claude/settings.json` proje köküne göre çözülür. Hook yalnızca
Edit/Write tool'larında tetiklenir — Bash içinden yapılan değişiklikler
bu ağı atlar (yazıda bilinçli bırakılmış bir boşluktur).

**Hook her düzenlemede yavaş:** Bu proje boyutunda tam test paketi
saniyeler sürer ve kabul edilebilir; proje büyüdüğünde pahalı
kontrolleri commit/CI noktasına kaydırın (yazıdaki ölçek notu).

**verify-app 4. adımda takılıyor:** Skill, başlıkları HTML-escaped
hâliyle arar (`R&D` → sayfada `R&amp;D`); ham karşılaştırma yapmayın.

**`tsc` Node API'lerinde hata veriyor:** `node --version` çıktınız
24'ün altındaysa Adım 1'e dönün.

**Windows'ta `curl: (23) client returned ERROR on write` hatası:**
Unix'teki `/dev/null` Windows'ta yoktur; `-o /dev/null` yerine
`-o NUL` kullanın. Hatayı görseniz bile HTTP isteği tamamlanmıştır —
`-w` ile basılan durum kodu güvenilirdir.

**Permission onayları döngüyü bölüyor:** Adım 6'daki permission notunu
uygulayın (auto mode ya da dar `allow` kuralları).
