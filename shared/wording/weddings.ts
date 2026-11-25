// Wedding words. The names stand above the headline, so each headline carries on from them.
// No scripture, invocations or names of God: those come only from the vetted greetings (cultures.ts).
import { pack, t } from './kit';

const everyone = pack({ occasion: 'wedding' }, [
    [
        'wedding-two-families',
        'warm',
        'From both families',
        t(
            'invite you to celebrate their wedding',
            'शुभ विवाह में आप सादर आमंत्रित हैं',
            'શુભ લગ્ન પ્રસંગે આપને ભાવભર્યું આમંત્રણ',
        ),
        t(
            'Two families are becoming one, and we would love you beside us as it happens.',
            'दो परिवार एक होने जा रहे हैं। इस मंगल अवसर पर आपका साथ हमारी खुशी को पूरा करेगा।',
            'બે પરિવાર એક થઈ રહ્યા છે. આ મંગલ પ્રસંગે આપનો સાથ અમારી ખુશીને પૂર્ણ કરશે.',
        ),
        t(
            'Come and bless the beginning of their story.',
            'आइए, इस नई शुरुआत को अपना आशीर्वाद दीजिए।',
            'પધારો અને આ નવી શરૂઆતને આપના આશીર્વાદ આપો.',
        ),
    ],
    [
        'wedding-honour',
        'formal',
        'Request the honour',
        t('request the honour of your presence at their marriage'),
        t(
            'Together with their parents, they ask you to witness their vows and to join the celebrations that follow.',
        ),
        t('Your presence will be warmly remembered.'),
    ],
    [
        'wedding-parents',
        'traditional',
        'With their parents’ blessings',
        t(
            'are getting married with the blessings of their parents',
            'माता-पिता के आशीर्वाद से विवाह सूत्र में बँध रहे हैं',
            'માતા-પિતાના આશીર્વાદથી લગ્નબંધનમાં જોડાય છે',
        ),
        t(
            'Our children are beginning a life of their own. We invite you and your family to stand with ours.',
            'हमारे बच्चे अपने नए जीवन की शुरुआत कर रहे हैं। आप सपरिवार पधारकर हमारे साथ खड़े हों।',
            'અમારાં સંતાનો નવા જીવનની શરૂઆત કરે છે. આપ સહકુટુંબ પધારી અમારી સાથે રહો.',
        ),
        t(
            'With folded hands, we look forward to welcoming you.',
            'हाथ जोड़कर आपके स्वागत की प्रतीक्षा में।',
            'બે હાથ જોડી આપના સ્વાગતની રાહમાં.',
        ),
    ],
    [
        'wedding-simple',
        'modern',
        'Short and sure',
        t('are getting married'),
        t('We found each other, and now we would like our favourite people in one place.'),
        t('Please be one of them.'),
    ],
    [
        'wedding-small',
        'quiet',
        'A small wedding',
        t('invite you to a small wedding'),
        t(
            'We are keeping it close: a short ceremony, a long table and only the people who know us best.',
        ),
        t('We hope you will take your seat.'),
    ],
    [
        'wedding-away',
        'warm',
        'A wedding away from home',
        t('invite you to travel with them to their wedding'),
        t(
            'Pack for a few days with us. We will look after the rest, from the first welcome drink to the last goodbye.',
        ),
        t('The journey is better with you on it.'),
    ],
    [
        'wedding-second-chapter',
        'quiet',
        'A new chapter',
        t('have found each other, and are getting married'),
        t(
            'Life brought us here a little later, and we are all the more grateful. Join us as two households become one.',
        ),
        t('Your warmth has carried us this far.'),
    ],
    [
        'wedding-finally',
        'playful',
        'Finally!',
        t('are finally doing this'),
        t(
            'You asked when. You asked often. Here is the date, the place and a promise of very good food.',
        ),
        t('Wear shoes you can dance in.'),
    ],
]);

