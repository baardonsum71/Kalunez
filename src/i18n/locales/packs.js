/** Compact UI packs for major world languages (nav + settings chrome). */
import en from './en';

function pack(partial) {
  return {
    nav: { ...en.nav, ...partial.nav },
    settings: { ...en.settings, ...partial.settings },
    common: { ...en.common, ...partial.common },
  };
}

export const da = pack({
  nav: { home: 'Hjem', discover: 'Opdag', library: 'Bibliotek', forArtists: 'For kunstnere', upload: 'Upload', goLive: 'Gå live', messages: 'Beskeder', notifications: 'Notifikationer', settings: 'Indstillinger', back: 'Gå tilbage', mainNav: 'Hovedmenu' },
  settings: { title: 'Indstillinger', subtitle: 'Administrer din konto', profile: 'Din profil', profileHint: 'Alle får en profil. Vælg Lytter eller Kunstner.', photo: 'Profilbillede', changePhoto: 'Skift billede', uploadPhoto: 'Upload billede', displayName: 'Visningsnavn', listener: 'Lytter', artist: 'Kunstner', artistName: 'Kunstnernavn', bio: 'Bio (valgfrit)', saveProfile: 'Gem profil', saving: 'Gemmer…', saved: 'Profil gemt.', account: 'Konto', language: 'Sprog', languageSearch: 'Søg sprog…', languageTranslated: 'Oversat', languageFallback: 'UI på engelsk', subscription: 'Abonnement og betaling', privacy: 'Privatlivspolitik', terms: 'Vilkår', changePassword: 'Skift adgangskode', dangerZone: 'Farezone', deleteAccount: 'Slet konto', cancel: 'Annuller', save: 'Gem' },
  common: { signIn: 'Log ind', loading: 'Indlæser…' },
});

export const sv = pack({
  nav: { home: 'Hem', discover: 'Upptäck', library: 'Bibliotek', forArtists: 'För artister', upload: 'Ladda upp', goLive: 'Gå live', messages: 'Meddelanden', notifications: 'Aviseringar', settings: 'Inställningar', back: 'Gå tillbaka', mainNav: 'Huvudmeny' },
  settings: { title: 'Inställningar', subtitle: 'Hantera ditt konto', profile: 'Din profil', photo: 'Profilbild', changePhoto: 'Byt bild', uploadPhoto: 'Ladda upp bild', displayName: 'Visningsnamn', listener: 'Lyssnare', artist: 'Artist', saveProfile: 'Spara profil', saving: 'Sparar…', saved: 'Profil sparad.', account: 'Konto', language: 'Språk', languageSearch: 'Sök språk…', languageTranslated: 'Översatt', subscription: 'Prenumeration och fakturering', privacy: 'Integritetspolicy', terms: 'Villkor', changePassword: 'Byt lösenord', dangerZone: 'Farozon', deleteAccount: 'Radera konto', cancel: 'Avbryt', save: 'Spara' },
  common: { signIn: 'Logga in', loading: 'Laddar…' },
});

export const fi = pack({
  nav: { home: 'Koti', discover: 'Tutustu', library: 'Kirjasto', forArtists: 'Artisteille', upload: 'Lataa', goLive: 'Mene liveen', messages: 'Viestit', notifications: 'Ilmoitukset', settings: 'Asetukset', back: 'Takaisin', mainNav: 'Päävalikko' },
  settings: { title: 'Asetukset', subtitle: 'Hallitse tiliäsi', profile: 'Profiilisi', photo: 'Profiilikuva', displayName: 'Näyttönimi', listener: 'Kuuntelija', artist: 'Artisti', saveProfile: 'Tallenna profiili', account: 'Tili', language: 'Kieli', languageSearch: 'Hae kieliä…', subscription: 'Tilaus ja laskutus', privacy: 'Tietosuoja', terms: 'Ehdot', changePassword: 'Vaihda salasana', dangerZone: 'Vaaravyöhyke', deleteAccount: 'Poista tili', cancel: 'Peruuta', save: 'Tallenna' },
  common: { signIn: 'Kirjaudu', loading: 'Ladataan…' },
});

