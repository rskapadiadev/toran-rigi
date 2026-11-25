// The public guides: one per occasion and wedding tradition. Each has a wording page (/wording/<slug>)
// and, when the shop has a design for it, a designs page (/invitations/<slug>). Every guide says
// something only it can say; a page that just swaps a name helps nobody and search engines bury it.
// Import on the server only: pages receive their own guide from the loader.
import type { CultureId } from './cultures';
import { isSolemn, type OccasionId, occasionOf } from './occasions';

export interface GuideFaq {
    q: string;
    a: string;
}

interface GuideSide {
    // Under the heading, and the page's description in search results (160 characters at most).
    lead: string;
    body: string;
    faqs: GuideFaq[];
}

export interface Guide {
    slug: string;
    occasion: OccasionId;
    culture?: CultureId;
    variant?: string;
    // "Hindu wedding": headings add "invitations" or "invitation wording".
    name: string;
    // Example names above each sample.
    sample: string;
    designs: GuideSide;
    words: GuideSide & { include: string[] };
}

export const guides: Guide[] = [
    {
        slug: 'wedding',
        occasion: 'wedding',
        name: 'Wedding',
        sample: 'Riya & Kabir',
        designs: {
            lead: 'Living wedding invitations that open like a doorway: every ceremony, map and reply on one link. Try any design free with your own names.',
            body: 'A wedding is rarely one event. Your invitation carries each ceremony with its own date, dress code and directions, collects replies for each one, and can show every family only the functions they are invited to.',
            faqs: [
                {
                    q: 'Can different guests see different functions?',
                    a: 'Yes. Each family can have its own link that shows only the ceremonies they are invited to, and their reply counts only for those.',
                },
                {
                    q: 'Can both families have their own version?',
                    a: 'Yes. Each side can have its own version, with its own child’s name first and its own welcome words, while the ceremonies stay the same.',
                },
            ],
        },
        words: {
            lead: 'Wedding invitation wording you can copy: from both families, from the parents, formal, modern, small weddings and second marriages.',
            body: 'Start with who is inviting. If the parents host, let them speak; if you host, speak for yourselves. After that, the best wording is short: names, what you are asking people to come to, and one line that sounds like you.',
            include: [
                'Both names, spelled the way you use them',
                'Who is hosting, if it is the parents or family',
                'The date, with the day of the week',
                'Each ceremony with its own time and venue',
                'Dress code, if there is one',
                'How to reply, and by when',
            ],
            faqs: [
                {
                    q: 'Whose name comes first on a wedding invitation?',
                    a: 'There is no single rule. Many families put their own child first on the cards they send, which is why a version for each side helps. If the couple hosts, choose the order that reads best aloud.',
                },
                {
                    q: 'How long should the wording be?',
                    a: 'One headline and two or three lines. Dates, venues and dress codes sit in the ceremony details, so the words only need to welcome people.',
                },
            ],
        },
    },
    {
        slug: 'hindu-wedding',
        occasion: 'wedding',
        culture: 'hindu',
        name: 'Hindu wedding',
        sample: 'Ananya & Rohan',
        designs: {
            lead: 'Hindu wedding invitations with palaces, temples and lamps, for every ceremony from haldi to reception, in English, Hindi and Gujarati.',
            body: 'Start with a vetted opening greeting, add Ganesh sthapana, haldi, mehndi, sangeet, baraat, pheras and reception, and choose how the story unfolds: a walk through a haveli, a path in the Himalayas or doors that open on your names.',
            faqs: [
                {
                    q: 'Can the invitation be in Hindi as well as English?',
                    a: 'Yes. One invitation can carry English, Hindi and Gujarati together, and each guest switches language with a tap.',
                },
                {
                    q: 'Do the ceremonies show their own timings?',
                    a: 'Each ceremony has its own date, time, venue, map and dress code, and guests can add it to their calendar.',
                },
            ],
        },
        words: {
            lead: 'Hindu wedding invitation wording in English, Hindi and Gujarati: traditional, formal and modern, ready to copy for your card or WhatsApp.',
            body: 'A Hindu wedding card traditionally opens with an auspicious greeting, then names the couple and their parents, and asks guests to come with family. Speak to elders in their own language where you can; a line of Hindi or Gujarati carries more warmth than a long English paragraph.',
            include: [
                'An opening greeting, such as Shree Ganeshay Namah',
                'The couple’s names with their parents',
                'Grandparents, where the family includes them',
                'The muhurat for the pheras',
                'Haldi, mehndi, sangeet and reception, with who is invited',
                'A closing line from the family, the “darshanabhilashi”',
            ],
            faqs: [
                {
                    q: 'What does “darshanabhilashi” mean on a wedding card?',
                    a: 'It means “those looking forward to seeing you”. It introduces the family members who are inviting, usually near the end of the card.',
                },
                {
                    q: 'Should we write the muhurat or the arrival time?',
                    a: 'Both, if they differ. Give the time you want guests to arrive as the ceremony time, and mention the muhurat in its description.',
                },
            ],
        },
    },
    {
        slug: 'gujarati-wedding',
        occasion: 'wedding',
        culture: 'hindu',
        variant: 'gujarati',
        name: 'Gujarati wedding',
        sample: 'Mira & Dhruv',
        designs: {
            lead: 'Gujarati wedding invitations and digital kankotri with bandhani, garba and mandap, in Gujarati and English, shared as one link.',
            body: 'From Ganesh sthapana and mameru to pithi, garba, jaan and hastmelap, every prasang gets its own card with the time and place. Elders read it in Gujarati; cousins abroad read it in English.',
            faqs: [
                {
                    q: 'Can our kankotri be in Gujarati first?',
                    a: 'Yes. Choose Gujarati as the first language and it opens in Gujarati for everyone, with English a tap away.',
                },
                {
                    q: 'Can we still print it?',
                    a: 'Yes. You can download a PDF of the invitation, and a 5×7 inch card for printing with a code that opens the full one.',
                },
            ],
        },
        words: {
            lead: 'Gujarati kankotri wording in Gujarati, Hindi and English: traditional lines, hastmelap, and the children’s tahuko for a lighter note.',
            body: 'A kankotri speaks for the whole family: elders invite, parents welcome and, at the end, the little ones add their tahuko in their own voice. Keep the main invitation respectful and let the children be funny.',
            include: [
                'An opening greeting chosen by the family',
                'Names of the couple with parents and grandparents',
                'Pithi, mandap muhurat, garba, jaan and hastmelap times',
                'Mosal (mother’s side) and their names for mameru',
                'A tahuko from the children, if you like one',
                'The family’s names and native place at the end',
            ],
            faqs: [
                {
                    q: 'What is a tahuko on a kankotri?',
                    a: 'A short, playful line in the voice of the family’s children, asking guests to come for mama’s, kaka’s or foi’s wedding. It usually sits at the end.',
                },
                {
                    q: 'Is hastmelap the same as the pheras?',
                    a: 'They are close together but not the same. Hastmelap is the joining of hands at the auspicious moment; the pheras around the fire follow.',
                },
            ],
        },
    },
    {
        slug: 'marwari-wedding',
        occasion: 'wedding',
        culture: 'hindu',
        variant: 'marwari',
        name: 'Marwari wedding',
        sample: 'Nandini & Aditya',
        designs: {
            lead: 'Marwari and Rajasthani wedding invitations with palace arches, gulmohar and gold, for every ceremony from tilak to vidai.',
            body: 'Rajasthani weddings are long and generous, and the invitation should be too. Add tilak, mayra, pithi, mehndi, the baraat and pheras, each with its venue, and let travelling guests find hotels and maps in one place.',
            faqs: [
                {
                    q: 'Is there room for a multi-day wedding?',
                    a: 'Yes. Ceremonies are listed day by day with times, dress codes and directions for each one.',
                },
                {
                    q: 'Can we help guests who are travelling?',
                    a: 'Yes. Travel notes sit on the invitation beside the venues, so nobody has to ask for the address again.',
                },
            ],
        },
        words: {
            lead: 'Marwari wedding invitation wording in English and Hindi, with a Rajasthani welcome, for the family card or a WhatsApp invitation.',
            body: '“Padharo” does most of the work. Rajasthani hospitality is about the welcome, so let your words honour the guest first and describe the ceremonies after.',
            include: [
                'An opening greeting and the family’s name and place',
                'The couple with parents and grandparents',
                'Tilak, mayra or bhaat, pithi and mehndi',
                'Baraat assembly point and time, with the safa tying',
                'The phera muhurat',
                'A welcome line, such as “padharo sa”',
            ],
            faqs: [
                {
                    q: 'What is mayra or bhaat?',
                    a: 'The ceremony in which the maternal uncle’s family brings gifts for the couple and their parents. Include it if the mother’s side is hosting a separate function.',
                },
                {
                    q: 'Should the card be in Hindi or English?',
                    a: 'For elders, Hindi or Marwari reads warmest. A digital invitation can carry Hindi and English together, so you do not have to choose.',
                },
            ],
        },
    },
    {
        slug: 'punjabi-wedding',
        occasion: 'wedding',
        culture: 'hindu',
        variant: 'punjabi',
        name: 'Punjabi wedding',
        sample: 'Simran & Arjun',
        designs: {
            lead: 'Punjabi wedding invitations full of colour and music, from roka and jaggo to baraat and reception, shared as one WhatsApp link.',
            body: 'Roka, chooda, mehndi, jaggo, baraat, pheras, reception. Give each night its own dress code and let guests reply for the ones they will dance at.',
            faqs: [
                {
                    q: 'Do you have designs for a Sikh wedding?',
                    a: 'Yes. Invitations for an Anand Karaj have their own page, with laavan and gurdwara details in place of pheras.',
                },
                {
                    q: 'Does the invitation play music?',
                    a: 'Yes. Each design comes with a recording that starts when the guest opens it, and you can choose another or add your own.',
                },
            ],
        },
        words: {
            lead: 'Punjabi wedding invitation wording in English and Hindi: playful, warm and family-style lines for the card and for WhatsApp.',
            body: 'Punjabi invitations are allowed to be loud. Keep the parents’ lines gracious, and save the jokes for the jaggo and the reception.',
            include: [
                'The couple with both sets of parents',
                'Roka or engagement, chooda and mehndi',
                'Jaggo or sangeet, with a dress code',
                'Baraat time and meeting point',
                'Pheras, and the reception if it is a different day',
                'How many of the family you are expecting',
            ],
            faqs: [
                {
                    q: 'How do we invite someone only to the reception?',
                    a: 'Send them a link that shows only the reception. Their version of the invitation will not mention the other functions.',
                },
                {
                    q: 'Can we mix Punjabi words into English?',
                    a: 'Please do. Words like jaggo, chooda and doli need no translation for your guests, and they sound like home.',
                },
            ],
        },
    },
    {
        slug: 'south-indian-wedding',
        occasion: 'wedding',
        culture: 'hindu',
        variant: 'south-indian',
        name: 'South Indian wedding',
        sample: 'Lakshmi & Karthik',
        designs: {
            lead: 'South Indian wedding invitations with brass lamps, silk and jasmine, for the muhurtham, reception and every ceremony around them.',
            body: 'The muhurtham is often early and exact, so the time has to be easy to find. Guests see it first, with the kalyana mandapam on a map and the reception on its own card.',
            faqs: [
                {
                    q: 'Is it suitable for Tamil, Telugu, Kannada and Malayali weddings?',
                    a: 'Yes. Ceremony names are yours to write, so nichayathartham, pellikuthuru, muhurtham or saptapadi appear exactly as your family says them.',
                },
                {
                    q: 'Can the reception be listed before the wedding?',
                    a: 'Yes. Ceremonies follow the dates and times you give, so a reception the evening before simply comes first.',
                },
            ],
        },
        words: {
            lead: 'South Indian wedding invitation wording in English for the muhurtham and reception, in the traditional family style or a warmer one.',
            body: 'The classic style is formal and complete: grandparents, parents, the exact muhurtham and the closing “with best compliments from near and dear ones”. Keep that frame, and let the welcome line be yours.',
            include: [
                'The couple with parents, and grandparents where customary',
                'The muhurtham, with its exact time window',
                'The kalyana mandapam’s full address',
                'Nichayathartham or reception, if separate',
                'Breakfast and lunch timings',
                '“With best compliments from near and dear ones”',
            ],
            faqs: [
                {
                    q: 'How do we write the muhurtham time?',
                    a: 'Give it as a range, such as 9:00 to 10:30 am, and ask guests to arrive half an hour before it begins.',
                },
                {
                    q: 'What does “with best compliments from near and dear ones” mean?',
                    a: 'It is the customary last line on many South Indian cards, inviting on behalf of all the relatives and friends of the family.',
                },
            ],
        },
    },
    {
        slug: 'bengali-wedding',
        occasion: 'wedding',
        culture: 'hindu',
        variant: 'bengali',
        name: 'Bengali wedding',
        sample: 'Ishani & Arko',
        designs: {
            lead: 'Bengali wedding invitations for aiburo bhat, gaye holud, the wedding night and bou bhat, shared as one link with maps and replies.',
            body: 'The wedding and the bou bhat are often hosted by different families on different days. Each has its own card, place and replies, so nobody arrives at the wrong house.',
            faqs: [
                {
                    q: 'Can the bou bhat have a different guest list?',
                    a: 'Yes. Guests see only the functions on their own link, and replies are counted for each one.',
                },
                {
                    q: 'Can we use Bengali words?',
                    a: 'Yes, for ceremony names and phrases. Full Bengali script is not one of our languages yet.',
                },
            ],
        },
        words: {
            lead: 'Bengali wedding invitation wording in English for biye and bou bhat, from formal family lines to warmer ones you can copy.',
            body: 'Traditional Bengali cards are letters: a respectful greeting, a request, and the signature of the person inviting. In English, keep that courtesy in two lines rather than ten.',
            include: [
                'The couple with their parents, and who is inviting',
                'Gaye holud, if guests are invited to it',
                'The lagna, or wedding hour',
                'Bou bhat or reception, with its own address',
                'Dinner timings',
                'A line of apology for not inviting in person, if you follow the custom',
            ],
            faqs: [
                {
                    q: 'What is bou bhat?',
                    a: 'The groom’s family’s celebration, usually two days after the wedding, when the bride serves rice for the first time in her new home. It is often the reception.',
                },
                {
                    q: 'Why do Bengali cards apologise for inviting by letter?',
                    a: 'Because inviting in person is considered proper. The line asks guests to forgive an invitation sent by post, and now by link.',
                },
            ],
        },
    },
    {
        slug: 'muslim-wedding',
        occasion: 'wedding',
        culture: 'islamic',
        name: 'Muslim wedding',
        sample: 'Ayesha & Zain',
        designs: {
            lead: 'Nikah and walima invitations with mashrabiya, lanterns and moonlight, in Urdu, Arabic and English. Music waits for a tap.',
            body: 'Choose designs without figures or photographs, open with the Bismillah from our vetted library, and show Hijri dates beside the calendar ones. Nothing plays until a guest asks for it.',
            faqs: [
                {
                    q: 'Will music start on its own?',
                    a: 'No. On Muslim designs, music stays silent until a guest taps to hear it, and you can leave it out completely.',
                },
                {
                    q: 'Can the invitation be in Urdu or Arabic?',
                    a: 'Yes. Both are set right to left throughout, and guests can switch to English.',
                },
            ],
        },
        words: {
            lead: 'Muslim wedding invitation wording for nikah, rukhsati and walima in English: from the parents, formal, warm or very simple.',
            body: 'Many families open with the Bismillah and then keep the words modest. Invite on behalf of the parents, name the nikah and the walima clearly, and ask for duas rather than gifts.',
            include: [
                'The Bismillah, if you open with it',
                'The couple, as daughter of and son of their parents',
                'Nikah time and place, and the mosque or hall',
                'Walima, which may be on another day',
                'Separate seating or prayer arrangements, if any',
                'Dates in Hijri as well, if your family uses them',
            ],
            faqs: [
                {
                    q: 'What is the difference between nikah and walima on a card?',
                    a: 'The nikah is the marriage contract; the walima is the feast the groom’s family hosts after it. Give each its own time, because some guests are invited to only one.',
                },
                {
                    q: 'Is it all right to put Quranic verses on an invitation?',
                    a: 'Families differ. Because an invitation may be deleted or scrolled past, many prefer to keep verses off it. Our designs use only a short vetted opening, and you can turn it off.',
                },
            ],
        },
    },
    {
        slug: 'sikh-wedding',
        occasion: 'wedding',
        culture: 'sikh',
        name: 'Sikh wedding',
        sample: 'Harleen & Gurveer',
        designs: {
            lead: 'Anand Karaj invitations in phulkari colours, with gurdwara directions, langar and reception, in Punjabi and English.',
            body: 'Guests who have never been to a gurdwara want to know what to wear and when to sit. Put head coverings, milni, laavan and langar on the invitation and everyone arrives at ease.',
            faqs: [
                {
                    q: 'Can the invitation be in Gurmukhi?',
                    a: 'Yes. Punjabi in Gurmukhi script sits alongside English, and guests choose which to read.',
                },
                {
                    q: 'Can we tell guests to cover their heads?',
                    a: 'Yes. Each ceremony has a dress note, so the Anand Karaj can ask for covered heads while the reception says black tie.',
                },
            ],
        },
        words: {
            lead: 'Sikh wedding invitation wording in English for the Anand Karaj, milni and reception: from the parents, warm, or full of bhangra.',
            body: 'Keep the Anand Karaj lines calm and respectful, and let the evening functions be lively. Families usually invite guests “to join both families at the gurdwara”, and langar is part of the welcome.',
            include: [
                'Ik Onkar, from the vetted greetings, if you open with it',
                'The couple with both sets of parents',
                'Gurdwara name and full address',
                'Milni, Anand Karaj and langar timings',
                'A note on covering heads and removing shoes',
                'Jaggo, sangeet and reception',
            ],
            faqs: [
                {
                    q: 'How should guests be told about head coverings?',
                    a: 'Kindly and plainly: “Please cover your head at the gurdwara; scarves will be available.” Put it in the ceremony’s dress note so it is not missed.',
                },
                {
                    q: 'Should the Anand Karaj and the reception be on one invitation?',
                    a: 'They can be, with separate times and addresses. If some guests are invited only to the reception, send them a link that shows just that.',
                },
            ],
        },
    },
    {
        slug: 'jain-wedding',
        occasion: 'wedding',
        culture: 'jain',
        name: 'Jain wedding',
        sample: 'Khushi & Parth',
        designs: {
            lead: 'Jain wedding invitations in lotus and marble, in Gujarati, Hindi and English, with dinner times and dietary notes for guests.',
            body: 'A calm design, a respectful opening and clear meal times. Guests can tell you about Jain, upvas or chauvihar needs when they reply, so the kitchen knows before the day.',
            faqs: [
                {
                    q: 'Can guests tell us their food preference?',
                    a: 'Yes. The reply form asks, and the list you download for the caterer has every family’s answer.',
                },
                {
                    q: 'Can it be in Gujarati and Hindi together?',
                    a: 'Yes, with English as well. Each guest reads it in the language they prefer.',
                },
            ],
        },
        words: {
            lead: 'Jain wedding invitation wording in Gujarati, Hindi and English: traditional, simple and formal lines, with meals before sunset.',
            body: 'Simplicity reads as grace. A respectful opening, the family’s names and a clear dinner time say more than ornate lines, and “dinner is served before sunset” is worth its place.',
            include: [
                'An opening greeting, such as Jai Jinendra',
                'The couple with parents and grandparents',
                'The family’s native place and gotra, if customary',
                'Wedding rites and reception timings',
                'Meal times, especially if dinner is before sunset',
                'The names of those inviting, at the close',
            ],
            faqs: [
                {
                    q: 'How do we mention that dinner is before sunset?',
                    a: 'Put it in one clear line and give the time: “Dinner is served before sunset, from 5:00 pm.” Repeat it in the reception’s details.',
                },
                {
                    q: 'Is “Jai Jinendra” suitable at the top of a wedding card?',
                    a: 'Yes, it is a widely used greeting. Some families use a longer opening of their own; ask your elders which they prefer.',
                },
            ],
        },
    },
    {
        slug: 'christian-wedding',
        occasion: 'wedding',
        culture: 'christian',
        name: 'Christian wedding',
        sample: 'Anna & Joel',
        designs: {
            lead: 'Christian wedding invitations with cathedral light and garden flowers, for the church ceremony and the reception after.',
            body: 'Two places, two times and one link. The church and the reception each get a card with a map, and replies can be taken for both or for one.',
            faqs: [
                {
                    q: 'Is there a design for a Catholic wedding?',
                    a: 'Yes. Our church design suits Catholic, Protestant and Orthodox ceremonies; the words and rites on it are yours.',
                },
                {
                    q: 'Can we ask for replies by a date?',
                    a: 'Yes. Replies arrive on your guest list as people send them, and you can send a gentle reminder to those who have not answered.',
                },
            ],
        },
        words: {
            lead: 'Christian wedding invitation wording: “request the honour of your presence”, warm family lines and relaxed modern ones to copy.',
            body: 'By custom, “the honour of your presence” is for a ceremony in church and “the pleasure of your company” is for anywhere else. If that feels stiff, “joyfully invite you” works in both.',
            include: [
                'Who is hosting: both sets of parents, one, or the couple',
                'The couple’s full names',
                'The church, its address and the time of the ceremony',
                'The reception, if it is elsewhere',
                'Dress code',
                'How to reply, and by when',
            ],
            faqs: [
                {
                    q: 'When do we use “honour of your presence”?',
                    a: 'When the ceremony is in a church or another place of worship. For a garden, beach or hotel, “the pleasure of your company” is the traditional phrase.',
                },
                {
                    q: 'How do we word it when parents are divorced?',
                    a: 'List each parent on a separate line, or write “together with their families”, which includes everyone without explaining anything.',
                },
            ],
        },
    },
    {
        slug: 'jewish-wedding',
        occasion: 'wedding',
        culture: 'jewish',
        name: 'Jewish wedding',
        sample: 'Talia & Noam',
        designs: {
            lead: 'Jewish wedding invitations with a chuppah, Hebrew beside English, and the Hebrew date, on one link with maps and replies.',
            body: 'Hebrew is set right to left as it should be, Hebrew dates can sit beside the civil ones, and the chuppah, dinner and dancing each have their own time.',
            faqs: [
                {
                    q: 'Can the invitation include Hebrew?',
                    a: 'Yes. Names, headline and messages can be written in Hebrew as well as English, with proper right-to-left layout.',
                },
                {
                    q: 'Can guests tell us about kosher meals?',
                    a: 'Yes. The reply form takes dietary needs, and your guest list collects them for the caterer.',
                },
            ],
        },
        words: {
            lead: 'Jewish wedding invitation wording in English: under the chuppah, from both sets of parents, warm simcha lines and modern ones.',
            body: 'Both sets of parents usually invite together. Name the chuppah rather than just “the ceremony”, and give the kabbalat panim or reception time if guests should come before it.',
            include: [
                'Both sets of parents, inviting together',
                'The couple’s names, in Hebrew too if you wish',
                'Kabbalat panim and badeken, if guests join them',
                'The time of the chuppah',
                'Dinner and dancing',
                'Dress notes, and kosher or dietary requests',
            ],
            faqs: [
                {
                    q: 'Whose parents come first?',
                    a: 'Traditionally the bride’s parents are listed first and the groom’s after. Many families now list both together, or the hosts first.',
                },
                {
                    q: 'What does “simcha” mean?',
                    a: 'Joy, and also a happy occasion. “Share in our simcha” is a warm way to say “celebrate with us”.',
                },
            ],
        },
    },
    {
        slug: 'interfaith-wedding',
        occasion: 'wedding',
        culture: 'universal',
        variant: 'interfaith',
        name: 'Interfaith wedding',
        sample: 'Maya & Daniel',
        designs: {
            lead: 'Interfaith wedding invitations that hold two traditions with equal care: both ceremonies, both languages and one shared link.',
            body: 'Both ceremonies have the same weight on the page, with their own names, notes and times. Each family can receive a version in its own words and its own language.',
            faqs: [
                {
                    q: 'Can each family get its own version?',
                    a: 'Yes. Each side can have its own name order and its own words, while ceremonies and replies stay together on your list.',
                },
                {
                    q: 'Can we explain the ceremonies to guests?',
                    a: 'Yes. Every ceremony has room for a short description, which is kind to guests who are seeing it for the first time.',
                },
            ],
        },
        words: {
            lead: 'Interfaith wedding invitation wording for two ceremonies and two families: equal, warm lines that leave nobody out.',
            body: 'Equality shows in small things: both families named in the same way, both ceremonies given a full line and no tradition described as the “other” one. A short explanation helps guests feel at home.',
            include: [
                'Both families, named in the same form',
                'Both ceremonies, with a line about each',
                'What guests should wear or bring to each',
                'Which parts everyone is welcome to join',
                'Dietary notes for both sides',
                'One shared celebration at the end',
            ],
            faqs: [
                {
                    q: 'Which ceremony should come first?',
                    a: 'The one that happens first. If they are on the same day, let the time decide, so the order never looks like a preference.',
                },
                {
                    q: 'Should we use religious greetings at the top?',
                    a: 'You can use one from each tradition, or none. Many couples leave the top plain and let each ceremony carry its own greeting.',
                },
            ],
        },
    },
    {
        slug: 'engagement',
        occasion: 'engagement',
        name: 'Engagement',
        sample: 'Riya & Kabir',
        designs: {
            lead: 'Engagement, ring ceremony, sagai and roka invitations that open on your phone, with the venue, time and replies on one link.',
            body: 'The first invitation sets the tone for the ones that follow. Send a small, beautiful one for the ring ceremony, and keep the same guest list for the wedding.',
            faqs: [
                {
                    q: 'Is one evening enough for an invitation?',
                    a: 'Yes. A single function makes a short, lovely invitation: names, the moment, the place and a reply.',
                },
                {
                    q: 'How early should we send it?',
                    a: 'Two to three weeks is comfortable for a local engagement; give travellers a month.',
                },
            ],
        },
        words: {
            lead: 'Engagement invitation wording in English, Hindi and Gujarati for a ring ceremony, sagai or roka: formal, warm and playful.',
            body: 'Say which ceremony it is, because roka, sagai and ring ceremony mean different things to different families. Then keep it light: this is the easiest invitation you will write.',
            include: [
                'Both names, and both families if they host',
                'Which ceremony it is: ring ceremony, sagai or roka',
                'Date, time and venue',
                'Whether dinner follows',
                'Dress code, if any',
                'A place to reply',
            ],
            faqs: [
                {
                    q: 'What is the difference between roka and sagai?',
                    a: 'A roka is the families’ formal agreement to the match, usually small. Sagai, or the ring ceremony, is the engagement itself, with rings and a larger gathering.',
                },
                {
                    q: 'Do the parents or the couple invite?',
                    a: 'Either. For a traditional sagai the parents usually invite; for a party with friends, the couple does.',
                },
            ],
        },
    },
    {
        slug: 'anniversary',
        occasion: 'anniversary',
        name: 'Wedding anniversary',
        sample: 'Meena & Suresh',
        designs: {
            lead: 'Wedding anniversary invitations for silver, golden and every year between, with photographs and the story of your years together.',
            body: 'An anniversary is the one invitation that already has a story to tell. Add the old wedding photograph, the years between and the dinner at the end.',
            faqs: [
                {
                    q: 'Can we add old photographs?',
                    a: 'Yes. A phone picture of a print works well, and the gallery keeps the order you choose.',
                },
                {
                    q: 'Can the children send it as a surprise?',
                    a: 'Yes. Only the people you send the link to will have it, and it doesn’t appear in search results.',
                },
            ],
        },
        words: {
            lead: 'Anniversary invitation wording in English, Hindi and Gujarati: 25th silver jubilee, 50th golden jubilee, vow renewals and surprises.',
            body: 'Decide who is speaking. A couple can invite with a smile; children inviting for their parents can say what the couple never would.',
            include: [
                'The couple’s names, and the number of years',
                'Who is hosting, if it is the children',
                'Date, time and venue',
                'Whether it is a surprise',
                'A note on gifts, if you would rather not have any',
                'An old photograph',
            ],
            faqs: [
                {
                    q: 'What do the anniversary years mean?',
                    a: 'The twenty-fifth is silver, the fiftieth is golden and the sixtieth is usually called diamond. In Hindi they are rajat, swarna and heerak jayanti.',
                },
                {
                    q: 'How do we politely ask for no gifts?',
                    a: 'One short line is enough: “Your presence is the only gift we would like.”',
                },
            ],
        },
    },
    {
        slug: 'naming-ceremony',
        occasion: 'naming',
        name: 'Naming ceremony',
        sample: 'Baby Vihaan',
        designs: {
            lead: 'Naming ceremony invitations for namkaran, chhathi, aqiqah and christening, soft as a lullaby and shared as one link.',
            body: 'A moonlit sky, a cradle and a name kept secret until the day. Grandparents far away can open it, send a blessing and feel that they were there.',
            faqs: [
                {
                    q: 'Can we hide the name until the ceremony?',
                    a: 'Yes. Write “our little one” or “Baby” for now, and change it after the ceremony; the same link shows the new name.',
                },
                {
                    q: 'Can relatives who cannot come send blessings?',
                    a: 'Yes. They can leave a wish on the invitation, and you approve each one before it appears.',
                },
            ],
        },
        words: {
            lead: 'Naming ceremony invitation wording in English, Hindi and Gujarati for namkaran, cradle ceremony, aqiqah and christening.',
            body: 'The parents usually speak, sometimes the grandparents. Keep the name itself out of the wording if it is to be announced on the day, and let the invitation build a little suspense.',
            include: [
                'The baby’s name, or “our little one” if it is a secret',
                'The parents’ names, and grandparents if they host',
                'Which ceremony: namkaran, chhathi, aqiqah or christening',
                'The time of the ritual, and of the meal',
                'Full address with a map',
                'A gentle note on gifts, or on holding the baby',
            ],
            faqs: [
                {
                    q: 'When is a namkaran held?',
                    a: 'Customs vary by family and region. Many hold it on the twelfth day, others in the weeks that follow on a date chosen by the priest.',
                },
                {
                    q: 'Should the invitation reveal the name?',
                    a: 'Only if you want it to. Announcing it at the ceremony is traditional, and adding it to the invitation afterwards makes a nice keepsake.',
                },
            ],
        },
    },
    {
        slug: 'baby-shower',
        occasion: 'baby_shower',
        name: 'Baby shower',
        sample: 'Neha & Varun',
        designs: {
            lead: 'Baby shower, godh bharai and seemant invitations in soft colours, in English and Gujarati, with replies on one link.',
            body: 'A short, happy afternoon deserves an invitation that is easy to send and easy to answer. Add the ceremony, the address and a place for blessings.',
            faqs: [
                {
                    q: 'Is it suitable for a traditional godh bharai?',
                    a: 'Yes. Add the rituals with their timings, use Hindi or Gujarati, and choose a traditional greeting or none.',
                },
                {
                    q: 'Can men and women be invited to different parts?',
                    a: 'Yes. Make them separate functions and send each family a link showing the ones they are invited to.',
                },
            ],
        },
        words: {
            lead: 'Baby shower invitation wording in English, Hindi and Gujarati for godh bharai, seemant and simple showers, ready to copy.',
            body: 'A traditional ceremony asks for blessings; a modern shower asks for company. Pick one voice, and avoid giving a due date unless you are happy to be asked about it.',
            include: [
                'The mother-to-be’s name, or both parents',
                'Which ceremony: godh bharai, seemant or a shower',
                'The time of the ritual and of lunch or tea',
                'Full address with a map',
                'Colours to wear, if there is a theme',
                'Who is hosting',
            ],
            faqs: [
                {
                    q: 'Are godh bharai and seemant the same?',
                    a: 'Both bless the mother-to-be. Godh bharai is the common name in the north; seemant is the Gujarati ceremony, usually held in the seventh month.',
                },
                {
                    q: 'Who usually hosts?',
                    a: 'It depends on the family. The in-laws often host a godh bharai or seemant, while friends or siblings host a modern shower.',
                },
            ],
        },
    },
    {
        slug: 'griha-pravesh',
        occasion: 'griha_pravesh',
        name: 'Griha pravesh',
        sample: 'The Shah family',
        designs: {
            lead: 'Griha pravesh and housewarming invitations with a torana at the door, in Gujarati and English, with the map to your new address.',
            body: 'The most useful thing on a housewarming invitation is the address nobody knows yet. Guests get the map, the puja time and the lunch time, and can reply in a tap.',
            faqs: [
                {
                    q: 'Can we include the puja and the party separately?',
                    a: 'Yes. Vastu puja in the morning and an open house in the evening can each have their own time and guest list.',
                },
                {
                    q: 'Will guests get directions?',
                    a: 'Yes. Each function has a map link that opens in the guest’s own maps app.',
                },
            ],
        },
        words: {
            lead: 'Griha pravesh invitation wording in English, Hindi and Gujarati for vastu puja, housewarming and open house, ready to copy.',
            body: 'For a puja, mention the muhurat and ask guests to come with family. For a housewarming party, be as relaxed as the evening will be. Either way, the address deserves its own line.',
            include: [
                'The family’s name',
                'Vastu puja or griha pravesh muhurat',
                'Lunch or dinner timing',
                'The full new address, with a landmark',
                'Parking or lift instructions for a new building',
                'Whether children are welcome during the puja',
            ],
            faqs: [
                {
                    q: 'Is griha pravesh the same as a housewarming?',
                    a: 'Griha pravesh is the ritual first entry into the home, with a puja at an auspicious hour. A housewarming is a party, and many families hold one after the other.',
                },
                {
                    q: 'How early should we invite people?',
                    a: 'One to two weeks is usual, because the muhurat is often fixed late. A link can be sent as soon as the date is known, and corrected if it moves.',
                },
            ],
        },
    },
    {
        slug: 'birthday',
        occasion: 'birthday',
        name: 'Birthday',
        sample: 'Aarav',
        designs: {
            lead: 'Birthday invitations for first birthdays, children’s parties, milestones and shashtipurti, sent as one link with replies and a map.',
            body: 'From a smash cake to a sixtieth, the invitation tells people when to come, what to wear and where to park, and counts who is coming so you can order enough cake.',
            faqs: [
                {
                    q: 'Can parents tell us how many children are coming?',
                    a: 'Yes. Replies include how many people, so you know before you order return gifts.',
                },
                {
                    q: 'Can we share photos after the party?',
                    a: 'Yes. You can keep editing your invitation, so add photos to its gallery and the same link shows them.',
                },
            ],
        },
        words: {
            lead: 'Birthday invitation wording for first birthdays, children, sweet sixteen, 30th, 40th, 50th and 60th shashtipurti, ready to copy.',
            body: 'Write to whoever will read it. Children’s invitations go to tired parents, so lead with the time and place. Milestone birthdays go to old friends, so lead with a memory.',
            include: [
                'The name, and the age if it is a milestone',
                'Start and finish times for children’s parties',
                'Venue with a map and parking',
                'Theme or dress code',
                'Whether siblings are welcome',
                'Allergies, and how to reply',
            ],
            faqs: [
                {
                    q: 'What is shashtipurti?',
                    a: 'The celebration of completing sixty years, observed in many Hindu families with prayers and a family gathering, and sometimes a renewal of marriage vows.',
                },
                {
                    q: 'Should a children’s party invitation give an end time?',
                    a: 'Yes. Parents plan around it, and so will you.',
                },
            ],
        },
    },
    {
        slug: 'retirement',
        occasion: 'retirement',
        name: 'Retirement',
        sample: 'Dr. Kavita Rao',
        designs: {
            lead: 'Retirement party invitations that honour a career, with photographs through the years, the programme and a place for messages.',
            body: 'Colleagues who cannot come can still leave a message, and the family can keep them all. Add the years, the photographs and the speeches.',
            faqs: [
                {
                    q: 'Can colleagues leave messages?',
                    a: 'Yes. Messages can be left on the invitation itself, and nothing appears until you approve it.',
                },
                {
                    q: 'Is it suitable for an office farewell?',
                    a: 'Yes. The same design works for a company dinner or a family celebration; only the words change.',
                },
            ],
        },
        words: {
            lead: 'Retirement invitation wording for an office farewell or a family party: formal, warm and light-hearted lines to copy.',
            body: 'Thank the person in one line, and let the evening say the rest. If the office is hosting, name the years of service; if the family is, say what they are looking forward to.',
            include: [
                'The name and title of the person retiring',
                'Years of service, and where',
                'Who is hosting',
                'Date, time and venue',
                'Whether there will be speeches',
                'Where to send a message or photograph',
            ],
            faqs: [
                {
                    q: 'How do we word it when the company is hosting?',
                    a: 'Use the company’s voice and keep it formal: “invites you to honour a remarkable career”. Leave the jokes for the speeches.',
                },
                {
                    q: 'Is it all right to make it a surprise?',
                    a: 'It is, with one line asking guests not to mention it, and a time to arrive before the guest of honour.',
                },
            ],
        },
    },
    {
        slug: 'puja',
        occasion: 'puja',
        name: 'Puja and katha',
        sample: 'The Joshi family',
        designs: {
            lead: 'Puja, katha and festival invitations lit by lamps, in English and Hindi, with timings for aarti and prasad on one link.',
            body: 'Satyanarayan katha, Ganesh Chaturthi, Mata ki chowki, Diwali at home. Tell guests when the aarti is and when prasad is served, and let them arrive when they can.',
            faqs: [
                {
                    q: 'Can one invitation cover several days?',
                    a: 'Yes. Add each day’s aarti, katha or bhajan evening with its own time.',
                },
                {
                    q: 'Is sacred text handled with care?',
                    a: 'Yes. Greetings come from a small vetted list, and no effect ever breaks, scratches or covers them.',
                },
            ],
        },
        words: {
            lead: 'Puja invitation wording in English, Hindi and Gujarati: Satyanarayan katha, Ganesh Chaturthi, Mata ki chowki, Diwali and garba.',
            body: 'Guests mostly want three things: which puja, when to arrive and when prasad is served. Write those plainly and add one line of welcome.',
            include: [
                'Which puja, katha or festival it is',
                'The family’s name',
                'Start time, aarti time and prasad',
                'Address with a landmark',
                'How long guests may come, if it is an open house',
                'Anything guests should bring or wear',
            ],
            faqs: [
                {
                    q: 'How do we invite people to an open house for a festival?',
                    a: 'Give a window rather than one time, such as “any time between 6 and 10 pm”, and the aarti time for those who want to be there for it.',
                },
                {
                    q: 'Can we print mantras on the invitation?',
                    a: 'You can write your own text. We do not write sacred verses for you; ask your priest for the ones your family uses.',
                },
            ],
        },
    },
    {
        slug: 'thread-ceremony',
        occasion: 'upanayan',
        name: 'Thread ceremony',
        sample: 'Master Arnav',
        designs: {
            lead: 'Thread ceremony invitations for upanayan, janoi, munja and poonal, in Gujarati and English, with the muhurat and lunch on one link.',
            body: 'Known as upanayan, janoi, munja or poonal, it is a day with an early start and a full house. The muhurat, the venue and the meal each have their place.',
            faqs: [
                {
                    q: 'Can we use our own name for the ceremony?',
                    a: 'Yes. Call it janoi, munja, poonal or upanayan, in your own language.',
                },
                {
                    q: 'Can two brothers share one invitation?',
                    a: 'Yes. Write both names where the name goes, and the rest stays the same.',
                },
            ],
        },
        words: {
            lead: 'Thread ceremony invitation wording in English, Hindi and Gujarati for upanayan, janoi and munja: traditional, formal and warm.',
            body: 'The grandparents or parents usually invite. Name the boy, ask for blessings, and give the muhurat along with the time you would like guests to be seated.',
            include: [
                'The boy’s name, with parents and grandparents',
                'The ceremony, in your family’s own word for it',
                'The muhurat',
                'Lunch timing',
                'Venue with a map',
                'Who is inviting, at the close',
            ],
            faqs: [
                {
                    q: 'What is the ceremony called in different regions?',
                    a: 'Upanayan or yajnopavit in Sanskrit, janeu in Hindi, janoi in Gujarati, munja in Marathi and poonal in Tamil. Use the one your family says.',
                },
                {
                    q: 'What should guests wear?',
                    a: 'Traditional clothes are usual. If the ritual is at a temple, add a line saying so.',
                },
            ],
        },
    },
    {
        slug: 'mundan',
        occasion: 'mundan',
        name: 'Mundan',
        sample: 'Baby Kiaan',
        designs: {
            lead: 'Mundan and first haircut invitations with the ritual time, the venue and lunch, shared with family as one link.',
            body: 'A short ceremony and a big family meal. Give the ritual its time and the lunch its own, so guests with children can plan the morning.',
            faqs: [
                {
                    q: 'Can guests come only for lunch?',
                    a: 'Yes. List the ritual and the meal separately and people can reply for either.',
                },
                {
                    q: 'What if it is held at a temple in another town?',
                    a: 'Add travel notes and a map, and guests who are coming from far will find everything on the link.',
                },
            ],
        },
        words: {
            lead: 'Mundan invitation wording in English, Hindi and Gujarati: traditional lines, a formal version and a playful goodbye to the curls.',
            body: 'It is a happy ritual with a nervous star. A traditional line for elders and a light one for friends is a good pair to have ready.',
            include: [
                'The child’s name, with parents and grandparents',
                'The time of the ritual',
                'Temple or home address',
                'Lunch timing',
                'Travel notes, if it is out of town',
                'Who is inviting',
            ],
            faqs: [
                {
                    q: 'At what age is a mundan held?',
                    a: 'Traditions differ: often in the first or third year, on a date chosen by the family priest. Some families hold it at a particular temple.',
                },
                {
                    q: 'Is it called something else in other regions?',
                    a: 'Yes. Chudakarana is the Sanskrit name; you will also hear chaul, babri or tonsure.',
                },
            ],
        },
    },
    {
        slug: 'passing-notice',
        occasion: 'demise_notice',
        name: 'Passing notice',
        sample: 'Savitri Desai',
        designs: {
            lead: 'A quiet, respectful way to share the news of a passing and the details of the last rites with everyone, on one link.',
            body: 'When there is too much to do and too many people to call, one link can carry the news, the time and the place. The pages are calm: no countdown, no celebration and no sound unless someone asks for it.',
            faqs: [
                {
                    q: 'How quickly can it be ready?',
                    a: 'In a few minutes. Choose a design, write the name and the details, and share the link. You can correct a time later and the same link updates.',
                },
                {
                    q: 'Can people leave condolences?',
                    a: 'Yes. Messages reach the family privately first, and appear only when you approve them.',
                },
            ],
        },
        words: {
            lead: 'Wording for a passing notice in English, Hindi and Gujarati: short, calm lines to inform family and friends of a loss.',
            body: 'You do not need to find the right words alone. Say who has passed, when the last rites are and where the family will be. Everything else can wait.',
            include: [
                'The full name, with the years of birth and passing',
                'The time and place of the last rites',
                'Where the family will receive visitors',
                'A telephone number for one relative',
                'The prayer meet, if it is already decided',
                'The names of the family, at the close',
            ],
            faqs: [
                {
                    q: 'What should be said first?',
                    a: 'The name, then the news, then the time and place. People reading it will need those before anything else.',
                },
                {
                    q: 'Is it all right to share the news by WhatsApp?',
                    a: 'Yes. Call the closest relatives first if you can, and then one message can reach everyone else.',
                },
            ],
        },
    },
    {
        slug: 'prayer-meet',
        occasion: 'prayer_meet',
        name: 'Prayer meet and besnu',
        sample: 'Ramesh Patel',
        designs: {
            lead: 'Prayer meet, besnu and uthamna invitations: calm pages with the time, the place and a lamp to light in their memory.',
            body: 'Guests see the name, the years and where to come. Those who are far away can light a lamp and leave a memory, and the family reads each one before it appears.',
            faqs: [
                {
                    q: 'Can it be in Gujarati or Hindi?',
                    a: 'Yes. The notice can be in Gujarati, Hindi and English together.',
                },
                {
                    q: 'Is there music?',
                    a: 'Nothing plays on its own. A soft flute is there for anyone who chooses to hear it, and it can be removed.',
                },
            ],
        },
        words: {
            lead: 'Prayer meet, besnu and uthamna wording in English, Hindi and Gujarati, including a respectful line to decline customary offerings.',
            body: 'These notices are short by custom. The name, the relationship, the time and the place are enough; a single line can decline flowers or customary offerings.',
            include: [
                'The full name, with the years of birth and passing',
                'Besnu, uthamna, chautha or prayer meet, as your family says',
                'Date, with start and end time',
                'Full address',
                'A line if flowers or customary offerings are declined',
                'The family’s names and a telephone number',
            ],
            faqs: [
                {
                    q: 'What does “laukik vyavahar bandh” mean?',
                    a: 'That the family is not accepting customary offerings or exchanges. It is usually the last line of a Gujarati besnu notice.',
                },
                {
                    q: 'Is besnu the same as uthamna?',
                    a: 'Both are gatherings after a passing. Besnu is the Gujarati custom of sitting with the family; uthamna marks the end of a mourning observance in many northern and Sindhi families.',
                },
            ],
        },
    },
    {
        slug: 'death-anniversary',
        occasion: 'death_anniversary',
        name: 'Death anniversary',
        sample: 'Indira Sharma',
        designs: {
            lead: 'Punyatithi and death anniversary invitations: a quiet page of remembrance with photographs, prayers and the gathering’s details.',
            body: 'A year on, or many years on, gather the photographs and the stories in one place and tell the family where to come. The page can stay as a small memorial.',
            faqs: [
                {
                    q: 'Can we add photographs and their life story?',
                    a: 'Yes. There is a place for their story, and a gallery for photographs through the years.',
                },
                {
                    q: 'Can the page stay online?',
                    a: 'It stays for the months included with the design, and you can save a PDF to keep for always.',
                },
            ],
        },
        words: {
            lead: 'Death anniversary and punyatithi wording in English, Hindi and Gujarati for a prayer, a shraddh or a day of giving.',
            body: 'After the first year, the words can be gentler: less news, more memory. One thing they loved or believed says more than a list of qualities.',
            include: [
                'The name, with the years of birth and passing',
                'Which anniversary it is',
                'Prayer, shraddh or bhajan timings',
                'The meal, if there is one',
                'Address with a map',
                'A place or cause for donations, if the family wishes',
            ],
            faqs: [
                {
                    q: 'What is punyatithi?',
                    a: 'The anniversary of a person’s passing. Families mark it with prayers, remembrance, food for others or a donation in their name.',
                },
                {
                    q: 'How do we ask for donations in place of flowers?',
                    a: 'One line is enough: “In place of flowers, a gift to a cause they loved would be welcome”, with the name of the charity.',
                },
            ],
        },
    },
    {
        slug: 'corporate-event',
        occasion: 'corporate',
        name: 'Corporate event',
        sample: 'Northwind Labs',
        designs: {
            lead: 'Corporate invitations for summits, launches, openings and client dinners, with the agenda, venue and replies on one link.',
            body: 'Something better than a calendar hold: an agenda people can read on a phone, a map that opens, and a reply count you can give to the venue.',
            faqs: [
                {
                    q: 'Can we use our logo and colours?',
                    a: 'Yes. Our studio can set a design in your brand; write to us from any design page.',
                },
                {
                    q: 'Can guests add sessions to their calendar?',
                    a: 'Yes. Each session has an add-to-calendar button with the right time zone.',
                },
            ],
        },
        words: {
            lead: 'Corporate invitation wording for an annual summit, product launch, office inauguration or client thank-you evening.',
            body: 'Lead with what the guest gets: what they will see, learn or eat. Job titles and sponsors can go lower down, where they do no harm.',
            include: [
                'The company’s name',
                'What the event is, in five words',
                'Date, time and time zone',
                'Venue with parking or entry instructions',
                'Agenda or speakers',
                'A deadline to confirm, and whether a guest may come',
            ],
            faqs: [
                {
                    q: 'How far ahead should we send it?',
                    a: 'Three to four weeks for a local event, and six to eight if people must fly in.',
                },
                {
                    q: 'How do we ask people to confirm?',
                    a: 'Say why: “Please confirm by Friday so that we can plan your seat.” A reason gets more replies than a reminder.',
                },
            ],
        },
    },
];