const hindu = pack(
    {
        occasion: 'wedding',
        culture: 'hindu',
    },
    [
        [
            'hindu-wedding-saptapadi',
            'traditional',
            'Seven steps',
            t(
                'invite you to witness their seven steps together',
                'सात फेरों के साक्षी बनने हेतु आप सादर आमंत्रित हैं',
                'સપ્તપદીના સાક્ષી બનવા આપને સાદર આમંત્રણ',
            ),
            t(
                'Around the sacred fire our children will take seven steps and seven promises. Bless each one with your presence.',
                'अग्नि को साक्षी मानकर हमारे बच्चे सात फेरे और सात वचन लेंगे। आपकी उपस्थिति हर वचन को आशीर्वाद देगी।',
                'અગ્નિની સાક્ષીએ અમારાં સંતાનો સાત ફેરા અને સાત વચન લેશે. આપની હાજરી દરેક વચનને આશીર્વાદ આપશે.',
            ),
            t(
                'Your blessings are the first gift of their new life.',
                'आपका आशीर्वाद उनके नवजीवन का पहला उपहार है।',
                'આપના આશીર્વાદ એમના નવજીવનની પહેલી ભેટ છે.',
            ),
        ],
        [
            'hindu-wedding-sparivar',
            'formal',
            'You and your family',
            t(
                'request the pleasure of your company at their wedding',
                'शुभ विवाह में आपकी सपरिवार उपस्थिति प्रार्थनीय है',
                'શુભ લગ્ન પ્રસંગે આપની સહકુટુંબ ઉપસ્થિતિ પ્રાર્થનીય છે',
            ),
            t(
                'On this auspicious occasion we request you to grace every ceremony with your family and bless the couple.',
                'इस मांगलिक अवसर पर सपरिवार पधारकर वर-वधू को अपना स्नेह और आशीर्वाद प्रदान करें।',
                'આ માંગલિક પ્રસંગે સહકુટુંબ પધારી વર-વધૂને આપના સ્નેહ અને આશીર્વાદ આપશો.',
            ),
            t(
                'Awaiting your arrival, both families.',
                'दर्शनाभिलाषी, दोनों परिवार।',
                'આપના આગમનની રાહમાં, બંને પરિવાર.',
            ),
        ],
        [
            'hindu-wedding-mandap',
            'warm',
            'Under the mandap',
            t(
                'invite you to join them under the mandap',
                'मंडप तले आपको प्रेमपूर्वक आमंत्रित करते हैं',
                'મંડપ નીચે આપને પ્રેમભર્યું આમંત્રણ આપે છે',
            ),
            t(
                'From the first haldi to the last farewell, every ceremony will feel fuller with you in it.',
                'हल्दी की पहली रस्म से विदाई तक, हर रस्म आपके साथ और भी सुंदर होगी।',
                'પીઠીની પહેલી વિધિથી વિદાય સુધી, દરેક પ્રસંગ આપના સાથથી વધુ સુંદર બનશે.',
            ),
            t(
                'Bring your songs, your laughter and your blessings.',
                'अपने गीत, अपनी हँसी और अपना आशीर्वाद साथ लाइए।',
                'આપનાં ગીત, આપનું હાસ્ય અને આપના આશીર્વાદ સાથે લાવજો.',
            ),
        ],
        [
            'hindu-wedding-grandparents',
            'traditional',
            'From the grandparents',
            t(
                'are getting married with their grandparents’ blessings',
                'दादा-दादी के आशीर्वाद से विवाह बंधन में बँध रहे हैं',
                'દાદા-દાદીના આશીર્વાદથી લગ્નબંધનમાં જોડાય છે',
            ),
            t(
                'We have waited years to see this day in our home. Come and share it with us, young and old together.',
                'इस दिन की प्रतीक्षा हमारे घर ने बरसों की है। छोटे-बड़े सब साथ आकर यह खुशी बाँटिए।',
                'આ દિવસની રાહ અમારા ઘરે વર્ષોથી જોઈ છે. નાના-મોટા સૌ સાથે આવી આ ખુશી વહેંચો.',
            ),
            t(
                'With love from the eldest to the youngest of us.',
                'घर के बड़ों से लेकर छोटों तक, सबका स्नेह।',
                'ઘરના વડીલોથી લઈને નાનાં સૌનો સ્નેહ.',
            ),
        ],
        [
            'hindu-wedding-modern',
            'modern',
            'Old rituals, new story',
            t('are getting married, the traditional way'),
            t(
                'There will be a baraat that runs late, a pandit who does not and a dance floor that outlasts us all.',
            ),
            t('Come for the pheras, stay for the party.'),
        ],
    ],
);

