import { languageTranslations } from '@vocably/i18n';

export const uk = {
  'welcome.no_extension':
    'Схоже, у вас не встановлено або не увімкнено розширення браузера.',
  'welcome.install_extension': 'Встановити або увімкнути розширення',
  'welcome.no_install': 'Я не хочу встановлювати розширення',
  'welcome.use_mobile': 'Ви можете використовувати мобільний додаток.',
  'welcome.scan_qr': 'Відскануйте QR-код нижче:',
  'welcome.open_mobile_link':
    'Або відкрийте це посилання на мобільному пристрої:',
  'welcome.index.mother_tongue': 'Моя рідна мова',
  'welcome.index.i_study': 'Мова, яку я вивчаю',
  'welcome.index.show_more': 'Показати більше мов',
  'welcome.index.multilang': 'Я хочу вивчати кілька мов.',
  'welcome.second.loading': 'Завантаження прикладу тексту...',
  'welcome.second.study_sentence':
    'Мова, яку ви вивчаєте — <strong class="text-emphasize">{{sourceLanguage}}</strong>, а ваша рідна мова — <strong class="text-emphasize">{{targetLanguage}}</strong>.',
  'welcome.second.change': 'Змінити',
  'welcome.second.try_select':
    'Щоб зрозуміти, як працює розширення, спробуйте виділити будь-яке слово або фразу в тексті нижче.',
  'welcome.second.how_it_works': 'Як це працює —',
  'welcome.second.three_steps': 'лише 3 кроки',
  'welcome.second.step1_heading': 'Виділіть',
  'welcome.second.step1_desc': 'Будь-яке слово або фразу на будь-якому сайті.',
  'welcome.second.step2_heading': 'Дізнайтесь значення',
  'welcome.second.step2_desc':
    'Vocably покаже переклад і приклади використання.',
  'welcome.second.step3_heading': 'Збережіть і вчіть',
  'welcome.second.step3_desc':
    'Вчіть збережені слова прямо на цьому сайті або в мобільному додатку.',
  'welcome.multilang.p1': 'Vocably дуже зручний для вивчення кількох мов.',
  'welcome.multilang.p2':
    'Розширення автоматично визначає мову сайту та використовує правильну мову перекладу.',
  'welcome.multilang.p3':
    'Щоб змінити мову навчання та перекладу, просто змініть випадаючий список.',
  'welcome.multilang.p4':
    'Зараз давайте зосередимося на мові, яку ви хочете вивчати в першу чергу.',
  'welcome.multilang.close': 'Закрити',
  'welcome.generic.select_highlight': 'Виділіть',
  'welcome.generic.select_rest':
    'будь-яке слово або фразу на будь-якому сайті, щоб дізнатися значення.',

  // Auth
  'auth.carousel.slide1_text1':
    'Миттєві контекстні переклади на будь-якому сайті.',
  'auth.carousel.slide1_text2': 'Зберігайте переклади як картки.',
  'auth.carousel.slide2':
    'Опановуйте збережені слова за допомогою інтерактивних тестів і завдань.',
  'auth.carousel.slide3': 'Перекладайте прямо із субтитрів YouTube.',
  'auth.carousel.slide4':
    'Перекладайте і зберігайте слова під час відеозвонків.',
  'auth.carousel.slide5':
    'Не знаєте потрібне слово? Знайдіть його рідною мовою.',
  'auth.carousel.need_account': 'Для використання Vocably потрібен акаунт.',
  'auth.sign_in.button': 'Увійти або створити акаунт',
  'auth.sign_in.agree': 'Входячи, ви погоджуєтесь з нашими',
  'auth.sign_in.terms': 'Умовами використання',
  'auth.sign_in.and': 'та',
  'auth.sign_in.privacy': 'Політикою конфіденційності',
  'auth.hands_free.not_installed':
    'Схоже, розширення браузера не встановлено або не увімкнено.',
  'auth.hands_free.please_install':
    'Встановіть або увімкніть розширення та спробуйте знову.',
  'auth.hands_free.but_installed': 'Але у мене воно встановлено',
  'auth.hands_free.safari_bug':
    'Схоже, ви зіткнулися з помилкою Safari, яка заважає виявити розширення.',
  'auth.hands_free.ios_steps_title': 'Ось що потрібно зробити:',
  'auth.hands_free.ios_step1':
    'Перейдіть до Налаштування iOS -> Safari -> Розширення -> Vocably for Safari',
  'auth.hands_free.ios_step2': 'Зніміть позначку «Дозволити розширення»',
  'auth.hands_free.ios_step3': 'Закрийте Safari',
  'auth.hands_free.ios_step4':
    'Знову відкрийте Налаштування iOS і поставте позначку «Дозволити розширення» для Vocably for Safari',
  'auth.hands_free.sorry':
    'Вибачте за незручності — я працюю над виправленням.',
  'auth.hands_free.restart_safari': 'Спробуйте перезапустити Safari.',
  'auth.hands_free.signing_in': 'Вхід...',
  'auth.sign_in_success.loading': 'Завантаження даних профілю...',
  'auth.sign_in_success.signed_in': 'Ви успішно увійшли в систему.',
  'auth.sign_in_success.tab_can_close': 'Цю вкладку можна закрити.',
  'auth.sign_in_success.close_tab': 'Закрити цю вкладку',
  'auth.sign_in_success.show_how': 'Покажи, як працює Vocably',
  'auth.sign_in_success.redirecting': 'Перенаправлення...',
  'auth.sign_out.signed_out': 'Ви успішно вийшли з системи.',
  'auth.sign_out.go_to_sign_in': 'Перейти на сторінку входу',

  // Decks
  'decks.loading': 'Завантаження колекцій...',
  'decks.loading_cards': 'Завантаження карток...',
  'decks.dashboard.study': 'Розпочати навчання',
  'decks.dashboard.edit_deck': 'Редагувати колекцію',
  'decks.dashboard.cards_without_tags': 'Картки без тегів',
  'decks.edit.export_deck': 'Експорт колекції',
  'decks.edit.delete_deck': 'Видалити колекцію',
  'decks.card_form.source': 'Слово або фраза',
  'decks.card_form.part_of_speech': 'Частина мови',
  'decks.card_form.examples': 'Приклади',
  'decks.card_form.translation': 'Переклад',
  'decks.card_form.definition': 'Визначення',
  'decks.card_form.save': 'Зберегти',
  'decks.card_form.cancel': 'Скасувати',
  'decks.edit_card.edit': 'Редагувати',
  'decks.edit_card.delete': 'Видалити',
  'decks.edit_card.restore': 'відновити',
  'decks.delete_dialog.title': 'Видалити {{language}}?',
  'decks.delete_dialog.cannot_undo': 'Цю дію не можна скасувати.',
  'decks.delete_dialog.yes': 'Так',
  'decks.delete_dialog.no': 'Ні, дякую',
  'decks.export.between_columns': 'Між стовпцями картки',
  'decks.export.tab': 'Табуляція',
  'decks.export.comma': 'Кома [ , ]',
  'decks.export.custom': 'Інший',
  'decks.export.between_cards': 'Між картками',
  'decks.export.new_line': 'Новий рядок',
  'decks.export.semicolon': 'Крапка з комою [ ; ]',
  'decks.export.old_cards_warning':
    'Картки, створені до 27 жовтня 2025 року, не можна експортувати.',
  'decks.export.why': 'Чому?',
  'decks.export.copy_csv': 'Скопіюйте згенерований CSV.',
  'decks.export.copy_all': 'Копіювати все',
  'decks.export.download': 'Завантажити {{fileName}}',
  'decks.lexicala_dialog.p1': 'Vocably був створений до епохи ШІ.',
  'decks.lexicala_dialog.p2':
    'Тоді єдиним способом запропонувати якісні картки був платний словниковий провайдер.',
  'decks.lexicala_dialog.p3':
    'У жовтні 2025 року цей провайдер повідомив, що я порушив їхні Умови використання, дозволивши користувачам експортувати картки.',
  'decks.lexicala_dialog.p4':
    '27 жовтня 2025 року Vocably перейшов на повністю ШІ-генеровані картки.',
  'decks.lexicala_dialog.p5':
    'Картки, створені до 27 жовтня 2025 року, не можна експортувати з юридичних причин.',
  'decks.lexicala_dialog.close': 'Закрити',
  'decks.no_decks.no_cards': 'У цій колекції поки що немає карток.',
  'decks.study.loading': 'Навчальна сесія...',
  'decks.study.reload':
    'Будь ласка, перезавантажте сторінку та спробуйте знову.',

  // Membership
  'membership.loading': 'Перевірка статусу підписки...',
  'membership.premium_user': 'Ви є Premium-користувачем',
  'membership.why': 'Чому?',
  'membership.ends_at': 'Ваша підписка закінчується:',
  'membership.next_payment': 'Наступний платіж:',
  'membership.manage': 'Керування підпискою',
  'membership.error': 'Не вдалося завантажити статус підписки',
  'membership.why_paid.title': 'Я не знаю',
  'membership.why_paid.possible_reasons': 'Можливі причини:',
  'membership.why_paid.first_users':
    'Ви один із перших активних користувачів Vocably',
  'membership.why_paid.like_you': 'Ви мені подобаєтесь',
  'membership.why_paid.enjoy': 'Так чи інакше, насолоджуйтесь Premium.',
  'membership.why_paid.rate': 'Хочете допомогти проекту? Оцініть його на',
  'membership.why_paid.close': 'Закрити',

  // Membership Selector
  'membership_selector.title': 'Vocably Premium',
  'membership_selector.subtitle':
    'Створено для людей, які вивчають мову через активне використання',
  'membership_selector.feature1.title':
    "Побачили нове слово в браузері на комп'ютері?",
  'membership_selector.feature1.desc1':
    'Використовуйте розширення Chrome або Safari, щоб швидко виділити, перекласти та створити картку одним кліком.',
  'membership_selector.feature1.desc2':
    'Користувачі iOS також можуть скористатися розширенням Safari для iPhone та iPad.',
  'membership_selector.feature2.title':
    'Побачили нове слово в будь-якому Android додатку?',
  'membership_selector.feature2.desc1':
    'Виділіть його і поділіться з Vocably для перекладу та створення картки.',
  'membership_selector.feature2.desc2': 'Виділіть і натисніть',
  'membership_selector.feature3.title':
    'Побачили нове слово в реальному житті?',
  'membership_selector.feature3.desc':
    'Використовуйте мобільний додаток Vocably для iOS та Android замість Google Translate для перекладу та автоматичного створення картки.',
  'membership_selector.feature4.title':
    'Хочете щось сказати, але не знаєте слово?',
  'membership_selector.feature4.desc':
    'Знайдіть потрібне слово рідною мовою в мобільному додатку Vocably для iOS та Android. Збережіть його як картку для повторення.',
  'membership_selector.feature5.title':
    'Бездоганно працює з більшістю читалок для Android',
  'membership_selector.feature5.desc':
    'Натисніть на будь-яке слово в електронній книзі, щоб побачити переклад і зберегти його як картку.',
  'membership_selector.feature6.title': 'Усі ваші картки зберігаються в хмарі',
  'membership_selector.feature6.desc':
    'Ви можете вивчати їх за допомогою вбудованої системи інтервального повторення на будь-якому мобільному пристрої (iOS або Android), а також безпосередньо у веб-браузері.',
  'membership_selector.comparison_title':
    'Різниця між безкоштовною та Premium версіями',
  'membership_selector.unlimited_translations': 'Необмежені переклади',
  'membership_selector.unlimited_collections': 'Необмежені колекції карток',
  'membership_selector.unlimited_sessions': 'Необмежені навчальні сесії',
  'membership_selector.unlimited_decks': 'Необмежені мовні колекції',
  'membership_selector.cloud_storage':
    'Картки зберігаються в хмарі та доступні на всіх платформах',
  'membership_selector.card_saving':
    'Якщо колекція досягла {{count}} карток, то',
  'membership_selector.cards_per_day':
    'можна додавати не більше {{count}} карток на день',
  'membership_selector.unlimited': 'можна додавати скільки завгодно карток',
  'membership_selector.social_proof':
    'Vocably — єдиний інструмент, повністю орієнтований на потреби людей, активно вивчаючих мови. Це новий продукт, але вже сотні людей використовують його для практики мови в реальних умовах.',
  'membership_selector.per_month': 'На місяць',
  'membership_selector.pay_once': 'Раз і назавжди',
  'membership_selector.total': 'Разом',
  'membership_selector.select': 'Вибрати',
  'membership_selector.trial_3_days': 'Спробуйте 3 дні безкоштовно.',
  'membership_selector.trial_7_days': 'Спробуйте 7 днів безкоштовно.',
  'membership_selector.cancel': 'Скасування будь-коли.',
  'membership_selector.cards_stay':
    'Усі збережені картки залишаться у вашій колекції, якщо ви вирішите скасувати підписку.',

  // Settings
  'settings.title': 'Налаштування',
  'settings.not_sure': 'Не знаєте, з чого почати? Просто',
  'settings.click_link': 'натисніть на це посилання',
  'settings.need_help': 'Потрібна допомога?',
  'settings.contact': "Зв'язатися з автором Vocably",
  'settings.respond_everyone': 'Я відповідаю всім.',
  'settings.study_settings': 'Налаштування навчання',
  'settings.max_cards': 'Максимум карток за навчальну сесію',
  'settings.random_select': 'Випадковий вибір карток для вивчення',
  'settings.random_warning':
    'Увімкнення цієї опції в цілому є <strong>поганою ідеєю</strong>. Вона вимикає алгоритм розумного навчання. Люди, які вимкнули його, зрештою розчаровуються у своїх результатах.',
  'settings.read_how':
    'Дізнайтеся, як Vocably використовує алгоритм розумного навчання, щоб допомогти вам вивчити більше слів за менший час.',
  'settings.sync_cards': "Синхронізуйте картки між комп'ютером і телефоном.",
  'settings.mobile_features':
    'Мобільний додаток також включає ексклюзивні функції:',
  'settings.feature_tags': 'Групування за тегами',
  'settings.feature_ai_dict': 'ШІ-словник',
  'settings.feature_prompts': 'Генерація колекцій за запитом',
  'settings.scan_qr': 'Відскануйте QR-код для встановлення:',
  'settings.interface_language': 'Мова інтерфейсу',
  'settings.delete_account': 'Видалити мій акаунт',
  'settings.delete_dialog.title': 'Видалити акаунт',
  'settings.delete_dialog.confirm':
    'Ви впевнені, що хочете видалити свій акаунт? Цю дію не можна скасувати.',
  'settings.delete_dialog.yes': 'Так',
  'settings.delete_dialog.no': 'Ні, дякую',
  'settings.study_steps.title': 'Етапи навчання',
  'settings.study_steps.premium_only':
    'Доступно лише для Premium-користувачів.',
  'settings.study_steps.become_premium': 'Стати Premium-учасником.',
  'settings.study_steps.preview': 'Попередній перегляд',
  'settings.study_steps.drag_to_reorder':
    'Перетягніть для зміни порядку, перемкніть для увімкнення або вимкнення.',
  'settings.study_steps.mf': 'Оберіть правильний переклад',
  'settings.study_steps.sf': 'Згадайте правильний переклад',
  'settings.study_steps.mb': 'Оберіть правильне слово або фразу',
  'settings.study_steps.ab': 'Складіть правильне слово або фразу по буквах',
  'settings.study_steps.sb': 'Згадайте правильне слово або фразу',

  // Feedback
  'feedback.title': "Зворотний зв'язок",
  'feedback.p1':
    'Бракує функцій? Є питання або ви хочете поділитися думкою про Vocably? Буду радий отримати вашу думку!',
  'feedback.p2':
    'Я відповідаю кожному користувачу. Зазвичай, протягом кількох днів.',
  'feedback.p3': 'Я відповім вам на вашу електронну адресу',
  'feedback.apple_email':
    'Схоже, це секретна email-адреса Apple, яку ви надали під час реєстрації, але не хвилюйтеся — вона працює.',
  'feedback.placeholder': 'Будь ласка, введіть ваше повідомлення тут...',
  'feedback.submit': 'Надіслати',
  'feedback.success':
    'Ваше повідомлення успішно надіслано. Ось що ви написали:',
  'feedback.error':
    'На жаль, під час надсилання відгуку сталася помилка. Спробуйте пізніше.',

  // Import
  'import.title': 'Імпорт карток з CSV',
  'import.loading_decks': 'Завантаження колекцій...',
  'import.what_language': 'Яку мову ви хочете імпортувати?',
  'import.import_cards_for': 'Мова карток для імпорту:',
  'import.csv_two_columns':
    'CSV-файл повинен містити два стовпці, розділені табуляцією',
  'import.copy_paste': 'Скопіюйте та вставте з Google Sheets, CSV-файлу або',
  'import.upload_csv': 'Завантажити CSV-файл',
  'import.placeholder': 'Вставте CSV-дані з Google Sheets сюди.',
  'import.dont_know': 'Не знаєте, з чого почати?',
  'import.download_example': 'Завантажте приклад CSV-файлу',
  'import.csv_error':
    'Кожен рядок CSV повинен містити два значення: слово/фразу та її переклад. Значення повинні бути розділені табуляцією',
  'import.trouble': 'Проблеми з імпортом?',
  'import.let_me_know': 'Дайте знати',
  'import.help_best': '— постараюсь допомогти.',
  'import.add_tags': 'Додати теги',
  'import.analysing': 'Аналіз',
  'import.import_cards': 'Імпортувати картки',
  'import.success.title': 'Картки успішно імпортовані.',
  'import.success.import_more': 'Імпортувати ще картки',
  'import.success.go_to_cards': 'Перейти до імпортованих карток',
  'import.failure.title': 'Помилка',
  'import.failure.error': 'Під час імпорту сталася помилка.',
  'import.failure.logged': 'Помилку зафіксовано, я розберуся з нею.',
  'import.failure.try_again': 'Спробуйте пізніше.',
  'import.failure.close': 'Закрити',

  // Not Found
  'not_found.404': '404',
  'not_found.message': 'Запитувана сторінка не знайдена.',

  // Preview Study Step
  'preview_step.loading': 'Навчальна сесія...',
  'preview_step.completed': 'Етап завершено.',
  'preview_step.try_again': 'Спробувати знову',
  'preview_step.back_to_settings': 'Повернутися до налаштувань',

  // Android Translate
  'android_translate.loading': 'Завантаження прикладу тексту...',
  'android_translate.how_to':
    'Щоб перекласти будь-яке слово на будь-якому сайті або в додатку:',
  'android_translate.step1': 'Виділіть слово',
  'android_translate.step2': 'Натисніть',
  'android_translate.step3': 'Натисніть «Перекласти з Vocably»',
  'android_translate.try_it': 'Спробуйте на цьому тексті',

  // Subscription
  'subscription.purchased': 'успішно придбано.',
  'subscription.go_back': 'Повернутися на сторінку підписки.',

  // SRS
  'srs.card.space_hint': 'Пробіл на клавіатурі',
  'srs.card.show_question': 'Показати питання',
  'srs.card.show_answer': 'Показати відповідь',
  'srs.card.left_arrow': 'Стрілка вліво на клавіатурі',
  'srs.card.weak': 'Слабко',
  'srs.card.not_yet': 'Не знаю',
  'srs.card.down_arrow': 'Стрілка вниз на клавіатурі',
  'srs.card.somewhat': 'Частково',
  'srs.card.almost': 'Майже',
  'srs.card.right_arrow': 'Стрілка вправо на клавіатурі',
  'srs.card.strong': 'Добре',
  'srs.card.got_it': 'Знаю',
  'srs.success.one_more': 'Ще один раунд',
  'srs.streak.consecutive_day': 'день поспіль.',
  'srs.streak.consecutive_days': 'днів поспіль.',
  'srs.reverse_front.guess_the': 'Вгадай',
  'srs.reverse_front.type_in_the': 'Введи',
  'srs.reverse_front.meaning': 'значення:',

  // Header
  'header.menu': 'Меню',
  'header.setup': 'Налаштувати розширення',
  'header.premium': 'Premium',
  'header.settings': 'Системні налаштування',
  'header.import': 'Імпорт',
  'header.feedback': "Зворотний зв'язок",
  'header.sign_out': 'Вийти',

  // Alert
  'alert.error': 'Помилка',

  // Back Button
  'back_button.back': 'Назад',

  // Page Titles
  'page.sign_in': 'Увійти',
  'page.auto_sign_in': 'Автоматичний вхід',
  'page.preview_study_step': 'Попередній перегляд кроку навчання',
  'page.settings': 'Налаштування',
  'page.feedback': "Зворотний зв'язок",
  'page.import_cards': 'Імпорт карток',
  'page.set_up': 'Налаштування',
  'page.dashboard': 'Головна',
  'page.study': 'Навчання',
  'page.edit_deck': 'Редагувати колекцію',
  'page.export_deck': 'Експорт колекції',
  'page.welcome': 'Ласкаво просимо',
  'page.user_info': 'Інформація про користувача',
  'page.uninstall': 'Видалення',
  'page.ios_extension': 'Safari Extension для iOS',
  'page.android_translate': 'Переклад через Android',
  'page.subscribe': 'Підписка',
  'page.subscription_success': 'Успішно',
  'page.try_out': 'Спробуй Vocably',
  'page.membership': 'Членство',

  // Uninstall Survey
  'uninstall.header': 'Розширення було видалено.',
  'uninstall.intro':
    'Ви видалили розширення, бо вам щось не сподобалося.\nЩо саме? Можливо, я зможу виправити це в майбутній версії.',
  'uninstall.reason.not_often': 'Я користуюся ним не дуже часто',
  'uninstall.reason.lost_motivation': 'Я втратив мотивацію',
  'uninstall.reason.dont_understand': 'Я не розумію, як ним користуватися',
  'uninstall.reason.translation_quality': 'Мене не влаштовує якість перекладів',
  'uninstall.reason.use_something_else': 'Я користуюся чимось іншим',
  'uninstall.reason.other': 'Інше',
  'uninstall.use_something_else_placeholder':
    'Будь ласка, напишіть, чим ви користуєтеся натомість',
  'uninstall.other_placeholder': 'Будь ласка, напишіть, що саме',
  'uninstall.email_invite':
    'Я постійно вдосконалюю Vocably, і є велика ймовірність, що вашу проблему буде вирішено в одній із майбутніх версій. Залиште свій email, і я особисто повідомлю вас, щойно все буде виправлено.',
  'uninstall.email_placeholder': 'Ваш email (необовʼязково)',
  'uninstall.submit': 'Надіслати',
  'uninstall.success': 'Дякую за ваш відгук!',
  ...languageTranslations.uk,
};
