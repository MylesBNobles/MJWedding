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
			"We first met in high school in the same AP U.S. History class.\nP.S. Jeslin took this pic of Myles!",
		imageUrl: "/images/LightStringPic.jpeg",
		imagePosition: "center 25%",
		background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
		theme: "dark",
	},
	{
		id: "2",
		headline: "Finding Our Way Back",
		shortText:
			"Years later, we reconnected in a very unexpected way. Jeslin slid up on an Instagram photo Myles reposted, which he definitely thought was about him. It turns out she was actually complimenting his mom. Either way, it worked.",
		imageUrl: "/images/MomInstagram.jpeg",
		imagePosition: "center 30%",
		background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
		theme: "dark",
	},
	{
		id: "3",
		headline: "Getting to Know Each Other",
		shortText:
			"What started casually quickly turned into many long phone calls. We got to know each other naturally through conversations about life, family, and everything in between.",
		imageUrl: "/images/VideoCall.jpeg",
		background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
		theme: "dark",
	},
	{
		id: "4",
		headline: "The First Date",
		shortText:
			"When we finally spent quality time together in person, there was an instant connection. It felt easy, intentional, and exciting in all the right ways.",
		imageUrl: "/images/FirstDates.jpeg",
		background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
		theme: "dark",
	},
	{
		id: "5",
		headline: "Growing Together",
		shortText:
			"Over the next year and a half, we dated, traveled, shared experiences, and learned how to show up for each other. What started as a connection turned into a partnership.",
		imageUrl: "/images/SanFran.jpeg",
		background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
		theme: "dark",
	},
	{
		id: "6",
		headline: "The Proposal",
		shortText:
			"On a trip to Lake Como, the question was asked at Villa del Balbianello. A complete surprise and a moment we will never forget.",
		imageUrl: "/images/ProposalPic.jpeg",
		background: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
		theme: "dark",
	},
	{
		id: "7",
		headline: "What's Next",
		shortText:
			"We're excited to celebrate this next chapter with the people we love most and continue building a life together.",
		imageUrl: "/images/Duomo.jpeg",
		background: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
		theme: "dark",
	},
];

export const timelineEvents: EventItem[] = [
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
		title: "Formal Attire",
		description:
			"The ceremony and reception call for formal attire. Think elegant, refined, and celebration-ready. The venue is outdoors with indoor options, so plan for warm Tuscan summer evenings.",
		images: [
			"linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
			"linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)",
		],
		doList: [
			"Floor-length or midi dresses",
			"Suits or tuxedos",
			"Dark or jewel-toned colors",
			"Elegant accessories",
			"Comfortable shoes for dancing",
		],
		avoidList: [
			"White, ivory, or cream (reserved for the couple)",
			"Overly casual fabrics like denim",
			"Very bright neon colors",
			"Stilettos (garden venue with gravel paths)",
		],
	},
	{
		id: "2",
		title: "Smart Casual (Welcome Lunch & Brunch)",
		description:
			"For the welcome lunch and farewell brunch, think polished but relaxed. Tuscan countryside vibes.",
		images: ["linear-gradient(135deg, #ddd6f3 0%, #faaca8 100%)"],
		doList: [
			"Sundresses or midi skirts",
			"Linen pants or chinos",
			"Light blazers or cardigans",
			"Wedges or loafers",
		],
		avoidList: ["Athletic wear", "Flip flops", "Ripped jeans"],
	},
];

