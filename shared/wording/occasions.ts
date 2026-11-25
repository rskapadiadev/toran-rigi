// Words for every occasion but weddings (weddings.ts) and remembrance (remembrance.ts). Most carry on
// from the name above them; where the family is speaking, the headline is theirs ("invite you…").
import { pack, t } from './kit';

const engagement = pack({ occasion: 'engagement' }, [
    [
        'engagement-rings',
        'warm',
        'Two rings',
        t('are getting engaged', 'की सगाई में आप सादर आमंत्रित हैं', 'ની સગાઈ પ્રસંગે આપને ભાવભર્યું આમંત્રણ'),
        t(
            'Two rings, two families and one very happy evening. We would love you there.',
            'दो अँगूठियाँ, दो परिवार और खुशियों से भरी एक शाम। आपका साथ हमें प्रिय होगा।',
            'બે વીંટી, બે પરિવાર અને ખુશીઓથી ભરેલી એક સાંજ. આપનો સાથ અમને ગમશે.',
        ),
        t(
            'Come and bless their beginning.',
            'आइए, इस शुरुआत को आशीर्वाद दीजिए।',
            'પધારો અને આ શરૂઆતને આશીર્વાદ આપો.',
        ),
    ],
    [
        'engagement-formal',
        'formal',
        'Ring ceremony',
        t(
            'request the pleasure of your company at their ring ceremony',
            'अँगूठी समारोह में आपकी उपस्थिति प्रार्थनीय है',
            'રિંગ સેરેમનીમાં આપની ઉપસ્થિતિ પ્રાર્થનીય છે',
        ),
        t(
            'With the blessings of both families, they will exchange rings. Dinner follows.',
            'दोनों परिवारों के आशीर्वाद से वे एक-दूसरे को अँगूठी पहनाएँगे। तत्पश्चात् भोजन में पधारें।',
            'બંને પરિવારના આશીર્વાદથી તેઓ એકબીજાને વીંટી પહેરાવશે. ત્યારબાદ ભોજનમાં પધારશો.',
        ),
        t('We look forward to welcoming you.', 'आपके स्वागत की प्रतीक्षा में।', 'આપના સ્વાગતની રાહમાં.'),
    ],
    [
        'engagement-families-meet',
        'traditional',
        'Families meet',
        t(
            'are promised to each other, with both families’ blessings',
            'दोनों परिवारों के आशीर्वाद से वाग्दान संस्कार',
            'બંને પરિવારના આશીર્વાદથી વાગ્દાન વિધિ',
        ),
        t(
            'Our elders have said yes and the sweets have been ordered. Join us as the two families meet as one.',
            'बड़ों ने हामी भर दी है और मिठाई भी आ गई है। दो परिवारों के इस मिलन में हमारे साथ रहिए।',
            'વડીલોએ હા પાડી છે અને મીઠાઈ પણ આવી ગઈ છે. બે પરિવારના આ મિલનમાં અમારી સાથે રહેજો.',
        ),
        t(
            'Your blessings make it official.',
            'आपके आशीर्वाद से ही यह रिश्ता पूरा होगा।',
            'આપના આશીર્વાદથી જ આ સંબંધ પૂરો થશે.',
        ),
    ],
    [
        'engagement-she-said-yes',
        'playful',
        'The answer was yes',
        t('asked the question, and the answer was yes'),
        t('Now comes the good part: music, food and everyone who saw this coming before we did.'),
        t('Come and say “I told you so”.'),
    ],
    [
        'engagement-modern',
        'modern',
        'Before the wedding',
        t('are making it official'),
        t('One evening with our nearest people before the wedding plans take over our lives.'),
        t('Say you will come.'),
    ],
]);

