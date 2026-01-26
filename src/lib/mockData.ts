import { StorySlide, EventItem, AttireSection, FAQItem, UpdateItem, TravelSection } from './types';

export const storySlides: StorySlide[] = [
  {
    id: '1',
    headline: 'The Beginning',
    shortText: 'We met at a coffee shop in Brooklyn on a rainy Tuesday afternoon. Neither of us expected to find anything more than caffeine.',
    imageUrl: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    theme: 'dark',
  },
  {
    id: '2',
    headline: 'First Date',
    shortText: 'Dinner turned into a walk through the city. The walk turned into sunrise. We both called in sick to work the next day.',
    imageUrl: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    theme: 'dark',
  },
  {
    id: '3',
    headline: 'The Adventures',
    shortText: 'From Tokyo to Patagonia, we discovered that home is not a place—it\'s a person.',
    imageUrl: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    theme: 'dark',
  },
  {
    id: '4',
    headline: 'Moving In',
    shortText: 'Two apartments became one. Our books finally met. His records learned to share space with her plants.',
    imageUrl: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    theme: 'dark',
  },
  {
    id: '5',
    headline: 'The Question',
    shortText: 'On a quiet evening at home, no grand gesture needed. Just the two of us and a question that had only one answer.',
    imageUrl: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    theme: 'dark',
  },
  {
    id: '6',
    headline: 'What\'s Next',
    shortText: 'We\'re building a life together. And we want you there to celebrate the next chapter with us.',
    imageUrl: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    theme: 'dark',
  },
];

export const timelineEvents: EventItem[] = [
  {
    id: '1',
    title: 'Welcome Drinks',
    date: '2025-06-13',
    startTime: '18:00',
    endTime: '21:00',
    venueName: 'The Rooftop at Hotel Luna',
    address: '123 Main Street, Napa Valley, CA',
    mapLink: 'https://maps.google.com',
    dressCode: 'Smart Casual',
    notes: 'Join us for sunset cocktails and light bites. A chance to catch up before the big day.',
  },
  {
    id: '2',
    title: 'Wedding Ceremony',
    date: '2025-06-14',
    startTime: '16:30',
    endTime: '17:30',
    venueName: 'The Garden at Villa Rosa',
    address: '456 Vineyard Road, Napa Valley, CA',
    mapLink: 'https://maps.google.com',
    dressCode: 'Formal',
    notes: 'Please arrive by 4:00 PM. Ceremony begins promptly at 4:30 PM.',
  },
  {
    id: '3',
    title: 'Cocktail Hour',
    date: '2025-06-14',
    startTime: '17:30',
    endTime: '18:30',
    venueName: 'The Terrace at Villa Rosa',
    dressCode: 'Formal',
  },
  {
    id: '4',
    title: 'Reception & Dinner',
    date: '2025-06-14',
    startTime: '18:30',
    endTime: '23:00',
    venueName: 'The Grand Hall at Villa Rosa',
    address: '456 Vineyard Road, Napa Valley, CA',
    mapLink: 'https://maps.google.com',
    dressCode: 'Formal',
    notes: 'Dinner, toasts, dancing, and celebration. Late-night snacks at 10 PM.',
  },
  {
    id: '5',
    title: 'Farewell Brunch',
    date: '2025-06-15',
    startTime: '10:00',
    endTime: '13:00',
    venueName: 'Hotel Luna Restaurant',
    address: '123 Main Street, Napa Valley, CA',
    dressCode: 'Casual',
    notes: 'A relaxed morning to say goodbye. Drop in anytime.',
  },
];

export const attireSections: AttireSection[] = [
  {
    id: '1',
    title: 'Formal Attire',
    description: 'The ceremony and reception call for formal attire. Think elegant, refined, and celebration-ready. The venue is outdoors with indoor options, so plan for mild evening temperatures.',
    images: [
      'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
      'linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)',
    ],
    doList: [
      'Floor-length or midi dresses',
      'Suits or tuxedos',
      'Dark or jewel-toned colors',
      'Elegant accessories',
      'Comfortable shoes for dancing',
    ],
    avoidList: [
      'White, ivory, or cream (reserved for the couple)',
      'Overly casual fabrics like denim',
      'Very bright neon colors',
      'Stilettos (grass venue)',
    ],
  },
  {
    id: '2',
    title: 'Smart Casual (Welcome & Brunch)',
    description: 'For the welcome drinks and farewell brunch, think polished but relaxed. California wine country vibes.',
    images: [
      'linear-gradient(135deg, #ddd6f3 0%, #faaca8 100%)',
    ],
    doList: [
      'Sundresses or midi skirts',
      'Linen pants or chinos',
      'Blazers or cardigans',
      'Wedges or loafers',
    ],
    avoidList: [
      'Athletic wear',
      'Flip flops',
      'Ripped jeans',
    ],
  },
];

