const { defaultUserStaticMetadata } = require('@vocably/model');

module.exports = {
  templateOptions: {
    usageLimit: {
      maxCollectionLength: defaultUserStaticMetadata.max_cards,
      cardsPerDay: defaultUserStaticMetadata.cards_per_day,
    },
    languages: [
      { code: 'af', label: 'Afrikaans' },
      { code: 'sq', label: 'Albanian' },
      { code: 'am', label: 'Amharic' },
      { code: 'ar', label: 'Arabic' },
      { code: 'hy', label: 'Armenian' },
      { code: 'hyw', label: 'Armenian (Western)' },
      { code: 'az', label: 'Azerbaijani' },
      { code: 'eu', label: 'Basque' },
      { code: 'be', label: 'Belarusian' },
      { code: 'bn', label: 'Bengali' },
      { code: 'bs', label: 'Bosnian' },
      { code: 'bg', label: 'Bulgarian' },
      { code: 'ca', label: 'Catalan' },
      { code: 'zh', label: 'Chinese (Simplified)' },
      { code: 'zh-TW', label: 'Chinese (Traditional)' },
      { code: 'co', label: 'Corsican' },
      { code: 'hr', label: 'Croatian' },
      { code: 'cs', label: 'Czech' },
      { code: 'da', label: 'Danish' },
      { code: 'nl', label: 'Dutch' },
      { code: 'en', label: 'English (US)' },
      { code: 'en-GB', label: 'English (British)' },
      { code: 'eo', label: 'Esperanto' },
      { code: 'et', label: 'Estonian' },
      { code: 'fi', label: 'Finnish' },
      { code: 'fr', label: 'French' },
      { code: 'fy', label: 'Frisian' },
      { code: 'gl', label: 'Galician' },
      { code: 'ka', label: 'Georgian' },
      { code: 'de', label: 'German' },
      { code: 'el', label: 'Greek' },
      { code: 'gu', label: 'Gujarati' },
      { code: 'ht', label: 'Haitian Creole' },
      { code: 'ha', label: 'Hausa' },
      { code: 'haw', label: 'Hawaiian' },
      { code: 'he', label: 'Hebrew' },
      { code: 'hi', label: 'Hindi' },
      { code: 'hmn', label: 'Hmong' },
      { code: 'hu', label: 'Hungarian' },
      { code: 'is', label: 'Icelandic' },
      { code: 'ig', label: 'Igbo' },
      { code: 'id', label: 'Indonesian' },
      { code: 'ga', label: 'Irish' },
      { code: 'it', label: 'Italian' },
      { code: 'ja', label: 'Japanese' },
      { code: 'jv', label: 'Javanese' },
      { code: 'kn', label: 'Kannada' },
      { code: 'kk', label: 'Kazakh' },
      { code: 'km', label: 'Khmer' },
      { code: 'rw', label: 'Kinyarwanda' },
      { code: 'ko', label: 'Korean' },
      { code: 'ku', label: 'Kurdish' },
      { code: 'ky', label: 'Kyrgyz' },
      { code: 'lo', label: 'Lao' },
      { code: 'lv', label: 'Latvian' },
      { code: 'lt', label: 'Lithuanian' },
      { code: 'lb', label: 'Luxembourgish' },
      { code: 'mk', label: 'Macedonian' },
      { code: 'mg', label: 'Malagasy' },
      { code: 'ms', label: 'Malay' },
      { code: 'ml', label: 'Malayalam' },
      { code: 'mt', label: 'Maltese' },
      { code: 'mi', label: 'Maori' },
      { code: 'mr', label: 'Marathi' },
      { code: 'mn', label: 'Mongolian' },
      { code: 'my', label: 'Myanmar (Burmese)' },
      { code: 'ne', label: 'Nepali' },
      { code: 'no', label: 'Norwegian' },
      { code: 'ny', label: 'Nyanja (Chichewa)' },
      { code: 'or', label: 'Odia (Oriya)' },
      { code: 'ps', label: 'Pashto' },
      { code: 'fa', label: 'Persian' },
      { code: 'pl', label: 'Polish' },
      { code: 'pt', label: 'Portuguese (Brazilian)' },
      { code: 'pt-PT', label: 'Portuguese (European)' },
      { code: 'pa', label: 'Punjabi' },
      { code: 'ro', label: 'Romanian' },
      { code: 'ru', label: 'Russian' },
      { code: 'sm', label: 'Samoan' },
      { code: 'gd', label: 'Scots Gaelic' },
      { code: 'sr', label: 'Serbian' },
      { code: 'st', label: 'Sesotho' },
      { code: 'sn', label: 'Shona' },
      { code: 'sd', label: 'Sindhi' },
      { code: 'si', label: 'Sinhala (Sinhalese)' },
      { code: 'sk', label: 'Slovak' },
      { code: 'sl', label: 'Slovenian' },
      { code: 'so', label: 'Somali' },
      { code: 'es', label: 'Spanish' },
      { code: 'su', label: 'Sundanese' },
      { code: 'sw', label: 'Swahili' },
      { code: 'sv', label: 'Swedish' },
      { code: 'tl', label: 'Tagalog (Filipino)' },
      { code: 'tg', label: 'Tajik' },
      { code: 'ta', label: 'Tamil' },
      { code: 'tt', label: 'Tatar' },
      { code: 'te', label: 'Telugu' },
      { code: 'th', label: 'Thai' },
      { code: 'tr', label: 'Turkish' },
      { code: 'tk', label: 'Turkmen' },
      { code: 'uk', label: 'Ukrainian' },
      { code: 'ur', label: 'Urdu' },
      { code: 'ug', label: 'Uyghur' },
      { code: 'uz', label: 'Uzbek' },
      { code: 'vi', label: 'Vietnamese' },
      { code: 'cy', label: 'Welsh' },
      { code: 'xh', label: 'Xhosa' },
      { code: 'yi', label: 'Yiddish' },
      { code: 'yo', label: 'Yoruba' },
      { code: 'zu', label: 'Zulu' },
    ],
    reviews: {
      chromeWebStore: [
        {
          name: 'Masha Glynchak',
          date: '28 Apr 2026',
          text: 'amazing app for integrating language learning in your real life internet browsing and learning new words as you go in new language to finally cross into b2/c1 territory and start using the language',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/f2950848-576f-4f86-b9e9-25e29f4a0862',
          image:
            'https://lh3.googleusercontent.com/a/ACg8ocIPNawCxbxvhBufVgKi7dxzizs54qjZu07ykaQrdbGtjPq_ZQ=s96-w96-h96',
        },
        {
          name: 'Stewart L',
          date: '14 Mar 2025',
          text: 'Very good extension. Simple to understand, light, fast.',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/4019dcbf-7e22-4eff-9c3a-86c8764950c1',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjUsvhLcXdmliEcDmlbm54PseWSoFIvdJy9hzB54HJEsi8HXegI=s48-w48-h48',
        },
        {
          name: 'Tuấn Trần',
          date: '26 Nov 2025',
          text: 'This program is really convenient. I find it better than Anki for creating flashcards.',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/07ea2219-0efd-49f0-83bb-f43cdc57366e',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjUNECCiqF2MgJA38-tivnRrNHISyiU61tL3vPxBiGDOzQvPl1Mw=s48-w48-h48',
        },
        {
          name: 'Chawika',
          date: '3 Oct 2025',
          text: "Highly recommended for all language learners! After using Vocably for a while, I'm really satisfied with its AI-translated features, which are accurate and seamlessly integrated with other platforms. Vocably is a wonderful tool for learning words and sentences using flashcards on a mobile application. I really appreciate the developer. Thank you so much for creating this awesome tool. <3",
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/96445048-988e-423c-bec9-4d520fc6a45b',
          image:
            'https://lh3.googleusercontent.com/a/ACg8ocK-kJ49OCvErwRxHkVDOkos_a5oRKroOCioSzAzsxccE-CXJTs=s48-w48-h48',
        },
        {
          name: 'Doston Kamilov',
          date: '22 Sept 2025',
          text: 'Лучшее расширение для изучения языка, а еще огромное спасибо разработчику за отзывчивость',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/79a4e5ba-ddea-4ae8-acb8-905848174b45',
          image:
            'https://lh3.googleusercontent.com/a/ACg8ocIJ8h9AvGsRQ3VlPa94GeQIGgjuS6BhgBqr78BEqLgUpOWK1A=s48-w48-h48',
        },
        {
          name: '12C6-42-Huỳnh Thiên Phú',
          date: '16 Sept 2025',
          text: 'this is useful for english learners',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/5a0f45bc-9143-4bfb-945c-d4cae817a7a3',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjVF-uKjVQnNTu0WtXdi7YBrgNrqcEVGU7QB_FwKhAZYLEoftrMl=s48-w48-h48',
        },
        {
          name: 'Vitalii',
          date: '7 Apr 2025',
          text: "Дуже класна пріложуха. Особливо коли працює у зв'язці App в смартфоні та Extension в Хром браузері. Це ніби Комбо фаталіті.",
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/590977f3-5ef5-41fd-8a68-d58a5748766f',
          image:
            'https://lh3.googleusercontent.com/a/ACg8ocKbUus4_PNl4ZNbM1XwozKj63f1Qc6MwcRcRsUbt7Iz-05MeQ=s48-w48-h48',
        },
        {
          name: 'CAIO VICTOR FERREIRA DO NASCIMENTO',
          date: '13 Sept 2025',
          text: 'Simply the best Chrome extension to learn any language!',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/285462b0-0057-4f1f-ace0-e82dd810275f',
          image:
            'https://lh3.googleusercontent.com/a/ACg8ocLEP8Y-xzhqXGf9cs27ueKj-cyhaPDM7t3cH4H9XlOBAHa898E=s48-w48-h48',
        },
        {
          name: 'Tapsi Mufa',
          date: '9 Sept 2025',
          text: 'bingle bangle bingle bongla veryy nicceee',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/b330d3f1-3ba9-4c7b-8ddd-c53f9012aef8',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjW4-AMJziyl3aA5huRWcioC29C8beMK7rXaarOturRkjV6_J1c=s48-w48-h48',
        },
        {
          name: 'Konstantin MK',
          date: '8 Sept 2025',
          text: 'Отличное приложение, то что нужно каждому в изучении языка',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/3e6fd857-f687-43ba-baf9-8d1cf7088f8b',
          image:
            'https://lh3.googleusercontent.com/a/ACg8ocK1E6DCMPJS2n6fWyk4o-S0c3bpkTPVhltRR60sxHp2LY6L5w=s48-w48-h48',
        },
        {
          name: 'Israel Kianzambi',
          date: '31 Aug 2025',
          text: 'This extension is really impressive! I just came across it on the Chrome Web Store, and I had no idea how useful it could be. For those who don’t know, you can use it with YouTube by pausing the subtitles whenever you encounter a word you don’t know and take notes if you want to— it makes learning so much easier. Don’t forget to pin the extension so it’s always ready to use. Big cheerios to the creator — they did an amazing job making this!',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/37aa5756-6262-4302-982e-ebb2038a1a5a',
          image:
            'https://lh3.googleusercontent.com/a/ACg8ocJkyr8MQWsDZyFCWI6VzkZOl31SQwCK9Ft8v1JU7GyPpeFrgQ=s48-w48-h48',
        },
        {
          name: 'Макс Привезенцев',
          date: '29 Aug 2025',
          text: 'Очень круто, то что надо и без излишеств',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/c9106998-ddde-4696-b59e-9e370c87fd50',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjXDe4tvQmqKiCdIsxWK2C3zdYO9b8_UfR9UgXcmFaxGfm8SLSc1=s48-w48-h48',
        },
        {
          name: 'Данир Кашапов',
          date: '15 Aug 2025',
          text: 'Very useful instrument to upgrade your vocabulary, especially with the app!',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/15c02811-5ce2-43ca-9df4-6c0b9210c851',
          image:
            'https://lh3.googleusercontent.com/a/ACg8ocJ5v7FNqEV6miJBktllN1b-WfTtDlcZsAbZmsbvDvEJVHtteA=s48-w48-h48',
        },
        {
          name: 'Floriano',
          date: '14 Jul 2025',
          text: 'A very good subtitles app, it is simple, but very functional ;)',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/0498bf70-92b0-47a4-b314-d64f01acbe39',
          image:
            'https://lh3.googleusercontent.com/a/ACg8ocJ7ZNVGoE_mNo-eKAalZhcMzDS29AXPzdtxoySypMY1GjX62Mo=s48-w48-h48',
        },
        {
          name: 'Gary Malkin',
          date: '11 Jul 2025',
          text: "This is the best flashcard app that I've used. It goes into more detail than others. For example, if I type in a word in a foreign language, it will automatically give me the definition (or a number of them to choose from if there is more than one), as well as examples of use. This is incredibly useful when studying a language. You can even edit the definition field to make it more personal or memorable to you. It's really intuitive and easy to use and strikes a perfect balance between the au... Show more",
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/23a423ed-f6c7-4088-be04-b815ef3ef3ab',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjXk8lJZYAOxP-bx1u-t3gCBk9gWfuZ9UzihKGY0Fm1cGikvIsdohw=s48-w48-h48',
        },
        {
          name: 'Bohdan Yalovskyi',
          date: '9 Jul 2025',
          text: 'Вокеблі — це саме той інструмент, якого мені не вистачало для щоденного вивчення слів. Інтерфейс простий і приємний, все працює стабільно, а функції підібрані з розумінням реальних потреб користувача. Видно, що проєкт створено з любов’ю і увагою до деталей. Дуже рекомендую всім, хто хоче покращити свій словниковий запас ефективно й без зайвого шуму.',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/91525591-106e-4f0d-97f1-d3588ecaa0df',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjU5yBUPPhIudT-6Op8NAKpakDkKdFes8GU_7JmM-L_tBgyKjBSs=s48-w48-h48',
        },
        {
          name: 'Dmytro Palivoda',
          date: '7 Jul 2025',
          text: 'Really love this plugin — it makes adding new words to flashcards so much easier. I like that I can instantly see the translation without switching tabs or looking it up separately. Saves time and keeps me focused while studying.',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/e6444dc1-e867-4e72-9919-e3c31ee6e1a6',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjWzFz82lUDd3dqFoJMqub9ZJqUd5EsDRwejUBOgSSi2-gQAslFFKA=s48-w48-h48',
        },
        {
          name: 'Jaider Barraza',
          date: '6 Jul 2025',
          text: "So this service is very practical and useful. I'm trying to take the most of it. I can be on my computer reading or watching something on youtube and with some clicks I get the word in my phone for reviewing later. Thank you for this because it helps a lot when you try to do inmersion on the language you're acquiring. Keep doing such a excellent job. I know it'll be much better in the future.",
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/81537b22-1591-4476-ab12-946672fb4bcb',
          image:
            'https://lh3.googleusercontent.com/a/ACg8ocKayrH8czzItvtitGyriYHx37G2rLRIM7iWzfxt1DYM4DC5ZQ=s48-w48-h48',
        },
        {
          name: 'Demet Bağcı',
          date: '3 Jul 2025',
          text: 'Çok yararlı bir eklenti. Uygulama olarak da telefona indirilebiliyor. Flashcard gibi kullanabiliyorsunuz kaydettiğiniz kelimeleri ayrıca soru şeklinde de çalışılabiliyor.',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/16e818d1-aa5e-4ad6-9ba4-3ac1cc56f7b1',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjW5WlUKlf_Y2VU58giV-l8eK9DQ1ltmESD_5xGDyPTxFLq276w=s48-w48-h48',
        },
        {
          name: 'fkrusenstern',
          date: '10 Jun 2025',
          text: "I really couldn't imagine how useful and easy to use this App is. Vocably gives you short and detailed multi-language translation in a couple with AI. I installed it into my Chrome and on my Android as well. I prefer reading large texts on a full-size screen, but It's better to learn the words using phone. Thank you guys!",
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/184252ff-7ed5-4be3-8009-143a7bfc517d',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjWp-ET7o8BsCDpf-zleffQzC_xrT4BkriXFxSnnKuAjXgxjgPY=s48-w48-h48',
        },
        {
          name: 'Saeed Fattahi',
          date: '30 May 2025',
          text: "that's so nice, using chatGpt and user friendly makes it awesome, thanks dev team",
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/d9ad3d8b-4c82-4495-ab1e-09eda8400075',
          image:
            'https://lh3.googleusercontent.com/a/ACg8ocI7XcbWXg_4CmVRPIjwkmjh_xyDkkr967n5LCQi5BRUmdRoWA=s48-w48-h48',
        },
        {
          name: 'Ruben',
          date: '28 May 2025',
          text: 'Esta extensão usa a inteligência artificial para produzir explicações sobre palavras que selecionamos. Também dá para gravar palavras para estudá-las depois. Seria bom incluir línguas antigas, como o latim',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/1a82f3a2-9a5b-4c75-9fa2-d01fa7fd1502',
          image:
            'https://lh3.googleusercontent.com/a/ACg8ocLoc2rzTe09aI8Tw2zwTndNftTnyjjkdclTB3Jw2aVE2uGr9Q=s48-w48-h48',
        },
        {
          name: 'Mike Kilmer',
          date: '26 May 2025',
          text: 'A beautiful gift. Helping us communicate better with one another. Thanks much, Dmytro and team.',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/567ad343-4a5e-491c-b75d-973700bcc401',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjWpht4bMXndL69JFXpZWyS6PMNxxebYt1oXVxXRSXVBCWPZRCM=s48-w48-h48',
        },
        {
          name: 'Ira Rekh',
          date: '2 May 2025',
          text: 'Искала простое приложение с возможностью удобного создания карточек через браузер и упражнений для запоминания на телефоне. Нашла то что нужно, ничего лишнего, есть перевод на русский язык.',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/4436916b-ff1f-4688-b2ef-9663b1f4bb38',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjXpWWjCh-UoOoZqQ0Gf65RmvSoBBipCNBgN6HqtIiEsjqy9LswK=s48-w48-h48',
        },
        {
          name: 'Марiя Тищенко',
          date: '7 Apr 2025',
          text: 'Просто супер. З радістю користуюсь кожен день, щиро дякую👍',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/e8c36e7c-a8eb-4617-8d70-c19d9555ceba',
          image:
            'https://lh3.googleusercontent.com/a/ACg8ocJrkCARpprysG6ad2n2GO9k8GhjaZlCnKIwRJaLPyFbbX3JYIE=s48-w48-h48',
        },
        {
          name: 'S D',
          date: '5 Apr 2025',
          text: 'Amazing tool for language learning and growing your vocabulary.',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/b0e2b3e7-120c-4227-ae55-846af8bc23e2',
          image:
            'https://lh3.googleusercontent.com/a/ACg8ocIovLShnpivaXQrAa17ZVFRUgPX7dQ_A3m3cwEsTiEaizmv8Q=s48-w48-h48',
        },
        {
          name: 'Trang Thule',
          date: '5 Apr 2025',
          text: 'perfect',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/d85827b6-0c7a-4c0b-824d-7118d02b444b',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjVGIP_tw2sPyhC8C3XJ64CEZiPAflxnjGBfyi1sg9hBdoLrj3yi=s48-w48-h48',
        },
        {
          name: 'krunal prajapati',
          date: '4 Apr 2025',
          text: 'amazing',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/24d61f8b-c794-4673-9eff-582b6032fb2c',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjWgqeVsTreiHwallsLpwBIwdN2HuznQAacv-4skCeYcVFHsyzQ=s48-w48-h48',
        },
        {
          name: 'Amir Sayfiddinov',
          date: '1 Apr 2025',
          text: 'finally. needed smth similar for long',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/34672d07-96da-4524-a8de-2a14b3284fa7',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjWBTp2An2QDW1ALJipN79iCIZ8kJ9uKBJP5kR4n4GRXVn9sYY0=s48-w48-h48',
        },
        {
          name: 'Noorain Bashir',
          date: '29 Mar 2025',
          text: 'after spending hours for finding an extension which provides definition and save words along with their details to learn/recall later, i found this. believe me it is the best extension out there. please add synonyms and antonyms of the words too. It will be a great addition. thank you so much, team vocably!',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/6c690405-b70b-4e79-a0c5-63b95fe16479',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjXmk41Ms9DcYy0c2gvldmF3l4o-i83fXK7HE6s88wWKn9E02KM=s48-w48-h48',
        },
        {
          name: 'Пожилая Чепуха',
          date: '28 Mar 2025',
          text: 'Лучшее расширение, приятный красивый интерфейс, всё круто переводит и хранит. Есть крутое мобильное приложение. Интеллектуальный анализ слов и их хороший перевод. 5/5. Ошибок не замечено. Огромное спасибо.',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/6c689753-d923-4b39-927e-a0c30a4d91b4',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjWi3c7MOAnwNms2Iky-dT0eerfZTNh1V3LUjJdx5on8rGJ59lA=s48-w48-h48',
        },
        {
          name: 'CatBeheMath',
          date: '27 Mar 2025',
          text: 'It is very useful app.',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/4ba70258-7379-43a3-b1aa-1084120b41f2',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjVV0twjGdADcR9GFWq_rR-lyq47K-OjKWhPcY8elCevsyQfqEM=s48-w48-h48',
        },
        {
          name: 'Journey Kim',
          date: '10 Mar 2025',
          text: 'Great!',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/4a8ae946-82fb-4615-b26e-bef8d1e49915',
          image:
            'https://lh3.googleusercontent.com/a/ACg8ocLiRDNnpvo5sNNXkks0n_NSGwMBn4G8JinZJWu86aUYz10-vw=s48-w48-h48',
        },
        {
          name: '江瑋平（GHSRobert 瑋平）',
          date: '1 Mar 2025',
          text: 'So many languages available. Very handy to add new words and new language decks. Great project!',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/997fae51-c1dd-4ef5-beb7-89fd9a3225da',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjWYOSKaQYl0z1AJ2oKvAFZrmanVqAbAcmhidxjzCy4C4OJusU9z=s48-w48-h48',
        },
        {
          name: 'Samy',
          date: '22 Feb 2025',
          text: 'A god-send',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/d1874834-28f6-4f2b-a31b-f0a84de313be',
          image:
            'https://lh3.googleusercontent.com/a/ACg8ocJoIJx5UOnUOlI-mTngVRUDtRm1shsPm6jhAFZYYglQppR_Tw=s48-w48-h48',
        },
        {
          name: 'Vira Morenets',
          date: '18 Feb 2025',
          text: "Wonderful! The most I like it's the feature that brings all the words to Vocably app and I can learn my words on my way.",
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/1db54959-4e83-40e5-8495-41ffff53889f',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjWUOULlXW6foWXfLH8JdkQot-Kb5HDjoJDIHL3NjKgb93XpyDbU=s48-w48-h48',
        },
        {
          name: 'Anna Krusenstern',
          date: '13 Feb 2025',
          text: 'Very helpful and life-long developing tool. Feel grateful to the creator!',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/cc09491c-3fa6-4923-9088-1a580e0913bb',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjV4ujXlgxG1PKhXRjlCf5sPYqLzmwzJL5fE6sHCQKaTQKc1Py5u=s48-w48-h48',
        },
        {
          name: 'Ruslan Pavlenko',
          date: '5 Feb 2025',
          text: 'Супер!\nОсобливо після впровадження ChatGPT переклад просто став чудовим!',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/44020c97-a124-4766-9f5d-13886ad42b6e',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjXmUH7MGyRmjMdnbi4pWexrIHcxlnRynTfSvKxY_VwVHIYYEFX9kw=s48-w48-h48',
        },
        {
          name: 'Оксана Купрякова',
          date: '29 Jan 2025',
          text: 'super',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/a077372d-10bf-439b-87e4-320e4206257e',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjWDZePfORPB4vMfxYIJv_OcNZihSyuwWoG_-i6L9Xg9vLohRepG=s48-w48-h48',
        },
        {
          name: 'Sofia Efimochkina',
          date: '28 Jan 2025',
          text: 'давно искала такое расширение, спасибо разработчикам за такую полезную программу!)',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/2a786e37-10ad-4486-8dad-fd694df421a1',
          image:
            'https://lh3.googleusercontent.com/a/ACg8ocLRz3I0XrfInaMC0RGVryq7eKTC7dGlnNzDML6nrn9lYL1CJvw=s48-w48-h48',
        },
        {
          name: 'Руслан Савчук',
          date: '14 Jan 2025',
          text: 'Мне очень понравилось. Удобно и практично.',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/a8339e99-e7f2-44ea-b383-b88def505218',
          image:
            'https://lh3.googleusercontent.com/a/ACg8ocLQEIH84c1AeJVgzVHT7L7FeqsFLflsqfCAv5uBtVxIlKwTOg=s48-w48-h48',
        },
        {
          name: 'Chau',
          date: '11 Jan 2025',
          text: 'Just what I was looking for in a vocab extension. Thank you :)',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/5af2e626-709f-4691-bd44-25089e51a3a2',
          image:
            'https://lh3.googleusercontent.com/a/ACg8ocJ0EGIrQTyXRD1QSTJHky-KqMHnY-xVbeiDpSJhOmAxKeYbvoVM=s48-w48-h48',
        },
        {
          name: 'Z. Ar',
          date: '30 Dec 2024',
          text: 'Powerful tool. Thank you!',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/641782b6-9e40-4203-9eaf-a1d9c066d6a1',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjWytriDeGhX12DQoPmLhOezkdyg6xMxGYqcVyGIPgIcRINGbpnh=s48-w48-h48',
        },
        {
          name: 'hoa truong',
          date: '28 Dec 2024',
          text: 'great',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/bcb4f270-a873-4659-89de-5ca1644e19b9',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjVeaVEt5D0UGcUJh9NUhfBjDn6HL39ZyfZFgoSdcSXUAMDjx1dE=s48-w48-h48',
        },
        {
          name: 'QiaoChu Liu',
          date: '25 Nov 2024',
          text: '我使用过的最好用最方便的意大利语翻译为中文的字典.',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/4dbf82b1-62b2-49cf-ad5c-c4d463cf3b28',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjVBdt7vX3aiQD_XdX-KJ36T1xQk7J1jIzWn4-AV7acpmQaakFNg=s48-w48-h48',
        },
        {
          name: 'Minh Quang Trần',
          date: '10 Oct 2024',
          text: "By far the most sensible extension for words highlighting I've found: right features, clean UI. The support is top-notch as well. Highly recommend.",
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/b361c398-1f83-418c-baf8-bd60bf19798b',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjWJ9ENStMKsblSEiTmKbz21xB2CdUC9LvqZ5J3tywJE5lIyJgg=s48-w48-h48',
        },
        {
          name: 'Maksym Korzh',
          date: '9 Oct 2024',
          text: 'Очень удобное приложение с большим потенциалом. Например есть программа Анки, но там очень сложно добавлять слова из любого приложения или с любой страницы браузера. Здесь это легко сделать. Синхронизация словаря на всех устройствах. Спасибо автору за труд и продуманность удобства использования приложения.',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/df774cdb-0a90-40b9-9836-e7411304d508',
          image:
            'https://lh3.googleusercontent.com/a/ACg8ocJ0yixYIsHtYF95-54EMGfjAHmNOQJO6SSzTGYiawv7cKdd4A=s48-w48-h48',
        },
        {
          name: 'Fatemeh Douroudian',
          date: '26 Sept 2024',
          text: 'It’s great! I just wish I could use it outside of browsers to read PDFs. (I am working on mac)',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/d8e7427c-4f5e-4417-8d33-22b144f7ef37',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjXTJOfGHht1spl4riJ646om5zRBTm3xMRGkdqFQ08e27k8JBGUz=s48-w48-h48',
        },
        {
          name: 'KuanYi Chen',
          date: '23 Sept 2024',
          text: 'nice app',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/84c5e1c9-4095-4fc6-8071-7b0ad6c046fc',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjWBp-dJszTdeMysq46cBdkKxXI1rBTvkMWDDoGgqdNgzFx4ohtv=s48-w48-h48',
        },
        {
          name: 'Ксенія Комарова',
          date: '26 Jul 2024',
          text: 'super!!',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/bcad399a-2adb-428b-98aa-e264169f4f24',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjUbpyJSmrIROMSbk99UqzKo784XW9mQVqqoo8mwx7CffRryi93N=s48-w48-h48',
        },
        {
          name: 'Dmitrii Babich',
          date: '10 Jul 2024',
          text: "Thanks to Vocably, I successfully built up the vocabulary I needed to pass my German B1 exam. The extension makes adding new words friction-free, and learning and revising them is easy. This was the key feature for me, as other applications require effort and context switching to create new cards. With Vocably, it's just one button click directly on the page. The new ChatGPT assistant is also great for new learners. Highly recommended for anyone learning a language - it’s the perfect day-to-d... Show more",
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/11990636-c92e-415e-8b52-b5e6a820fa0c',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjWwQKOZQh1zfqIitD6yf3ii8bILnZbQlNizOocd_PBe5doUJSTmhw=s48-w48-h48',
        },
        {
          name: 'Denis Shcherbak',
          date: '28 Jun 2024',
          text: 'Лучшее расширение для Chrome',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/e001797e-a6c2-4886-8096-5e2b60a619c3',
          image:
            'https://lh3.googleusercontent.com/a/ACg8ocLO4_3iR5x3K1ozHDbwqxlwgF6fGygXcbUwecKzJ_w3vZ_kKA=s48-w48-h48',
        },
        {
          name: 'Oleksandr',
          date: '23 Jun 2024',
          text: "That's great! Our teacher made a great program. Thank you Dmitry)))))",
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/36f414a6-d9b8-479a-a987-5a6d5b90482e',
          image:
            'https://lh3.googleusercontent.com/a/ACg8ocJIbIupyrTrsSatLhlLhsGkjNorr4cvgI9QwWC_KLZLAztmRg=s48-w48-h48',
        },
        {
          name: 'Janaíne Arioli',
          date: '14 Jun 2024',
          text: "Besides my native language (portuguese), I also speak english and italian and I often read articles and newsletters to practice my reading skills. I've been using Vocably for over 6 months and it has been helping me learn the translation of a lot of words I'm not familiar with it yet. Highly recommend!",
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/56c72103-03ab-4679-a588-0d3be2a33d1f',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjWDsf-T5KlQs95MJm5cMqR1gNQrFM45yk7Q9CmHQolSsMdIvCln=s48-w48-h48',
        },
        {
          name: 'Dương Nguyễn Thanh',
          date: '7 Jun 2024',
          text: "it's useful, thank a lots",
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/3458e41d-aef5-47f8-93ed-8602484c93c1',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjUhesc_NYc2aJR9faTPbI_uiFUOdgSWeWiVkpGItlrLtqgLaG0=s48-w48-h48',
        },
        {
          name: 'Rosen Dimitrov',
          date: '6 Jun 2024',
          text: 'Thanks to the creators! An excellent helper and means of development for each of us!',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/7081af32-3d90-41e5-80bb-1f435e40af0c',
          image:
            'https://lh3.googleusercontent.com/a/ACg8ocJf4CuvWI8YZWwr1wCrezSUPUbSE4irywd9zCAc2Wl3FmQscA=s48-w48-h48',
        },
        {
          name: 'Aliaksandr Yerashenka',
          date: '2 Jun 2024',
          text: 'Great app. It would be nice to have dark mode for the extension. Also more options for customization, such as number of examples and translation of examples.',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/03affcd2-9b0b-47be-abb3-adba49e10f95',
          image:
            'https://lh3.googleusercontent.com/a/ACg8ocJE4qjDkSVRHDZo-2LpYh2qLsY-At8ovGF4E55tY6wEzL-Xcw=s48-w48-h48',
        },
        {
          name: 'Kostia',
          date: '29 May 2024',
          text: 'Very good application. Something that I was looking for a long time. The support of PDF format would be great.',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/7eae2387-8540-40c3-b39b-02afc16e104c',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjVl_AebYtkBuYywTIeC1BMncPGQ2PWRgw2mMzxZ8ovKSDllxzJ_=s48-w48-h48',
        },
        {
          name: 'Richard Yates',
          date: '1 May 2024',
          text: '谢谢开发者！',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/56a2f160-ec44-4714-8118-a99f243c2eff',
          image:
            'https://lh3.googleusercontent.com/a/ACg8ocIdjGmy9ZkiwOF6tu_BmRG_JkLa-E6Wig9q6ij5Am42zw_MB_py=s48-w48-h48',
        },
        {
          name: 'Vadim Karedin',
          date: '25 Apr 2024',
          text: 'very useful app, it would be great if it continued to be developed further. Thank you very much',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/ddd03358-da12-4e8e-b362-58dfafd9fa19',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjXtWMRXCLx9yDD-Wn3-sJ6pVtnjhMZ6jwyzG1po7hehmcS1TY0=s48-w48-h48',
        },
        {
          name: 'John “TROPIC” Doe',
          date: '15 Apr 2024',
          text: 'Очень полезное приложение, помогает учить целевой язык с помощью интервального повторения!',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/41a4bd1a-8fc9-4213-9728-9c14949b2414',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjUotSuowj7p3LLfMVoj75i0Zn0VgrZkyLNYXNkFa5fX9mtnjK8=s48-w48-h48',
        },
        {
          name: 'Godfrey Norton',
          date: '25 Mar 2024',
          text: 'Very useful extension that support many languages, if you are studying a language, then this app is for you!',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/69a5806b-6b9b-4c18-976b-bb011dc58c9a',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjWGxxxwMqLoEeUlu-A0ZOLeu72U2BaA3jdZGL9ed-4YxgJDrjGl=s48-w48-h48',
        },
        {
          name: 'ZeeGreed',
          date: '22 Mar 2024',
          text: 'Useful and easy to master',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/b2652a83-2053-4858-a2f3-4445d3753ebe',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjXdWrKX8RQ_s-QmLdyYcV7NFPu47L2qdxppz5gqWippaeX-d6-f_w=s48-w48-h48',
        },
        {
          name: 'Asefine',
          date: '11 Mar 2024',
          text: 'Поистине гениальное приложение, причём выделять можно слова можно в том числе и с субтитров на ютубе, просто кликая на них. Единственное хотелось бы ещё разных способов повторять слова, но и без этого приложение отличное.',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/1a45c311-eba5-4a43-b506-be2bc4cd934b',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjUrBnEYGeHJH8DRvM6dkGo2yySC0zyljPss9eG_wpgSb4bmeBa7=s48-w48-h48',
        },
        {
          name: 'Nick Gisich',
          date: '10 Mar 2024',
          text: 'Простое и гениальное решение, его очень не хватало. Выделил непонятное слово в браузере -> добавил в базу -> учишь в смартфоне.\nБольшое спасибо автору!',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/fcd05fb4-7f7b-4f07-b4c0-7b931d18c4cf',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjXzxexzIF3vZiiqhqqw58L7i966yezpp6N54I3NkFYFFiGrvFZr=s48-w48-h48',
        },
        {
          name: 'Pavlo Krasnomovets',
          date: '4 Mar 2024',
          text: 'Simple and awesome',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/3f74cac5-f6ef-4218-98a1-23c7aaa36924',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjUVyo26z61IXoUBgMiy_k7xTYTLbTgptUIaWz3mywIecHF18pJk7A=s48-w48-h48',
        },
        {
          name: 'Dino',
          date: '4 Mar 2024',
          text: 'Fantastic work! This is impressive.',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/0e9ca2cf-94d2-46e7-b5e5-3355b1d0ab71',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjUz4QfgE-npdzxKBzk0ZPPNTtd1JyZEkOYFxXiQ3V84VTrYH4C9=s48-w48-h48',
        },
        {
          name: 'Oleksandr Nesterenko',
          date: '3 Mar 2024',
          text: 'Exactly, what i need',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/b450abd7-1832-4124-b1ef-b72d863c9e8c',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjVO5VRYhdTYlufAcXD8hNUJvAJsWb5g-VIAMY4E2iVkVDpbDvv_=s48-w48-h48',
        },
        {
          name: 'Shota Arabuli',
          date: '3 Mar 2024',
          text: 'Идеальное решение для изучения неочевидных словосочетаний, которые встречаются в тексте - можно просто делать с ними такие же карточки для изучения, как со словами. Спасибо большое создателю!',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/28b1e9e1-777b-4b24-bccd-ff11e4407416',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjU5I7zgQs0w4JZbi6w2gzazWd6ZzHW3t1iG8BrYBxd8w_RliAeq9g=s48-w48-h48',
        },
        {
          name: 'FragMent',
          date: '14 Feb 2024',
          text: 'Works great, just what you need ^_^ ',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/4ab53d86-612c-4182-b25f-f692dedc28d9',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjVpJKY-9Ql2AVvKRgy3kqPL6civLpdLUpSGmW3NCTK67nkuAhJ4=s48-w48-h48',
        },
        {
          name: 'Alexander “Qantas”',
          date: '12 Feb 2024',
          text: 'Отличное решение, похоже это именно то, о чём мечтал для расширения словарного запаса на английском. Мира и всех благ тебе, добрый человек!',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/4ac1c130-ac1f-46ba-a147-99d32d4d14c8',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjVssbB81qvWcZKFkBJ3VwTXjA_DCfap-h0BwwOqhDaNdu62vnI=s48-w48-h48',
        },
        {
          name: 'Wissam',
          date: '15 Nov 2023',
          text: 'Simple and easy to use! Recommended for folks just getting started or who like to use the flashcards!',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/18a0b3cb-eb07-4e68-8fcf-73d6eb7ce6df',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjUDAdYpHmB6y9dG15lThAnfMonhxEigajNnhbhoP0WltpfftF_F=s48-w48-h48',
        },
        {
          name: 'Lia Nelson',
          date: '29 Aug 2023',
          text: 'Using it already for a month, works nicely in tandem with phone app',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/\\351\\004)\\335\\370\\263@\\303\\257\\030\\313D\\246\\244\\027\\n\\202F[\\227\\203p8F1\\336\\034\\352RZ6\\277',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjUzjmy63jSoocpVOReE8NsJ1Sh2TrpVKrlEqAw41HmoGQRSWCW6=s48-w48-h48',
        },
        {
          name: 'Mary Grigoryeva',
          date: '29 Aug 2023',
          text: 'Great app for intermediate and upper-intermediate level of language. Love the slick design!',
          stars: 5,
          url: 'https://chromewebstore.google.com/reviews/\\213\\021c\\331g\\344\\303\\035`\\024\\022\\345\\027\\246A\\311\\271\\03011\\241D\\274\\203\\2429he\\325w\\005\\004',
          image:
            'https://lh3.googleusercontent.com/a-/ALV-UjV1Oj7y1oU-gPQgWER4TDtg01feaL6SX2SyS5VFwhC1H46noVg=s48-w48-h48',
        },
      ],
      playStore: [
        {
          name: 'Cholo Barin',
          date: '10 November 2026',
          text: 'Better than other flashcards I have used so far. It even has Tagalog translation.',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=3896ee4b-79ac-45e4-bd41-0788aeb321ba',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjVpPbe2Bxr56lDOkvudkuzNP8u593jgiWESjR_04y5TA1jaxRZEOA=s32-rw',
        },
        {
          name: 'ngoc pham',
          date: '30 October 2026',
          text: 'this is a good application',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=7d7a864b-3c5f-43e4-8491-e1242c75e706',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjXDVrEc2IX9LjjbyTEWMdUi-LXCqUrtUofvwnXW_GA99daOlvQc=s32-rw',
        },
        {
          name: 'Menel',
          date: '28 October 2026',
          text: 'Wonderful app',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=d7cea196-6608-49de-8395-77e04f3f32e3',
          image:
            'https://play-lh.googleusercontent.com/a/ACg8ocIYNHSxs9LQlH7nc99N7LUJCcOnXBaGoIZXhkKcwxzvGs71ng=s32-rw',
        },
        {
          name: 'Michele Garau',
          date: '19 October 2026',
          text: 'The best dictionary, the only one I would really recommend',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=1040d5f2-9f3f-433e-b259-dcb7a4f7e151',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjXvyLhtmuEkgUdHa5WvPnfcEURoPgZjg5AkB7nqKZL7b4Wzym0J=s32-rw',
        },
        {
          name: 'erspra',
          date: '19 October 2026',
          text: "this app's best feature is that it's so simple yet effective. it doesn't distract you from learning and has zero useless functions. thx developers i love thissss",
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=a4c9f883-f3f3-48c5-9180-5b29933afbbb',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjUcZR6n45lb8l-u9-q1iRlDdGfTuPkuMyyX4pBhy5PYZAbl2QE=s32-rw',
        },
        {
          name: 'Parastoo Nikbakht',
          date: '8 October 2026',
          text: "That's great .",
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=17bd9fab-5f3e-42bf-a010-657c2cf76429',
          image:
            'https://play-lh.googleusercontent.com/a/ACg8ocKfiL5nUT5m-l6YHPEcLCFb7dWXTNzUysKjfkGuytpBZu5xuw=s32-rw',
        },
        {
          name: 'Hassy',
          date: '12 September 2026',
          text: 'Good. Satisfactory. Needs little interface improvements. Also needs enhancement in some less popular languages interactions; Arabic and others. Thanks',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=958f0e25-f428-46ae-9fed-3a0fa5391985',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjVMAlLZvzumR3weSCNbhZZvFpoXkqllgbpPPKBQO11Yt6YNmk3v=s32-rw',
        },
        {
          name: 'Карина',
          date: '24 August 2026',
          text: "The app integrates very well with the desktop extension; added words also appear in the mobile app. It translates almost instantly, explains the meaning of individual phrases in a single sentence (thanks to the AI, even phrases that have an indirect meaning in context will be understood). Plus, there's a translation for each individual word, with the option to add your own words to the list of words you're learning, which is very convenient. I don't think there are any drawbacks, but even if there were, you wouldn't find a better app than this one.",
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=5e7ff796-7590-4b33-8afd-02537d8dc4f5',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjWpVj096ltxq1gn1i2M3Z3mphOMMbHMN-EhtowMbE1lwiv7umk=s32-rw',
        },
        {
          name: 'Lirio Del Valle',
          date: '17 August 2026',
          text: 'This app is a gem for learning words from other languages.',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=95294fb6-cf7f-432f-affb-f574428ba72b',
          image:
            'https://play-lh.googleusercontent.com/a/ACg8ocJ-eaQR227utvlLd6Oo0BlNx1nbrCnAGzFNvuUUrF8J14N6kplB=s32-rw',
        },
        {
          name: 'Liliia Kruk',
          date: '7 July 2026',
          text: "I use the app to learn two languages and it's the best thing on the internet. It has a user-friendly and intuitive interface. Special thanks for the AI that lets you create flashcards in a minute.",
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=ca25a2fc-b0d8-449a-9c1c-aa2f2f899a87',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjWpLsjVDe7zhJNGynO-w3yfLTl-NERKCZ8fVsO1x2GEL0fb2yXI=s32-rw',
        },
        {
          name: 'Ruslan Pavlenko',
          date: '27 June 2026',
          text: "Cool app! I recommend it to everyone because it's convenient, effective, and very useful. Importing your own word lists for study is just TOP!",
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=d211ef6e-f648-4ed1-86ba-7822b0f76249',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjXmUH7MGyRmjMdnbi4pWexrIHcxlnRynTfSvKxY_VwVHIYYEFX9kw=s32-rw',
        },
        {
          name: 'Laia Ramírez',
          date: '15 June 2026',
          text: "It helps you learn many languages... it's perfect for creating vocabulary review lists without needing to know the meaning or translatio, it gives examples and pronunciation. I already bought the subscription 🤩",
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=84ba0751-51ca-4c67-a0db-e4f1c2621c64',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjVlULQhnStKRTGV_Pd644b1KgVqJMjmWSWc8MQtWY5kFbPL7rIv=s32-rw',
        },
        {
          name: 'Алексей Будан',
          date: '2 June 2026',
          text: "The most valuable tool for learning a foreign language. Regular flashcard apps don't help you learn words in context or with examples. Because of this, their effectiveness is very low. This app solves this problem. The advantage of this app is that it integrates into your daily routine; you don't need to dedicate time to creating flashcards. The app automatically generates flashcards as you read English books and websites. I just click the plus sign, and the card is added. Huge thanks to the developer!",
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=a8ee2007-a30a-44da-a979-e1d755065aea',
          image:
            'https://play-lh.googleusercontent.com/a/ACg8ocIk8kNjkI_QVHu_RhQ5rPL1rQLI6UDAzoBLWxkJlKEaWiRh9Q=s32-rw',
        },
        {
          name: 'Sofia Kalaidopoulou',
          date: '15 March 2026',
          text: 'The App ist simply top!',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=8bdd6789-32d3-46da-844d-f04b79d93eac',
          image:
            'https://play-lh.googleusercontent.com/a/ACg8ocIKat8rdM2soWS33H93IJsvtQVeNp9gBMvF6K95DwNdRL01CQ=s32-rw',
        },
        {
          name: 'E. Yenioglu',
          date: '2 March 2026',
          text: 'Highly recommended for learning new words.',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=f7c90d5f-b60c-4ef2-901d-48d57ed188d7',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjX2VQScG_Weu8OqD7aqpiGwbmjQXInMsTv8O4Pj2d5WxcdXxIc-YQ=s32-rw',
        },
        {
          name: 'hurtado102',
          date: '24 February 2026',
          text: 'sooooo much easier than Anki and works really well. the AI features is really easy and works great for creating senteces or individual cards for prefixes and suffixes.',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=f471875e-acb0-49f0-8c37-2ff264800581',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjWumzhKWZUeJvefH3GVbMn_pxiL8gbe1nZ85p3x9JG6zpA-bELm=s32-rw',
        },
        {
          name: 'Back Ads Pack Publicidade Móvel',
          date: '17 February 2026',
          text: 'Wow! it has impressed me positivity!',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=fd503c24-05d9-45bd-b191-e07183475d14',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjWGS8Xgu0u4Xnsblt9CcEJpOuhmSuLBCwQUtXl2nz7ej_0LtaA=s32-rw',
        },
        {
          name: 'john blade',
          date: '13 January 2026',
          text: 'The perfect app. Much better than Anki or anything similar. HUGE respect to the author!',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=4822eb91-45df-4a67-bbfa-1e26103d9a03',
          image:
            'https://play-lh.googleusercontent.com/a/ACg8ocKIk0a0f3uc0JiZv4ZahvFhm4ijQHp7iqT_wYoB1PYvwocj=s32-rw',
        },
        {
          name: 'Pan',
          date: '7 January 2026',
          text: 'great',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=a870fd46-2256-40b1-ae21-245721abd2fc',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjVF-uKjVQnNTu0WtXdi7YBrgNrqcEVGU7QB_FwKhAZYLEoftrMl=s32-rw',
        },
        {
          name: 'Kuba Wasikiewicz',
          date: '4 January 2026',
          text: "Super easy flashcard language learning app. I mostly use it while reading ebooks, but also for quick lookups while watching TV shows or playing video games. I even grabbed my previously saved Google Translate queries and added them to this app with the web extension. After trying to get myself to set up anki for the dozenth time to get a language learning routine I find this actually works for me. It's definitely much more sustainable.",
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=dec9add7-9c34-4d04-96ae-901002887552',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjUlDRANKUTm7hWqPHB4w5Yg_rUrCzw3H3AiGBG5PJrJSwrXK12ulg=s32-rw',
        },
        {
          name: 'Sara Mekki',
          date: '3 January 2026',
          text: 'very helpful, makes learning fun',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=b46f0e65-13e8-4da6-a6b3-e4a79e52ca00',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjUmRYLWh8WRzO-45MazVMSeBuS5d2x8n7L6aUlceVtUlu1RDCY8GQ=s32-rw',
        },
        {
          name: '江瑋平（GHSRobert 瑋平）',
          date: '30 December 2025',
          text: 'Advanced AI explanations, human voice pronunciation, seamlessly integrated; diverse test question types.',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=9a88e2a3-1fdf-4bf6-91fd-1394c4963e4b',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjWYOSKaQYl0z1AJ2oKvAFZrmanVqAbAcmhidxjzCy4C4OJusU9z=s32-rw',
        },
        {
          name: 'Josh Pitt',
          date: '29 December 2025',
          text: 'Amazing, helps me so much with learning',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=580c8995-6a66-47de-bf5a-27308eec10f8',
          image:
            'https://play-lh.googleusercontent.com/a/ACg8ocJV7-u8pwNfyAVaHYTgtVnrYHUtBT1k5Bl2QX7ETNTWB4D6ng=s32-rw',
        },
        {
          name: 'hamed emami',
          date: '6 December 2025',
          text: 'Perfect❤️',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=1e9447eb-ee03-4ac8-a9f8-c7d3f906c041',
          image:
            'https://play-lh.googleusercontent.com/a/ACg8ocLtlfEQIQAUE7Fm3lDjABtUTMKffoHOV2xPJCc5KbFkekdjPQ=s32-rw',
        },
        {
          name: 'Stanislav Ivankin',
          date: '20 November 2025',
          text: 'Very convenient to teach a foreign language.',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=491c727d-8e84-4d7b-a05a-442ef974063b',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjXt5eWQgEDyP-wzKCE_Cee_RJ4DUw2ocmYI7XMgvRLnSH_Hz8Oq=s32-rw',
        },
        {
          name: 'Mayur Luhadia',
          date: '14 November 2025',
          text: 'AMAZING APP. PLEASE ADD HINDI TRANSLATION FOR EXAMPLES. ALSO ADD PHRASAL VERB IDIOMS AND SLANG .HIGHLY RECOMMEND .BEST WISHES TO THE TEAM BEHIND THIS APP. ❤️💥💫💢🏵️🙂',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=5625eaaf-4874-4ffe-a6d1-18a028b1e9ae',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjUHQGA889iAYFE8Nq9D9rgn_Aw3lqwdmgz6LPHBVzP22v-9Ws55=s32-rw',
        },
        {
          name: 'Konstantin MK',
          date: '1 September 2025',
          text: 'Great app, convenient service!',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=3b6cc2e4-d587-491b-be3b-b98c7142602f',
          image:
            'https://play-lh.googleusercontent.com/a/ACg8ocK1E6DCMPJS2n6fWyk4o-S0c3bpkTPVhltRR60sxHp2LY6L5w=s32-rw',
        },
        {
          name: 'Бэла',
          date: '1 September 2025',
          text: "One of the most useful vocabulary learning apps I've ever tried. It's finally convenient to read online and immediately translate unfamiliar words—no notepad or copy-pasting required. I add a word to my vocabulary in one or two taps, and then easily return to it and review it using built-in technologies. The interface is simple, everything works quickly and without unnecessary steps. I really feel the progress: my vocabulary grows, reviewing is easy, and my motivation never wanes. I'm thrilled! I highly recommend it! A huge thank you to the author!",
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=99fc3447-5c95-4f5e-a85f-a9b61c900481',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjW9tu3DXyWCXyqG1K2nsAzgKOrjmtriGy0CtxMtW6-L0T3SwUM=s32-rw',
        },
        {
          name: 'Gary Malkin',
          date: '11 July 2025',
          text: "This is the best flashcard app that I've used. It goes into more detail than others. If I type in a word in a foreign language, it will automatically give me the definition (or a number of them to choose from if there is more than one), as well as examples of use, which is incredibly useful when studying a language. You can edit this definition field to make it more personal or memorable to you. It's really intuitive and easy to use. A perfect balance between the automated and customisable.",
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=d336e41c-0fa9-498e-92d7-9eb014baf71d',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjXk8lJZYAOxP-bx1u-t3gCBk9gWfuZ9UzihKGY0Fm1cGikvIsdohw=s32-rw',
        },
        {
          name: 'Ale P',
          date: '7 July 2025',
          text: 'One of the best apps for learning a new language. Highly recommended.',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=5f1b0453-ffe3-48a8-940e-766859b61b2c',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjXwpU_jxJ7uvauXd6tcuFpwv5z3jDysHnTWbJHcoXKj-o2HL5hb=s32-rw',
        },
        {
          name: 'Jaider Andrés BARRAZA Iturriago',
          date: '6 July 2025',
          text: "So I found this app recently and I think it's really helpful because I can watch content in French on my computer and easily save words and study it later on my phone, it's very easy and practical. I like that I also can have the dictionary in one place. so this app is very helpful. Also I just realized that I was given PREMIUM access for being one of the first active users so THANK YOU SO MUCH. It can be better and I'm sure it will be better 😉. Keep doing such an excellent job cause I loveit🥳",
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=3886d497-c002-4553-9dc1-8125539212bc',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjU5KxmAXvwvBBpxGSw_HUK7RSkkI63vJXV5exblOuSxU0wPDAA=s32-rw',
        },
        {
          name: 'Bogdan451',
          date: '5 July 2025',
          text: "This is truly the best translator, and overall the best app for memorizing new words. I've been using it for over a year now, and honestly, it's really helped me out, and I'll keep using it. The developer is the best!",
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=7e5af196-2c96-4e72-a089-2cace2bdf06a',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjXyyCsozlqsbD7PqhVm90yDcZxXWRKATlEDPz9Z2k4OOwlDKzQm=s32-rw',
        },
        {
          name: 'Antoine Planche',
          date: '5 July 2025',
          text: 'Amazing app with all the features needed to look up, collect, organize and smartly learn new vocabulary words. Non-exhaustive list of appreciated features : - export/import cards - translator based on chatgpt (LLMs are nowadays the best translators) - smart algorithm to memorize the words in your long-term memory',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=507cd56c-3957-4f3c-9be0-d926d3ea44c7',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjWFbtR2aMRc3UBlHPOPveS9cq_WdHhxqrll1MigkstBgda1dZjG=s32-rw',
        },
        {
          name: 'fkrusenstern',
          date: '23 June 2025',
          text: "I use three language study apps at the same time, and tried a few ones before. Vocably has the most clear interface. I like it a lot. Also it's free yet ;)",
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=e00acea7-3ee2-47ed-84c7-0b062caa205d',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjWp-ET7o8BsCDpf-zleffQzC_xrT4BkriXFxSnnKuAjXgxjgPY=s32-rw',
        },
        {
          name: 'Maksym Korzh',
          date: '4 June 2025',
          text: 'It helps a lot in learning English.',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=e8d4cee5-b76f-477c-8cdc-2429ba5fd3b0',
          image:
            'https://play-lh.googleusercontent.com/a/ACg8ocJ0yixYIsHtYF95-54EMGfjAHmNOQJO6SSzTGYiawv7cKdd4A=s32-rw',
        },
        {
          name: 'Dmytro Palivoda',
          date: '27 May 2025',
          text: "Great app! The developer responded quickly to my feedback and fixed everything right away — now it's even more convenient to use. Thank you!",
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=89d08bbd-0823-4585-a37a-d7a5b0e1f6dc',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjWzFz82lUDd3dqFoJMqub9ZJqUd5EsDRwejUBOgSSi2-gQAslFFKA=s32-rw',
        },
        {
          name: 'Oleksandr Kozachok',
          date: '14 May 2025',
          text: 'Thanks for the program. You can use the flashcards for review and for translation with explanations. The translation is excellent.',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=0113c80d-45d0-4aa2-b21c-068feb8cd4fb',
          image:
            'https://play-lh.googleusercontent.com/a/ACg8ocItrO6YZLndpM2FZlJQScsu5lrLVJquC_aPQ9Lojl2wKtTp=s32-rw',
        },
        {
          name: 'Illia Krasnienkov',
          date: '3 May 2025',
          text: 'This is a nice app with minimalistic design and comprehensive features. Since it already has AI integration, I suggest using it to analyze words and organize them by tags automatically. Another idea is to add a button to generate use cases for better understanding, which could then be added to the card.',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=1b03cc5e-60b5-4ee2-a249-79cec6151ef2',
          image:
            'https://play-lh.googleusercontent.com/a/ACg8ocJKroSF6pKcGUkTZKgRYzaqBy1j9BVgLrIwIBFyWF5zRQ-G=s32-rw',
        },
        {
          name: 'Пожилая Чепуха',
          date: '28 March 2025',
          text: 'Thank you for your app',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=6d1df01f-b7e0-402d-b625-3393e59ce4d5',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjWi3c7MOAnwNms2Iky-dT0eerfZTNh1V3LUjJdx5on8rGJ59lA=s32-rw',
        },
        {
          name: 'Stewart L',
          date: '17 March 2025',
          text: 'very nice integration with Chrome extension! I instantly add words into my deck during the day with 3 clicks when im reading content and never have to stop to open stupid anki, and then i have fresh flashcards to review instantly on my phone whenever i want',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=3ff78d2c-d9e7-4bbd-ac95-965e3da9a285',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjUqZQV6ZizE3dO1wyRZlatCFHX-vlIyUiEosVlCPVkZTp6SZbp6YA=s32-rw',
        },
        {
          name: 'Meiyou',
          date: '13 March 2025',
          text: 'One of the best dictionary flash card',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=64e5e90c-e4ad-4a38-b74d-d64620b541e7',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjWMQ9aOTn5OhiI7P8FEDLt6cJYh6BmA-tzuLDbMksP4UhXYqS0=s32-rw',
        },
        {
          name: 'Danylo',
          date: '17 February 2025',
          text: 'A useful and quite convenient application for learning foreign words and phrases 👍 I believe that it will become even better in the future. Many thanks to the developer.',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=8f343db7-747c-4ab2-b866-9f40614c9f74',
          image:
            'https://play-lh.googleusercontent.com/a/ACg8ocJtQ-A92Nem9s9Li-CDu43WJXlH-5PzF8-I2Hqy5uCIKIJOLw=s32-rw',
        },
        {
          name: 'Rail Batyrshin',
          date: '23 January 2025',
          text: 'This is a cool app for learning and reinforcing words on a mobile device. Paired with a browser extension, it becomes an indispensable tool for daily use. Thank you',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=607bc53b-f253-4eb9-a70b-1497fe45c0ae',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjX3yLyi3d-6aO_9Rv7CZiV_cb7Eg33rOszZbcvr3nOONoiXaaXc=s32-rw',
        },
        {
          name: 'Aliks Belyakova',
          date: '9 January 2025',
          text: 'It is a miracle: the app from my dreams) Weating for development',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=8a22b70e-4f93-4d51-af13-4748dc622a9f',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjWEXEShuhK7OORrypqAf9oA_lJziiXcjV8pwR1utegkyhnrVhhX=s32-rw',
        },
        {
          name: 'Z. Ar',
          date: '29 December 2024',
          text: 'Excellent app. Thank you!',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=1271fae2-5806-4000-aa9c-fcb8b10fb726',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjWytriDeGhX12DQoPmLhOezkdyg6xMxGYqcVyGIPgIcRINGbpnh=s32-rw',
        },
        {
          name: 'Игорь Медведев',
          date: '19 November 2024',
          text: 'A good app with a great feature – creating cards directly from the browser.',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=4cd32b31-848a-402d-b7a9-d157333f8911',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjVAk2moWo0M7NZ-BvArKPuXuJ90IJFDAAkQPL8FJPQHHVLP1R4=s32-rw',
        },
        {
          name: 'Дмитрий Мухин',
          date: '4 November 2024',
          text: "The app is excellent. It's easy to find a word and save it for memorization in one place. I've searched for many words and noticed one flaw: if I notice a typo in a word but have already pressed the search button, I have to wait for the incorrect search to process before I can submit the corrected one. Given that the search isn't instant, this makes the app difficult to use.",
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=fc579863-7240-40e4-84a5-ccbda56a646b',
          image:
            'https://play-lh.googleusercontent.com/a/ACg8ocJ-tkefoTfruvR8pjJMulg4PuuSJHk5YBwgm0pZSw3J7mGg1A=s32-rw',
        },
        {
          name: 'Shota Arabuli',
          date: '22 October 2024',
          text: 'Great app at first for learning not only words but collocations.',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=d4be4879-aea5-4632-a2cc-9c00d6898343',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjU5I7zgQs0w4JZbi6w2gzazWd6ZzHW3t1iG8BrYBxd8w_RliAeq9g=s32-rw',
        },
        {
          name: 'Dmitrii Babich',
          date: '19 July 2024',
          text: 'Perfect combination together with a corresponding browser extension',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=948b7215-5917-41d1-a074-5eb7bd9367b3',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjWwQKOZQh1zfqIitD6yf3ii8bILnZbQlNizOocd_PBe5doUJSTmhw=s32-rw',
        },
        {
          name: 'Alexandr Arnov',
          date: '16 May 2024',
          text: 'The app is very useful. Please, add a possibility to transfer transcription automatically from the dictionary. (for Georgian language).',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=25fcf151-8f2a-4283-af81-120ecf49412f',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjVQT4WT3i6guZw3B98bOf-GH01S8WDUa4zLPqDI-l5FAbq6fmzA=s32-rw',
        },
        {
          name: 'Бэла К',
          date: '30 April 2024',
          text: 'Very cool and convenient application! I recommend it to everyone!',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=58bc8672-2e55-4d5f-86e3-9867d8252f97',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjW0VGT97qUNnjPYX_0lyhatYZgByfuuKd46heYwItyRC8wlxU0=s32-rw',
        },
        {
          name: 'Jonny Wild',
          date: '29 April 2024',
          text: 'Simple and great app, use it every day. Found information about it on Habr, thanks to the author respect',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=f2a1a18a-8214-4cd1-8ae6-43c041d8443b',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjV9J75uHFLUwm9Mmxj2VW0uH6DL5TvhaKB-FEJgGNAOtTYH-_GS=s32-rw',
        },
        {
          name: 'cyb',
          date: '14 April 2024',
          text: "An excellent program, especially pleased with the open source nature of the project and the lack of ads. I've been looking for something like this for a long time, and now I have such a simple and convenient app.",
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=0847d8b3-24c5-4361-964d-ec1166b3387f',
          image:
            'https://play-lh.googleusercontent.com/a/ACg8ocLXQ9oTFCE6FaMkA39DMh3mm_CFtHfn4MvMc6IhR3tsm4Yhag=s32-rw',
        },
        {
          name: 'Санжар Рустамов',
          date: '12 April 2024',
          text: 'Hi there , it is the best vocabulary card maker app that I ever used, especially it is free, highly recommended for everyone',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=76cdc05f-b92d-42dd-b17a-36ca7d47b0b5',
          image:
            'https://play-lh.googleusercontent.com/a/ACg8ocIqWGsQZ9-WpsFLhSdfEaosykjxbJ8DsnXiLv7wH6_Dz8v6FQ=s32-rw',
        },
        {
          name: 'Vladislav Simbirkin',
          date: '2 April 2024',
          text: 'Thank you for this app! Please add an examples block to the card and fix some layout issues. It would also be great if there was a possibility to create multiple desks.',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=31235364-9f99-47b4-895c-6fcf878e6ef4',
          image:
            'https://play-lh.googleusercontent.com/a/ACg8ocKGwWOwL7DbvRqcBlTy084f6nBCaxsnWh9oeAmWAR9Fpn3XZL3A=s32-rw',
        },
        {
          name: 'Alex S.',
          date: '21 March 2024',
          text: 'It would be nice to add words from different languages and teach in the chosen one.',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=7e887c8a-d7cc-44ae-bb30-7f5003b5fe29',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjV2ydMFdWKmv2v6ZPeTcyIleoa3Y57747RaNn4M4i-Po9YuGow74A=s32-rw',
        },
        {
          name: 'kurya',
          date: '20 March 2024',
          text: "A simple yet excellent app for practicing words or texts in a foreign language. Yes, it's difficult to learn the language with it, for various reasons. But it's very good for practicing. I read the comments and saw people writing about authorization issues... I don't know what happened there, but mine is fine. I even tried using multiple accounts, and everything worked the first time. And besides, it's an open-source app, so problems are entirely possible.",
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=adabb4bc-d889-4eea-a68f-c320a97b8a68',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjXdLLVWqLlIfu3A8khlH0YZQBRQtzwjybHoJIisAGlc2v-A3Vc=s32-rw',
        },
        {
          name: 'JohnRogerSweep',
          date: '17 March 2024',
          text: "I tested the app, and it's well-implemented. However, there are issues with authorization. Specifically, the process doesn't work properly the first time, and you have to re-login to the app for it to work.",
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=2a114faf-190f-4537-af4b-8e465bfbb3a6',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjXz1ih0qefEceIf2QDSgTM0OAAelulMiEpwjOgNStzWX-zzIfQ=s32-rw',
        },
        {
          name: 'Андрей Селезнев',
          date: '17 March 2024',
          text: 'Very convenient app',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=ddc8ee8c-2798-461b-9787-af1913c9d025',
          image:
            'https://play-lh.googleusercontent.com/a/ACg8ocKObYmHDrSGiI0kT8NYAHjRl6nwqEf_ablEsgPOII9r5s9CFQ=s32-rw',
        },
        {
          name: 'Andrii Martynenko',
          date: '25 February 2024',
          text: 'It would bee great to have several desks for different languages',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=01f5ceb3-9a25-4595-adb9-d17fe841a657',
          image:
            'https://play-lh.googleusercontent.com/a/ACg8ocKW_ulWyhLdl2YIqUJsCAZ3ZqCKy9MGXnsaklnJz2oio3J-8w=s32-rw',
        },
        {
          name: 'Илья Карев',
          date: '23 February 2024',
          text: 'Simple & useful 👍',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=817389e7-223f-47bc-8d60-668cc55472af',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjX4BfkZX0m40SkQJcxtBi2xG-CjFaBFDYAid21XrvDBsfwM1hkM=s32-rw',
        },
        {
          name: 'Unknown “Юждон” Name',
          date: '22 February 2024',
          text: 'Everything is fine.',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=93a3586b-5ae0-4e25-ae73-35b3eeafd2e8',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjX_WW8ar6KgAdv_1SOEGyUE2dV1GGN0NXZuEnrlNTM_YKdqi0sI=s32-rw',
        },
        {
          name: 'ZEFIR',
          date: '16 February 2024',
          text: 'A wonderful app, worthy of five stars. It would be even better if it had voice-overs and usage examples, like from deepl.',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=7684eed2-db82-4c10-8b01-cfd6ec8e6740',
          image:
            'https://play-lh.googleusercontent.com/a/ACg8ocLMNsbLO0TINLuz3CNNjII9HzpI2xB_kCcptvvW5RludXMLgw=s32-rw',
        },
        {
          name: 'Надежда Китаева',
          date: '12 February 2024',
          text: "The best solution I've seen for expanding vocabulary!",
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=c8ffa10a-b7b1-407f-9ad2-d9a40163e3ed',
          image:
            'https://play-lh.googleusercontent.com/a/ACg8ocI1VWLG7VEXlp6g08tNPgCmu7CKFNKez9C4tRZNrNmDh0wm6Q=s32-rw',
        },
        {
          name: 'exinel',
          date: '11 February 2024',
          text: 'Very good app and easy to use',
          stars: 5,
          url: 'https://play.google.com/store/apps/details?id=com.vocablypro&reviewId=494bb79a-ef63-4ae2-a464-e22e0843d181',
          image:
            'https://play-lh.googleusercontent.com/a-/ALV-UjXqEXS1_SZkj9aaX9wugR3LDYhzEmCTA3-B_amF2UTJlCIYea5R=s32-rw',
        },
      ],
      appStore: [
        {
          title: 'The best',
          date: 'Nov 1, 2026',
          text: '最好用的单词软件。界面简洁干净，释义权威准确。可同时充当词典和背单词软件，查询、记录及单词卡的归档体验都非常丝滑。而且同时支持多语言同时学习！分语言的词卡分别归类，简单切换就可以分别查询和复习。可以说一个app就可以满足所有语言的查询、学习、记忆。推荐给所有人！',
          stars: 5,
        },
        {
          title: 'Convenient to use.',
          date: 'Oct 8, 2026',
          text: 'Love it!',
          stars: 5,
        },
        {
          title: 'Searched far and wide for this app',
          date: 'Sep 24, 2026',
          text: 'So I was looking for pretty much exactly that app: - free - open source iOS - allows to translate and add translations as word - nice clean and simple look - no exaggerated AI overuse I cannot thank the dev enough for this one, really great job! 🫶',
          stars: 5,
        },
        {
          title: 'This should replace LookUP',
          date: 'Sep 9, 2026',
          text: "This is hands down the best tool for word searching and learning vocab. Super easy to use and doesn't make your brain hurt trying to figure how it works. Big thanks to whoever made this gem. You're awesome!",
          stars: 5,
        },
        {
          title: 'Найкращий додаток для вивчення лексики.',
          date: 'Aug 26, 2026',
          text: 'На мою думку, цей додаток найкращий додаток в своїй категорії. Дуже подобається режим навчання по карткам. Автоматичне створення карток для вивчення і, що для мене дуже важливо, це імпорт вже сформованих списків слів. Генерація прикладів словосполучень і речень, де це слово використовується в різних контекстах. Найкращі побажання розробнику та подальшого розвитку. Щиро дякую. Слава Україні! DE: Meiner Meinung nach ist diese App die beste in ihrer Kategorie. Der Lernmodus mit Karteikarten gefällt mir sehr gut. Die automatische Erstellung von Karteikarten zum Lernen und – was für mich besonders wichtig ist – der Import bereits erstellter Vokabellisten. Die Generierung von Beispielen für Wortkombinationen und Sätzen, in denen das Wort in verschiedenen Kontexten verwendet wird. Die besten Wünsche an den Entwickler und viel Erfolg bei der weiteren Entwicklung. Vielen herzlichen Dank. Es lebe die Ukraine!',
          stars: 5,
        },
        {
          title: 'Вельмі добрая аплікацыя',
          date: 'Aug 26, 2026',
          text: 'Вельмі падабаецца мінімалістычны выгляд аплікацыя і шмат карыстнага функцыянала як стварэння тэгаў, каб структурызаваць наўчанне пад сваі жадання.',
          stars: 5,
        },
        {
          title: 'Powerful Tool',
          date: 'Aug 20, 2026',
          text: 'I’ve been using this for a little bit now, I enjoy how easy it is to add vocabulary and it generates example sentences for you to put it into context!',
          stars: 5,
        },
        {
          title: 'Great app',
          date: 'May 22, 2026',
          text: 'Great app to learn words. You should take book and write problem words in this app',
          stars: 5,
        },
        {
          title: 'One of the best of its kind',
          date: 'May 6, 2026',
          text: 'I have tried many vocabulary builder tools but none has been as handy as this',
          stars: 5,
        },
        {
          title: 'Cool design',
          date: 'Feb 3, 2026',
          text: 'And convenient mechanics.',
          stars: 5,
        },
        {
          title: 'Amazing',
          date: 'Jan 26, 2026',
          text: 'This app has taken my knowledge of Spanish words from a B2 to a solid C1 in no time!',
          stars: 5,
        },
        {
          title: 'Одно из самых удобных приложений для ведения личного словаря',
          date: 'Jan 2, 2026',
          text: 'Приложение супер, внешне стандартное приложение для сохранения и повторения новых слов, но главным преимуществом являются расширения для браузеров, то что ты можешь смотреть, например, видео на ютубе и кликнуть по слову из субтитров и сразу перейти к переводу это чудо какое-то. И так работает с любыми словами в браузере, в том числе и на телефоне.',
          stars: 5,
        },
        {
          title:
            'Everything is focused on what matters most — quickly adding vocabulary and reviewing it effectively.',
          date: 'Nov 21, 2025',
          text: 'Vocably is one of the most convenient apps for learning new words. It’s stylish, minimalistic, functional, and free of clutter or unnecessary features. 5 ⭐️',
          stars: 5,
        },
        {
          title: 'Very useful',
          date: 'Nov 18, 2025',
          text: 'The app keeps improving! Only piece of AI powered software I use.',
          stars: 5,
        },
        {
          title: 'Best app!',
          date: 'Nov 15, 2025',
          text: "I very much like this app! It's very convenient and simple at the same time. Everything is designed so that you can learn without getting lost in a bunch of added words.",
          stars: 5,
        },
        {
          title: 'Perfect in its Simplicity!',
          date: 'Sep 12, 2025',
          text: "A huge thank you to the developer for this amazing app! Your creativity and hard work have created something special. It's so simple to use but unbelievably useful at any moment. It's the definition of a perfectly designed tool. Wishing you all the best! I highly recommend this app to everyone!",
          stars: 5,
        },
        {
          title: 'Impressive App!',
          date: 'Sep 1, 2025',
          text: 'Very Useful App! I love using this app while watching movies on my PC. Whenever I pause a scene and look up the word on my phone, the app gives me the translation with an explanation right away. I’ve tried it with Tubi and YouTube, and it makes learning super easy and fun. Big thanks to the creator — they really did an amazing job!',
          stars: 5,
        },
        {
          title: 'Огнина 🔥',
          date: 'Aug 29, 2025',
          text: 'Просто топ — вот прям то, что искал. Без лишнего барахла и разучивание карточек из словаря это 🤌',
          stars: 5,
        },
        {
          title: '最好的',
          date: 'Aug 28, 2025',
          text: 'Сердечно благодарю за замечательное приложение, для человека который много учит китайский это просто невероятно. Люблю все функции: от возможности редактировать карточки и до режимов обучения. Я амбассадор этого приложения, реально рекомендую его буквально каждому, кто чуть заикнется о том, что он учит какой-то язык💖',
          stars: 5,
        },
        {
          title: 'Exactly I was Looking For',
          date: 'Aug 6, 2025',
          text: 'I rarely leave reviews, but this app is everything I wanted. Amazing! Please never stop developing! Thank you so much !',
          stars: 5,
        },
        {
          title: 'Very useful',
          date: 'Jul 26, 2025',
          text: 'Love that I can build my own vocabulary of specific words that I am encountering and thus need to know.',
          stars: 5,
        },
        {
          title: 'Unfassbar hilfreich im Ausland',
          date: 'Jul 10, 2025',
          text: 'Ich schreibe zwar nie Bewertungen, aber diese App hat es verdient. Sie ist einfach so praktisch, besonders dann, wenn man länger im Ausland unterwegs ist und sprachlich noch oft auf seine Grenzen stößt. Mein Anwendungsfall sind v.a. Vokabeln die man im Alltag braucht, die aber bei Sprach Lern Apps noch lange nicht rankommen. Einfach eingeben, Beispielsätze anschauen (es wird nämlich nicht nur das Wort ohne Kontext übersetzt), die passende Karteikarte speichern und später wiederholen. Eine perfekte Ergänzung zu DeepL und etwaigen Sprach Apps.',
          stars: 5,
        },
        {
          title: 'review',
          date: 'Jul 7, 2025',
          text: 'I so far really like it 🫶🏼',
          stars: 5,
        },
        {
          title: 'Great for memorizing new words',
          date: 'Jul 5, 2025',
          text: 'I am learning English and Polish and I use other apps for that and also have classes with a teacher. It was challenging for me to memorize new words and this app was a great solution. Thank you Dmitry',
          stars: 5,
        },
        {
          title: '10/10',
          date: 'Jul 4, 2025',
          text: 'кланяюсь в ноги за расширение для сафари, потому что это лучшее из возможного, чтобы читать научные статьи на английском и сразу фиксировать ключевую лексику не нужно никуда переходить из браузера, просто выделить слово и нажать кнопку для перевода и добавления в словарик, чтобы потом работать над запоминанием этой лексики',
          stars: 5,
        },
        {
          title: 'Danach habe ich ewig gesucht',
          date: 'Jun 10, 2025',
          text: 'Super simpel gestaltete App mit hoher Funktionalität. Besser geht es kaum! Ich nutze es jeden Tag um Wörter mit dem Browser Plugin zu übersetzen und anschließend in der App zu lernen. Einfach genial',
          stars: 5,
        },
        {
          title: 'Yahoo 🎉',
          date: 'Jun 9, 2025',
          text: "This is exactly what I needed. I'm looking forward to more new features to come! 🔥",
          stars: 5,
        },
        {
          title: 'Better than Anki',
          date: 'Jun 3, 2025',
          text: 'The app allows you to create flashcards directly from the translator, what really saves you time. The interface is also nice, and everything works great.',
          stars: 5,
        },
        {
          title: 'Simple but effective app',
          date: 'May 31, 2025',
          text: 'I love this app for not using ‘gamification’ in user interface, I was just searching for a place where I can study words in a calm manner without reminders and passive-aggressive birds and I found it.',
          stars: 5,
        },
        {
          title: 'Excellent app that delivers on what it promises!',
          date: 'May 26, 2025',
          text: 'For me This app helps bridge the gap from basic understanding to more advanced by helping to unlock reading and other things. Plus it really helps to create great feedback loops on different bits of vocabulary. Great ux and responsive developer!',
          stars: 5,
        },
        {
          title: 'Дякую',
          date: 'May 14, 2025',
          text: 'Для вивчення іноземної мови просто супер',
          stars: 5,
        },
        {
          title: 'Just great.',
          date: 'Apr 14, 2025',
          text: 'This app is just great. It covers my language needs. Also good as a simple translator and not mentioned it makes big difference when it comes to translate anything inside safari. Developer is very communicative and opened for new ideas. Thanks!',
          stars: 5,
        },
        {
          title: 'Simple, yet so helpful!',
          date: 'Mar 4, 2025',
          text: 'The app is perfectly designed for collecting and memorizing new words/phrases from a language you’re learning, each stack (of them) is even separated per language (so many available: Spanish, Russian, Korean, etc). The practicing sessions are quite assistive and even show you a couple of examples to help recall the word/phrase. Definitely recommended for every language learner!',
          stars: 5,
        },
        {
          title: 'Fantastic',
          date: 'Feb 25, 2025',
          text: 'One of the best apps that I have used.',
          stars: 5,
        },
        {
          title: 'Отличное приложение для изучения языка!',
          date: 'Feb 5, 2025',
          text: 'Очень удобно, что можно быстро искать и переводить слова, а затем учить их с помощью флеш-карт. Особенно понравилась интеграция с Safari - теперь, читая статьи на английском, сразу добавляю новые слова в свою коллекцию. Еще одна крутая фишка - обратный перевод. Если не знаю, как сказать слово на английском, просто ввожу его на родном языке, и приложение помогает найти нужный вариант. Приложение сохраняет слова в начальной форме, что делает изучение более логичным. Метод SRS с флеш-картами действительно работает - запоминать новые слова стало проще. Очень рекомендую тем, кто учит язык и хочет улучшить словарный запас!',
          stars: 5,
        },
        {
          title: 'Dope!',
          date: 'Dec 10, 2024',
          text: 'Unique app, that helps me with Brazilian Portuguese , I love this flash cards system, that design from my learnings!',
          stars: 5,
        },
        {
          title: 'Simple but powerful',
          date: 'Dec 7, 2024',
          text: 'Well made app that does exactly what it should. Thank you for this!',
          stars: 5,
        },
        {
          title: 'Отличное приложение',
          date: 'Nov 26, 2024',
          text: 'Простое и понятное приложение для помощи в изучении слов. Самое главное преимущество - наличие расширения для браузера. При помощи него очень удобно сохранять незнакомые слова, а после практиковать уже через телефон, например по пути куда-либо.',
          stars: 5,
        },
        {
          title: 'Exactly what I searched for!',
          date: 'Nov 7, 2024',
          text: 'Thank you so much for your effort to provide this free apps. It’s the best. (I used words for this review that I learned in your app.)',
          stars: 5,
        },
        {
          title: 'Easy to use, great integration and highly effective!',
          date: 'Oct 8, 2024',
          text: 'I love this app and it has simply changed the game for helping me to learn a language. Since it integrates with my browser on my computer and the app on my phone, I can add and learn new words easily no matter where I am. The interface is simple and works really well while the translations are fast and accurate. You even get helpful definitions to to further improve the efficacy of understanding new words and phrases. I would highly recommend this app to any language learner at any level!',
          stars: 5,
        },
        {
          title: 'User friendly and efficient',
          date: 'Sep 19, 2024',
          text: 'I love this app. I was looking for something like this app for a long time.',
          stars: 5,
        },
        {
          title: 'Truly the best vocab app ever',
          date: 'Jun 27, 2024',
          text: 'I want to say thank you for that wonderful app. I particularly like the way it translates not only the separate words but also the whole phrases and expressions. Needless to say, the translation is much more accurate compared to Google! My respect and gratitude to the developing team for their valuable contribution to my language-acquiring',
          stars: 5,
        },
        {
          title: 'Very helpful for learning Spanish.',
          date: 'May 23, 2024',
          text: 'I’ve been using this app for a couple weeks now and it is a great way to quickly note words that I come across while learning Spanish. The ability to easily translate words that I’m thinking in English to Spanish is a very helpful feature. Also the ability to test myself on those words in my free time is also great for making learning Spanish part of my daily life. Look forward to seeing how it continues to develop!',
          stars: 5,
        },
        {
          title: 'Great for learning complex words',
          date: 'Jun 3, 2023',
          text: 'Unlike many other apps, this one allows you to learn real-life words which you can pick-up from your daily content.',
          stars: 5,
        },
      ],
    },
  },
};
