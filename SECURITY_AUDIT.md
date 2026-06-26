# Liina Butik Çanta (cantacim) - Güvenlik ve Mimari İnceleme Raporu

Bu doküman, projenin veritabanı şeması ve kod tabanı üzerinde **OWASP WSTG** standartları çerçevesinde yapılan Güvenli Kod İncelemesi sonuçlarını içermektedir.

---

## 📌 Genel Değerlendirme ve Mimari Doğrular
* **IDOR Koruması:** `updateAddress` ve `deleteAddress` fonksiyonlarında güncelleme öncesi `userId` sahiplik kontrolünün yapılması başarılı bir güvenlik pratiğidir.
* **Sunucu Taraflı Hesaplama:** Sipariş faturası API katmanında Prisma kullanılarak hesaplanmaktadır.
* **Şifreleme:** `changePassword` fonksiyonunda Bcrypt kullanımı ve AuditLog kayıtları sistemin güvenliğini artırmaktadır.

---

## 🚨 Tespit Edilen Kritik Riskler ve Çözüm Önerileri

### 1. Kısmi IDOR (Insecure Direct Object Reference) Zafiyeti
* **İncelenen Modül:** `setDefaultAddress` (Server Action)
* **OWASP Kategorisi:** WSTG-ATHZ-04 (Testing for BOLA/IDOR)
* **Risk Derecesi:** Orta-Yüksek (Medium/High)

#### Risk Açıklaması:
Adresi varsayılan yapma (`isDefault: true`) işleminde, nesne sahipliği doğrulaması (`findFirst` ile) yapılmış olmasına rağmen, asıl veritabanını güncelleyen `prisma.address.update` bloğunda `where` koşulu sadece dışarıdan alınan `id` parametresi ile çalıştırılmaktadır. Bu yapısal kopukluk, karmaşık Race Condition durumlarında veya Prisma'nın update katmanında yetkisiz nesne erişimlerine teorik olarak olanak tanıyabilir.
* **Çözüm:** Güncelleme işlemleri (`update`, `delete`) çalıştırılırken `where` koşulu her zaman, doğrulanan nesnenin ID'si (örn. `existingAddress.id`) kullanılarak veya kompozit anahtarlarla (`id_userId`) yapılmalıdır.

---

### 2. Yorumlanan Girdi Doğrulama (Bypassable Input Validation & Mass Assignment)
* **İncelenen Modül:** `updateUserProfile` (Server Action)
* **OWASP Kategorisi:** WSTG-INPV-05 (Testing for Mass Assignment)
* **Risk Derecesi:** Yüksek (High)

#### Risk Açıklaması:
Kullanıcı profil güncelleme işleminde, Zod ile yazılmış olan katı şema doğrulayıcı (`userProfileSchema.parse(rawData)`) yorum satırına (comment) alınmıştır. Bu durum API'yi "Mass Assignment" saldırılarına açık hale getirir. Bir saldırgan HTTP isteğine ekleyeceği sahte parametreler ile (eğer Prisma update nesnesinde spread operator `...` kullanılırsa) `tier`, `totalSpent`, `role` gibi kendi yetkisinde olmayan kritik sütunları güncelleyebilir.
* **Çözüm:** Zod doğrulama satırı aktifleştirilmeli ve Prisma'ya veri kaydı yapılırken sadece `validated` nesnesinden geçen veriler işlenmelidir.

---

### 3. XSS (Cross-Site Scripting) Girdi Zafiyeti
* **İncelenen Modül:** `createAddress`, `updateAddress`
* **OWASP Kategorisi:** WSTG-INPV-02 (Testing for Stored XSS)
* **Risk Derecesi:** Orta-Yüksek (Medium/High)

#### Risk Açıklaması:
Adres kayıt formundan gelen `title`, `neighborhood`, `fullAddress` gibi serbest metin alanları doğrudan veritabanına yazılmaktadır. Kötü niyetli kullanıcılar bu alanlara `<script>` etiketleri veya zararlı payload'lar enjekte edebilir (Stored XSS). Bu veriler yönetim panelinde (Admin) veya faturalarda filtrelenmeden render edilirse (örn. `dangerouslySetInnerHTML`), yöneticilerin oturum bilgileri çalınabilir.
* **Çözüm:** Kullanıcıdan gelen tüm metinsel veriler, veritabanına yazılmadan önce (veya okunurken) zararlı HTML etiketlerinden arındırılmalı (Sanitization - DOMPurify vb.) ve React tarafında her zaman encode edilerek basılmalıdır.
# Liina Butik Çanta (cantacim) - Güvenlik ve Mimari İnceleme Raporu