const anniversary = pack({ occasion: 'anniversary' }, [
    [
        'anniversary-silver',
        'warm',
        'Silver jubilee, 25 years',
        t(
            'celebrate twenty-five years together',
            'विवाह की रजत जयंती में आप सादर आमंत्रित हैं',
            'લગ્નની રજત જયંતી પ્રસંગે આપને ભાવભર્યું આમંત્રણ',
        ),
        t(
            'Twenty-five years, one home and more stories than we can fit into an evening. Help us try.',
            'पच्चीस बरस, एक घर और अनगिनत किस्से। एक शाम उन्हीं के नाम, आपके साथ।',
            'પચીસ વર્ષ, એક ઘર અને અગણિત વાતો. એક સાંજ એ જ યાદોના નામે, આપની સાથે.',
        ),
        t(
            'Your love is part of our story.',
            'हमारी कहानी में आपका स्नेह भी शामिल है।',
            'અમારી વાતમાં આપનો સ્નેહ પણ સામેલ છે.',
        ),
    ],
    [
        'anniversary-golden',
        'traditional',
        'Golden jubilee, 50 years',
        t(
            'celebrate fifty golden years of marriage',
            'विवाह की स्वर्ण जयंती में आप सादर आमंत्रित हैं',
            'લગ્નની સુવર્ણ જયંતી પ્રસંગે આપને સાદર આમંત્રણ',
        ),
        t(
            'Fifty years ago they began with very little and each other. Their children and grandchildren invite you to honour them.',
            'पचास बरस पहले उन्होंने साथ चलना शुरू किया था। बच्चे और नाती-पोते आपको इस उत्सव में आमंत्रित करते हैं।',
            'પચાસ વર્ષ પહેલાં એમણે સાથે ચાલવાનું શરૂ કર્યું હતું. સંતાનો અને પૌત્ર-પૌત્રીઓ આપને આ ઉત્સવમાં નોતરે છે.',
        ),
        t('From the family they built.', 'उनके बसाए परिवार की ओर से।', 'એમણે રચેલા પરિવાર તરફથી.'),
    ],
    [
        'anniversary-vows',
        'quiet',
        'Saying it again',
        t('are renewing their vows'),
        t(
            'The first time we promised without knowing what it meant. Now we know, and we would like to promise again.',
        ),
        t('Thank you for walking with us.'),
    ],
    [
        'anniversary-surprise',
        'playful',
        'A surprise from the children',
        t('have no idea this is happening'),
        t(
            'We are throwing our parents a surprise party. Come early, park far away and please keep the secret.',
        ),
        t('Not a word. Not even to the aunties.'),
    ],
    [
        'anniversary-dinner',
        'modern',
        'Dinner for the years',
        t('invite you to an anniversary dinner'),
        t(
            'No stage and no speeches, just good food with the people who have been there all along.',
        ),
        t('Here’s to the next one.'),
    ],
]);

const naming = pack({ occasion: 'naming' }, [
    [
        'naming-little-one',
        'warm',
        'Our little one',
        t(
            'invite you to the naming ceremony of our little one',
            'हमारे नन्हे मेहमान के नामकरण में आप सादर आमंत्रित हैं',
            'અમારા નાનકડા મહેમાનના નામકરણમાં આપને ભાવભર્યું આમંત્રણ',
        ),
        t(
            'We have chosen a name and cannot wait to say it out loud with all of you around us.',
            'हमने नाम चुन लिया है, और उसे आप सबके बीच पहली बार पुकारना चाहते हैं।',
            'અમે નામ પસંદ કરી લીધું છે, અને આપ સૌની વચ્ચે પહેલી વાર બોલવા આતુર છીએ.',
        ),
        t(
            'Your blessings are the first gift we hope for.',
            'आपका आशीर्वाद ही सबसे पहला उपहार है।',
            'આપના આશીર્વાદ એ જ પહેલી ભેટ.',
        ),
    ],
    [
        'naming-grandparents',
        'traditional',
        'From the grandparents',
        t(
            'invite you to bless our grandchild',
            'हमारे पोते-पोती के नामकरण में आशीर्वाद देने पधारें',
            'અમારા પૌત્ર-પૌત્રીના નામકરણમાં આશીર્વાદ આપવા પધારો',
        ),
        t(
            'A new voice fills our home. Join the naming ceremony and share a meal with us.',
            'हमारे घर में एक नई किलकारी गूँजी है। नामकरण संस्कार में पधारें और हमारे साथ भोजन करें।',
            'અમારા ઘરમાં નવી કિલકારી ગુંજી છે. નામકરણ વિધિમાં પધારો અને અમારી સાથે ભોજન લો.',
        ),
        t('With love from two proud generations.', 'दो पीढ़ियों के स्नेह सहित।', 'બે પેઢીના સ્નેહ સાથે.'),
    ],
    [
        'naming-cradle',
        'traditional',
        'Cradle ceremony',
        t(
            'invite you to the cradle ceremony of our baby',
            'पालना समारोह में आप सादर आमंत्रित हैं',
            'પારણા પ્રસંગે આપને સાદર આમંત્રણ',
        ),
        t(
            'The cradle is dressed with flowers and the lullabies are ready. Come and rock it once with your blessings.',
            'पालना फूलों से सजा है और लोरियाँ तैयार हैं। आइए, अपने आशीर्वाद से एक बार झुलाइए।',
            'પારણું ફૂલોથી સજાવ્યું છે અને હાલરડાં તૈયાર છે. પધારો, આશીર્વાદ સાથે એક વાર ઝુલાવો.',
        ),
        t(
            'Sweet dreams begin with good wishes.',
            'मीठे सपने शुभकामनाओं से ही शुरू होते हैं।',
            'મીઠાં સપનાં શુભેચ્છાઓથી જ શરૂ થાય છે.',
        ),
    ],
    [
        'naming-guess',
        'playful',
        'Guess the name',
        t('invite you to find out the name at last'),
        t(
            'You have all had suggestions. We read every one. Come and hear which of them we ignored.',
        ),
        t('Cake for the closest guess.'),
    ],
]);

