// Single source of brand truth; rename the product or parent company here only.
export const brand = {
    name: 'Toran',
    atelier: 'Toran Atelier',
    parent: 'Rigi',
    tagline: 'Every celebration begins at the Toran.',
    taglineShort: 'The doorway to every celebration',
    whatsapp: '+919054887442',
    phone: '+91 90548 87442',
    email: 'hello@therigi.shop',
    // Who customers buy from, as on the KYC papers the payment service checks.
    legalName: 'Toran Invitation',
    address: 'Althan, Surat, Gujarat, India',
    // Indian e-commerce rules ask every shop to name who takes complaints.
    grievanceOfficer: 'Rishi Kapadia',
    grievanceTitle: 'Grievance Officer',
    courts: 'Surat, Gujarat',
    socials: {
        instagram: 'https://instagram.com/toran.invites',
        pinterest: 'https://pinterest.com/toraninvites',
    },
} as const;