export const de = pack({
  nav: { home: 'Start', discover: 'Entdecken', library: 'Bibliothek', forArtists: 'Für Künstler', upload: 'Hochladen', goLive: 'Live gehen', messages: 'Nachrichten', notifications: 'Benachrichtigungen', settings: 'Einstellungen', back: 'Zurück', mainNav: 'Hauptnavigation' },
  settings: { title: 'Einstellungen', subtitle: 'Kontoeinstellungen verwalten', profile: 'Dein Profil', photo: 'Profilbild', changePhoto: 'Bild ändern', uploadPhoto: 'Bild hochladen', displayName: 'Anzeigename', listener: 'Hörer', artist: 'Künstler', artistName: 'Künstlername', bio: 'Bio (optional)', saveProfile: 'Profil speichern', saving: 'Speichern…', saved: 'Profil gespeichert.', account: 'Konto', language: 'Sprache', languageSearch: 'Sprachen suchen…', languageTranslated: 'Übersetzt', languageFallback: 'UI auf Englisch', subscription: 'Abo & Abrechnung', privacy: 'Datenschutz', terms: 'Nutzungsbedingungen', changePassword: 'Passwort ändern', dangerZone: 'Gefahrenzone', deleteAccount: 'Konto löschen', cancel: 'Abbrechen', save: 'Speichern' },
  common: { signIn: 'Anmelden', loading: 'Laden…' },
});

export const fr = pack({
  nav: { home: 'Accueil', discover: 'Découvrir', library: 'Bibliothèque', forArtists: 'Pour les artistes', upload: 'Publier', goLive: 'Passer en direct', messages: 'Messages', notifications: 'Notifications', settings: 'Paramètres', back: 'Retour', mainNav: 'Navigation principale' },
  settings: { title: 'Paramètres', subtitle: 'Gérer votre compte', profile: 'Votre profil', photo: 'Photo de profil', changePhoto: 'Changer la photo', uploadPhoto: 'Téléverser une photo', displayName: 'Nom affiché', listener: 'Auditeur', artist: 'Artiste', artistName: 'Nom de scène', bio: 'Bio (optionnel)', saveProfile: 'Enregistrer le profil', saving: 'Enregistrement…', saved: 'Profil enregistré.', account: 'Compte', language: 'Langue', languageSearch: 'Rechercher une langue…', languageTranslated: 'Traduit', languageFallback: 'Interface en anglais', subscription: 'Abonnement et facturation', privacy: 'Confidentialité', terms: 'Conditions', changePassword: 'Changer le mot de passe', dangerZone: 'Zone dangereuse', deleteAccount: 'Supprimer le compte', cancel: 'Annuler', save: 'Enregistrer' },
  common: { signIn: 'Se connecter', loading: 'Chargement…' },
});

export const es = pack({
  nav: { home: 'Inicio', discover: 'Descubrir', library: 'Biblioteca', forArtists: 'Para artistas', upload: 'Subir', goLive: 'Salir en vivo', messages: 'Mensajes', notifications: 'Notificaciones', settings: 'Ajustes', back: 'Volver', mainNav: 'Navegación principal' },
  settings: { title: 'Ajustes', subtitle: 'Administra tu cuenta', profile: 'Tu perfil', photo: 'Foto de perfil', changePhoto: 'Cambiar foto', uploadPhoto: 'Subir foto', displayName: 'Nombre visible', listener: 'Oyente', artist: 'Artista', artistName: 'Nombre artístico', bio: 'Bio (opcional)', saveProfile: 'Guardar perfil', saving: 'Guardando…', saved: 'Perfil guardado.', account: 'Cuenta', language: 'Idioma', languageSearch: 'Buscar idiomas…', languageTranslated: 'Traducido', languageFallback: 'Interfaz en inglés', subscription: 'Suscripción y facturación', privacy: 'Privacidad', terms: 'Términos', changePassword: 'Cambiar contraseña', dangerZone: 'Zona de peligro', deleteAccount: 'Eliminar cuenta', cancel: 'Cancelar', save: 'Guardar' },
  common: { signIn: 'Iniciar sesión', loading: 'Cargando…' },
});

export const pt = pack({
  nav: { home: 'Início', discover: 'Descobrir', library: 'Biblioteca', forArtists: 'Para artistas', upload: 'Enviar', goLive: 'Ir ao vivo', messages: 'Mensagens', notifications: 'Notificações', settings: 'Definições', back: 'Voltar', mainNav: 'Navegação principal' },
  settings: { title: 'Definições', subtitle: 'Gerir a sua conta', profile: 'O seu perfil', photo: 'Foto de perfil', displayName: 'Nome a mostrar', listener: 'Ouvinte', artist: 'Artista', saveProfile: 'Guardar perfil', account: 'Conta', language: 'Idioma', languageSearch: 'Pesquisar idiomas…', subscription: 'Subscrição e faturação', privacy: 'Privacidade', terms: 'Termos', changePassword: 'Alterar palavra-passe', dangerZone: 'Zona de perigo', deleteAccount: 'Eliminar conta', cancel: 'Cancelar', save: 'Guardar' },
  common: { signIn: 'Entrar', loading: 'A carregar…' },
});