const namingMuslim = pack(
    {
        occasion: 'naming',
        culture: 'islamic',
    },
    [
        [
            'naming-aqiqah',
            'traditional',
            'Aqiqah',
            t('invite you to the aqiqah of our child'),
            t(
                'With thankful hearts we share the joy of our newborn. Please join us for a meal with family.',
            ),
            t('Remember our little one in your duas.'),
        ],
    ],
);

const namingChristian = pack(
    {
        occasion: 'naming',
        culture: 'christian',
    },
    [
        [
            'naming-christening',
            'formal',
            'Christening',
            t('invite you to the christening of our child'),
            t(
                'Join us in church as our baby is christened, and afterwards for lunch with the godparents and family.',
            ),
            t('Your love will surround this child always.'),
        ],
    ],
);

const babyShower = pack({ occasion: 'baby_shower' }, [
    [
        'baby-shower-godh-bharai',
        'traditional',
        'Godh bharai',
        t(
            'is expecting, and we invite you to the godh bharai',
            'की गोद भराई में आप सादर आमंत्रित हैं',
            'ના સીમંત પ્રસંગે આપને સાદર આમંત્રણ',
        ),
        t(
            'Come fill her lap with blessings, and stay for songs, sweets and advice she has not asked for.',
            'आइए, उसकी गोद आशीर्वाद से भरिए और गीत, मिठाई और हँसी में हमारे साथ रहिए।',
            'પધારો, એનો ખોળો આશીર્વાદથી ભરો અને ગીત, મીઠાઈ ને હાસ્યમાં અમારી સાથે રહો.',
        ),
        t('With the love of both families.', 'दोनों परिवारों के स्नेह सहित।', 'બંને પરિવારના સ્નેહ સાથે.'),
    ],
    [
        'baby-shower-seemant',
        'traditional',
        'Seemant',
        t(
            'invite you to the seemant ceremony',
            'सीमंत संस्कार में आप सादर आमंत्रित हैं',
            'સીમંત સંસ્કારમાં આપને ભાવભર્યું નિમંત્રણ',
        ),
        t(
            'A new life is on the way to our home. Bless the mother-to-be and the little one she carries.',
            'हमारे घर एक नया जीवन आने को है। होने वाली माँ और नन्हे जीवन को आशीर्वाद दीजिए।',
            'અમારા ઘરે નવું જીવન આવવાનું છે. થનાર માતા અને નાનકડા જીવને આશીર્વાદ આપો.',
        ),
        t(
            'Your blessings will reach them both.',
            'आपका आशीर्वाद दोनों तक पहुँचेगा।',
            'આપના આશીર્વાદ બંને સુધી પહોંચશે.',
        ),
    ],
    [
        'baby-shower-tiny-feet',
        'warm',
        'Tiny feet',
        t(
            'are expecting, and would love you near',
            'के घर नन्हे कदम आने वाले हैं',
            'ના ઘરે નાનાં પગલાં પડવાનાં છે',
        ),
        t(
            'Soon there will be tiny feet and no sleep. Before that, an afternoon with the people our baby will call family.',
            'जल्द ही नन्हे कदम होंगे और नींद कम। उससे पहले, अपनों के साथ एक प्यारी-सी दोपहर।',
            'થોડા જ દિવસમાં નાનાં પગલાં હશે અને ઊંઘ ઓછી. એ પહેલાં, પોતાનાઓ સાથે એક વહાલી બપોર.',
        ),
        t(
            'We cannot wait for you to meet.',
            'आपसे मिलाने की हमें बहुत उत्सुकता है।',
            'આપની સાથે મેળવવા અમે આતુર છીએ.',
        ),
    ],
    [
        'baby-shower-boy-or-girl',
        'playful',
        'Place your bets',
        t('invite you to place your bets'),
        t('Due date, weight, whose nose. Winners get bragging rights for at least eighteen years.'),
        t('Cake is certain. Everything else is a guess.'),
    ],
    [
        'baby-shower-simple',
        'modern',
        'A gentle afternoon',
        t('invite you to a gentle afternoon before the baby comes'),
        t('Tea, good company and a few quiet hours, while we still have them.'),
        t('Come as you are. No games, we promise.'),
    ],
]);