Bu doküman, projenin veritabanı şeması ve kod tabanı üzerinde **OWASP WSTG** standartları çerçevesinde yapılan Güvenli Kod İncelemesi sonuçlarını içermektedir.

---

## 📌 Genel Değerlendirme ve Mimari Doğrular
* **Merkezi API Hata Yönetimi:** `apiHandler` sarıcısı (wrapper) sayesinde API'ler standart bir `ApiError` fırlatmaktadır. Bu sayede iç (internal) sunucu hatalarının detayları dışarı sızdırılmamakta ve Information Exposure (Bilgi İfşası) engellenmektedir.
* **Katı Zod Doğrulaması:** `validateBody` helper fonksiyonu ve merkezi Zod şemalarının kurgulanması harika bir pratiktir. Özellikle `passwordRule` ile PCI-DSS şifre zorluk gereksinimlerinin karşılanması takdire şayandır.
* **Yetki Merkezileştirme:** `requireAuth` ve `requireAdmin` fonksiyonları, kod tekrarını önleyip yetki kontrollerini (RBAC) sağlamlaştırmaktadır.

---

## 🚨 Tespit Edilen Kritik Riskler ve Çözüm Önerileri

### 1. Dosya Yükleme (Local Uploads) Zafiyeti (Unrestricted File Upload)
* **İncelenen Modül:** `getImageSrc` ve Yardımcı Fonksiyonlar (`/utils/utils.ts` gibi)
* **OWASP Kategorisi:** WSTG-INPV-11 (Testing for Unrestricted File Upload)
* **Risk Derecesi:** Kritik (Critical)

