export type Property = {
  id: number;
  title: string;
  location: string;
  price: string;
  monthlyPrice: string;
  image: string;
  tag: string;
  beds: number;
  baths: number;
  area: string;
  type: "Apartment" | "House" | "Commercial" | "Condo";
  score?: number;
  forRent?: boolean;
  isVerified?: boolean;
};

export const propertyImages = {
  tower: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=85",
  house: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
  interior: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
  living: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85",
  bright: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=85",
  apartment: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=85",
  skyline: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85",
  commercial: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85",
  penthouse: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=85",
  studio: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=85",
  kitchen: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1200&q=85",
  lobby: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=85",
};

export const featuredListings = [
  {
    id: 101,
    title: "Skyview Residence — Premium 3 Bedroom",
    location: "Gulshan 2, Dhaka",
    price: "৳ 7200",
    image: propertyImages.tower,
    tag: "Verified",
  },
  {
    id: 102,
    title: "Lakeside Duplex House with Garden",
    location: "Baridhara DOHS, Dhaka",
    price: "৳ 10200",
    image: propertyImages.house,
    tag: "Verified",
  },
  {
    id: 103,
    title: "Commercial Office Floor — Grade A",
    location: "Banani, Dhaka",
    price: "৳ 6.50 Cr",
    image: propertyImages.commercial,
    tag: "Verified",
    investmentScore: "Investment 95",
  },
  {
    id: 104,
    title: "Penthouse with Private Terrace",
    location: "Gulshan 1, Dhaka",
    price: "৳ 5.80 Cr",
    image: propertyImages.penthouse,
    tag: "Verified",
    investmentScore: "Investment 90",
  },
];

export const recommendedListings: Property[] = [
  {
    id: 1,
    title: "Skyview Residence — Premium 3 Bedroom",
    location: "Gulshan 2, Dhaka",
    price: "৳ 6200",
    monthlyPrice: "৳ 180,000/mo",
    image: propertyImages.tower,
    tag: "New",
    beds: 3,
    baths: 3,
    area: "2,150 sqft",
    type: "Apartment",
    score: 92,
  },
  {
    id: 2,
    title: "Lakeside Duplex House with Garden",
    location: "Baridhara DOHS, Dhaka",
    price: "৳ 12000",
    monthlyPrice: "৳ 320,000/mo",
    image: propertyImages.house,
    tag: "Verified",
    beds: 5,
    baths: 6,
    area: "4,200 sqft",
    type: "House",
    score: 88,
  },
  {
    id: 3,
    title: "Modern 2 Bedroom for Rent",
    location: "Dhanmondi, Dhaka",
    price: "৳ 3.2 Cr",
    monthlyPrice: "৳ 1100 /mo",
    image: propertyImages.interior,
    tag: "New",
    beds: 2,
    baths: 2,
    area: "1,250 sqft",
    type: "Apartment",
    score: 79,
    forRent: true,
  },
];

export const recentlyAddedListings: Property[] = [
  {
    id: 4,
    title: "Skyview Residence — Premium",
    location: "Gulshan 2, Dhaka",
    price: "৳ 6200",
    monthlyPrice: "৳ 180,000/mo",
    image: propertyImages.tower,
    tag: "New",
    beds: 3,
    baths: 3,
    area: "2,150 sqft",
    type: "Apartment",
    score: 92,
  },
  {
    id: 5,
    title: "Modern 2 Bedroom for Rent",
    location: "Dhanmondi, Dhaka",
    price: "৳ 2.8 Cr",
    monthlyPrice: "৳ 1100 /mo",
    image: propertyImages.interior,
    tag: "New",
    beds: 2,
    baths: 2,
    area: "1,250 sqft",
    type: "Apartment",
    score: 79,
    forRent: true,
  },
  {
    id: 6,
    title: "Cozy 1 Bedroom Studio for Rent",
    location: "Bashundhara R/A, Dhaka",
    price: "৳ 1.5 Cr",
    monthlyPrice: "৳ 12000 /mo",
    image: propertyImages.studio,
    tag: "New",
    beds: 1,
    baths: 1,
    area: "700 sqft",
    type: "Apartment",
    score: 79,
    forRent: true,
  },
];