const grihaPravesh = pack({ occasion: 'griha_pravesh' }, [
    [
        'griha-pravesh-door',
        'warm',
        'A new door',
        t('welcome you to our new home', 'हमारे नए घर में आपका स्वागत है', 'અમારા નવા ઘરમાં આપનું સ્વાગત છે'),
        t(
            'The walls are up and the keys are ours. It becomes a home when the people we love have walked through it.',
            'दीवारें बन गईं, चाबी मिल गई। घर तो तब बनेगा जब अपने इसमें कदम रखेंगे।',
            'દીવાલો ચણાઈ ગઈ, ચાવી મળી ગઈ. ઘર તો ત્યારે બનશે જ્યારે પોતાનાં પગલાં પડશે.',
        ),
        t(
            'Come and leave your blessings at our door.',
            'आइए और हमारे द्वार पर अपना आशीर्वाद दीजिए।',
            'પધારો અને અમારા દ્વારે આપના આશીર્વાદ આપો.',
        ),
    ],
    [
        'griha-pravesh-vastu',
        'traditional',
        'Vastu and griha pravesh',
        t(
            'invite you to our vastu puja and griha pravesh',
            'वास्तु पूजन एवं गृह प्रवेश में आप सादर आमंत्रित हैं',
            'વાસ્તુ પૂજન અને ગૃહ પ્રવેશ પ્રસંગે આપને સાદર આમંત્રણ',
        ),
        t(
            'Please join the puja at the auspicious hour with your family, and stay for lunch with us after.',
            'शुभ मुहूर्त में होने वाले पूजन में सपरिवार पधारें और तत्पश्चात् हमारे साथ भोजन करें।',
            'શુભ મુહૂર્તે થનાર પૂજનમાં સહકુટુંબ પધારશો અને ત્યારબાદ અમારી સાથે ભોજન લેશો.',
        ),
        t(
            'Your footsteps will make it auspicious.',
            'आपके चरणों से यह घर मंगलमय होगा।',
            'આપનાં પગલાંથી આ ઘર મંગલમય બનશે.',
        ),
    ],
    [
        'griha-pravesh-parents-dream',
        'traditional',
        'A dream come home',
        t(
            'invite you to bless the home we dreamed of',
            'हमारे सपनों के घर को आशीर्वाद देने पधारें',
            'અમારા સપનાના ઘરને આશીર્વાદ આપવા પધારો',
        ),
        t(
            'Years of hope, savings and our elders’ blessings stand behind this door. Please walk through it with us.',
            'बरसों की आशा, बचत और बड़ों का आशीर्वाद इस द्वार के पीछे है। हमारे साथ इसमें प्रवेश कीजिए।',
            'વર્ષોની આશા, બચત અને વડીલોના આશીર્વાદ આ દ્વાર પાછળ છે. અમારી સાથે એમાં પ્રવેશ કરો.',
        ),
        t(
            'Our home is complete with you in it.',
            'आपके आने से ही हमारा घर पूरा होगा।',
            'આપના આવવાથી જ અમારું ઘર પૂરું થશે.',
        ),
    ],
    [
        'griha-pravesh-housewarming',
        'playful',
        'Boxes and biryani',
        t('have moved, and some boxes are still closed'),
        t('Come see the new place. There is food, there are chairs and the Wi-Fi almost works.'),
        t('Bring nothing. We have nowhere to put it.'),
    ],
    [
        'griha-pravesh-evening',
        'modern',
        'New address',
        t('have a new address, and would love you to see it'),
        t('Join us for an easy evening, a short tour and a long dinner.'),
        t('The door is open.'),
    ],
]);

