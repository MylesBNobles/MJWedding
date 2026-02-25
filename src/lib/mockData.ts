import {
	StorySlide,
	EventItem,
	AttireSection,
	FAQItem,
	UpdateItem,
	TravelSection,
} from "./types";

export const storySlides: StorySlide[] = [
	{
		id: "1",
		headline: "Where We First Met",
		shortText:
			"We first met in high school in the same AP U.S. History class — and yes, Jeslin is the one who took this photo of Myles.",
		imageUrl: "/images/LightStringPic.jpeg",
		imagePosition: "center 25%",
		background: "linear-gradient(135deg, #FAF7F2 0%, #EDE6D8 100%)",
		theme: "light",
	},
	{
		id: "2",
		headline: "Finding Our Way Back",
		shortText:
			"Years later, we reconnected in the most unexpected way — Jeslin replied to an Instagram photo Myles had reposted with a compliment for his mom. What started as a small interaction quickly turned into something much bigger.",
		imageUrl: "/images/MomInstagram.jpeg",
		imagePosition: "center 30%",
		background: "linear-gradient(135deg, #EDE6D8 0%, #D5DBCE 100%)",
		theme: "light",
	},
	{
		id: "3",
		headline: "Getting to Know Each Other",
		shortText:
			"What started with a single conversation soon gave way to long phone calls and an easy rhythm between us. Through talks about life, family, and everything in between, our connection deepened in the most natural way.",
		imageUrl: "/images/VideoCall.jpeg",
		background: "linear-gradient(135deg, #D5DBCE 0%, #BCC9B5 100%)",
		theme: "light",
	},
	{
		id: "4",
		headline: "The First Date",
		shortText:
			"When we finally spent time together in person, the connection was immediate. There was a natural comfort between us, along with an excitement that was impossible to miss.",
		imageUrl: "/images/FirstDates.jpeg",
		background: "linear-gradient(135deg, #BCC9B5 0%, #A3B79D 100%)",
		theme: "light",
	},
	{
		id: "5",
		headline: "Growing Together",
		shortText:
			"Over the next year and a half, we traveled, built memories, and learned how to truly show up for one another. What began as a connection gradually grew into a steady partnership.",
		imageUrl: "/images/SanFran.jpeg",
		background: "linear-gradient(135deg, #A3B79D 0%, #8AA585 100%)",
		theme: "dark",
	},
	{
		id: "6",
		headline: "The Proposal",
		shortText:
			"While in Lake Como, Italy, Myles asked the question at Villa del Balbianello. Completely unexpected, it became one of the most unforgettable moments of our lives.",
		imageUrl: "/images/ProposalPic.jpeg",
		background: "linear-gradient(135deg, #8AA585 0%, #72936E 100%)",
		theme: "dark",
	},
	{
		id: "7",
		headline: "What's Next",
		shortText:
			"We're excited to celebrate this next chapter with the people we love most and continue building a life together.",
		imageUrl: "/images/Duomo.jpeg",
		background: "linear-gradient(135deg, #72936E 0%, #5C6B4A 100%)",
		theme: "dark",
	},
];