export const faqItems: FAQItem[] = [
  {
    id: '1',
    q: 'Can I bring a plus-one?',
    a: 'Your invitation will specify if you have a plus-one. Due to venue capacity, we can only accommodate guests who are specifically named. Please reach out if you have questions.',
  },
  {
    id: '2',
    q: 'Are children welcome?',
    a: 'We love your little ones, but this will be an adults-only celebration. We hope this gives you a chance to enjoy a night off!',
  },
  {
    id: '3',
    q: 'What time should I arrive for the ceremony?',
    a: 'Please arrive by 4:00 PM. The ceremony begins promptly at 4:30 PM, and we want everyone settled and comfortable.',
  },
  {
    id: '4',
    q: 'Is there parking at the venue?',
    a: 'Yes, complimentary valet parking will be available at Villa Rosa. We also encourage carpooling and will have shuttle service from Hotel Luna.',
  },
  {
    id: '5',
    q: 'Will the ceremony be indoors or outdoors?',
    a: 'The ceremony will be outdoors in the garden, weather permitting. We have a beautiful indoor backup space just in case.',
  },
  {
    id: '6',
    q: 'Can I take photos during the ceremony?',
    a: 'We kindly ask for an unplugged ceremony—please keep phones and cameras away during the vows. Our photographer will capture everything. Feel free to snap away during the reception!',
  },
  {
    id: '7',
    q: 'Do you have a registry?',
    a: 'Your presence is the greatest gift. If you wish to honor us with a gift, we have a small registry linked in your invitation, or contributions to our honeymoon fund are welcome.',
  },
  {
    id: '8',
    q: 'What if I have dietary restrictions?',
    a: 'Please note any dietary restrictions in your plans form. Our caterer can accommodate most requirements with advance notice.',
  },
  {
    id: '9',
    q: 'Is there a hotel block?',
    a: 'Yes! We have reserved rooms at Hotel Luna at a special rate. Please book by May 15th to secure the group rate. Details on the Travel page.',
  },
  {
    id: '10',
    q: 'What\'s the weather like in June?',
    a: 'Napa Valley in June is typically warm during the day (75-85°F) and cooler in the evening (55-65°F). Bring a light layer for after sunset.',
  },
];

export const updateItems: UpdateItem[] = [
  {
    id: '1',
    title: 'Hotel Block Now Open',
    body: 'Our room block at Hotel Luna is now available for booking. Use code MYLESJESLIN2025 for the special rate. Book by May 15th.',
    category: 'lodging',
    publishedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Shuttle Service Confirmed',
    body: 'We\'ve arranged shuttle service between Hotel Luna and Villa Rosa for all wedding events. No need to worry about transportation or parking.',
    category: 'travel',
    publishedAt: '2025-02-01T14:00:00Z',
  },
  {
    id: '3',
    title: 'Weekend Timeline Finalized',
    body: 'The full weekend schedule is now posted on the Timeline page. We can\'t wait to celebrate with you!',
    category: 'timeline',
    publishedAt: '2025-02-20T09:00:00Z',
  },
  {
    id: '4',
    title: 'Welcome to Our Wedding Website',
    body: 'We\'re so excited to share all the details for our celebration. Check back here for updates as the big day approaches.',
    category: 'general',
    publishedAt: '2025-01-01T12:00:00Z',
  },
];

export const travelInfo: TravelSection = {
  airports: [
    { name: 'San Francisco International', code: 'SFO', driveTime: '1 hour 15 min', recommended: true },
    { name: 'Oakland International', code: 'OAK', driveTime: '1 hour', recommended: true },
    { name: 'Sacramento International', code: 'SMF', driveTime: '1 hour 15 min', recommended: false },
    { name: 'San Jose International', code: 'SJC', driveTime: '1 hour 45 min', recommended: false },
  ],
  arrivalWindow: {
    ideal: 'Thursday, June 12th or Friday morning, June 13th',
    latest: 'Friday, June 13th by 3:00 PM',
  },
  departureWindow: {
    earliest: 'Sunday, June 15th after 2:00 PM',
    ideal: 'Sunday evening or Monday, June 16th',
  },
  lodgingAreas: [
    { name: 'Downtown Napa', description: 'Walking distance to restaurants and shops. 15 min to venue.', priceRange: '$$$' },
    { name: 'Yountville', description: 'Charming wine country town. 10 min to venue.', priceRange: '$$$$' },
    { name: 'American Canyon', description: 'Budget-friendly option. 25 min to venue.', priceRange: '$$' },
  ],
  hotelBlock: {
    name: 'Hotel Luna',
    bookBy: 'May 15, 2025',
    code: 'MYLESJESLIN2025',
  },
  transport: [
    { type: 'Shuttle', description: 'Complimentary shuttle between Hotel Luna and all wedding events.', recommended: true },
    { type: 'Rental Car', description: 'Great for exploring wine country before or after the wedding.', recommended: true },
    { type: 'Rideshare', description: 'Uber and Lyft are available but can be limited in wine country.', recommended: false },
  ],
  tips: [
    'California wine country is casual but classy—pack layers for cooler evenings.',
    'Tipping is customary (15-20% for service, $2-5 for valet).',
    'June is peak season—book lodging and rental cars early.',
    'Don\'t miss the chance to do some wine tasting while you\'re here!',
    'Sunscreen is a must, even in the evening.',
  ],
};

export const weddingDetails = {
  couple: 'Myles & Jeslin',
  date: 'June 14, 2025',
  location: 'Napa Valley, California',
  timezone: 'Pacific Time (PT)',
  dressCode: 'Formal',
};