const birthday = pack({ occasion: 'birthday' }, [
    [
        'birthday-first',
        'warm',
        'First birthday',
        t('is turning one!', 'का पहला जन्मदिन!', 'નો પહેલો જન્મદિવસ!'),
        t(
            'Twelve months of giggles, very little sleep and more love than we knew existed. Come celebrate with us.',
            'बारह महीने की किलकारियाँ, थोड़ी-सी नींद और ढेर सारा प्यार। हमारे साथ जश्न मनाइए।',
            'બાર મહિનાની કિલકારીઓ, થોડી ઊંઘ અને ઢગલો વહાલ. અમારી સાથે ઉજવણી કરો.',
        ),
        t('See you at the very first party!', 'पहली पार्टी में मिलते हैं!', 'પહેલી પાર્ટીમાં મળીએ!'),
    ],
    [
        'birthday-child',
        'playful',
        'A children’s party',
        t('is having a party, and you are on the list'),
        t(
            'Balloons, games, cake and the kind of noise that only happy children make. Grown-ups welcome too.',
        ),
        t('Wear something you can spill on.'),
    ],
    [
        'birthday-sixteen',
        'playful',
        'Sweet sixteen',
        t('is turning sixteen'),
        t('Good music, better friends and parents who have agreed to stay in the other room.'),
        t('Come dressed for photos.'),
    ],
    [
        'birthday-thirty',
        'modern',
        'Thirty',
        t('is turning thirty, and taking it well'),
        t(
            'Dinner, drinks and a room full of people who remember the twenties better than they should.',
        ),
        t('No gifts. Only good stories.'),
    ],
    [
        'birthday-forty',
        'modern',
        'Forty',
        t('is turning forty'),
        t(
            'Old friends, new friends and music from the years we still call recent. Come for the evening.',
        ),
        t('The night is young, even if we are not.'),
    ],
    [
        'birthday-fifty',
        'warm',
        'Fifty',
        t(
            'is turning fifty',
            'के पचासवें जन्मदिन पर आप सादर आमंत्रित हैं',
            'ના પચાસમા જન્મદિને આપને ભાવભર્યું આમંત્રણ',
        ),
        t(
            'Half a century of friendship, laughter and second helpings. We are gathering everyone who made it so.',
            'आधी सदी की दोस्ती, हँसी और यादें। जिन्होंने इन्हें संजोया, उन सबको हम बुला रहे हैं।',
            'અડધી સદીની મિત્રતા, હાસ્ય અને યાદો. જેમણે એ સજાવી, એ સૌને અમે નોતરીએ છીએ.',
        ),
        t(
            'It would not be the same without you.',
            'आपके बिना यह शाम अधूरी रहेगी।',
            'આપના વિના આ સાંજ અધૂરી રહેશે.',
        ),
    ],
    [
        'birthday-sixty',
        'traditional',
        'Shashtipurti, 60 years',
        t(
            'completes sixty years',
            'की षष्टिपूर्ति में आप सादर आमंत्रित हैं',
            'ની ષષ્ટિપૂર્તિ પ્રસંગે આપને સાદર આમંત્રણ',
        ),
        t(
            'Sixty years of hard work, kindness and quiet guidance. Join our family in honouring a life well lived.',
            'साठ बरस की मेहनत, स्नेह और मार्गदर्शन। इस जीवन के सम्मान में हमारे परिवार के साथ सम्मिलित हों।',
            'સાઠ વર્ષની મહેનત, સ્નેહ અને માર્ગદર્શન. આ જીવનના સન્માનમાં અમારા પરિવાર સાથે જોડાશો.',
        ),
        t(
            'With respect and love, the whole family.',
            'आदर और स्नेह सहित, समस्त परिवार।',
            'આદર અને સ્નેહ સાથે, સમસ્ત પરિવાર.',
        ),
    ],
    [
        'birthday-seventy-five',
        'traditional',
        '75 years',
        t('celebrates seventy-five years'),
        t(
            'Four generations will be in one room. Come and add your stories to the ones we tell every year.',
        ),
        t('From the children, grandchildren and everyone in between.'),
    ],
]);