export const it = pack({
  nav: { home: 'Home', discover: 'Scopri', library: 'Libreria', forArtists: 'Per artisti', upload: 'Carica', goLive: 'Vai in diretta', messages: 'Messaggi', notifications: 'Notifiche', settings: 'Impostazioni', back: 'Indietro', mainNav: 'Navigazione principale' },
  settings: { title: 'Impostazioni', subtitle: 'Gestisci il tuo account', profile: 'Il tuo profilo', photo: 'Foto profilo', displayName: 'Nome visualizzato', listener: 'Ascoltatore', artist: 'Artista', saveProfile: 'Salva profilo', account: 'Account', language: 'Lingua', languageSearch: 'Cerca lingue…', subscription: 'Abbonamento e fatturazione', privacy: 'Privacy', terms: 'Termini', changePassword: 'Cambia password', dangerZone: 'Zona pericolosa', deleteAccount: 'Elimina account', cancel: 'Annulla', save: 'Salva' },
  common: { signIn: 'Accedi', loading: 'Caricamento…' },
});

export const nl = pack({
  nav: { home: 'Home', discover: 'Ontdekken', library: 'Bibliotheek', forArtists: 'Voor artiesten', upload: 'Uploaden', goLive: 'Ga live', messages: 'Berichten', notifications: 'Meldingen', settings: 'Instellingen', back: 'Terug', mainNav: 'Hoofdnavigatie' },
  settings: { title: 'Instellingen', subtitle: 'Beheer je account', profile: 'Je profiel', photo: 'Profielfoto', displayName: 'Weergavenaam', listener: 'Luisteraar', artist: 'Artiest', saveProfile: 'Profiel opslaan', account: 'Account', language: 'Taal', languageSearch: 'Zoek talen…', subscription: 'Abonnement en facturering', privacy: 'Privacy', terms: 'Voorwaarden', changePassword: 'Wachtwoord wijzigen', dangerZone: 'Gevarenzone', deleteAccount: 'Account verwijderen', cancel: 'Annuleren', save: 'Opslaan' },
  common: { signIn: 'Inloggen', loading: 'Laden…' },
});

export const pl = pack({
  nav: { home: 'Start', discover: 'Odkrywaj', library: 'Biblioteka', forArtists: 'Dla artystów', upload: 'Prześlij', goLive: 'Transmituj', messages: 'Wiadomości', notifications: 'Powiadomienia', settings: 'Ustawienia', back: 'Wstecz', mainNav: 'Główne menu' },
  settings: { title: 'Ustawienia', subtitle: 'Zarządzaj kontem', profile: 'Twój profil', photo: 'Zdjęcie profilowe', displayName: 'Nazwa wyświetlana', listener: 'Słuchacz', artist: 'Artysta', saveProfile: 'Zapisz profil', account: 'Konto', language: 'Język', languageSearch: 'Szukaj języków…', subscription: 'Subskrypcja i płatności', privacy: 'Prywatność', terms: 'Regulamin', changePassword: 'Zmień hasło', dangerZone: 'Strefa zagrożenia', deleteAccount: 'Usuń konto', cancel: 'Anuluj', save: 'Zapisz' },
  common: { signIn: 'Zaloguj się', loading: 'Ładowanie…' },
});

export const ru = pack({
  nav: { home: 'Главная', discover: 'Обзор', library: 'Библиотека', forArtists: 'Артистам', upload: 'Загрузить', goLive: 'В эфир', messages: 'Сообщения', notifications: 'Уведомления', settings: 'Настройки', back: 'Назад', mainNav: 'Главное меню' },
  settings: { title: 'Настройки', subtitle: 'Управление аккаунтом', profile: 'Ваш профиль', photo: 'Фото профиля', displayName: 'Отображаемое имя', listener: 'Слушатель', artist: 'Артист', saveProfile: 'Сохранить профиль', account: 'Аккаунт', language: 'Язык', languageSearch: 'Поиск языка…', subscription: 'Подписка и оплата', privacy: 'Конфиденциальность', terms: 'Условия', changePassword: 'Сменить пароль', dangerZone: 'Опасная зона', deleteAccount: 'Удалить аккаунт', cancel: 'Отмена', save: 'Сохранить' },
  common: { signIn: 'Войти', loading: 'Загрузка…' },
});