export const verifiedPropertiesListings: Property[] = [
  {
    id: 7,
    title: "Skyview Residence — Premium",
    location: "Gulshan 2, Dhaka",
    price: "৳ 12000",
    monthlyPrice: "৳ 210,000/mo",
    image: propertyImages.tower,
    tag: "New",
    beds: 3,
    baths: 3,
    area: "2,150 sqft",
    type: "Apartment",
    score: 92,
  },
  {
    id: 8,
    title: "Lakeside Duplex House with Garden",
    location: "Baridhara DOHS, Dhaka",
    price: "৳ 12000",
    monthlyPrice: "৳ 320,000/mo",
    image: propertyImages.house,
    tag: "Verified",
    beds: 5,
    baths: 6,
    area: "4,200 sqft",
    type: "House",
    score: 88,
  },
  {
    id: 9,
    title: "Modern 2 Bedroom for Rent",
    location: "Dhanmondi, Dhaka",
    price: "৳ 3.2 Cr",
    monthlyPrice: "৳ 1100 /mo",
    image: propertyImages.interior,
    tag: "New",
    beds: 2,
    baths: 2,
    area: "1,250 sqft",
    type: "Apartment",
    score: 79,
    forRent: true,
  },
];

export const aiInvestmentPicksListings: Property[] = [
  {
    id: 10,
    title: "Commercial Office Floor — Grade A",
    location: "Banani, Dhaka",
    price: "৳ 11000",
    monthlyPrice: "৳ 450,000/mo",
    image: propertyImages.commercial,
    tag: "Verified",
    beds: 0,
    baths: 4,
    area: "6,500 sqft",
    type: "Commercial",
    score: 95,
  },
  {
    id: 11,
    title: "Skyview Residence — Premium",
    location: "Gulshan 2, Dhaka",
    price: "৳ 98000",
    monthlyPrice: "৳ 280,000/mo",
    image: propertyImages.tower,
    tag: "New",
    beds: 3,
    baths: 3,
    area: "2,150 sqft",
    type: "Apartment",
    score: 92,
  },
  {
    id: 12,
    title: "Penthouse with Private Terrace",
    location: "Gulshan 1, Dhaka",
    price: "৳ 14500",
    monthlyPrice: "৳ 350,000/mo",
    image: propertyImages.penthouse,
    tag: "Verified",
    beds: 4,
    baths: 5,
    area: "3,800 sqft",
    type: "Apartment",
    score: 90,
  },
];

export const allProperties: Property[] = [
  ...recommendedListings,
  ...recentlyAddedListings,
  ...verifiedPropertiesListings,
  ...aiInvestmentPicksListings,
];