#### Risk Açıklaması:
Projede `/uploads/` dizini yerel (local) resim yüklemeleri için bir "güvenli" veya "tanınan" path olarak `getImageSrc` gibi fonksiyonlarda kabul edilmektedir. Eğer Admin panelinde veya Kullanıcı Profil resminde dosya yükleme (File Upload) imkanı varsa ve bu dosyaların MIME type'ı, uzantısı veya dosya boyutu backend'de kesinlikle denetlenmiyorsa; bir saldırgan resim gibi görünen bir zararlı yazılım (Web Shell / `.js` / `.php` / SVG içinde XSS payload'u) yükleyebilir. `getImageSrc` bu zararlı `/uploads/hack.js` veya `/uploads/xss.svg` dosyasını `src` olarak döndürdüğünde, bu URL'yi çalıştıran tüm istemciler (veya sunucu) tehlikeye girer.

#### Çözüm:
* Dosya yüklemeleri Vercel ortamında zaten geçicidir (Ephemeral). Bunun yerine Cloudinary, AWS S3 veya Vercel Blob gibi harici (external) ve bağımsız servisler kullanılmalıdır.
* Eğer local upload devam edecekse, upload API'sinde mutlak "File Type Checking" (Magic Byte/MIME Type) yapılmalı ve yüklenecek resim uzantıları katı bir allowlist'e (izin verilenler listesi - sadece `jpeg, png, webp`) alınmalıdır.

---

### 2. URL ve Veri Entegrasyonunda Yetersiz Girdi Denetimi (Input Validation)
* **İncelenen Modül:** Zod Şemaları (`productSchema`, `variantSchema`)
* **OWASP Kategorisi:** WSTG-INPV-01 (Testing for Bypassing Client Side Controls)
* **Risk Derecesi:** Yüksek (High)

#### Risk Açıklaması:
Zod şemalarında `images: z.array(z.string().url())` kullanılarak URL beklendiği belirtilmiştir. Ancak `z.string().url()` doğrulaması siber güvenlikte her zaman yeterli değildir; çünkü saldırganlar `javascript:alert(1)` veya OAST (Out-of-Band Application Security Testing) URL'leri girerek (SSRF - Sunucu Taraflı İstek Sahteciliği) sistem açıklarını tespit edebilirler.
Ayrıca, `addressSchema` içinde `address: z.string().min(5).max(500)` belirtilmiş ancak zararlı HTML etiketlerini (XSS) temizleyecek bir regex (`.regex()`) veya sanitization kurgulanmamıştır.

#### Çözüm:
* Zod şemalarında `url()` yerine `https://` veya projenin kendi alan adıyla başlamasını zorunlu kılan özel kurallar eklenmelidir (`.refine()`).
* Adres ve not gibi `string` alanlar DOMPurify tarzı bir araç ile sanitize edilmeli veya Zod şemasının içine `<script>` vb. etiketleri yasaklayan bir `.regex(/^[a-zA-Z0-9\s.,-]*$/)` filtresi eklenmelidir.

---

### 3. Log Enjeksiyonu Zafiyeti (Log Injection)
* **İncelenen Modül:** `auditLog` Fonksiyonu
* **OWASP Kategorisi:** WSTG-ERRH-02 (Testing for Inadequate Error Handling / Logging)
* **Risk Derecesi:** Orta (Medium)

#### Risk Açıklaması:
`auditLog` fonksiyonu, `action`, `entity`, ve `entityId` gibi parametreleri doğrudan alıp `db.auditLog.create` içine yazmaktadır. Eğer bu parametreler kullanıcının doğrudan kontrol edebildiği yerlerden (örneğin URL path'i veya bir form input'u) geliyorsa, saldırgan log mekanizmasını manipüle edebilir. Örneğin, `entityId` yerine `"123
LOGIN SUCCESS
ADMIN_GRANT"` göndererek log dosyasını (veya veritabanını) tahrif edebilir ve kendini admin yapmış gibi sahte bir log kaydı oluşturabilir.

#### Çözüm:
Log parametreleri doğrudan yazılmadan önce bir escape (kaçış) işleminden geçirilmeli veya `action` ile `entity` alanları bir Enum (Sınıflandırılmış Sabit Değer) olarak tanımlanmalıdır.



### 4. Mantıksal İndirim Algoritması Hatası (Business Logic Flaw)
* **İncelenen Modül:** `discounts.ts` (`getBestDiscountForProduct`) ve `validations.ts`
* **OWASP Kategorisi:** WSTG-BUSL-03 (Data Integrity / Business Logic)
* **Risk Derecesi:** Yüksek (High)

#### Risk Açıklaması:
`getBestDiscountForProduct` algoritması, en iyi indirimi bulmak için `currentPercent` değerini karşılaştırmaktadır. Ancak `BUY_X_GET_Y` kampanyası için bu değer kod içinde sabit olarak `1`, `FREE_SHIPPING` için `0.5` olarak atanmıştır. Bu durumda, eğer sepette %2'lik geçerli bir indirim varsa (`currentPercent = 2`), sistem bu %2'lik çok küçük indirimi, müşteriye tam bir ürün bedava veren (`BUY_X_GET_Y`) kampanyasından daha "büyük" algılayacak ve onu seçecektir.
Ayrıca `validations.ts` içindeki `couponSchema`'da `discountValue` için bir üst sınır (max 100) yoktur. Eğer indirim türü `PERCENTAGE` ise, %150 gibi bir değer girildiğinde ürün fiyatı eksiye düşer.

#### Çözüm ve Defansif Kodlama:
* Yüzdelik indirimler için Zod şemasına `.max(100)` kısıtlaması eklenmelidir.
* En iyi indirim (Best Discount) algoritması yüzdelik oran (`currentPercent`) üzerinden değil, **sepete yansıyan net indirim tutarı (TL cinsi)** üzerinden hesaplanmalıdır.

---

### 5. JWT Oturum İptali Zafiyeti (Session Invalidation)
* **İncelenen Modül:** `auth.ts` (NextAuth JWT Stratejisi)
* **OWASP Kategorisi:** WSTG-ATHN-06 (Testing for Logout Functionality / Session Management)
* **Risk Derecesi:** Kritik (Critical)

#### Risk Açıklaması:
NextAuth yapılandırmasında `strategy: "jwt"` kullanılmış ve oturum süresi 30 gün (`LONG_SESSION_MAX_AGE`) olarak belirlenmiştir. JWT (JSON Web Token) tarayıcı tarafında tutulduğu için "Stateless" (durumsuz) bir yapıdır. Eğer kullanıcının hesabı çalınırsa ve asıl kullanıcı şifresini değiştirirse veya yönetici hesabı dondurursa (`isActive: false`), saldırganın elindeki JWT token **30 gün boyunca geçerli kalmaya devam eder**. Şifre değiştirmek veya hesabı pasife çekmek, halihazırda dağıtılmış olan aktif JWT oturumlarını sunucu tarafında iptal etmez (Revoke edilemez).

#### Çözüm ve Defansif Kodlama:
* `auth.ts` içindeki `jwt` veya `session` callback'inde, kullanıcının veritabanındaki son durumunun (`isActive` durumu veya şifre değişim tarihi) her istekte veya kritik işlemlerde tekrar kontrol edilmesi (JWT validation check) gerekir.
* Veya e-ticaret siteleri için endüstri standardı olan `strategy: "database"` kullanılarak oturumların veritabanından (Sessions tablosu) anlık olarak yönetilmesi ve anında iptal edilebilmesi sağlanmalıdır.


### 6. Yetkilendirme Eksikliği (Broken Access Control) - Server Actions
* **İncelenen Modül:** Admin Paneli Yorum Yönetimi (`actions.ts` içindeki `approveReview`, `deleteReview` vb.)
* **OWASP Kategorisi:** WSTG-ATHZ-02 (Testing for Bypassing Authorization Schema)
* **Risk Derecesi:** Kritik (Critical)

#### Risk Açıklaması:
Next.js Server Action mimarisinde, dışarıdan (frontend) tetiklenebilen `export async function` bloklarının içinde kimlik ve rol doğrulama (Session/RBAC) mekanizmaları kullanılmamıştır. `middleware.ts` dosyası Server Action'ları her senaryoda tam olarak kapsamayabilir. Bir saldırgan, Admin arayüzüne girmeden (sadece giriş yaparak veya tamamen anonim bir şekilde), ilgili HTTP POST isteklerini taklit edip `deleteReview(id)` fonksiyonunu tetikleyerek sistemdeki verileri silebilir veya onaylayabilir (Insecure Direct Object Reference ve Privilege Escalation).

#### Çözüm ve Defansif Kodlama:
* Frontend'den çağrılan (export edilen) her bir Server Action fonksiyonunun ilk satırında, `utils` içinde tanımlanmış olan `await requireAdmin()` veya `await requireAuth()` fonksiyonları **kesinlikle** çalıştırılmalıdır.

---

### 7. Stored XSS (Kalıcı Çapraz Site Betik Çalıştırma) Paneli Etkileşimi
* **İncelenen Modül:** `ReviewManagementClient.tsx`
* **OWASP Kategorisi:** WSTG-INPV-02 (Testing for Stored XSS)
* **Risk Derecesi:** Yüksek (High)

#### Risk Açıklaması:
Müşterilerin girdiği `review.comment` verisi, hiçbir HTML/Script temizleme (Sanitization) işleminden geçmeden veritabanına yazılmakta ve Admin panelinde ekrana basılmaktadır. React her ne kadar text düğümlerini (Text Nodes) kısmen encode etse de, HTML attribute'larına (`title={review.comment}`) verilen girdiler veya ileride eklenebilecek `dangerouslySetInnerHTML` yapıları, Admin'in tarayıcısında zararlı JavaScript kodlarının (DOM-based XSS) çalışmasına yol açacaktır.

#### Çözüm:
* Yorumlar veritabanına kaydedilirken (Write aşamasında) katı bir sanitize işleminden geçirilmelidir. 
* Veya ekrana basılırken DOMPurify gibi bir araçla zararlı etiketler (`<script>`, `<img onerror=...>`, `onload`) temizlenmelidir.

---
## 🏁 Güvenlik Raporu Özeti
Liina Butik Çanta (cantacim) projesi, altyapı ve kodlama standartları açısından modern ve yeteneklidir. Ancak "Never Trust the Client" (İstemciye Asla Güvenme) felsefesine tam uyum sağlanabilmesi için; ödeme esnasında sepetin sunucuda doğrulanması, JWT oturumlarının kontrolü, eşzamanlı stok yönetimi (Transaction Locks) ve tüm Server Action'larda mutlak yetki kontrollerinin (requireAdmin) uygulanması gerekmektedir.


### 8. Yönetim Paneli İşlemlerinde Yetki Eksikliği (Broken Access Control)
* **İncelenen Modül:** Admin Ürün Yönetimi (`actions.ts` - `createProduct`, `updateProduct`, Bulk Actions)
* **OWASP Kategorisi:** WSTG-ATHZ-02 (Testing for Bypassing Authorization Schema)
* **Risk Derecesi:** Kritik (Critical)

#### Risk Açıklaması:
Ürün ekleme, silme, stok güncelleme ve indirim uygulama gibi tüm mağaza kataloğunu etkileyen kritik Server Action fonksiyonlarında `requireAdmin()` veya benzeri bir yetki kontrolü bulunmamaktadır. Bu durum, sisteme dışarıdan yetkisiz POST istekleri gönderilerek tüm ürün fiyatlarının sıfırlanmasına, stokların değiştirilmesine veya veritabanındaki ürünlerin topluca silinmesine açık kapı bırakmaktadır.

#### Çözüm:
* İlgili dosyadaki tüm `export async function` bloklarının ilk satırına mutlak suretle `await requireAdmin();` kuralı eklenmelidir.

---

### 9. Tip Güvensizliği ve Zod Entegrasyon Eksikliği (Mass Assignment / Type Unsafety)
* **İncelenen Modül:** Admin Ürün Yönetimi (`actions.ts`)
* **OWASP Kategorisi:** WSTG-INPV-05 (Testing for Mass Assignment)
* **Risk Derecesi:** Yüksek (High)

#### Risk Açıklaması:
`createProduct(data: any)` ve `updateProduct(id: string, data: any)` fonksiyonlarında girdi verisi `any` tipiyle alınmakta ve `validations.ts` içinde tanımlanan katı Zod şemalarından (`productSchema`) geçirilmemektedir. Bu durum, Prisma veritabanı sürücüsüne beklenmeyen tiplerde veri gönderilmesine, sistemin çökertilmesine veya araya sıkıştırılan manipülatif verilerin (NoSQL/SQL injection türevleri) veritabanına yazılmasına zemin hazırlar.

#### Çözüm:
* `data` nesnesi işlenmeden önce mutlaka `productSchema.parse(data)` ile doğrulanmalı ve Prisma'ya sadece bu filtreden geçmiş (sanitize edilmiş) güvenli veri kümesi gönderilmelidir.


### 10. Yetersiz Girdi Denetimi (XSS) - Sipariş Güncelleme
* **İncelenen Modül:** Sipariş Yönetimi (`updateOrderStatus` ve `OrderDetailPage`)
* **OWASP Kategorisi:** WSTG-INPV-02 (Testing for Stored XSS)
* **Risk Derecesi:** Orta-Yüksek (Medium/High)

#### Risk Açıklaması:
Admin panelinde sipariş kargoya verildiğinde girilen `cargoCompany` ve `cargoTracking` değerleri Zod şemasında sadece `string()` olarak doğrulanmaktadır. Bu alanların içine yazılabilecek potansiyel HTML veya JavaScript kodları (Örn: `<iframe src="...">`) veritabanına kaydedilir. Eğer bu değerler ilerleyen aşamalarda HTML formatında e-posta gönderim şablonlarında, SMS gateway'lerinde veya müşteri arayüzlerinde sanitize edilmeden kullanılırsa Cross-Site Scripting (XSS) saldırısı tetiklenir.

#### Çözüm:
* Zod şemalarında serbest metin alınan her noktada zararlı karakterleri yasaklayan `.regex(/^[a-zA-Z0-9\s.,-]+$/)` gibi kontroller kullanılmalı veya veritabanına yazılmadan önce `DOMPurify` gibi kütüphanelerle HTML etiketleri temizlenmelidir.

---

### 11. İş Mantığı Zafiyeti (Notification Spamming)
* **İncelenen Modül:** `updateOrderStatus` (Bildirim Üretme)
* **OWASP Kategorisi:** WSTG-BUSL-03 (Testing for Business Logic / Rate Limiting)
* **Risk Derecesi:** Düşük (Low)

#### Risk Açıklaması:
Sipariş durumu her değiştiğinde veritabanına bir `Notification` kaydı açılmaktadır. Eğer bir siparişin durumu API üzerinden manipüle edilerek veya bir insan hatasıyla art arda defalarca değiştirilirse, veritabanında gereksiz bildirim kirliliği (Spam) oluşur ve müşterinin arayüz deneyimi bozulur.

#### Çözüm:
* Bildirim oluşturulmadan önce, `db.notification.findFirst` ile aynı sipariş ve durum (`entityId` ve `type`) için kısa süre önce bir bildirim oluşturulup oluşturulmadığı kontrol edilmeli veya veritabanında `Unique Constraint` (Tekillik Kısıtlaması) kullanılmalıdır.