export const uk = pack({
  nav: { home: 'Головна', discover: 'Огляд', library: 'Бібліотека', forArtists: 'Для артистів', upload: 'Завантажити', goLive: 'В ефір', messages: 'Повідомлення', notifications: 'Сповіщення', settings: 'Налаштування', back: 'Назад', mainNav: 'Головне меню' },
  settings: { title: 'Налаштування', subtitle: 'Керуйте обліковим записом', profile: 'Ваш профіль', photo: 'Фото профілю', displayName: "Ім'я", listener: 'Слухач', artist: 'Артист', saveProfile: 'Зберегти профіль', account: 'Обліковий запис', language: 'Мова', languageSearch: 'Пошук мови…', cancel: 'Скасувати', save: 'Зберегти' },
  common: { signIn: 'Увійти', loading: 'Завантаження…' },
});

export const tr = pack({
  nav: { home: 'Ana sayfa', discover: 'Keşfet', library: 'Kitaplık', forArtists: 'Sanatçılar için', upload: 'Yükle', goLive: 'Canlıya geç', messages: 'Mesajlar', notifications: 'Bildirimler', settings: 'Ayarlar', back: 'Geri', mainNav: 'Ana menü' },
  settings: { title: 'Ayarlar', subtitle: 'Hesabınızı yönetin', profile: 'Profiliniz', photo: 'Profil fotoğrafı', displayName: 'Görünen ad', listener: 'Dinleyici', artist: 'Sanatçı', saveProfile: 'Profili kaydet', account: 'Hesap', language: 'Dil', languageSearch: 'Dil ara…', cancel: 'İptal', save: 'Kaydet' },
  common: { signIn: 'Giriş yap', loading: 'Yükleniyor…' },
});

export const ar = pack({
  nav: { home: 'الرئيسية', discover: 'اكتشف', library: 'المكتبة', forArtists: 'للفنانين', upload: 'رفع', goLive: 'بث مباشر', messages: 'الرسائل', notifications: 'الإشعارات', settings: 'الإعدادات', back: 'رجوع', mainNav: 'القائمة الرئيسية' },
  settings: { title: 'الإعدادات', subtitle: 'إدارة حسابك', profile: 'ملفك الشخصي', photo: 'صورة الملف', displayName: 'الاسم الظاهر', listener: 'مستمع', artist: 'فنان', saveProfile: 'حفظ الملف', account: 'الحساب', language: 'اللغة', languageSearch: 'ابحث عن لغة…', cancel: 'إلغاء', save: 'حفظ' },
  common: { signIn: 'تسجيل الدخول', loading: 'جارٍ التحميل…' },
});

export const hi = pack({
  nav: { home: 'होम', discover: 'खोजें', library: 'लाइब्रेरी', forArtists: 'कलाकारों के लिए', upload: 'अपलोड', goLive: 'लाइव जाएँ', messages: 'संदेश', notifications: 'सूचनाएँ', settings: 'सेटिंग्स', back: 'वापस', mainNav: 'मुख्य नेविगेशन' },
  settings: { title: 'सेटिंग्स', subtitle: 'अपना खाता प्रबंधित करें', profile: 'आपकी प्रोफ़ाइल', photo: 'प्रोफ़ाइल फ़ोटो', displayName: 'प्रदर्शित नाम', listener: 'श्रोता', artist: 'कलाकार', saveProfile: 'प्रोफ़ाइल सहेजें', account: 'खाता', language: 'भाषा', languageSearch: 'भाषा खोजें…', cancel: 'रद्द करें', save: 'सहेजें' },
  common: { signIn: 'साइन इन', loading: 'लोड हो रहा है…' },
});

export const zh = pack({
  nav: { home: '首页', discover: '发现', library: '曲库', forArtists: '艺术家', upload: '上传', goLive: '开播', messages: '消息', notifications: '通知', settings: '设置', back: '返回', mainNav: '主导航' },
  settings: { title: '设置', subtitle: '管理你的账户', profile: '你的资料', photo: '头像', changePhoto: '更换头像', uploadPhoto: '上传头像', displayName: '显示名称', listener: '听众', artist: '艺术家', saveProfile: '保存资料', account: '账户', language: '语言', languageSearch: '搜索语言…', cancel: '取消', save: '保存' },
  common: { signIn: '登录', loading: '加载中…' },
});