export const itineraryEvents: EventItem[] = [
	{
		id: "1",
		title: "Welcome Lunch",
		date: "2027-06-11",
		startTime: "12:30",
		endTime: "15:30",
		venueName: "Villa Di Geggiano",
		address: "Strada di Geggiano 1, 53010 Castelnuovo Berardenga, Siena, Italy",
		mapLink: "https://maps.google.com/?q=Villa+Di+Geggiano+Siena+Italy",
		dressCode: "Smart Casual",
		notes:
			"Join us for a relaxed afternoon lunch in the Tuscan countryside. A chance to catch up before the big day.",
	},
	{
		id: "2",
		title: "Wedding Ceremony",
		date: "2027-06-12",
		startTime: "16:30",
		endTime: "17:30",
		venueName: "Villa Di Geggiano",
		address: "Strada di Geggiano 1, 53010 Castelnuovo Berardenga, Siena, Italy",
		mapLink: "https://maps.google.com/?q=Villa+Di+Geggiano+Siena+Italy",
		dressCode: "Formal",
		notes: "Please arrive by 4:00 PM. Ceremony begins promptly at 4:30 PM.",
	},
	{
		id: "3",
		title: "Cocktail Hour",
		date: "2027-06-12",
		startTime: "17:30",
		endTime: "18:30",
		venueName: "Villa Di Geggiano Gardens",
		dressCode: "Formal",
	},
	{
		id: "4",
		title: "Reception & Dinner",
		date: "2027-06-12",
		startTime: "18:30",
		endTime: "23:00",
		venueName: "Villa Di Geggiano",
		address: "Strada di Geggiano 1, 53010 Castelnuovo Berardenga, Siena, Italy",
		mapLink: "https://maps.google.com/?q=Villa+Di+Geggiano+Siena+Italy",
		dressCode: "Formal",
		notes: "Dinner, toasts, dancing, and celebration under the Tuscan stars.",
	},
	{
		id: "5",
		title: "Farewell Brunch",
		date: "2027-06-13",
		startTime: "10:00",
		endTime: "13:00",
		venueName: "Grand Hotel Continental Siena",
		address: "Banchi di Sopra, 85, 53100 Siena, Italy",
		mapLink: "https://maps.google.com/?q=Grand+Hotel+Continental+Siena+Italy",
		dressCode: "Casual",
		notes: "A relaxed morning to say goodbye. Drop in anytime.",
	},
];

export const attireSections: AttireSection[] = [
	{
		id: "1",
		title: "Indo-Western Black Tie",
		description:
			"The ceremony and reception call for Indo-Western Black Tie attire. Think elegant, refined, and celebration-ready—whether in a stunning lehenga or a classic tuxedo. The celebration will be outdoors, so plan for a warm Tuscan summer evening.",
		images: ["/images/DressDo.png", "/images/DressDont.png"],
		doList: [
			"Elegant floor-length evening gowns",
			"Refined sarees in elevated fabrics",
			"Stunning lehengas or anarkalis",
			"Structured, formal silhouettes",
			"Dressy heels or refined evening footwear",
			"Embellished clutches or formal handbags",
			"Tailored sherwanis or formal kurta sets",
			"Classic tuxedos",
			"Dark, well-fitted suits",
			"Crisp dress shirts with formal styling",
			"Polished formal shoes",
		],
		avoidList: [
			"Casual or club-style dresses",
			"Denim or daytime fabrics",
			"Sundresses or relaxed daywear",
			"Athletic sneakers or flip flops",
			"Casual attire (polo shirts, untucked button-downs)",
			"Jeans or shorts",
			"Sneakers or athletic shoes",
			"Casual loafers without formal structure",
		],
	},
	{
		id: "2",
		title: "Smart Casual (Welcome Lunch & Brunch)",
		description:
			"We're still finalizing the details for the welcome lunch and farewell brunch. Check the Updates section for announcements as we get closer to the date.",
		images: [],
		doList: [],
		avoidList: [],
	},
];

export const faqItems: FAQItem[] = [
	{
		id: "1",
		q: "When will save the dates be sent out?",
		a: "Save the dates will go out ahead of June 12, about a year before the big day, so everyone has plenty of time to plan and budget for our destination celebration.",
	},
	{
		id: "2",
		q: "When will wedding invitations be sent out?",
		a: "Formal invitations will be sent about four months before the wedding to confirm RSVPs. You'll also get an early heads-up around a year out when the save the dates go out.",
	},
	{
		id: "11",
		q: "Where should I stay?",
		a: "We're working on lodging recommendations and will share them soon. Sign up for updates and we'll let you know as soon as we have more details!",
	},
	{
		id: "3",
		q: "Can I bring a plus-one?",
		a: "Your invitation will specify if you have a plus-one. Due to venue capacity, we can only accommodate guests who are specifically named. Please reach out if you have questions.",
	},
	{
		id: "4",
		q: "Are children welcome?",
		a: "We would love to celebrate with your little ones! To help with planning, invited children will be named directly on your invitation.",
	},
	{
		id: "5",
		q: "What time should I arrive for the ceremony?",
		a: "We're still finalizing the schedule. We'll share arrival times in an update closer to the date—sign up for updates so you don't miss it!",
	},
	{
		id: "7",
		q: "Will the ceremony be indoors or outdoors?",
		a: "The ceremony will be outdoors in the villa gardens, weather permitting. We have a beautiful indoor backup space just in case.",
	},
	{
		id: "9",
		q: "Do you have a registry?",
		a: "We're still putting together our registry and will share details soon. Keep an eye on the Updates section for an announcement!",
	},
	{
		id: "12",
		q: "What's the weather like in June?",
		a: "Tuscany in June is warm and sunny, typically 25-30°C (77-86°F) during the day and pleasantly cool in the evening around 18-22°C (64-72°F). Bring a light layer for after sunset.",
	},
	{
		id: "13",
		q: "Have a question that isn't answered here?",
		a: "We are happy to help. Please reach out to Jeslin or Myles, or email us anytime at hello@jeslinandmyles.com.",
	},
];