export const popularLocations = [
  { name: "Dhaka", count: "8,420 listings", subtext: "Gulshan, Banani, Uttara...", image: "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&w=600&q=80" },
  { name: "Chottogram", count: "3,150 listings", subtext: "Agrabad, Nasirabad, Khulshi...", image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80" },
  { name: "Sylhet", count: "1,890 listings", subtext: "Zindabazar, Upashahar...", image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80" },
  { name: "Rajshahi", count: "1,420 listings", subtext: "Boalia, Motihar, Upashahar...", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80" },
  { name: "Khulna", count: "1,260 listings", subtext: "Sonadanga, Boyra, Nirala...", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80" },
  { name: "Barishal", count: "890 listings", subtext: "Sadar, Band Road, Rupatali...", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" },
  { name: "Rangpur", count: "780 listings", subtext: "Dhap, Modern Mor, Shalbon...", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80" },
  { name: "Maymensingh", count: "670 listings", subtext: "Town Hall, Charpara...", image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=600&q=80" },
  { name: "Cumilla", count: "920 listings", subtext: "Kandirpar, Kotbari...", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80" },
  { name: "Gazipur", count: "1,640 listings", subtext: "Joydebpur, Tongi, Chowrasta...", image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=600&q=80" },
];

export const trustedPartners = [
  { initial: "S", name: "Skyline Realty", deals: "3.2k deals" },
  { initial: "M", name: "Sunveely", deals: "2.8k deals" },
  { initial: "D", name: "Bashundhara", deals: "1.9k deals" },
  { initial: "P", name: "Prime Living", deals: "1.4k deals" },
];

export const latestNews = [
  {
    id: 1,
    tag: "Market",
    time: "2h ago",
    title: "Dhaka apartment prices rise 8% as metro expands",
    image: propertyImages.skyline,
  },
  {
    id: 2,
    tag: "Technology",
    time: "1d ago",
    title: "How AI valuation is changing home buying in Bangladesh",
    image: propertyImages.living,
  },
  {
    id: 3,
    tag: "Guide",
    time: "3d ago",
    title: "Best neighbourhoods for first-time buyers in 2026",
    image: propertyImages.bright,
  },
];

export const savedCollections = [
  {
    id: "all",
    name: "All saved",
    count: "5 properties",
    image: propertyImages.tower,
  },
  {
    id: "dream",
    name: "Dream homes",
    count: "3 properties",
    image: propertyImages.house,
  },
  {
    id: "investments",
    name: "Investments",
    count: "2 properties",
    image: propertyImages.commercial,
  },
];

export const savedPageListings: Property[] = [
  {
    id: 201,
    title: "Skyview Residence — Premium 3 Bedroom",
    location: "Gulshan 2, Dhaka",
    price: "৳ 6200",
    monthlyPrice: "৳ 180,000/mo",
    image: propertyImages.tower,
    tag: "New",
    beds: 3,
    baths: 3,
    area: "2,150 sqft",
    type: "Apartment",
    score: 92,
  },
  {
    id: 202,
    title: "Lakeside Duplex House with Garden",
    location: "Baridhara DOHS, Dhaka",
    price: "৳ 12000",
    monthlyPrice: "৳ 320,000/mo",
    image: propertyImages.house,
    tag: "Verified",
    beds: 5,
    baths: 6,
    area: "4,200 sqft",
    type: "House",
    score: 88,
  },
  {
    id: 203,
    title: "Penthouse with Private Terrace",
    location: "Gulshan 1, Dhaka",
    price: "৳ 12000",
    monthlyPrice: "৳ 350,000/mo",
    image: propertyImages.penthouse,
    tag: "Verified",
    beds: 4,
    baths: 5,
    area: "3,800 sqft",
    type: "Apartment",
    score: 90,
  },
];

export const recentlyViewedListings: Property[] = [
  {
    id: 301,
    title: "Commercial Office Floor — Grade A",
    location: "Banani, Dhaka",
    price: "৳ 11000",
    monthlyPrice: "৳ 450,000/mo",
    image: propertyImages.commercial,
    tag: "Verified",
    beds: 0,
    baths: 4,
    area: "6,500 sqft",
    type: "Commercial",
    score: 95,
  },
  {
    id: 302,
    title: "Residential Land Plot (5 Katha)",
    location: "Bashundhara R/A, Dhaka",
    price: "৳ 98000",
    monthlyPrice: "৳ 250,000/mo",
    image: propertyImages.bright,
    tag: "Verified",
    beds: 0,
    baths: 0,
    area: "3,600 sqft",
    type: "Apartment",
    score: 84,
  },
  {
    id: 303,
    title: "Cozy 1 Bedroom Studio for Rent",
    location: "Uttara Sector 7, Dhaka",
    price: "৳ 14500",
    monthlyPrice: "৳ 14500 /mo",
    image: propertyImages.studio,
    tag: "New",
    beds: 1,
    baths: 1,
    area: "720 sqft",
    type: "Apartment",
    score: 72,
    forRent: true,
  },
];

export const savedPropertyIds = [201, 202, 203];