const gujarati = pack(
    {
        occasion: 'wedding',
        culture: 'hindu',
        variant: 'gujarati',
    },
    [
        [
            'gujarati-wedding-kankotri',
            'traditional',
            'Kankotri',
            t(
                'invite you to their auspicious wedding',
                'मंगल परिणय के अवसर पर आपको सस्नेह आमंत्रण',
                'મંગલ પરિણય પ્રસંગે આપને સસ્નેહ આમંત્રણ',
            ),
            t(
                'With the blessings of our elders, we invite you to our home with your family for this happy occasion.',
                'बड़ों के आशीर्वाद से आयोजित इस शुभ प्रसंग पर आप सपरिवार हमारे आँगन पधारें।',
                'વડીલોના આશીર્વાદથી યોજાયેલ આ શુભ પ્રસંગે આપ સહકુટુંબ અમારે આંગણે પધારશો.',
            ),
            t(
                'Your steps will brighten our courtyard.',
                'आपके पधारने से हमारे आँगन की शोभा बढ़ेगी।',
                'આપનાં પગલાંથી અમારું આંગણું દીપી ઊઠશે.',
            ),
        ],
        [
            'gujarati-wedding-hastmelap',
            'warm',
            'Hastmelap',
            t(
                'invite you to the joining of their hands',
                'हस्तमिलाप के शुभ अवसर पर आप सादर आमंत्रित हैं',
                'હસ્તમેળાપના શુભ પ્રસંગે આપને ભાવભર્યું નિમંત્રણ',
            ),
            t(
                'Two hands will meet, and with them two families. Join us for the garba, the wedding and a meal together.',
                'दो हाथ मिलेंगे और उनके साथ दो परिवार। गरबा, विवाह और भोजन में हमारे साथ रहिए।',
                'બે હાથ મળશે અને સાથે મળશે બે પરિવાર. ગરબા, લગ્ન અને ભોજનમાં અમારી સાથે રહેજો.',
            ),
            t(
                'Come early, and stay for one more round of garba.',
                'जल्दी आइए, और गरबा के एक और दौर तक रुकिए।',
                'વહેલા આવજો, અને ગરબાના એક વધુ રાઉન્ડ સુધી રોકાજો.',
            ),
        ],
        [
            'gujarati-wedding-tahuko',
            'playful',
            'From the little ones',
            t(
                'are getting married, and the children are inviting you',
                'का विवाह है, और निमंत्रण बच्चों की ओर से है',
                'નાં લગ્ન છે, અને નોતરું બાળકો તરફથી છે',
            ),
            t(
                'The grown-ups are busy with lists, so we are asking you ourselves. Please come, or who will dance with us?',
                'बड़े तो सूचियों में लगे हैं, इसलिए हम ही बुला रहे हैं। ज़रूर आना, वरना हमारे साथ नाचेगा कौन?',
                'મોટા તો યાદીઓમાં પડ્યા છે, એટલે અમે જ નોતરીએ છીએ. જરૂર જરૂરથી આવજો, નહીં તો અમારી સાથે નાચશે કોણ?',
            ),
            t(
                'From all the little ones of the family.',
                'परिवार के सभी नन्हे-मुन्नों की ओर से।',
                'પરિવારનાં સૌ ભૂલકાંઓ તરફથી.',
            ),
        ],
    ],
);

const marwari = pack(
    {
        occasion: 'wedding',
        culture: 'hindu',
        variant: 'marwari',
    },
    [
        [
            'marwari-wedding-padharo',
            'traditional',
            'Padharo sa',
            t(
                'invite you to their wedding, in true Rajasthani welcome',
                'शुभ विवाह में आप घणे मान सूं आमंत्रित हैं',
            ),
            t(
                'Our doors are open and the courtyard is dressed. Come with your family and be honoured as our guests.',
                'हमारे द्वार खुले हैं और आँगन सज चुका है। सपरिवार पधारिए और हमें अतिथि सत्कार का सौभाग्य दीजिए।',
            ),
            t('Padharo sa, we are waiting for you.', 'पधारो सा, आपकी बाट जोह रहे हैं।'),
        ],
        [
            'marwari-wedding-baraat',
            'warm',
            'With the baraat',
            t(
                'invite you to walk in their baraat and their wedding',
                'बारात और विवाह में आप सादर आमंत्रित हैं',
            ),
            t(
                'Turbans will be tied, drums will play and the pheras will follow under the stars. We want you there for all of it.',
                'साफे बँधेंगे, ढोल बजेंगे और तारों की छाँव में फेरे होंगे। इन सभी पलों में आपका साथ चाहिए।',
            ),
            t('Every welcome is warmer with you in it.', 'आपके आने से हर स्वागत और आत्मीय होगा।'),
        ],
    ],
);

