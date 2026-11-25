// Words for a loss: plain, calm and short. No scripture or prayer is written here; families add
// their own, or choose a vetted greeting.
import { pack, t } from './kit';

const demise = pack({ occasion: 'demise_notice' }, [
    [
        'passing-family',
        'quiet',
        'From the family',
        t('left us peacefully', 'हमारे बीच नहीं रहे', 'આપણી વચ્ચે રહ્યા નથી'),
        t(
            'With deep sorrow we share the passing of our beloved. The details of the last rites are below.',
            'अत्यंत दुःख के साथ सूचित करते हैं कि हमारे प्रियजन का निधन हो गया है। अंतिम संस्कार का विवरण नीचे है।',
            'અત્યંત દુઃખ સાથે જણાવીએ છીએ કે અમારા સ્વજનનું અવસાન થયું છે. અંતિમ સંસ્કારની વિગત નીચે છે.',
        ),
        t(
            'Please keep the family in your thoughts.',
            'कृपया परिवार को अपनी स्मृतियों में स्थान दें।',
            'કૃપયા પરિવારને આપની સ્મૃતિમાં સ્થાન આપશો.',
        ),
    ],
    [
        'passing-heavenly-abode',
        'traditional',
        'Left for the heavenly abode',
        t('left for the heavenly abode', 'का स्वर्गवास हो गया है', 'નો સ્વર્ગવાસ થયો છે'),
        t(
            'With grief we inform our relatives and friends of this loss. The family will receive you at the time below.',
            'शोकपूर्वक सभी संबंधियों और मित्रों को सूचित करते हैं। परिवार नीचे दिए समय पर उपलब्ध रहेगा।',
            'શોક સાથે સૌ સગાં-સ્નેહીઓને જણાવીએ છીએ. પરિવાર નીચેના સમયે મળશે.',
        ),
        t('In grief, the family.', 'शोकाकुल परिवार।', 'શોકાતુર પરિવાર.'),
    ],
    [
        'passing-life-well-lived',
        'warm',
        'A life well lived',
        t('passed away, surrounded by family'),
        t(
            'A long life, a generous heart and a home that was never short of guests. We will miss them every day.',
        ),
        t('Thank you for the love you gave them.'),
    ],
]);

const prayerMeet = pack({ occasion: 'prayer_meet' }, [
    [
        'prayer-meet-memory',
        'quiet',
        'In loving memory',
        t('Prayer meet in loving memory', 'स्मृति में प्रार्थना सभा', 'સ્મૃતિમાં પ્રાર્થના સભા'),
        t(
            'We invite you to join us in prayer as we remember a life lived with love and grace.',
            'स्नेह और गरिमा से जिए गए जीवन को स्मरण करते हुए, प्रार्थना में हमारे साथ सम्मिलित हों।',
            'સ્નેહ અને ગરિમાથી જિવાયેલા જીવનને યાદ કરતાં, પ્રાર્થનામાં અમારી સાથે જોડાશો.',
        ),
        t(
            'Your presence is our strength.',
            'आपकी उपस्थिति ही हमारा संबल है।',
            'આપની હાજરી એ જ અમારો આધાર.',
        ),
    ],
    [
        'prayer-meet-besnu',
        'traditional',
        'Besnu',
        t('Besnu', 'बैठक', 'બેસણું'),
        t(
            'The family will sit at the place and time below. We request only your presence.',
            'परिवार नीचे दिए स्थान और समय पर बैठेगा। केवल आपकी उपस्थिति प्रार्थनीय है।',
            'પરિવાર નીચેના સ્થળે અને સમયે બેસશે. માત્ર આપની હાજરી પ્રાર્થનીય છે.',
        ),
        t(
            'Customary offerings are respectfully declined.',
            'लौकिक व्यवहार बंद रखा गया है।',
            'લૌકિક વ્યવહાર બંધ રાખેલ છે.',
        ),
    ],
    [
        'prayer-meet-uthamna',
        'traditional',
        'Uthamna',
        t('Uthamna and prayer', 'उठावना एवं प्रार्थना सभा', 'ઉઠમણું અને પ્રાર્થના સભા'),
        t(
            'We will gather to pray and to remember. Relatives and friends are requested to join us.',
            'प्रार्थना और स्मरण के लिए हम एकत्र होंगे। सभी संबंधियों और मित्रों से पधारने का अनुरोध है।',
            'પ્રાર્થના અને સ્મરણ માટે અમે એકત્ર થઈશું. સૌ સગાં-સ્નેહીઓને પધારવા વિનંતી.',
        ),
        t('In grief, the family.', 'शोकाकुल परिवार।', 'શોકાતુર પરિવાર.'),
    ],
    [
        'prayer-meet-memorial',
        'warm',
        'A gathering of memories',
        t('A gathering to remember'),
        t(
            'Come with a memory, a photograph or simply your company. We would like to hear the stories we have not heard.',
        ),
        t('It will comfort us to see you.'),
    ],
]);

const deathAnniversary = pack({ occasion: 'death_anniversary' }, [
    [
        'remembrance-first-year',
        'quiet',
        'First anniversary',
        t('First anniversary of remembrance', 'प्रथम पुण्यतिथि', 'પ્રથમ પુણ્યતિથિ'),
        t(
            'A year has passed, but not a day without remembering. Please join us in prayer.',
            'एक वर्ष बीत गया, पर एक दिन भी बिना याद के नहीं। प्रार्थना में हमारे साथ सम्मिलित हों।',
            'એક વર્ષ વીત્યું, પણ યાદ વિનાનો એક દિવસ નહીં. પ્રાર્થનામાં અમારી સાથે જોડાશો.',
        ),
        t('Forever in our hearts.', 'सदैव हमारे हृदय में।', 'સદાય અમારા હૃદયમાં.'),
    ],
    [
        'remembrance-punyatithi',
        'traditional',
        'Punyatithi',
        t('On the punyatithi of our beloved', 'पुण्यतिथि पर सादर स्मरण', 'પુણ્યતિથિએ સાદર સ્મરણ'),
        t(
            'The values they lived by still light our home. We request your presence at the prayers and the meal after.',
            'उनके संस्कार आज भी हमारे घर को आलोकित करते हैं। प्रार्थना और भोजन में आपकी उपस्थिति प्रार्थनीय है।',
            'એમના સંસ્કાર આજે પણ અમારા ઘરને અજવાળે છે. પ્રાર્થના અને ભોજનમાં આપની હાજરી પ્રાર્થનીય છે.',
        ),
        t('With respect, the family.', 'सादर, समस्त परिवार।', 'સાદર, સમસ્ત પરિવાર.'),
    ],
    [
        'remembrance-service',
        'warm',
        'A day of giving',
        t('Remembered with a day of giving'),
        t(
            'They gave quietly, all their life. On this day we will do the same, and we invite you to join us.',
        ),
        t('Their kindness goes on.'),
    ],
]);

export const remembranceWordings = [...demise, ...prayerMeet, ...deathAnniversary];
