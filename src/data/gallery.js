import baileyImage from "../assets/bailey-anselme-Bkp3gLygyeA-unsplash.jpg";
import johnsonImage from "../assets/johnson-U6Q6zVDgmSs-unsplash.jpg";
import sieuwertImage from "../assets/sieuwert-otterloo-aren8nutd1Q-unsplash.jpg";
import toddImage from "../assets/todd-kent-178j8tJrNlc-unsplash.jpg";

export const galleryImages = [
  baileyImage,
  johnsonImage,
  sieuwertImage,
  toddImage,
  // Add more image paths as needed
];

export const galleryData = [
  {
    id: 1,
    image: baileyImage,
    alt: "Luxury Waterfront Estate",
    address: "456 Ocean View Drive, Malibu, CA 90265",
    price: "$2,850,000",
    bedrooms: 5,
    bathrooms: 4,
    sqft: "4,200",
    link: "/property/1",
  },
  {
    id: 2,
    image: johnsonImage,
    alt: "Modern Downtown Condo",
    address: "789 Metropolitan Ave, Los Angeles, CA 90012",
    price: "$675,000",
    bedrooms: 2,
    bathrooms: 2,
    sqft: "1,450",
    link: "/property/2",
  },
  {
    id: 3,
    image: sieuwertImage,
    alt: "Charming Suburban Home",
    address: "321 Maple Street, Pasadena, CA 91101",
    price: "$895,000",
    bedrooms: 4,
    bathrooms: 3,
    // sqft intentionally missing to test optional fields
    link: "/property/3",
  },
  {
    id: 4,
    image: toddImage,
    alt: "Contemporary Family Residence",
    // address intentionally missing to test optional fields
    price: "$1,250,000",
    bedrooms: 4,
    bathrooms: 3.5,
    sqft: "3,100",
    link: "/property/4",
  },
];