const punjabiHindu = pack(
    {
        occasion: 'wedding',
        culture: 'hindu',
        variant: 'punjabi',
    },
    [
        [
            'punjabi-wedding-dhol',
            'playful',
            'Bring the dhol',
            t(
                'are getting married, and the dhol is already playing',
                'की शादी है, और ढोल अभी से बज रहा है',
            ),
            t(
                'Jaggo, mehndi, baraat and one very long dance floor. Come ready, come hungry and come with everyone.',
                'जागो, मेहंदी, बारात और नाच-गाना देर रात तक। तैयार होकर आइए, भूखे आइए और सबको साथ लाइए।',
            ),
            t('No one leaves before the last song.', 'आख़िरी गाने से पहले कोई घर नहीं जाएगा।'),
        ],
        [
            'punjabi-wedding-vehda',
            'warm',
            'In our courtyard',
            t(
                'invite you to celebrate their wedding with both families',
                'शुभ विवाह में आपको सपरिवार प्रेमपूर्वक बुलाते हैं',
            ),
            t(
                'Our courtyard has waited for this day. Share the songs, the food and the happy tears with us.',
                'इस दिन की राह हमारे आँगन ने बहुत देखी है। गीत, खाना और खुशी के आँसू, सब हमारे साथ बाँटिए।',
            ),
            t('Your blessings will stay with them always.', 'आपका आशीर्वाद सदा उनके साथ रहेगा।'),
        ],
    ],
);

const southIndian = pack(
    {
        occasion: 'wedding',
        culture: 'hindu',
        variant: 'south-indian',
    },
    [
        [
            'south-indian-wedding-muhurtham',
            'traditional',
            'At the muhurtham',
            t('request your presence at the muhurtham of their wedding'),
            t(
                'With the blessings of our elders, we request you to attend with family and friends at the auspicious hour and bless the couple.',
            ),
            t('With best compliments from near and dear ones.'),
        ],
        [
            'south-indian-wedding-banana-leaf',
            'warm',
            'Nadaswaram and a full leaf',
            t('invite you to their wedding and a full banana leaf'),
            t(
                'Come early for the nadaswaram, stay for the oonjal and the knot, and please do not leave before lunch.',
            ),
            t('There is always room for one more at our table.'),
        ],
    ],
);

const bengali = pack(
    {
        occasion: 'wedding',
        culture: 'hindu',
        variant: 'bengali',
    },
    [
        [
            'bengali-wedding-shubho',
            'traditional',
            'Shubho Bibaho',
            t('invite you to their shubho bibaho'),
            t(
                'From gaye holud in the morning to the shubho drishti at night, we request you to be with us and bless the couple.',
            ),
            t('With warm regards from both families.'),
        ],
        [
            'bengali-wedding-bou-bhat',
            'warm',
            'Wedding and bou bhat',
            t('invite you to their wedding and bou bhat'),
            t(
                'There will be conch shells, ululation, far too many sweets and every cousin you remember.',
            ),
            t('Come home to us for a day.'),
        ],
    ],
);

const islamic = pack(
    {
        occasion: 'wedding',
        culture: 'islamic',
    },
    [
        [
            'muslim-wedding-nikah',
            'traditional',
            'Nikah ceremony',
            t('request the honour of your presence at their nikah'),
            t(
                'With grateful hearts, our families invite you to witness the nikah and to join us for the walima.',
            ),
            t('Please remember the couple in your duas.'),
        ],
        [
            'muslim-wedding-parents',
            'formal',
            'From the parents',
            t('are to be married, with the prayers of their parents'),
            t(
                'We request the pleasure of your company, with family, as our children begin their life together in nikah.',
            ),
            t('Your presence and your duas will honour us.'),
        ],
        [
            'muslim-wedding-walima',
            'warm',
            'Nikah and walima',
            t('invite you to their nikah and walima'),
            t(
                'Two families are joining in joy and gratitude. Share a meal with us and leave the couple your good wishes.',
            ),
            t('We look forward to welcoming you and your family.'),
        ],
        [
            'muslim-wedding-simple',
            'quiet',
            'A simple nikah',
            t('invite you to their simple nikah'),
            t(
                'We have chosen to keep the day modest, with close family, a short ceremony and a shared meal.',
            ),
            t('Your duas are the only gift we ask for.'),
        ],
        [
            'muslim-wedding-rukhsati',
            'traditional',
            'Nikah and rukhsati',
            t('invite you to their nikah and rukhsati'),
            t(
                'A daughter leaves one loving home for another. Stand with us as we send her with our prayers.',
            ),
            t('With love from both our homes.'),
        ],
    ],
);

