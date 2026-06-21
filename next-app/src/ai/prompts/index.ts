export const PROMPTS = {
  REWRITE: `
Aşağıdaki spor haberini Türk spor medyası standartlarında profesyonelce, tarafsız ve özgün bir dille yeniden yaz. 
Haberi birebir çevirme veya kopyalama. Olayları ve kişileri ön plana çıkaran gazeteci dili kullan.

Orijinal Başlık: {{title}}
Orijinal İçerik: {{content}}

Yalnızca aşağıdaki JSON formatında dön:
{
  "rewrittenTitle": "Yeni çarpıcı başlık",
  "rewrittenContent": "Html formatında veya temiz paragraflarla yeni içerik..."
}`,

  SEO: `
Aşağıdaki haber için arama motoru optimizasyonu (SEO) verileri oluştur:

Başlık: {{title}}
İçerik: {{content}}

Yalnızca aşağıdaki JSON formatında çıktı ver:
{
  "metaTitle": "Maks 60 karakter SEO başlığı",
  "metaDescription": "Maks 150 karakter meta açıklaması",
  "focusKeyword": "Ana odak anahtar kelime",
  "tags": ["etiket1", "etiket2", "etiket3"]
}`,

  CATEGORY: `
Aşağıdaki haberi analiz ederek detaylı kategorizasyon verilerini üret:

Başlık: {{title}}
İçerik: {{content}}

Yalnızca aşağıdaki JSON formatında çıktı ver:
{
  "mainCategory": "Ana Kategori (örn: spor-haberleri, espor-haberleri, dunya-spor)",
  "subCategory": "Alt Kategori (örn: futbol, basketbol, cs2, valorant)",
  "sportType": "Spor Dalı (Futbol, Basketbol, vs.)",
  "gameType": "Oyun Türü (Espor ise CS2, LoL, boş bırakılabilir)"
}`,

  SUMMARY: `
Aşağıdaki haber için farklı cihazlarda gösterilmek üzere 3 farklı uzunlukta özet üret:

Başlık: {{title}}
İçerik: {{content}}

Yalnızca aşağıdaki JSON formatında çıktı ver:
{
  "summaryShort": "Haberin özünü veren tek bir vurucu cümle.",
  "summaryMedium": "Yaklaşık 30 kelimelik, ana olayı anlatan özet.",
  "summaryLong": "Yaklaşık 100 kelimelik, detaylı haber özeti."
}`,

  TRANSLATION: `
Translate the following sports news article to {{language}}:

Title: {{title}}
Content: {{content}}
Short Summary: {{summaryShort}}

Respond purely in JSON format:
{
  "title": "Translated title",
  "content": "Translated content",
  "summaryShort": "Translated short summary"
}`,

  NOTIFICATION: `
Bu önemli spor haberi için iOS ve Android uygulamalarında gönderilecek tıklama oranını (CTR) artıracak, çarpıcı bir bildirim başlığı ve metni oluştur.

Başlık: {{title}}
İçerik: {{content}}

Format (Yalnızca JSON):
{
  "notificationTitle": "Dikkat çekici kısa başlık (maks 40 karakter)",
  "notificationBody": "Açıklayıcı ve merak uyandırıcı metin (maks 100 karakter)"
}`
};