export const ja = pack({
  nav: { home: 'ホーム', discover: '発見', library: 'ライブラリ', forArtists: 'アーティスト向け', upload: 'アップロード', goLive: 'ライブ配信', messages: 'メッセージ', notifications: '通知', settings: '設定', back: '戻る', mainNav: 'メインナビ' },
  settings: { title: '設定', subtitle: 'アカウント設定', profile: 'プロフィール', photo: 'プロフィール写真', displayName: '表示名', listener: 'リスナー', artist: 'アーティスト', saveProfile: 'プロフィールを保存', account: 'アカウント', language: '言語', languageSearch: '言語を検索…', cancel: 'キャンセル', save: '保存' },
  common: { signIn: 'サインイン', loading: '読み込み中…' },
});

export const ko = pack({
  nav: { home: '홈', discover: '탐색', library: '라이브러리', forArtists: '아티스트', upload: '업로드', goLive: '라이브', messages: '메시지', notifications: '알림', settings: '설정', back: '뒤로', mainNav: '주 메뉴' },
  settings: { title: '설정', subtitle: '계정 관리', profile: '내 프로필', photo: '프로필 사진', displayName: '표시 이름', listener: '리스너', artist: '아티스트', saveProfile: '프로필 저장', account: '계정', language: '언어', languageSearch: '언어 검색…', cancel: '취소', save: '저장' },
  common: { signIn: '로그인', loading: '로딩 중…' },
});

export const id = pack({
  nav: { home: 'Beranda', discover: 'Jelajahi', library: 'Perpustakaan', forArtists: 'Untuk artis', upload: 'Unggah', goLive: 'Siarkan', messages: 'Pesan', notifications: 'Notifikasi', settings: 'Pengaturan', back: 'Kembali', mainNav: 'Navigasi utama' },
  settings: { title: 'Pengaturan', subtitle: 'Kelola akun Anda', profile: 'Profil Anda', photo: 'Foto profil', displayName: 'Nama tampilan', listener: 'Pendengar', artist: 'Artis', saveProfile: 'Simpan profil', account: 'Akun', language: 'Bahasa', languageSearch: 'Cari bahasa…', cancel: 'Batal', save: 'Simpan' },
  common: { signIn: 'Masuk', loading: 'Memuat…' },
});

export const th = pack({
  nav: { home: 'หน้าแรก', discover: 'ค้นพบ', library: 'คลังเพลง', forArtists: 'สำหรับศิลปิน', upload: 'อัปโหลด', goLive: 'ไลฟ์', messages: 'ข้อความ', notifications: 'การแจ้งเตือน', settings: 'การตั้งค่า', back: 'กลับ', mainNav: 'เมนูหลัก' },
  settings: { title: 'การตั้งค่า', subtitle: 'จัดการบัญชีของคุณ', profile: 'โปรไฟล์ของคุณ', photo: 'รูปโปรไฟล์', displayName: 'ชื่อที่แสดง', listener: 'ผู้ฟัง', artist: 'ศิลปิน', saveProfile: 'บันทึกโปรไฟล์', account: 'บัญชี', language: 'ภาษา', languageSearch: 'ค้นหาภาษา…', cancel: 'ยกเลิก', save: 'บันทึก' },
  common: { signIn: 'เข้าสู่ระบบ', loading: 'กำลังโหลด…' },
});

export const vi = pack({
  nav: { home: 'Trang chủ', discover: 'Khám phá', library: 'Thư viện', forArtists: 'Cho nghệ sĩ', upload: 'Tải lên', goLive: 'Phát trực tiếp', messages: 'Tin nhắn', notifications: 'Thông báo', settings: 'Cài đặt', back: 'Quay lại', mainNav: 'Điều hướng chính' },
  settings: { title: 'Cài đặt', subtitle: 'Quản lý tài khoản', profile: 'Hồ sơ của bạn', photo: 'Ảnh hồ sơ', displayName: 'Tên hiển thị', listener: 'Người nghe', artist: 'Nghệ sĩ', saveProfile: 'Lưu hồ sơ', account: 'Tài khoản', language: 'Ngôn ngữ', languageSearch: 'Tìm ngôn ngữ…', cancel: 'Hủy', save: 'Lưu' },
  common: { signIn: 'Đăng nhập', loading: 'Đang tải…' },
});