// The fields of a published design a guide looks at.
interface Design {
    eventKind: string;
    culture: string;
}

// The designs made for a guide, and others its families also like. A designs page with nothing of
// its own to show isn't published.
export function guideDesigns<T extends Design>(guide: Guide, designs: readonly T[]) {
    const occasion = designs.filter((d) => d.eventKind === guide.occasion);
    if (!guide.culture)
        return {
            own: occasion,
            more: [],
        };
    const { culture, variant } = guide;
    const tradition = occasion.filter((d) => d.culture.split('.')[0] === culture);
    if (!variant)
        return {
            own: tradition,
            more: [],
        };
    const exact = `${culture}.${variant}`;
    return {
        own: tradition.filter((d) => d.culture === exact),
        // A design made for another community isn't suggested; ones for the whole tradition are.
        more: tradition.filter((d) => d.culture === culture || d.culture === `${culture}.modern`),
    };
}

// Guides near this one: the same occasion first, then the same kind of occasion.
export function relatedGuides(guide: Guide, count = 6): Guide[] {
    const category = occasionOf(guide.occasion).category;
    const others = guides.filter((g) => g.slug !== guide.slug);
    const same = others.filter((g) => g.occasion === guide.occasion);
    const near = others.filter(
        (g) => g.occasion !== guide.occasion && occasionOf(g.occasion).category === category,
    );
    // Nobody reading about a loss is shown a party.
    const rest = others.filter(
        (g) =>
            !same.includes(g) &&
            !near.includes(g) &&
            isSolemn(occasionOf(g.occasion)) === isSolemn(occasionOf(guide.occasion)),
    );
    return [...same, ...near, ...rest].slice(0, count);
}

export const guideBySlug = (slug: string): Guide | undefined => guides.find((g) => g.slug === slug);