const sikh = pack(
    {
        occasion: 'wedding',
        culture: 'sikh',
    },
    [
        [
            'sikh-wedding-anand-karaj',
            'traditional',
            'Anand Karaj',
            t('request the honour of your presence at their Anand Karaj'),
            t(
                'Join both families at the gurdwara as the couple take their four laavan, and share langar with us after.',
            ),
            t('With folded hands, both families.'),
        ],
        [
            'sikh-wedding-milni',
            'warm',
            'From the milni onwards',
            t('invite you to their Anand Karaj'),
            t(
                'Arrive for the milni, stay for langar and celebrate with us until the doli. You are family on this day.',
            ),
            t('Your blessings complete our happiness.'),
        ],
        [
            'sikh-wedding-parents',
            'formal',
            'From the parents',
            t('are to be married, with their parents’ blessings'),
            t(
                'We request you and your family to join the Anand Karaj of our children and to bless them as they begin their life together.',
            ),
            t('Your presence will be an honour to our family.'),
        ],
        [
            'sikh-wedding-jaggo',
            'playful',
            'Jaggo to reception',
            t('are getting married, and there will be bhangra'),
            t(
                'A peaceful morning at the gurdwara, and evenings that are anything but. Bring scarves for one and shoes for the other.',
            ),
            t('See you on the dance floor.'),
        ],
    ],
);

const jain = pack(
    {
        occasion: 'wedding',
        culture: 'jain',
    },
    [
        [
            'jain-wedding-mangal',
            'traditional',
            'On this auspicious day',
            t(
                'invite you to their auspicious wedding',
                'मंगल परिणय में आप सादर आमंत्रित हैं',
                'મંગલ પરિણયમાં આપને સાદર આમંત્રણ',
            ),
            t(
                'With the blessings of our elders, we request you to join us with your family and bless the couple.',
                'बड़ों के आशीर्वाद से आयोजित इस मंगल प्रसंग में सपरिवार पधारकर वर-वधू को आशीर्वाद दें।',
                'વડીલોના આશીર્વાદથી યોજાયેલ આ મંગલ પ્રસંગે સહકુટુંબ પધારી વર-વધૂને આશીર્વાદ આપશો.',
            ),
            t('With folded hands, both families.', 'विनीत, दोनों परिवार।', 'વિનીત, બંને પરિવાર.'),
        ],
        [
            'jain-wedding-ahimsa',
            'warm',
            'Joy, gently kept',
            t(
                'invite you to a wedding held with joy and gentleness',
                'सादगी और उल्लास से भरे विवाह में आमंत्रित करते हैं',
                'સાદગી અને ઉલ્લાસભર્યા લગ્નમાં આમંત્રણ આપે છે',
            ),
            t(
                'We celebrate as we live: simply, kindly and with all our family around us. Please be part of it.',
                'जैसे जीते हैं, वैसे ही मनाएँगे: सादगी से, करुणा से और पूरे परिवार के साथ। आप भी साथ रहिए।',
                'જેમ જીવીએ છીએ તેમ જ ઊજવીશું: સાદગીથી, કરુણાથી અને આખા પરિવાર સાથે. આપ પણ સાથે રહેજો.',
            ),
            t(
                'Dinner is served before sunset.',
                'भोजन सूर्यास्त से पहले परोसा जाएगा।',
                'ભોજન સૂર્યાસ્ત પહેલાં પીરસાશે.',
            ),
        ],
        [
            'jain-wedding-sangh',
            'formal',
            'With family and sangh',
            t(
                'request your gracious presence at their wedding',
                'शुभ विवाह में आपकी गरिमामयी उपस्थिति प्रार्थनीय है',
                'શુભ લગ્ન પ્રસંગે આપની ગરિમામય ઉપસ્થિતિ પ્રાર્થનીય છે',
            ),
            t(
                'Before our elders, our family and our sangh, two lives will be joined. Kindly grace the occasion.',
                'बड़ों, परिवार और संघ की उपस्थिति में दो जीवन जुड़ेंगे। कृपया पधारकर इस अवसर की शोभा बढ़ाएँ।',
                'વડીલો, પરિવાર અને સંઘની ઉપસ્થિતિમાં બે જીવન જોડાશે. કૃપયા પધારી પ્રસંગની શોભા વધારશો.',
            ),
            t(
                'Your presence will be our good fortune.',
                'आपकी उपस्थिति हमारा सौभाग्य होगी।',
                'આપની ઉપસ્થિતિ અમારું સૌભાગ્ય હશે.',
            ),
        ],
    ],
);

