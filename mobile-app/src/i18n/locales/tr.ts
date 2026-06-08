import { BaseTranslations } from '../index';
import { languageTranslations } from '@vocably/i18n';

const translations: BaseTranslations = {
  common: {
    cancel: 'İptal',
    delete: 'Sil',
    save: 'Tamam',
    done: 'Tamam',
    close: 'Kapat',
    back: 'Geri',
    ok: 'Tamam',
    yes: 'Evet',
    no: 'Hayır',
    error: 'Hata',
    goBack: 'Geri dön',
    operationFailed: 'İşlem gerçekleştirilemedi.',
    signIn: 'Giriş yap',
    presentTenses: '(şimdiki: {{value}})',
    pastTenses: '(geçmiş: {{value}})',
    plural: '(çoğul: {{value}})',
    examples: 'Örnekler',
  },
  appLanguagePicker: {
    title: 'Uygulama dili',
  },
  nav: {
    myCards: 'Kartlarım',
    lookUp: 'Ara',
    tips: 'İpuçları',
    settings: 'Ayarlar',
    studySettings: 'Çalışma ayarları',
    editCard: 'Kartı düzenle',
    chatWithCard: 'Kart hakkında sohbet et',
    cardGenerator: 'Kart oluşturucu',
    feedback: 'Geri bildirim',
    createAccount: 'Hesap oluştur',
    previewStudyStep: 'Çalışma adımını önizle',
    exportDeck: 'Kartları dışa aktar',
  },
  settings: {
    notRegistered: 'Henüz kayıtlı değilsin.',
    createAccount: 'Hesap oluştur',
    appLanguage: 'Uygulama dili: {{label}}',
    studySettings: 'Çalışma ayarları',
    studyReminders: {
      title: 'Çalışma hatırlatıcıları',
      body: 'Çalışma hatırlatıcıları, <bold>{{languageName}}</bold> kartlarını gözden geçirmen için günde bir kez gönderilir.',
      perLanguageHint:
        'Her dilin kendine ait hatırlatıcı ayarları «Dili düzenle» ekranından yapılır.',
      unregisteredHint:
        'Çalışma hatırlatıcıları, kayıtsız kullanıcılar için kullanılamaz.',
    },
    feedback: {
      title: 'Geri bildirim gönder',
      body: 'Önemli bir özellik mi eksik veya Vocably hakkındaki düşüncelerini benimle paylaşmak mı istiyorsun? Senden haber almayı çok isterim.',
    },
    signOut: 'Çıkış yap',
    deleteAccount: {
      menuItem: 'Hesabımı sil',
      title: 'Hesabını silmek istiyor musun?',
      message: 'Bu işlem geri alınamaz.',
    },
    deleteData: {
      menuItem: 'Verilerimi sil',
      title: 'Verilerini silmek istiyor musun?',
      message: 'Bu işlem geri alınamaz.',
    },
    version: 'Sürüm: {{version}}',
  },
  feedback: {
    thanksTitle: 'Geri bildirimin için teşekkürler.',
    thanksFollowUp: 'Kısa süre içinde e-postayla seninle iletişime geçeceğim.',
    sendFailed:
      'Bir şeyler ters gitti. Geri bildirimin gönderilemedi. Lütfen tekrar dene veya d@vocably.pro adresinden bana ulaş.',
    noEmailTitle: 'E-posta yok',
    noEmailMessage:
      'Lütfen sana yanıt verebilmem için mesajının içinde bir e-posta adresi ekle.',
    send: 'Gönder',
    intro:
      'Soruların veya özellik istekleri mi var? Bana istediğin zaman ulaşabilirsin.',
    personalReply:
      'Her başvuruyu kişisel olarak ben yanıtlarım ve birkaç gün içinde e-postana dönerim.',
    willReplyTo: 'Sana <bold>{{email}}</bold> adresine cevap vereceğim.',
    privateRelayNote:
      'Kayıt sırasında özel bir Apple e-postası paylaşmışsın gibi görünüyor, ama merak etme — sorunsuz çalışmalı.',
    provideEmail:
      'Geri bildirimine kişisel bir yanıt verebilmem için lütfen e-posta adresini yaz.',
    yourMessage: 'Mesajın',
  },
  error: {
    clearData: {
      title: 'Uygulama verileri temizlensin mi?',
      message:
        'Uygulama verilerini temizlemek, kayıtsız kullanıcılar için tüm ilerlemeyi kalıcı olarak siler. Devam edilsin mi?',
    },
    tryAgain: 'Tekrar dene',
    tryHarder: 'Daha çok çalış!',
    clearAndSignOut: 'Uygulama verilerini temizle ve çıkış yap',
  },
  howToGroupCards: {
    intro: 'Kartları etiketlerle gruplayabilirsin.',
    swipeLeft: 'Mevcut bir kartı sola kaydır ve <tagPlusIcon /> düğmesine bas.',
    tapOnNew: 'Veya yeni eklenen bir kartta <tagPlusIcon /> düğmesine bas.',
    studyByTag:
      'En az bir etiket oluşturulduğunda, seçili bir etiketi veya etiket grubunu çalışmak için Çalış düğmesindeki <tagIcon /> simgesine bas.',
    swipeToEdit:
      'Listede etiketi düzenlemek veya silmek için üzerinde kaydır. Kartların silinmez.',
  },
  subscription: {
    loadingCustomerStatus: 'Müşteri durumu yükleniyor',
    goPremium: "Premium'a geç",
  },
  premium: {
    label: 'Premium',
    nextPayment: 'Sonraki ödeme: {{date}}',
    validUntil: 'Geçerlilik: {{date}}',
    manageSubscription: 'Aboneliği yönet',
    refreshHint:
      'Değişikliklerin uygulamaya yansıması birkaç dakika sürebilir.',
    refresh: 'Yenile',
  },
  paidAccount: {
    youArePremium: 'Premium kullanıcısın',
    why: 'Neden?',
    iDontKnow: 'Bilmiyorum.',
    possibleReasons: 'Olası nedenler:',
    reasonEarlyUser: "Vocably'nin ilk aktif kullanıcılarından birisin",
    reasonILikeYou: 'Seni seviyorum',
    enjoyPremium: "Her durumda, Premium'un tadını çıkar.",
    wantToHelp:
      "Bu uygulamaya yardım etmek ister misin? <rate>{{storeName}}'da değerlendir</rate>.",
  },
  debug: {
    menuTitle: 'Hata ayıklama menüsü',
    languageTransformations: 'Dil dönüşümleri',
    studyStreak: 'Çalışma serisi',
    clearStorage: 'Depolama verilerini temizle',
  },
  studySettings: {
    maxCardsPerSession: 'Her çalışma oturumundaki maksimum kart sayısı',
    maxNeverStudiedPerDay:
      'Günde alınabilecek maksimum «hiç çalışılmamış» kart sayısı',
    maxNeverStudiedHint:
      'Bu seçenek yalnızca «Hiç çalışılmamış» grubunda birikmiş çok sayıda yeni kartı olan deneyimli kullanıcılar için anlamlıdır.',
    pronounceExample: 'Örnek cümleyi seslendir',
    pronounceExampleHint:
      'Bu seçenek, çalışma sırasında uygun anlarda rastgele bir örnek cümle çalmasını sağlar. <icon /> seçeneği açık olmalıdır — bu seçenek Çalışma ekranının sağ üst köşesindedir.',
    randomize: 'Çalışmak için kartları rastgele seç',
    randomizeHint:
      '<warningIcon /> Bu seçeneği açmak genellikle <bold>kötü bir fikirdir</bold>. Akıllı çalışma algoritmasını devre dışı bırakır. Akıllı algoritmayı devre dışı bırakanlar zamanla ilerlemelerinden hayal kırıklığına uğrar.',
    srsLink:
      "Vocably'nin akıllı çalışma algoritmasını nasıl kullanarak daha kısa sürede daha çok kelime öğrenmene yardımcı olduğunu okuyabilirsin.",
  },
  studyFlow: {
    mf: 'Doğru çeviriyi seç (çoktan seçmeli soru)',
    sf: 'Doğru çeviriyi hatırla',
    mb: 'Doğru kelimeyi veya ifadeyi seç (çoktan seçmeli soru)',
    ab: 'Doğru kelimeyi veya ifadeyi harflere göre düzenle',
    sb: 'Doğru kelimeyi veya ifadeyi hatırla',
    default: 'Yeni adım',
    preview: 'Önizleme',
    premiumOnly: 'Premium kullanıcılara açık',
    upgradeToPremium: "Premium'a geç",
    heading: 'Kart başına çalışma adımları',
    rearrangeHintBefore: 'Adımları yeniden düzenlemek için ',
    rearrangeHintAfter: ' kullan.',
  },
  cardsLimit: {
    openVocablySettings: "Yükseltmek için Vocably → Ayarlar'ı aç.",
    upgradeToPremium: "Premium'a geç",
    collectionHas_one:
      'Koleksiyonunda <bold>{{maxCards}}</bold> kart var. Şimdi günde <bold>{{count}} kart</bold> kaydedebilirsin. Premium kullanıcıların bu sınırı yoktur.',
    collectionHas_other:
      'Koleksiyonunda <bold>{{maxCards}}</bold> kart var. Şimdi günde <bold>{{count}} kart</bold> kaydedebilirsin. Premium kullanıcıların bu sınırı yoktur.',
    collectionHasMoreThan_one:
      'Koleksiyonunda <bold>{{maxCards}}</bold> karttan fazla var. Şimdi günde <bold>{{count}} kart</bold> kaydedebilirsin. Premium kullanıcıların bu sınırı yoktur.',
    collectionHasMoreThan_other:
      'Koleksiyonunda <bold>{{maxCards}}</bold> karttan fazla var. Şimdi günde <bold>{{count}} kart</bold> kaydedebilirsin. Premium kullanıcıların bu sınırı yoktur.',
  },
  chat: {
    thinking: 'Düşünüyor...',
    errorOccurred: 'Bir hata oluştu. Lütfen tekrar dene.',
    explain: 'Açıkla',
    examples: 'Örnekler',
    remember: 'Hatırla',
    explainMessage: 'Açıkla',
    examplesMessage: 'Birkaç örnek cümle ver',
    rememberMessage: 'Bu kartı hatırlamama yardım et',
    inputDisabled: 'Bu giriş şu anda devre dışı.',
    inputPlaceholder: 'Mesajını buraya yaz...',
    initialMessage:
      '**{{source}}** hakkında istediğin her şeyi sorabilirsin, örneğin:\n\n  * anlamını açıkla\n  * örnekler ver\n  * hatırlamama yardım et',
    initialMessageWithPartOfSpeech:
      '{{partOfSpeech}} **{{source}}** hakkında istediğin her şeyi sorabilirsin, örneğin:\n\n  * anlamını açıkla\n  * örnekler ver\n  * hatırlamama yardım et',
  },
  dashboard: {
    loadingCards: 'Kartlar yükleniyor...',
    study: 'Çalış',
    studySection: 'Çalış',
    studySelectedTags: 'Çalış',
    tagsLabel: 'Etiketler:',
    cardsWithNoTags: 'Etiketsiz kartlar',
    cantWait: 'Şimdi çalış',
    deleteCardFailedTitle: 'Hata: Kart silinemedi',
    deleteCardFailedMessage:
      'Hay aksi! Kart silinmeye çalışılırken bir şeyler ters gitti. Lütfen daha sonra tekrar dene.',
    searchPlaceholder: 'Koleksiyonunda ara...',
    section: {
      today: 'Bugün için planlanan',
      expired: 'Yetiştirmek için',
      notStarted: 'Hiç çalışılmamış',
      tomorrow: 'Yarın',
      future: 'Planlanan',
    },
    empty: {
      noCardsYet: 'Henüz çalışma kartın yok.',
      headOverToLookUp:
        'Yeni kelimeler bulup eklemek için Ara sekmesine geç. Vocably, yerleşik bir öğrenme sistemine sahip bir sözlüktür.',
      headOverToGenerator:
        'Ya da kart oluşturucuyu kullanarak çalışma kartları oluştur.',
      goToLookUp: "Ara'ya git",
      goToGenerator: 'Kart oluşturucuyu kullan',
      noCardsForSearch: '<bold>{{searchText}}</bold> için kart bulunamadı.',
      noCardsForTag: '<bold>{{tagTitle}}</bold> etiketli kartın yok.',
      noCardsForTags: 'Seçili etiketler için kart bulunamadı.',
    },
    mayBeStudiedIn_one: '{{count}} dakika sonra çalışılabilir.',
    mayBeStudiedIn_other: '{{count}} dakika sonra çalışılabilir.',
    dueDate: {
      tomorrow: 'yarın',
      inDays_one: '{{count}} gün içinde',
      inDays_other: '{{count}} gün içinde',
    },
  },
  deck: {
    editDeckTitle: '{{languageName}} düzenle',
    studyRemindersTitle: '{{languageName}} için çalışma hatırlatıcıları',
  },
  editCard: {
    updateFailedTitle: 'Hata: Kart güncellenemedi',
    updateFailedMessage:
      'Hay aksi! Kart güncellenmeye çalışılırken bir şeyler ters gitti. Lütfen tekrar dene.',
    deletePrompt: {
      title: 'Bu kartı sil?',
      message: 'Bu işlem geri alınamaz.',
    },
    unableToDelete: 'Kart silinemedi. Lütfen tekrar dene.',
    deletingCard: 'Kart siliniyor...',
    resetPrompt: {
      title: 'Çalışma ilerlemesi sıfırlansın mı?',
      message: 'Bu işlem geri alınamaz.',
      confirm: 'Sıfırla',
    },
    unableToReset: 'Çalışma ilerlemesi sıfırlanamadı. Lütfen tekrar dene.',
    addOrRemoveTags: 'Kart etiketlerini (klasörler) ekle veya kaldır',
    resetStudyProgress: 'Çalışma ilerlemesini sıfırla',
    rawCardData: 'Ham kart verisi',
  },
  editDeck: {
    studySettings: 'Çalışma ayarları',
    exportDeck: 'Dili dışa aktar',
    studyReminders: 'Çalışma hatırlatıcıları',
    studyRemindersUnregisteredHint:
      'Çalışma hatırlatıcıları, kayıtsız kullanıcılar için geçici olarak devre dışı.',
    hideDefinitions: 'Tanımları gizle',
    hideDefinitionsHint:
      'Uygulama, Kartlarım ekranında ve çalışma sırasında daha az tanım göstermeye çalışır.',
    deckContainsCards_one: '{{count}} kartın var.',
    deckContainsCards_other: '{{count}} kartın var.',
    deleteDeck: 'Bu dili sil',
    deleteDeckPrompt: {
      title: '{{languageName}} silinsin mi?',
      message: 'Bu işlem geri alınamaz.',
    },
    deleteDeckError: {
      title: 'Hata: Dil silinirken sorun çıktı',
      message:
        'Hay aksi! Dil silinmeye çalışılırken bir şeyler ters gitti. Lütfen daha sonra tekrar dene.',
    },
  },
  generateCards: {
    loadingPreset: 'Çeviri ön ayarı yükleniyor...',
    errorUnable: 'Kartlar oluşturulamadı. Lütfen tekrar dene.',
    intro: 'Ne istediğini yaz, Vocably senin için kartları oluştursun.',
    experimental:
      'Bu deneysel bir özelliktir. Bir hata bulursan veya önerilerin varsa <feedback>bana bildir</feedback>.',
    examplesToTry: 'Denemen için bazı örnekler:',
    exampleIrregularVerbs: 'düzensiz fiiller',
    exampleAnimals: 'hayvanlar',
    examplePopularIdioms: 'popüler deyimler',
    placeholder: 'Aklına ne gelirse...',
    generating: 'Kartlar oluşturuluyor...',
    followingWillBeGenerated: 'Aşağıdaki kartlar oluşturulacak:',
  },
  languageSelector: {
    addNewLanguage: 'Yeni dil ekle',
    popularLanguages: 'Popüler diller',
    selected: 'Seçildi',
    availableLanguages: 'Kullanılabilir diller',
    select: 'Seç',
    studyLanguage: 'Çalışılan dil',
    yourLanguages: 'Dillerin',
    deviceLanguage: 'Cihaz dili',
    preferredLanguages: 'Tercih edilen diller',
    motherTongue: 'Anadil',
    preferred: 'Popüler diller',
    search: 'Ara...',
  },
  lookUp: {
    loadingPreset: 'Çeviri ön ayarı yükleniyor...',
    lookUpFailedTitle: 'Hata: Arama başarısız',
    lookUpFailedMessage:
      'Hay aksi! Arama yapılırken bir şeyler ters gitti. Lütfen daha sonra tekrar dene.',
    searchPlaceholder: 'Herhangi bir dilde herhangi bir kelime',
    lookingForCollections: 'Kart koleksiyonu mu arıyorsun?',
    tryAiGenerator: 'AI kart oluşturucuyu dene',
    questionsOrSuggestions: 'Sorular veya öneriler?',
    connectOnTelegram: "Telegram'dan bağlan",
    joinDiscord: "Discord'a katıl",
    sendMessage: 'Mesaj gönder',
    conductingAnalysis: 'Daha ayrıntılı analiz yapılıyor...',
    selectLanguageLearning: 'Öğrendiğin dili seç.',
    selectMotherTongue: 'Anadilini seç',
  },
  notifications: {
    checking: 'Kontrol ediliyor...',
    loadingPreset: 'Ön ayar yükleniyor...',
    loadFailed: {
      sorry: 'Çok üzgünüm.',
      cannotLoad: 'Sistem, çalışma hatırlatıcı durumunu yükleyemiyor.',
      informed: 'Bu konuda zaten bilgilendirildim.',
      tryAgain: 'Lütfen daha sonra tekrar dene.',
    },
    enabledFor: '{{languageString}} için açık',
    remindersDescription:
      'Çalışma hatırlatıcıları, {{languageName}} kartlarını gözden geçirmen için günde bir kez gönderilir.',
    failedTitle: 'Çalışma hatırlatıcıları başarısız',
    failedAndroidMessage:
      'Bildirimler otomatik olarak ayarlanamıyor. Lütfen Uygulama Bilgileri ayarlarından etkinleştir.',
    failedIosMessage:
      'Bildirimler otomatik olarak ayarlanamıyor. Lütfen Ayarlar → Vocably üzerinden etkinleştir.',
    deniedAndroidMessage:
      'Bildirimler otomatik olarak ayarlanamıyor. Lütfen Uygulama Bilgileri ayarlarından etkinleştir.',
    deniedIosMessage:
      'Bildirimler otomatik olarak ayarlanamıyor. Lütfen Ayarlar → Vocably üzerinden etkinleştir.',
    openSettings: 'Ayarları aç',
    enableReminders: 'Hatırlatıcıları etkinleştir',
    receiveAt: 'Saat',
  },
  study: {
    loading: 'Yükleniyor...',
    finish: 'Bitir',
    takeOneMoreRound: 'Bir tur daha yap',
    cardUpdateFailedTitle: 'Hata: Kart güncellenemedi',
    cardUpdateNetworkError:
      'Bağlantı koptuğu için cevabın kaydedilemedi. Oturum duracak ve başarısız olan cevaptan devam edecek.',
    cardUpdateTechnicalError:
      'Hay aksi! Teknik bir sorun nedeniyle çalışma oturumuna devam edilemiyor. Lütfen daha sonra tekrar dene.',
    exitStudySession: 'Çalışma oturumundan çık',
    tapDot: {
      touch: 'Dokun',
    },
    swipeGrade: {
      notYet: 'Henüz değil',
      almost: 'Neredeyse',
      gotIt: 'Biliyorum!',
    },
    arrangeByLetters: {
      showMeTheAnswer: 'Cevabı göster',
    },
    cardBack: {
      emptyCardMessage: 'Bu kartın çevirisi veya tanımı yok. Bu kartı düzenle.',
    },
    multiChoice: {
      showCorrectAnswer: 'Doğru cevabı göster',
    },
    reverseCardBack: {
      theAnswerIs: 'Cevap',
    },
    reverseCardFront: {
      examples_one: 'Örnek:',
      examples_other: 'Örnekler:',
    },
    motivationalQuotes: {
      '0': 'Azim uzun bir koşu değildir; birbiri ardına gelen birçok kısa koşudur.',
      '1': 'Nehir kayayı gücüyle değil, kararlılığıyla deler.',
      '2': 'Kararlılık, sonuçların kaçınılmaz olmasını garantiler.',
      '3': 'Sabır ve kararlılık, büyüklüğün anahtarlarıdır.',
      '4': 'İleri atılan her adım, ne kadar küçük olursa olsun, bir ilerlemedir.',
      '5': 'Kararlılık hayalleri gerçeğe dönüştürür; her çaba başarının tohumudur.',
      '6': 'Her ileri attığınız adım, hikâyenizi başarıyla yeniden yazar.',
      '7': 'Kendinize inanmaya devam edin — kararlılığınız sizin süper gücünüzdür.',
      '8': 'Başarı, birer birer yerleştirilen kararlılık tuğlalarından inşa edilir.',
      '9': 'Evren, ileri gitmekten asla vazgeçmeyenler için harekete geçer.',
      '10': 'Bugün ortaya koyduğunuz enerji, yarının başarısına yakıt olur.',
      '11': 'Kararlılık imkânsızı kaçınılmaza dönüştürür.',
      '12': 'Öğrendiğiniz her kelime, sizi yeni bir kültürü anlamaya bir adım daha yaklaştırır.',
      '13': 'Dil öğrenmek bir maraton, bir sprint değildir. Çok iyisiniz!',
      '14': 'Kararlılık, akıcı olmanın gizli içeriğidir. Devam edin!',
      '15': 'Dil öğreniminde başarının anahtarı pratiktir. Doğru yoldasınız!',
      '16': 'İkinci bir dil sadece bir yetenek değil, vermeye devam eden bir hediyedir.',
      '17': 'Her çalışmanızda, beyninizi başarı için yeniden programlıyorsunuz.',
      '18': 'Bir dil öğrenicisi, kılık değiştirmiş bir dünya kâşifidir.',
      '19': 'Öğrenirken yaptığınız her hata, büyüdüğünüzün kanıtıdır.',
      '20': 'Diller dünyanın anahtarlarıdır; öğrendiğiniz her kelime yeni kapılar açar.',
      '21': 'Akıcılık hız değildir; her gün ortaya çıkmak ve pratik yapmaktır.',
      '22': 'Yeni bir dil size yalnızca kelimeler değil, yeni düşünme biçimleri de öğretir.',
      '23': 'Küçük ama sürekli çabalar, dil öğreniminde hayatı değiştiren büyük sonuçlara yol açar.',
      '24': 'Bir dil öğrenmek için ayırdığınız zamana asla pişman olmayacaksınız — bu kendinize yaptığınız bir yatırımdır.',
      '25': 'Öğrendiğiniz her dil, kimliğinize yeni bir boyut katar.',
      '26': 'Bugün zor gelse bile, yarın çabalarınız yüzünüzü güldürecek.',
      '27': 'Akıcılığa giden yol, anlatılmaya değer bir hikâyedir — yazmaya devam edin.',
    },
  },
  exportDeck: {
    title: '{{languageName}} dışa aktar',
    loadingCards: 'Kartlar yükleniyor...',
    advancedExportInfo:
      'Daha gelişmiş dışa aktarma işlevi yalnızca kayıtlı kullanıcılar için web tarayıcısında kullanılabilir.',
    loginWithAccount: 'Hesabınla giriş yap',
    deprecatedCardsExcluded:
      'Eski bir sözlük sağlayıcısıyla oluşturuldukları için bazı kartlar hariç tutuldu.',
    copyToClipboard: 'Panoya kopyala',
    copiedToClipboard: 'Panoya kopyalandı.',
  },
  loginModal: {
    syncAcrossDevices: 'Cihazlar arasında senkronize et',
    useBrowserExtensions: 'Tarayıcı uzantılarını kullan',
    importExportCsv: 'CSV verilerini içe ve dışa aktar',
  },
  loginForm: {
    screenTitle: 'Giriş yap veya kayıt ol',
    signIn: 'Giriş yap veya hesap oluştur',
    bySigningInYouAgreeToOur: 'Giriş yaparak şunları kabul etmiş olursun:',
    termsAndConditions: 'Şartlar ve Koşullar',
    and: 've',
    privacyPolicy: 'Gizlilik Politikası',
  },
  languageScreen: {
    motherTongueQuestion: 'Anadilin nedir?',
    motherTongueHint: 'Akıcı şekilde konuşabildiğin dili seç.',
  },
  welcome: {
    formIntro: 'Başlamak için lütfen birkaç soruyu yanıtla.',
    questionStudyLanguage: 'Hangi dili çalışıyorsun?',
    multipleLanguagesHint:
      'Birden fazla dil öğrenebilirsin. Şimdilik başlamak için bir tane seç.',
    setup: 'Kurulum',
    previous: 'Önceki',
    next: 'Sonraki',
    skip: 'Atla',
    goToApp: 'Uygulamaya git',
    slideCard: {
      looksUpWords:
        'Vocably kelimeleri arar ve şuna benzer flash kartlar oluşturur:',
      translatesWords:
        'Vocably kelimeleri çevirir ve şuna benzer flash kartlar oluşturur:',
      fallbackNote: 'Vocably yazarından bir not',
      fallbackBody:
        'Bu örnek kartlar yanlış ve kafa karıştırıcı. Bunun için özür dilerim. {{sourceLang}} öğrenen ve {{targetLang}} konuşan kullanıcılar için doğru örnekler üzerinde çalışıyorum.',
      saveFlashcardsBefore: 'Flash kartlarını',
      saveFlashcardsAfter:
        'kaydedebilir ve aralıklı tekrar sistemiyle çalışabilirsin.',
    },
    slideLookUp: {
      intro:
        '<bold>{{sourceLanguage}}</bold> dilinde yeni bir kelime veya ifade mi görüyor ya da duyuyorsun? Ara ve bir flash kart olarak kaydet!',
    },
    slideReverseTranslate: {
      intro:
        '<bold>{{sourceLanguage}}</bold> dilinde bir şey söylemek istiyor ama kelimeyi bilmiyor musun? <bold>{{targetLanguage}}</bold> dilinde ara.',
    },
    slideSelectToTranslate: {
      into_Safari:
        "Mobil Safari'de yeni bir kelime mi gördün? <bold>Vocably uzantısı</bold> ile ara.",
      into_Android: 'Android cihazının ekranında yeni bir kelime mi gördün?',
      androidStep1: 'Kelimeyi seç',
      androidStep2: 'Tıkla',
      androidStep3: "«Translate with Vocably»'ye tıkla",
    },
    slideDesktopBrowser: {
      intro:
        "Masaüstü bilgisayar mı kullanıyorsun? Web'de gezinmek için şu dillerden birinde",
      or: 'veya',
      browserExtensionSuffix: 'tarayıcı uzantısını yükle',
    },
  },
  languages: {
    loading: 'Diller yükleniyor...',
  },
  auth: {
    authenticating: 'Kimlik doğrulanıyor...',
    sessionExpired: 'Kimlik doğrulama oturumunun süresi doldu.',
    signInAgain: 'Tekrar giriş yap',
    anonymousUserError: {
      title: 'Anonim kullanıcı oluşturulamadı',
      message: 'Anonim kullanıcı oluşturulurken kritik bir hata oluştu.',
    },
  },
  tagMenu: {
    intro:
      'Etiketler gruplar veya klasörler gibidir, ama daha iyisidir. Başlamak için «Yeni etiket ekle»ye bas.',
    addNewTag: 'Yeni etiket ekle',
    editTag: '{{title}} düzenle',
    swipeLeftToEdit: 'Etiketi düzenlemek için sola kaydır.',
    swipeRightToDelete: 'Etiketi silmek için sağa kaydır. Kartların silinmez.',
    removeTagError: 'Etiket kaldırılırken bir hata oluştu. Lütfen tekrar dene.',
    updateTagError:
      'Etiket güncellenirken bir hata oluştu. Lütfen tekrar dene.',
    add: 'Ekle',
    newTagName: 'Yeni etiket adı',
  },
  cardForm: {
    wordOrPhrase: 'Kelime veya ifade',
    translation: 'Çeviri',
    partOfSpeech: 'Sözcük türü',
    transcriptionIpa: 'Transkripsiyon (IPA)',
    definition: 'Tanım',
    example: 'Örnek',
    partsOfSpeech: {
      noun: 'isim',
      verb: 'fiil',
      adjective: 'sıfat',
      adverb: 'zarf',
      phrase: 'ifade',
    },
  },
  discoverySurvey: {
    screenTitle: 'Son soru',
    question: "Vocably'yi nasıl duydun?",
    whatIsIt: 'Tam olarak nasıl?',
    typePlaceholder: 'Buraya yaz',
    sources: {
      playStore: 'Play Store',
      appStore: 'App Store',
      fromAFriend: 'Bir arkadaştan',
      other: 'Diğer',
    },
  },
  tips: {
    menu: {
      editCards: 'Kartları düzenle',
      groupCards: 'Kartları grupla (klasörlerde)',
      importExportCsv: 'CSV içe ve dışa aktar',
      studyPlan: 'Çalışma planı',
      androidTranslate:
        'Telefonundaki herhangi bir uygulamada seçilen metni nasıl çevirirsin.',
      iosTranslate:
        'Vocably iOS Safari uzantısıyla herhangi bir web sitesinde herhangi bir kelimeyi çevir.',
      desktopExtension:
        'Bilgisayarında Chrome veya Safari mi kullanıyorsun? Vocably uzantısını dene.',
      grammarChecker:
        'Yeni dilbilgisi denetleyici aracını dene. Yalnızca hatalarını düzeltmekle kalmaz, nedenini de açıklar.',
      provideFeedback: 'Geri bildirim gönder',
      feedbackBody:
        'Önemli bir özellik mi eksik veya Vocably hakkındaki düşüncelerini benimle paylaşmak mı istiyorsun? Senden haber almayı çok isterim.',
      supportBody:
        "Vocably'nin büyümesine yardım etmek ister misin? Bu eylemlerden herhangi biri bu proje için inanılmaz bir fark yaratır.",
      rate: "{{storeName}}'da uygulamayı değerlendir",
      shareOnFacebook: "Uygulamayı Facebook'ta arkadaşlarınla paylaş",
      shareOnTwitter: "Uygulamayı Twitter/X'te paylaş",
    },
    howToEditCards: {
      title: 'Kartları düzenle',
      intro: 'Kartları iki şekilde düzenleyebilirsin:',
      myCardsItem:
        '• <bold>Kartlarım ekranı</bold>: Düzenleme menüsünü görmek için bir kartı sola kaydır.',
      studySessionItem:
        '• <bold>Çalışma oturumu</bold>: «Düzenle» (<editIcon/>) düğmesine dokun.',
    },
    howToGroupCards: {
      title: 'Kartları grupla',
    },
    howToImportAndExport: {
      title: 'CSV içe ve dışa aktar',
      importCards: 'Kartları içe aktar',
      importNote:
        '<alertIcon/> İçe aktarma yalnızca kayıtlı kullanıcılar için kullanılabilir. Web sitesine yönlendirileceksin.',
      exportCards: '{{languageName}} kartlarını dışa aktar',
    },
    howToViewStudyStatistics: {
      title: 'Çalışma planı',
      para1:
        '<bold>Çalışma Planı</bold> varsayılan olarak etkindir ve bugün için planlanan, yaklaşan günler için planlanan ve süresi dolup gözden geçirilmesi gereken kartlara dair genel bir bakış sağlar. Bu, hedefte kalmana, geciken kartları yetiştirmene ve öğrenmeye daha stratejik yaklaşmana yardımcı olur.',
      para2:
        'Çalışma planını görmek için <myCards>Kartlarım</myCards> sekmesine git ve sol üst köşedeki <chartBoxIcon/> düğmesine dokun.',
      para3:
        "<bold>Önemli:</bold> Kartlar rastgele seçildiğinde çalışma planı kullanılamaz. Rastgele kart seçimini devre dışı bırakmak için <studySettings>Çalışma ayarları</studySettings>'na git.",
    },
  },
  shareIntent: {
    login: {
      openVocablyToSignIn: "Giriş yapmak için Vocably'yi aç.",
      openVocably: "Vocably'yi aç",
    },
    receivingText: 'Metin alınıyor...',
  },
  paymentSuccess: {
    thankYou:
      "Vocably'ye şans verdiğin için teşekkürler. Desteğin benim için çok değerli.",
    rateButton: "Vocably'yi {{storeName}}'da değerlendir",
    feedbackBefore:
      'Bir şey eksikse veya beğenmediğin bir şey varsa, bana her zaman Discord, Telegram veya',
    feedbackLink: 'doğrudan uygulamadan',
    feedbackAfter: ' yazabilirsin. Her geri bildirimi ciddiye alıyorum.',
  },
  requestFeedback: {
    question:
      "Vocably'yi sevdin mi? {{storeName}}'daki değerlendirmen bir dakikadan az sürer ve bu projeye yardımcı olur.",
    rateButton: "Vocably'yi {{storeName}}'da değerlendir",
    later: 'Daha sonra sor',
    feedbackBefore:
      'Bir şey eksikse veya beğenmediğin bir şey varsa, her zaman',
    feedbackLink: 'bana bildirebilirsin',
    feedbackAfter: '. Her geri bildirimi ciddiye alıyorum.',
    neverAgain: 'Bu mesajı bir daha görmek istemiyorum',
  },
  cardDefinition: {
    present: 'Şimdiki:',
    past: 'Geçmiş:',
    plural: 'Çoğul:',
  },
  streak: {
    consecutiveDays_one: 'art arda gün.',
    consecutiveDays_other: 'art arda gün.',
    days: {
      '0': 'Paz',
      '1': 'Pzt',
      '2': 'Sal',
      '3': 'Çar',
      '4': 'Per',
      '5': 'Cum',
      '6': 'Cmt',
    },
  },
  language: languageTranslations.tr,
};

export default translations;
