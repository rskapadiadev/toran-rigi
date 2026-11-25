// Messages to send with the link, on WhatsApp or by text. {name} is the guest, {link} the invitation:
// the same placeholders the guest list fills in (shared/guests.ts).
import { t } from './kit';
import type { WordingMessage } from './types';

export const wordingMessages: WordingMessage[] = [
    {
        id: 'message-wedding-warm',
        occasion: 'wedding',
        name: 'For family and friends',
        text: t(
            'Hello {name}! We are getting married and would love to have you with us. All the ceremonies, timings and directions are here: {link}',
            'नमस्ते {name}! हमारे विवाह में आप सपरिवार आमंत्रित हैं। सभी रस्में, समय और स्थान यहाँ देखें: {link}',
            'નમસ્તે {name}! અમારા લગ્નમાં આપ સહકુટુંબ આમંત્રિત છો. બધા પ્રસંગો, સમય અને સ્થળ અહીં જુઓ: {link}',
        ),
    },
    {
        id: 'message-wedding-elders',
        occasion: 'wedding',
        name: 'For elders',
        text: t(
            'Respected {name}, with the blessings of our elders we request your presence, with family, at our children’s wedding. Kindly see the invitation here: {link}',
            'आदरणीय {name}, हमारे बच्चों के विवाह में सपरिवार पधारकर आशीर्वाद देने की कृपा करें। निमंत्रण यहाँ है: {link}',
            'આદરણીય {name}, અમારાં સંતાનોનાં લગ્નમાં સહકુટુંબ પધારી આશીર્વાદ આપવા કૃપા કરશો. નિમંત્રણ અહીં છે: {link}',
        ),
    },
    {
        id: 'message-wedding-muslim',
        occasion: 'wedding',
        culture: 'islamic',
        name: 'Nikah and walima',
        text: t(
            'Assalamu alaikum {name}. Our families request the pleasure of your company at the nikah and walima. The details are here: {link}',
        ),
    },
    {
        id: 'message-wedding-colleagues',
        occasion: 'wedding',
        name: 'For colleagues',
        text: t(
            'Hi {name}, I am getting married and would be glad if you could join us. The date, venue and a place to reply are here: {link}',
        ),
    },
    {
        id: 'message-engagement',
        occasion: 'engagement',
        name: 'Engagement',
        text: t(
            'Hello {name}! We are getting engaged and it would not feel complete without you. Here is your invitation: {link}',
            'नमस्ते {name}! हमारी सगाई में आपका साथ हमें बहुत प्रिय होगा। निमंत्रण यहाँ है: {link}',
            'નમસ્તે {name}! અમારી સગાઈમાં આપનો સાથ અમને ખૂબ ગમશે. નિમંત્રણ અહીં છે: {link}',
        ),
    },
    {
        id: 'message-anniversary',
        occasion: 'anniversary',
        name: 'Anniversary',
        text: t(
            'Hello {name}! We are celebrating our anniversary and would love to have you with us. Details here: {link}',
            'नमस्ते {name}! हमारी विवाह वर्षगाँठ पर आप सादर आमंत्रित हैं। विवरण यहाँ है: {link}',
            'નમસ્તે {name}! અમારી લગ્નની વર્ષગાંઠે આપને ભાવભર્યું આમંત્રણ. વિગત અહીં છે: {link}',
        ),
    },
    {
        id: 'message-naming',
        occasion: 'naming',
        name: 'Naming ceremony',
        text: t(
            'Hello {name}! Our little one is about to get a name. Please come and bless the baby with us: {link}',
            'नमस्ते {name}! हमारे नन्हे मेहमान का नामकरण है। आशीर्वाद देने ज़रूर पधारें: {link}',
            'નમસ્તે {name}! અમારા નાનકડા મહેમાનનું નામકરણ છે. આશીર્વાદ આપવા જરૂર પધારશો: {link}',
        ),
    },
    {
        id: 'message-baby-shower',
        occasion: 'baby_shower',
        name: 'Baby shower',
        text: t(
            'Hello {name}! There is a baby on the way and we are celebrating. Come share the afternoon with us: {link}',
            'नमस्ते {name}! गोद भराई की रस्म में आप सादर आमंत्रित हैं। विवरण यहाँ है: {link}',
            'નમસ્તે {name}! સીમંત પ્રસંગે આપને ભાવભર્યું આમંત્રણ. વિગત અહીં છે: {link}',
        ),
    },
    {
        id: 'message-griha-pravesh',
        occasion: 'griha_pravesh',
        name: 'Griha pravesh',
        text: t(
            'Hello {name}! We are moving into our new home and want your blessings at the door. The time and address are here: {link}',
            'नमस्ते {name}! हमारे नए घर के गृह प्रवेश में सपरिवार पधारें। समय और पता यहाँ है: {link}',
            'નમસ્તે {name}! અમારા નવા ઘરના વાસ્તુ પ્રસંગે સહકુટુંબ પધારશો. સમય અને સરનામું અહીં છે: {link}',
        ),
    },
    {
        id: 'message-birthday',
        occasion: 'birthday',
        name: 'Birthday',
        text: t(
            'Hello {name}! There is a birthday, a cake and a seat for you. Here is your invitation: {link}',
            'नमस्ते {name}! जन्मदिन के जश्न में आप सादर आमंत्रित हैं। निमंत्रण यहाँ है: {link}',
            'નમસ્તે {name}! જન્મદિવસની ઉજવણીમાં આપને ભાવભર્યું આમંત્રણ. વિગત અહીં છે: {link}',
        ),
    },
    {
        id: 'message-retirement',
        occasion: 'retirement',
        name: 'Retirement',
        text: t(
            'Dear {name}, we are gathering to celebrate a career and say thank you. We hope you can join us: {link}',
        ),
    },
    {
        id: 'message-puja',
        occasion: 'puja',
        name: 'Puja at home',
        text: t(
            'Namaste {name}. Please join us with your family for a puja at our home. The time and address are here: {link}',
            'नमस्ते {name}। हमारे घर पूजा में सपरिवार पधारने की कृपा करें। समय और पता यहाँ है: {link}',
            'નમસ્તે {name}. અમારા ઘરે પૂજામાં સહકુટુંબ પધારવા કૃપા કરશો. સમય અને સરનામું અહીં છે: {link}',
        ),
    },
    {
        id: 'message-thread',
        occasion: 'upanayan',
        name: 'Thread ceremony',
        text: t(
            'Namaste {name}. Our son’s thread ceremony is near, and we request your blessings. Kindly see the invitation here: {link}',
            'नमस्ते {name}। हमारे पुत्र के उपनयन संस्कार में पधारकर आशीर्वाद दें। निमंत्रण यहाँ है: {link}',
            'નમસ્તે {name}. અમારા પુત્રના જનોઈ પ્રસંગે પધારી આશીર્વાદ આપશો. નિમંત્રણ અહીં છે: {link}',
        ),
    },
    {
        id: 'message-mundan',
        occasion: 'mundan',
        name: 'Mundan',
        text: t(
            'Namaste {name}. It is time for our little one’s first haircut. Please join us for the mundan and a meal: {link}',
            'नमस्ते {name}। हमारे बच्चे के मुंडन संस्कार में सपरिवार पधारें। विवरण यहाँ है: {link}',
            'નમસ્તે {name}. અમારા બાળકના મુંડન સંસ્કારમાં સહકુટુંબ પધારશો. વિગત અહીં છે: {link}',
        ),
    },
    {
        id: 'message-passing',
        occasion: 'demise_notice',
        name: 'Sharing the news',
        text: t(
            'Dear {name}, with deep sorrow we share that our beloved has passed away. The details of the last rites are here: {link}',
            '{name}, अत्यंत दुःख के साथ सूचित करते हैं कि हमारे प्रियजन नहीं रहे। अंतिम संस्कार का विवरण यहाँ है: {link}',
            '{name}, અત્યંત દુઃખ સાથે જણાવીએ છીએ કે અમારા સ્વજન રહ્યા નથી. અંતિમ સંસ્કારની વિગત અહીં છે: {link}',
        ),
    },
    {
        id: 'message-prayer-meet',
        occasion: 'prayer_meet',
        name: 'Prayer meet',
        text: t(
            'Dear {name}, we are holding a prayer meet in memory of our beloved. The time and place are here: {link}',
            '{name}, हमारे प्रियजन की स्मृति में प्रार्थना सभा रखी गई है। समय और स्थान यहाँ है: {link}',
            '{name}, અમારા સ્વજનની સ્મૃતિમાં પ્રાર્થના સભા રાખેલ છે. સમય અને સ્થળ અહીં છે: {link}',
        ),
    },
    {
        id: 'message-remembrance',
        occasion: 'death_anniversary',
        name: 'Remembrance',
        text: t(
            'Dear {name}, we will gather in prayer on this day of remembrance. Your presence would comfort us: {link}',
            '{name}, पुण्यतिथि पर हम प्रार्थना के लिए एकत्र होंगे। आपकी उपस्थिति से संबल मिलेगा: {link}',
            '{name}, પુણ્યતિથિએ અમે પ્રાર્થના માટે એકત્ર થઈશું. આપની હાજરીથી આધાર મળશે: {link}',
        ),
    },
    {
        id: 'message-corporate',
        occasion: 'corporate',
        name: 'Event invitation',
        text: t(
            'Hello {name}, you are invited. The programme, venue and a place to confirm your seat are here: {link}',
        ),
    },
];