const christian = pack(
    {
        occasion: 'wedding',
        culture: 'christian',
    },
    [
        [
            'christian-wedding-honour',
            'formal',
            'Honour of your presence',
            t('request the honour of your presence at their marriage'),
            t(
                'Together with their parents, they invite you to join them in church as they exchange their vows, and at the reception after.',
            ),
            t('The favour of a reply is kindly requested.'),
        ],
        [
            'christian-wedding-joyfully',
            'warm',
            'Joyfully',
            t('joyfully invite you to share in their wedding day'),
            t(
                'Walk with us from the church doors to the dinner table. Every person in those pews has helped bring us here.',
            ),
            t('With love and gratitude.'),
        ],
        [
            'christian-wedding-parents',
            'traditional',
            'From the parents',
            t('are to be joined in holy matrimony'),
            t(
                'Their parents request the pleasure of your company as our children make their vows before family and friends.',
            ),
            t('Your prayers and presence will be our blessing.'),
        ],
        [
            'christian-wedding-garden',
            'modern',
            'A garden ceremony',
            t('are saying “I do” in the garden'),
            t(
                'Short ceremony, late lunch, long toasts. Come as you are and stay until the candles go out.',
            ),
            t('We cannot wait to see your faces from the aisle.'),
        ],
    ],
);

const jewish = pack(
    {
        occasion: 'wedding',
        culture: 'jewish',
    },
    [
        [
            'jewish-wedding-chuppah',
            'traditional',
            'Under the chuppah',
            t('request the honour of your presence under the chuppah'),
            t(
                'Together with their parents, they invite you to celebrate their marriage and to dance at the wedding feast.',
            ),
            t('May we celebrate many happy occasions together.'),
        ],
        [
            'jewish-wedding-simcha',
            'warm',
            'Share our simcha',
            t('invite you to share in their simcha'),
            t(
                'A canopy, a glass and everyone we love in one room. Come and lift us up, quite possibly on chairs.',
            ),
            t('Our joy is doubled with you there.'),
        ],
        [
            'jewish-wedding-parents',
            'formal',
            'From both sets of parents',
            t('are to be married, with the blessing of their parents'),
            t(
                'Our families request the pleasure of your company at the chuppah, and at dinner and dancing to follow.',
            ),
            t('Kindly let us know if you will join us.'),
        ],
        [
            'jewish-wedding-modern',
            'modern',
            'Break a glass with us',
            t('are getting married, and a glass will be broken'),
            t(
                'Ketubah, chuppah, hora, dessert. In that order, with no speeches over five minutes.',
            ),
            t('Bring your dancing shoes.'),
        ],
    ],
);

const interfaith = pack(
    {
        occasion: 'wedding',
        culture: 'universal',
        variant: 'interfaith',
    },
    [
        [
            'interfaith-wedding-two-traditions',
            'warm',
            'Two traditions',
            t('two traditions, one promise: invite you to their wedding'),
            t(
                'We are keeping the rituals we each grew up with and making a few of our own. Come and see both our worlds meet.',
            ),
            t('Wherever you come from, you belong here.'),
        ],
        [
            'interfaith-wedding-two-ceremonies',
            'formal',
            'Two ceremonies',
            t('invite you to two ceremonies and one celebration'),
            t(
                'Our families request the pleasure of your company at both ceremonies, and at the dinner that brings us all together.',
            ),
            t('With respect and love from both families.'),
        ],
        [
            'interfaith-wedding-short',
            'modern',
            'Both, always',
            t('are getting married, in both their traditions'),
            t(
                'Different prayers, the same hopes. We will explain every step, so come curious and come hungry.',
            ),
            t('There will be twice the food.'),
        ],
    ],
);

export const weddingWordings = [
    ...everyone,
    ...hindu,
    ...gujarati,
    ...marwari,
    ...punjabiHindu,
    ...southIndian,
    ...bengali,
    ...islamic,
    ...sikh,
    ...jain,
    ...christian,
    ...jewish,
    ...interfaith,
];