const retirement = pack({ occasion: 'retirement' }, [
    [
        'retirement-career',
        'formal',
        'A remarkable career',
        t(
            'is retiring, and we invite you to honour a remarkable career',
            'के सेवानिवृत्ति समारोह में आप सादर आमंत्रित हैं',
            'ના નિવૃત્તિ સમારંભમાં આપને સાદર આમંત્રણ',
        ),
        t(
            'Colleagues, friends and family are gathering to say thank you. Please join us.',
            'सहकर्मी, मित्र और परिवार धन्यवाद कहने के लिए एकत्र हो रहे हैं। कृपया आप भी पधारें।',
            'સહકર્મીઓ, મિત્રો અને પરિવાર આભાર માનવા એકત્ર થાય છે. કૃપયા આપ પણ પધારશો.',
        ),
        t(
            'Thank you for being part of the journey.',
            'इस यात्रा में साथ देने के लिए धन्यवाद।',
            'આ સફરમાં સાથ આપવા બદલ આભાર.',
        ),
    ],
    [
        'retirement-family',
        'warm',
        'From the family',
        t('is coming home for good'),
        t(
            'For years we shared them with their work. Now it is our turn. Come celebrate with us first.',
        ),
        t('With love from a very patient family.'),
    ],
    [
        'retirement-last-day',
        'playful',
        'No more Mondays',
        t('has no more Mondays'),
        t(
            'The alarm clock is retired too. Join us for dinner, a few speeches and several embarrassing photographs.',
        ),
        t('Bring your best office story.'),
    ],
]);

