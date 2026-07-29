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
  type: "Apartment" | "House" | "Condo";
  score: number;
};

export const propertyImages = {
  tower: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=85",
  house: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85",
  interior: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85",
  living: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85",
  bright: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1400&q=85",
  apartment: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&q=85",
  skyline: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1400&q=85",
  lobby: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1400&q=85",
  kitchen: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1400&q=85",
};

export const allProperties: Property[] = [
  { id: 1, title: "Contemporary duplex with city views", location: "Gulshan 2, Dhaka", price: "BDT 4.8 Cr", monthlyPrice: "BDT 185,000/mo", image: propertyImages.house, tag: "AI verified", beds: 4, baths: 4, area: "3,240 sq ft", type: "House", score: 96 },
  { id: 2, title: "Quiet residence near the lake", location: "Banani, Dhaka", price: "BDT 3.2 Cr", monthlyPrice: "BDT 122,000/mo", image: propertyImages.interior, tag: "Best value", beds: 3, baths: 3, area: "2,150 sq ft", type: "Apartment", score: 93 },
  { id: 3, title: "Sunlit family apartment", location: "Bashundhara R/A", price: "BDT 2.6 Cr", monthlyPrice: "BDT 98,000/mo", image: propertyImages.living, tag: "New", beds: 3, baths: 3, area: "1,980 sq ft", type: "Apartment", score: 91 },
  { id: 4, title: "Modern home with open plan living", location: "Dhanmondi, Dhaka", price: "BDT 3.9 Cr", monthlyPrice: "BDT 145,000/mo", image: propertyImages.bright, tag: "Top rated", beds: 4, baths: 3, area: "2,720 sq ft", type: "Condo", score: 90 },
  { id: 5, title: "Smart apartment in a secure community", location: "Uttara, Dhaka", price: "BDT 1.9 Cr", monthlyPrice: "BDT 76,000/mo", image: propertyImages.apartment, tag: "High demand", beds: 3, baths: 2, area: "1,650 sq ft", type: "Apartment", score: 88 },
  { id: 6, title: "Designer residence with warm interiors", location: "Baridhara, Dhaka", price: "BDT 5.1 Cr", monthlyPrice: "BDT 210,000/mo", image: propertyImages.lobby, tag: "Exclusive", beds: 4, baths: 5, area: "3,600 sq ft", type: "House", score: 95 },
  { id: 7, title: "Skyline apartment with private balcony", location: "Mohakhali DOHS", price: "BDT 2.4 Cr", monthlyPrice: "BDT 89,000/mo", image: propertyImages.tower, tag: "Price drop", beds: 3, baths: 2, area: "1,820 sq ft", type: "Condo", score: 87 },
  { id: 8, title: "Calm two-bedroom home near the park", location: "Uttara Sector 7", price: "BDT 1.6 Cr", monthlyPrice: "BDT 62,000/mo", image: propertyImages.kitchen, tag: "Great location", beds: 2, baths: 2, area: "1,350 sq ft", type: "Apartment", score: 85 },
];

export const savedPropertyIds = [1, 2, 6];
