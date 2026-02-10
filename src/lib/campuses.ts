export type Campus = {
  id: string;
  name: string;
  fullName: string;
  image: string;
  location: string;
};

// canonical campus list used across the app. Add missing artist and sport entries here
export const campusData: Record<string, Campus> = {
  "iit-delhi": {
    id: "iit-delhi",
    name: "IIT-D",
    fullName: "Indian Institute of Technology Delhi",
    image: "/Assests/c1.jpeg",
    location: "New Delhi",
  },
  cu: {
    id: "cu",
    name: "CU",
    fullName: "Chandigarh University",
    image: "/Assests/c2.jpeg",
    location: "Chandigarh",
  },
  "iit-bombay": {
    id: "iit-bombay",
    name: "IIT-B",
    fullName: "Indian Institute of Technology Bombay",
    image: "/Assests/c3.jpeg",
    location: "Mumbai",
  },
  "bits-pilani": {
    id: "bits-pilani",
    name: "BITS",
    fullName: "BITS Pilani",
    image: "/Assests/c4.jpeg",
    location: "Pilani",
  },
  "delhi-university": {
    id: "delhi-university",
    name: "DU",
    fullName: "Delhi University",
    image: "/DU.jpg",
    location: "New Delhi",
  },
  "dtu-delhi": {
    id: "dtu-delhi",
    name: "DTU",
    fullName: "Delhi Technological University",
    image: "/DTU.jpg",
    location: "New Delhi",
  },
  "aiims-delhi": {
    id: "aiims-delhi",
    name: "AIIMS",
    fullName: "All India Institute of Medical Sciences",
    image: "/AIIMS.jpg",
    location: "New Delhi",
  },
  "nit-delhi": {
    id: "nit-delhi",
    name: "NIT-D",
    fullName: "National Institute of Technology Delhi",
    image: "/NIT.jpg",
    location: "New Delhi",
  },

  // sport/category campuses
  Cricket: {
    id: "Cricket",
    name: "Cricket",
    fullName: "Cricket",
    image: "/win.svg",
    location: "New Delhi",
  },
  Hockey: {
    id: "Hockey",
    name: "Hockey",
    fullName: "Hockey",
    image: "/win.svg",
    location: "New Delhi",
  },
  Football: {
    id: "Football",
    name: "Football",
    fullName: "Football",
    image: "/win.svg",
    location: "New Delhi",
  },
  Boxing: {
    id: "Boxing",
    name: "Boxing",
    fullName: "Boxing",
    image: "/win.svg",
    location: "New Delhi",
  },
  Tennis: {
    id: "Tennis",
    name: "Tennis",
    fullName: "Tennis",
    image: "/win.svg",
    location: "New Delhi",
  },
  Kabbadi: {
    id: "Kabbadi",
    name: "Kabbadi",
    fullName: "Kabbadi",
    image: "/win.svg",
    location: "New Delhi",
  },

  // artist entries referenced by event slugs
  "diljit-dosanjh": {
    id: "diljit-dosanjh",
    name: "Diljit Dosanjh",
    fullName: "Diljit Dosanjh",
    image: "/diljit.svg",
    location: "New Delhi",
  },
  "karan-aujla": {
    id: "karan-aujla",
    name: "Karan Aujla",
    fullName: "Karan Aujla",
    image: "/aujla.svg",
    location: "New Delhi",
  },
  punjabi: {
    id: "punjabi",
    name: "Punjabi",
    fullName: "Punjabi Music",
    image: "/punjabi.svg",
    location: "New Delhi",
  },
  "yo-yo-prateek": {
    id: "yo-yo-prateek",
    name: "Yo YO Prateek",
    fullName: "Yo YO Prateek",
    image: "/prateek.svg",
    location: "New Delhi",
  },
  "samay-raina": {
    id: "samay-raina",
    name: "Samay Raina",
    fullName: "Samay Raina",
    image: "/samay.svg",
    location: "New Delhi",
  },
  tamil: {
    id: "tamil",
    name: "Tamil",
    fullName: "Tamil Music",
    image: "/punjabi.svg",
    location: "New Delhi",
  },
  english: {
    id: "english",
    name: "English",
    fullName: "English Music",
    image: "/punjabi.svg",
    location: "New Delhi",
  },
  hindi: {
    id: "hindi",
    name: "Hindi",
    fullName: "Hindi Music",
    image: "/punjabi.svg",
    location: "New Delhi",
  },
};

export function normalizeSlug(s: string) {
  return s.replace(/[^a-z0-9\-]/gi, "").toLowerCase();
}

export function getCampusById(id?: string) {
  if (!id) return undefined;
  const direct = campusData[id];
  if (direct) return direct;
  const target = normalizeSlug(id);
  const found = Object.keys(campusData).find(
    (k) => normalizeSlug(k) === target,
  );
  return found ? campusData[found] : undefined;
}