const puja = pack({ occasion: 'puja' }, [
    [
        'puja-katha',
        'traditional',
        'Satyanarayan katha',
        t(
            'invite you to a Satyanarayan katha at our home',
            'हमारे निवास पर सत्यनारायण कथा में आप सादर आमंत्रित हैं',
            'અમારા નિવાસે સત્યનારાયણ કથામાં આપને સાદર આમંત્રણ',
        ),
        t(
            'Please join us with your family for the katha, aarti and prasad.',
            'कथा, आरती और प्रसाद के लिए सपरिवार पधारने की कृपा करें।',
            'કથા, આરતી અને પ્રસાદ માટે સહકુટુંબ પધારવા કૃપા કરશો.',
        ),
        t(
            'With good wishes for everyone’s well-being.',
            'सबके मंगल की कामना सहित।',
            'સૌના મંગલની કામના સાથે.',
        ),
    ],
    [
        'puja-ganesh',
        'traditional',
        'Ganesh Chaturthi',
        t(
            'invite you to our home for Ganesh Chaturthi',
            'गणेश चतुर्थी पर हमारे घर आप सादर आमंत्रित हैं',
            'ગણેશ ચતુર્થીએ અમારા ઘરે આપને સાદર આમંત્રણ',
        ),
        t(
            'The house is full of flowers and the modaks are ready. Come for darshan, aarti and prasad.',
            'घर फूलों से सजा है और मोदक तैयार हैं। दर्शन, आरती और प्रसाद के लिए पधारें।',
            'ઘર ફૂલોથી સજ્યું છે અને મોદક તૈયાર છે. દર્શન, આરતી અને પ્રસાદ માટે પધારો.',
        ),
        t(
            'Our door is open through the festival.',
            'उत्सव के सभी दिन हमारे द्वार खुले हैं।',
            'ઉત્સવના બધા દિવસ અમારા દ્વાર ખુલ્લાં છે.',
        ),
    ],
    [
        'puja-mata-chowki',
        'traditional',
        'Mata ki chowki',
        t(
            'invite you to a Mata ki chowki',
            'माता की चौकी में आप सादर आमंत्रित हैं',
            'માતાની ચોકીમાં આપને સાદર આમંત્રણ',
        ),
        t(
            'An evening of bhajans and devotion with family and friends, followed by prasad.',
            'भजन और भक्ति की एक संध्या, परिवार और मित्रों के साथ। तत्पश्चात् प्रसाद।',
            'ભજન અને ભક્તિની એક સંધ્યા, પરિવાર અને મિત્રો સાથે. ત્યારબાદ પ્રસાદ.',
        ),
        t('Please come with your family.', 'कृपया सपरिवार पधारें।', 'કૃપયા સહકુટુંબ પધારશો.'),
    ],
    [
        'puja-diwali',
        'warm',
        'Diwali at home',
        t(
            'invite you home for Diwali',
            'दीपावली पर हमारे घर आप सादर आमंत्रित हैं',
            'દિવાળીએ અમારા ઘરે આપને ભાવભર્યું આમંત્રણ',
        ),
        t(
            'Help us light the last few diyas, taste everything and stay until the candles burn low.',
            'आइए, साथ में आख़िरी दीये जलाइए, सब कुछ चखिए और देर तक रुकिए।',
            'પધારો, સાથે મળી છેલ્લા દીવા પ્રગટાવીએ, બધું ચાખો અને મોડે સુધી રોકાઓ.',
        ),
        t(
            'May your home be as full of light.',
            'आपका घर भी यूँ ही रोशन रहे।',
            'આપનું ઘર પણ આમ જ ઝળહળતું રહે.',
        ),
    ],
    [
        'puja-navratri',
        'playful',
        'Navratri garba',
        t(
            'invite you to a night of garba',
            'गरबा की रात में आप सादर आमंत्रित हैं',
            'ગરબાની રાતે આપને ભાવભર્યું આમંત્રણ',
        ),
        t(
            'Aarti first, then garba until our feet give up. Dandiya sticks will be waiting for you.',
            'पहले आरती, फिर गरबा जब तक पैर न थकें। डांडिया आपके लिए तैयार मिलेंगे।',
            'પહેલાં આરતી, પછી ગરબા જ્યાં સુધી પગ ન થાકે. દાંડિયા આપના માટે તૈયાર હશે.',
        ),
        t('Wear your brightest colours.', 'अपने सबसे चटक रंग पहनकर आइए।', 'સૌથી ચટક રંગો પહેરીને આવજો.'),
    ],
]);

const upanayan = pack({ occasion: 'upanayan' }, [
    [
        'thread-learning',
        'traditional',
        'A journey of learning',
        t(
            'invite you to the sacred-thread ceremony of our son',
            'हमारे पुत्र के उपनयन संस्कार में आप सादर आमंत्रित हैं',
            'અમારા પુત્રના ઉપનયન સંસ્કારમાં આપને સાદર આમંત્રણ',
        ),
        t(
            'He receives the sacred thread and begins his journey of learning. Bless him with your presence.',
            'यज्ञोपवीत धारण कर वह विद्या की यात्रा आरंभ कर रहा है। पधारकर उसे आशीर्वाद दें।',
            'યજ્ઞોપવીત ધારણ કરી એ વિદ્યાની યાત્રા શરૂ કરે છે. પધારી એને આશીર્વાદ આપશો.',
        ),
        t(
            'Your blessings guide him.',
            'आपका आशीर्वाद उसका मार्गदर्शक है।',
            'આપના આશીર્વાદ એ જ એનો માર્ગદર્શક.',
        ),
    ],
    [
        'thread-grandfather',
        'formal',
        'From grandfather’s hand',
        t(
            'request your presence at the upanayan of our grandson',
            'हमारे पौत्र के यज्ञोपवीत संस्कार में आपकी उपस्थिति प्रार्थनीय है',
            'અમારા પૌત્રના જનોઈ પ્રસંગે આપની ઉપસ્થિતિ પ્રાર્થનીય છે',
        ),
        t(
            'A thread passes from one generation of our family to the next. Kindly join us at the auspicious hour, and for the meal after.',
            'हमारे परिवार की एक पीढ़ी से दूसरी पीढ़ी तक यह सूत्र पहुँच रहा है। शुभ मुहूर्त में और तत्पश्चात् भोजन में पधारें।',
            'અમારા પરિવારની એક પેઢીથી બીજી પેઢી સુધી આ સૂત્ર પહોંચે છે. શુભ મુહૂર્તે અને ત્યારબાદ ભોજનમાં પધારશો.',
        ),
        t('With respect, the whole family.', 'सादर, समस्त परिवार।', 'સાદર, સમસ્ત પરિવાર.'),
    ],
    [
        'thread-warm',
        'warm',
        'A big day for a small boy',
        t('invite you to our son’s thread ceremony'),
        t(
            'He has practised his part and the new clothes are ironed. He would love to see you in the front row.',
        ),
        t('Come and cheer him on.'),
    ],
]);