export const faqItems: FAQItem[] = [
	{
		id: "1",
		q: "Can I bring a plus-one?",
		a: "Your invitation will specify if you have a plus-one. Due to venue capacity, we can only accommodate guests who are specifically named. Please reach out if you have questions.",
	},
	{
		id: "2",
		q: "Are children welcome?",
		a: "Yes! Children are welcome to join us for the celebration. Please include them in your party count when sharing your plans.",
	},
	{
		id: "3",
		q: "What time should I arrive for the ceremony?",
		a: "Please arrive by 4:00 PM. The ceremony begins promptly at 4:30 PM, and we want everyone settled and comfortable.",
	},
	{
		id: "4",
		q: "Is there parking at the venue?",
		a: "Yes, parking is available at Villa Di Geggiano. We also encourage carpooling and will have shuttle service from the recommended hotels in Siena.",
	},
	{
		id: "5",
		q: "Will the ceremony be indoors or outdoors?",
		a: "The ceremony will be outdoors in the villa gardens, weather permitting. We have a beautiful indoor backup space just in case.",
	},
	{
		id: "6",
		q: "Can I take photos during the ceremony?",
		a: "We kindly ask for an unplugged ceremony—please keep phones and cameras away during the vows. Our photographer will capture everything. Feel free to snap away during the reception!",
	},
	{
		id: "7",
		q: "Do you have a registry?",
		a: "Your presence is the greatest gift. If you wish to honor us with a gift, we have a small registry linked in your invitation, or contributions to our honeymoon fund are welcome.",
	},
	{
		id: "8",
		q: "What if I have dietary restrictions?",
		a: "Please note any dietary restrictions in your plans form. Our caterer can accommodate most requirements with advance notice.",
	},
	{
		id: "9",
		q: "Where should I stay?",
		a: "We recommend the Grand Hotel Continental Siena, which is close to the venue and where we'll host the farewell brunch. Details on the Travel page.",
	},
	{
		id: "10",
		q: "What's the weather like in June?",
		a: "Tuscany in June is warm and sunny, typically 25-30°C (77-86°F) during the day and pleasantly cool in the evening around 18-22°C (64-72°F). Bring a light layer for after sunset.",
	},
	{
		id: "11",
		q: "Do I need to speak Italian?",
		a: "English is widely spoken in tourist areas and hotels. However, learning a few basic Italian phrases is always appreciated by locals!",
	},
	{
		id: "12",
		q: "What currency is used in Italy?",
		a: "Italy uses the Euro (€). Credit cards are widely accepted, but it's good to have some cash for smaller establishments.",
	},
];

export const updateItems: UpdateItem[] = [
	{
		id: "1",
		title: "Hotel Recommendations Posted",
		body: "We recommend staying at the Grand Hotel Continental Siena for easy access to the venue. Book early as June is peak season in Tuscany!",
		category: "lodging",
		publishedAt: "2027-01-15T10:00:00Z",
	},
	{
		id: "2",
		title: "Shuttle Service Confirmed",
		body: "We've arranged shuttle service between Grand Hotel Continental Siena and Villa Di Geggiano for all wedding events.",
		category: "travel",
		publishedAt: "2027-02-01T14:00:00Z",
	},
	{
		id: "3",
		title: "Weekend Timeline Finalized",
		body: "The full weekend schedule is now posted on the Timeline page. We can't wait to celebrate with you in Tuscany!",
		category: "timeline",
		publishedAt: "2027-02-20T09:00:00Z",
	},
	{
		id: "4",
		title: "Welcome to Our Wedding Website",
		body: "We're so excited to share all the details for our Tuscan celebration. Check back here for updates as the big day approaches.",
		category: "general",
		publishedAt: "2027-01-01T12:00:00Z",
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
			driveTime: "2 hours 30 min",
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
				"Complimentary shuttle between Grand Hotel Continental Siena and all wedding events.",
			recommended: true,
		},
		{
			type: "Rental Car",
			description:
				"Great for exploring Tuscany before or after the wedding. Book early for June!",
			recommended: true,
		},
		{
			type: "Taxi/Transfer",
			description:
				"Private transfers can be arranged from airports. We can provide recommendations.",
			recommended: false,
		},
	],
	tips: [
		"Tuscany in June is warm—pack light, breathable clothing and comfortable shoes.",
		"Tipping in Italy is appreciated but not mandatory (round up or 5-10% for excellent service).",
		"June is peak tourist season—book accommodations and rental cars well in advance.",
		"Don't miss the chance to explore Siena, Florence, and the Chianti wine region!",
		"Sunscreen and a hat are essential for daytime outdoor activities.",
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
	dressCode: "Formal",
};