export const updateItems: UpdateItem[] = [
	{
		id: "1",
		title: "Welcome to Our Wedding Website",
		body: "We're so excited to share all the details for our Tuscan celebration. Check back here for updates as the big day approaches.",
		category: "general",
		publishedAt: "2026-02-12T12:00:00Z",
	},
];

export const travelInfo: TravelSection = {
	airports: [
		{
			name: "Florence Airport (Peretola)",
			code: "FLR",
			driveTime: "1 hour 15 min",
			recommended: true,
		},
		{
			name: "Pisa International Airport",
			code: "PSA",
			driveTime: "1 hour 45 min",
			recommended: true,
		},
		{
			name: "Rome Fiumicino Airport",
			code: "FCO",
			driveTime: "3 hours",
			recommended: false,
		},
	],
	arrivalWindow: {
		ideal: "Tuesday, June 8th or Wednesday, June 9th",
		latest: "Thursday, June 10th",
	},
	departureWindow: {
		earliest: "Sunday, June 13th after 3:00 PM",
		ideal: "Monday, June 14th or later",
	},
	lodgingAreas: [
		{
			name: "Siena Centro",
			description:
				"Historic city center, walking distance to restaurants and sights. 20 min to venue.",
			priceRange: "$$$",
		},
		{
			name: "Chianti Region",
			description:
				"Charming countryside agriturismos and villas. 15-30 min to venue.",
			priceRange: "$$-$$$$",
		},
		{
			name: "Castelnuovo Berardenga",
			description: "Closest to the venue, quiet Tuscan village.",
			priceRange: "$$",
		},
	],
	hotelBlock: {
		name: "Grand Hotel Continental Siena",
		bookBy: "March 1, 2027",
		code: "MYLESJESLIN2027",
	},
	transport: [
		{
			type: "Shuttle",
			description:
				"Complimentary shuttle service will run between recommended hotels (or a designated central meeting point in Siena) and all wedding events.",
			recommended: true,
		},
		{
			type: "Rental Car",
			description:
				"Great for exploring Tuscany before or after the wedding. Book early for June!",
			recommended: false,
		},
		{
			type: "Taxi/Transfer",
			description:
				"Private transfers can be arranged from airports. Taxis are less common than in major cities—booking ahead is recommended.",
			recommended: false,
		},
	],
	tips: [
		"Tuscany in June is warm—pack light, breathable clothing and comfortable shoes.",
		"Tipping in Italy is appreciated but not mandatory (round up or 5-10% for excellent service).",
		"June is peak tourist season—book accommodations and rental cars well in advance.",
		"Don't miss the chance to explore Siena, Florence, and the Chianti wine region!",
		'Many shops close for "riposo" (afternoon rest) from 1-4 PM.',
		"Italian dinner is typically served later (8 PM onwards)—adjust to local rhythm!",
	],
};

export const weddingDetails = {
	couple: "Jeslin & Myles",
	date: "June 12, 2027",
	location: "Tuscany, Italy",
	venue: "Villa Di Geggiano",
	timezone: "Central European Time (CET)",
	dressCode: "Indo-Western Black Tie",
};