const mundan = pack({ occasion: 'mundan' }, [
    [
        'mundan-first-haircut',
        'traditional',
        'Mundan sanskar',
        t(
            'invite you to the mundan ceremony of our little one',
            'हमारे नन्हे बालक के मुंडन संस्कार में आप सादर आमंत्रित हैं',
            'અમારા બાળકના મુંડન સંસ્કારમાં આપને સાદર આમંત્રણ',
        ),
        t(
            'Join us for a morning of rituals and blessings, and a meal together.',
            'संस्कार, आशीर्वाद और साथ में भोजन की इस सुबह हमारे साथ रहिए।',
            'સંસ્કાર, આશીર્વાદ અને સાથે ભોજનની આ સવારે અમારી સાથે રહેજો.',
        ),
        t('With love and gratitude.', 'स्नेह और आभार सहित।', 'સ્નેહ અને આભાર સાથે.'),
    ],
    [
        'mundan-curls',
        'playful',
        'Goodbye, curls',
        t('is saying goodbye to the curls'),
        t(
            'A very first haircut, a little fuss and a lot of sweets. Come see the new look before anyone else.',
        ),
        t('Bring tissues. Mostly for the parents.'),
    ],
    [
        'mundan-elders',
        'formal',
        'With our elders',
        t(
            'request your blessings at the chudakarana of our child',
            'चूड़ाकरण संस्कार में आपका आशीर्वाद प्रार्थनीय है',
            'ચૂડાકરણ સંસ્કારમાં આપના આશીર્વાદ પ્રાર્થનીય છે',
        ),
        t(
            'In the presence of our elders, our child will have this first ceremony. Kindly join us with your family.',
            'बड़ों की उपस्थिति में यह संस्कार संपन्न होगा। कृपया सपरिवार पधारें।',
            'વડીલોની હાજરીમાં આ સંસ્કાર સંપન્ન થશે. કૃપયા સહકુટુંબ પધારશો.',
        ),
        t(
            'Your blessings will grow with our child.',
            'आपका आशीर्वाद बच्चे के साथ बढ़ता रहेगा।',
            'આપના આશીર્વાદ બાળક સાથે વધતા રહેશે.',
        ),
    ],
]);

const corporate = pack({ occasion: 'corporate' }, [
    [
        'corporate-summit',
        'formal',
        'Annual summit',
        t('invites you to our annual summit'),
        t(
            'A day of ideas, people and what comes next. Please confirm your seat so that we can plan for you.',
        ),
        t('We look forward to hosting you.'),
    ],
    [
        'corporate-launch',
        'modern',
        'Product launch',
        t('invites you to the first look'),
        t(
            'We have been building quietly. Come and be among the first to see it, try it and tell us what you think.',
        ),
        t('Seats are limited. Curiosity is not.'),
    ],
    [
        'corporate-opening',
        'traditional',
        'Opening our doors',
        t('invites you to the inauguration of our new office'),
        t(
            'A lamp will be lit, a ribbon cut and lunch served. Your presence will mean a great deal to our team.',
        ),
        t('With gratitude for your support.'),
    ],
    [
        'corporate-thanks',
        'warm',
        'A thank-you evening',
        t('invites you to an evening of thanks'),
        t(
            'To the clients, partners and families behind our year: dinner is on us, and the speeches are short.',
        ),
        t('We would not be here without you.'),
    ],
]);

export const occasionWordings = [
    ...engagement,
    ...anniversary,
    ...naming,
    ...namingMuslim,
    ...namingChristian,
    ...babyShower,
    ...grihaPravesh,
    ...birthday,
    ...retirement,
    ...puja,
    ...upanayan,
    ...mundan,
    ...corporate,
];
