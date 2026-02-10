import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "rkade";

if (!uri) {
  console.error('Please define the MONGODB_URI environment variable');
  process.exit(1);
}

const generateId = () => new ObjectId();

const seedData = {
  eventTypes: [
    {
      _id: generateId(),
      name: "Movie",
      slug: "movie",
      isActive: true,
      position: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      name: "Event",
      slug: "event",
      isActive: true,
      position: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      name: "Sports",
      slug: "sports",
      isActive: true,
      position: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      name: "Campus",
      slug: "campus",
      isActive: true,
      position: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      name: "Campus Event",
      slug: "campus-event",
      isActive: true,
      position: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],

  // Categories
  categories: [
    {
      _id: generateId(),
      name: "Hackathons",
      slug: "hackathons",
      isActive: true,
      position: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      name: "Fests",
      slug: "fests",
      isActive: true,
      position: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      name: "Cohorts",
      slug: "cohorts",
      isActive: true,
      position: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      name: "Meetups",
      slug: "meetups",
      isActive: true,
      position: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      name: "Campuses",
      slug: "campuses",
      isActive: true,
      position: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],

  // Languages
  languages: [
    {
      _id: generateId(),
      name: "English",
      slug: "english",
      isActive: true,
      position: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      name: "Hindi",
      slug: "hindi",
      isActive: true,
      position: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      name: "Punjabi",
      slug: "punjabi",
      isActive: true,
      position: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],

  // Age Ratings
  ageRatings: [
    {
      _id: generateId(),
      code: "U",
      name: "Universal",
      slug: "u",
      minAge: 0,
      isActive: true,
      position: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      code: "U/A",
      name: "Parental Guidance",
      slug: "ua",
      minAge: 0,
      isActive: true,
      position: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      code: "A",
      name: "Adults Only",
      slug: "a",
      minAge: 18,
      isActive: true,
      position: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      code: "PG13",
      name: "Parental Guidance 13",
      slug: "pg13",
      minAge: 13,
      isActive: true,
      position: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],

  // Subtypes
  subtypes: [
    // Campus subtypes
    {
      _id: generateId(),
      eventTypeSlug: "campus",
      name: "IIT Delhi",
      slug: "iit-delhi",
      location: "New Delhi",
      portrait_url: "/Assests/c3.jpeg",
      position: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventTypeSlug: "campus",
      name: "CU",
      slug: "cu",
      location: "Chandigarh",
      portrait_url: "/Assests/c2.jpeg",
      position: 2,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventTypeSlug: "campus",
      name: "IIT Bombay",
      slug: "iit-bombay",
      location: "Mumbai",
      portrait_url: "/Assests/c1.jpeg",
      position: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventTypeSlug: "campus",
      name: "BITS Pilani",
      slug: "bits-pilani",
      location: "Pilani",
      portrait_url: "/Assests/c4.jpeg",
      position: 4,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // Movie subtypes
    {
      _id: generateId(),
      eventTypeSlug: "movie",
      name: "Hindi",
      slug: "hindi-movie",
      position: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventTypeSlug: "movie",
      name: "Punjabi",
      slug: "punjabi-movie",
      position: 2,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventTypeSlug: "movie",
      name: "English",
      slug: "english-movie",
      position: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // Sports subtypes
    {
      _id: generateId(),
      eventTypeSlug: "sports",
      name: "Cricket",
      slug: "cricket",
      position: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventTypeSlug: "sports",
      name: "Football",
      slug: "football",
      position: 2,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventTypeSlug: "sports",
      name: "Hockey",
      slug: "hockey",
      position: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // Event subtypes (Artists)
    {
      _id: generateId(),
      eventTypeSlug: "event",
      name: "Diljit Dosanjh",
      slug: "diljit-dosanjh",
      position: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // Fest subtypes
    {
      _id: generateId(),
      eventTypeSlug: "fest",
      name: "Innovfest",
      slug: "innovfest",
      location: "Chandigarh University, CU Campus",
      description: "India's premier AI Fest uniting passionate innovators with distinguished leaders to collaborate, create, and innovate. Experience immersive hackathons, expert panels, innovation competitions, and skill-driven workshops that fuel next-generation ideas and accelerate breakthroughs in AI. Transform your ideas into impactful solutions at this dynamic confluence of AI Innovation & Impact.",
      landscape_url: "/Assests/innovfest.jpg",
      portrait_url: "/Assests/innovfest.jpg",
      dateFrom: new Date("2026-02-21"),
      dateTo: new Date("2026-02-21"),
      campus: "cu",
      position: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventTypeSlug: "fest",
      name: "Sandbox",
      slug: "sandbox",
      location: "CU Campus",
      description: "Experience an interactive playground where cutting-edge AI innovations come to life. Explore live demos, prototype testing zones, and hands-on experimentation stations. Engage with pioneering startups, research labs, and tech giants showcasing breakthrough AI solutions. Perfect for innovators, developers, and enthusiasts eager to witness the future of artificial intelligence.",
      landscape_url: "/Assests/sandbox.jpg",
      portrait_url: "/Assests/sandbox.jpg",
      dateFrom: new Date("2026-02-19"),
      dateTo: new Date("2026-02-19"),
      position: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventTypeSlug: "fest",
      name: "Campus Tank",
      slug: "campus-tank",
      location: "CU Campus",
      description: "India’s premier AI fest bringing innovators and industry leaders together to collaborate and create. Dive into hackathons, expert panels, competitions, and hands-on workshops that spark next-gen AI ideas and real-world impact.",
      landscape_url: "/Assests/campus_tank.png",
      portrait_url: "/Assests/campus_tank.png",
      dateFrom: new Date("2026-02-20"),
      dateTo: new Date("2026-02-20"),
      position: 2,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],

  // Events
  events: [
    {
      _id: generateId(),
      eventName: "AI Hack Matrix - AI for Good: Solutions for Social Impact",
      slug: "ai-hack-matrix-ai-for-good-solutions-for-social-impact",
      landscapePoster: "/Assests/1.jpg",
      portraitPoster: "/Assests/1.jpg",
      date: new Date("2026-02-02"),
      time: "09:00",
      duration: "3 days",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Innovation Hub, RKade Campus",
      price: "FREE",
      description:
        "A premier hackathon focused on developing AI solutions that create positive social impact and address real-world challenges. Dates: 2nd - 4th February 2026. Prizes: ₹2,50,000.",
      performers: "AI & Data Science Department",
      timeline: [
        { id: "1", time: "09:00", activity: "Registration & Welcome Coffee" },
        { id: "2", time: "10:00", activity: "Opening Ceremony & Problem Statement Reveal" },
        { id: "3", time: "11:00", activity: "Hacking Begins - Team Formation" },
        { id: "4", time: "13:00", activity: "Lunch Break" },
        { id: "5", time: "15:00", activity: "Mentor Sessions - Round 1" },
        { id: "6", time: "18:00", activity: "Evening Snacks & Networking" },
        { id: "7", time: "20:00", activity: "Progress Check-in" },
      ],
      pptUrl: "https://docs.google.com/presentation/d/1234567890abcdef/edit?usp=sharing",
      pptTitle: "AI Hack Matrix - Event Overview & Guidelines",
      timelineDocument: {
        url: "https://drive.google.com/file/d/ai-hack-matrix-detailed-schedule/view",
        title: "AI Hack Matrix - Complete 3-Day Schedule",
        type: "pdf"
      },
      isTeamEvent: true,
      minTeamSize: 2,
      maxTeamSize: 5,
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "Genesis-X",
      slug: "genesis-x",
      landscapePoster: "/Assests/2.jpg",
      portraitPoster: "/Assests/2.jpg",
      date: new Date("2026-02-04"),
      time: "09:00",
      duration: "17 days",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Research & Innovation Block",
      price: "FREE",
      description:
        "An extended competition showcasing innovation and cutting-edge solutions. Dates: 4th - 20th February 2026. Prizes: ₹1,50,000.",
      performers: "Innovation Council",
      timeline: [
        { id: "1", time: "09:00", activity: "Day 1: Registration & Orientation" },
        { id: "2", time: "10:30", activity: "Keynote: Future of Innovation" },
        { id: "3", time: "12:00", activity: "Project Ideation Workshop" },
        { id: "4", time: "14:00", activity: "Lunch & Team Collaboration" },
        { id: "5", time: "16:00", activity: "Technical Workshop - Prototyping" },
        { id: "6", time: "18:00", activity: "Day 1 Wrap-up & Announcements" },
      ],
      pptUrl: "https://docs.google.com/presentation/d/genesis-x-overview-2026/edit",
      pptTitle: "Genesis-X Competition Guide & Resources",
      timelineDocument: {
        url: "https://drive.google.com/file/d/genesis-x-17-day-schedule/view",
        title: "Genesis-X 17-Day Complete Event Timeline",
        type: "pdf"
      },
      isTeamEvent: true,
      minTeamSize: 1,
      maxTeamSize: 4,
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "Resilient India",
      slug: "resilient-india",
      landscapePoster: "/Assests/3.jpg",
      portraitPoster: "/Assests/3.jpg",
      date: new Date("2026-02-09"),
      time: "09:00",
      duration: "8 days",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Convention Centre, RKade Campus",
      price: "FREE",
      description:
        "A major event focused on building resilience across various sectors in India, offering valuable certifications and substantial prizes. Dates: 9th - 16th February 2026. Certifications worth ₹1 Crore. Prize Money: ₹3,00,000.",
      performers: "Resilience & Policy Forum",
      timeline: [
        { id: "1", time: "09:00", activity: "Registration & Welcome Address" },
        { id: "2", time: "09:45", activity: "Inaugural Session - Chief Guest Address" },
        { id: "3", time: "11:00", activity: "Panel Discussion: Building Resilient Communities" },
        { id: "4", time: "13:00", activity: "Networking Lunch" },
        { id: "5", time: "14:30", activity: "Workshop Track A: Disaster Management" },
        { id: "6", time: "14:30", activity: "Workshop Track B: Economic Resilience" },
        { id: "7", time: "17:00", activity: "Q&A Session & Day 1 Closing" },
      ],
      pptUrl: "https://docs.google.com/presentation/d/resilient-india-2026/edit",
      pptTitle: "Resilient India 2026 - Program Overview",
      timelineDocument: {
        url: "https://drive.google.com/file/d/resilient-india-full-schedule/view",
        title: "Resilient India - 8-Day Comprehensive Schedule",
        type: "ppt"
      },
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "Apex Ad Sprint",
      slug: "apex-ad-sprint",
      landscapePoster: "/Assests/4.jpg",
      portraitPoster: "/Assests/4.jpg",
      date: null,
      time: "TBA",
      duration: "TBA",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Venue to be announced",
      price: "FREE",
      description:
        "A competitive advertising and marketing challenge. Prizes: To be announced. Dates: Date to be confirmed.",
      performers: "School of Management",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "Nationwide Moot Court 2026",
      slug: "nationwide-moot-court-2026",
      landscapePoster: "/Assests/8.jpg",
      portraitPoster: "/Assests/8.jpg",
      date: new Date("2026-01-23"),
      time: "09:00",
      duration: "4 days",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Law School Auditorium",
      price: "FREE",
      description:
        "A prestigious legal competition bringing together law students from across the nation for mock court proceedings. Dates: 23rd - 26th January 2026. Prizes: ₹2,17,000.",
      performers: "School of Law",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName:
        "Case Verse: International Case Study & Simulation Competition",
      slug: "case-verse-international-case-study-and-simulation-competition",
      landscapePoster: "/Assests/9.jpg",
      portraitPoster: "/Assests/9.jpg",
      date: new Date("2026-02-07"),
      time: "10:00",
      duration: "1 day",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Business School Auditorium",
      price: "FREE",
      description:
        "An international competition featuring business case studies and simulations for strategic problem-solving. Date: 7th February 2026. Prizes: ₹60,000.",
      performers: "School of Business",
      timeline: [
        { id: "1", time: "10:00", activity: "Opening Ceremony & Case Reveal" },
        { id: "2", time: "11:00", activity: "Case Study Session - Team Brainstorming" },
        { id: "3", time: "13:00", activity: "Lunch Break" },
        { id: "4", time: "14:00", activity: "Simulation Round Begins" },
        { id: "5", time: "16:00", activity: "Tea Break & Mentor Feedback" },
        { id: "6", time: "17:00", activity: "Final Presentations" },
        { id: "7", time: "19:00", activity: "Jury Deliberation & Results" },
      ],
      pptUrl: "https://docs.google.com/presentation/d/case-verse-2026/edit",
      pptTitle: "Case Verse - Competition Rules & Case Studies",
      timelineDocument: {
        url: "https://drive.google.com/file/d/case-verse-schedule/view",
        title: "Case Verse Event Flow & Timeline",
        type: "pdf"
      },
      isTeamEvent: true,
      minTeamSize: 3,
      maxTeamSize: 5,
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "PCB InnovateX: Powering the Hardware Revolution",
      slug: "pcb-innovatex-powering-the-hardware-revolution",
      landscapePoster: "/Assests/10.jpg",
      portraitPoster: "/Assests/10.jpg",
      date: new Date("2026-02-20"),
      time: "09:30",
      duration: "2 days",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Engineering Design Center",
      price: "FREE",
      description:
        "A major hardware innovation event focused on PCB design and development, in partnership with ALTIUM. Dates: 20th - 21st February 2026. Prizes: ₹4,45,000.",
      performers: "Department of Electronics (in collaboration with ALTIUM)",
      timeline: [
        { id: "1", time: "09:30", activity: "Registration & ALTIUM Setup" },
        { id: "2", time: "10:30", activity: "Keynote: PCB Design in Modern Hardware" },
        { id: "3", time: "11:30", activity: "ALTIUM Workshop - Basics" },
        { id: "4", time: "13:00", activity: "Lunch Break" },
        { id: "5", time: "14:00", activity: "Hands-on Design Challenge" },
        { id: "6", time: "16:30", activity: "Project Review & Feedback" },
        { id: "7", time: "18:00", activity: "Day 1 Closing & Networking" },
      ],
      pptUrl: "https://docs.google.com/presentation/d/pcb-innovatex-2026/edit",
      pptTitle: "PCB InnovateX - Workshop Materials & Resources",
      timelineDocument: {
        url: "https://drive.google.com/file/d/pcb-innovatex-schedule/view",
        title: "PCB InnovateX 2-Day Schedule & Lab Guide",
        type: "ppt"
      },
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName:
        "Drone Forge: Workshop, Design, Flying and Exposition of Drones",
      slug: "drone-forge-workshop-design-flying-and-exposition-of-drones",
      landscapePoster: "/Assests/5.jpg",
      portraitPoster: "/Assests/5.jpg",
      date: new Date("2026-02-13"),
      time: "09:00",
      duration: "2 days",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Aero Lab & Grounds",
      price: "FREE",
      description:
        "A comprehensive drone event featuring workshops, design challenges, flying demonstrations, and exhibitions. Dates: 13th - 14th February 2026. Prizes: ₹1,00,000.",
      performers: "Aerospace Club",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "Proto War 1.0",
      slug: "proto-war-1-0",
      landscapePoster: "/Assests/6.jpg",
      portraitPoster: "/Assests/6.jpg",
      date: new Date("2026-02-13"),
      time: "10:00",
      duration: "2 days",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Prototype Studio",
      price: "FREE",
      description:
        "A competitive event focused on prototype development and innovation. Dates: 13th - 14th February 2026. Prizes: ₹1,50,000.",
      performers: "Product Innovation Cell",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "Mapathon 2.0",
      slug: "mapathon-2-0",
      landscapePoster: "/Assests/7.jpg",
      portraitPoster: "/Assests/7.jpg",
      date: new Date("2026-01-10"),
      time: "09:00",
      duration: "16 days",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Geospatial Lab",
      price: "FREE",
      description:
        "An extensive mapping competition promoting geospatial data collection and analysis. Dates: 10th - 25th January 2026. Prizes: ₹3,50,000.",
      performers: "Geoinformatics Society",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "Milletverse 2026: Create, Compete, Conquer with Millets",
      slug: "milletverse-2026-create-compete-conquer-with-millets",
      landscapePoster: "/Assests/21.jpg",
      portraitPoster: "/Assests/21.jpg",
      date: new Date("2026-02-13"),
      time: "10:00",
      duration: "1 day",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Food Innovation Lab",
      price: "FREE",
      description:
        "A competition promoting millet-based innovations and sustainable food solutions. Date: 13th February 2026. Prizes: ₹15,000.",
      performers: "Department of Food Science",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName:
        "Revealing the Invisible: Instrumental Chemistry in Environmental Monitoring",
      slug: "revealing-the-invisible-instrumental-chemistry-in-environmental-monitoring",
      landscapePoster: "/Assests/22.jpg",
      portraitPoster: "/Assests/22.jpg",
      date: new Date("2026-02-20"),
      time: "10:00",
      duration: "2 days",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Chemistry Auditorium",
      price: "FREE",
      description:
        "A chemistry-focused event exploring instrumental techniques for environmental analysis and monitoring. Dates: 20th - 21st February 2026. Prizes: ₹10,000.",
      performers: "Department of Chemistry",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "AI Quest: The Mystery Trail 2.0 for Sustainable Environment",
      slug: "ai-quest-the-mystery-trail-2-0-for-sustainable-environment",
      landscapePoster: "/Assests/23.jpg",
      portraitPoster: "/Assests/23.jpg",
      date: new Date("2026-02-20"),
      time: "10:00",
      duration: "2 days",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Green Tech Lab",
      price: "FREE",
      description:
        "An AI-driven challenge focused on solving environmental sustainability puzzles and mysteries. Dates: 20th - 21st February 2026. Prizes: ₹25,000.",
      performers: "Department of Environmental Science",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "PhysX Fusion 2026 - Quiz, AI in Action & Ideathon",
      slug: "physx-fusion-2026-quiz-ai-in-action-and-ideathon",
      landscapePoster: "/Assests/24.jpg",
      portraitPoster: "/Assests/24.jpg",
      date: new Date("2026-02-07"),
      time: "09:30",
      duration: "4 days",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Physics Block",
      price: "FREE",
      description:
        "A multi-format physics event combining quizzing, AI applications, and ideation challenges. Dates: 7th - 10th February 2026. Prizes: ₹24,000.",
      performers: "Department of Physics",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "Robotics Skill Challenge",
      slug: "robotics-skill-challenge",
      landscapePoster: "/Assests/25.jpg",
      portraitPoster: "/Assests/25.jpg",
      date: new Date("2026-02-05"),
      time: "09:00",
      duration: "2 days",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Robotics Lab",
      price: "FREE",
      description:
        "A hands-on robotics competition testing technical skills and innovation. Dates: 5th - 6th February 2026. Prizes: ₹40,000.",
      performers: "Robotics Club",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "Confloat 3.0",
      slug: "confloat-3-0",
      landscapePoster: "/Assests/26.jpg",
      portraitPoster: "/Assests/26.jpg",
      date: new Date("2026-02-19"),
      time: "09:00",
      duration: "2 days",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Civil Engineering Workshop",
      price: "FREE",
      description:
        "A construction and engineering challenge event. Dates: 19th - 20th February 2026. Prizes: ₹10,000.",
      performers: "Department of Civil Engineering",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "Tech4SDG Ideathon 2.0",
      slug: "tech4sdg-ideathon-2-0",
      landscapePoster: "/Assests/27.jpg",
      portraitPoster: "/Assests/27.jpg",
      date: new Date("2026-02-20"),
      time: "10:00",
      duration: "2 days",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Innovation Hall",
      price: "FREE",
      description:
        "An ideation competition focused on technology solutions for Sustainable Development Goals. Dates: 20th - 21st February 2026. Prizes: ₹25,000.",
      performers: "Department of Computer Applications",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "Future Build Innovation Pitch Competition",
      slug: "future-build-innovation-pitch-competition",
      landscapePoster: "/Assests/28.jpg",
      portraitPoster: "/Assests/28.jpg",
      date: new Date("2026-02-20"),
      time: "10:00",
      duration: "2 days",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Architecture Studio",
      price: "FREE",
      description:
        "A pitch competition for innovative building and construction solutions, in collaboration with ASHRAE–PEDA. Dates: 20th - 21st February 2026. Prizes: ₹10,000.",
      performers:
        "Department of Architecture (in Collaboration with ASHRAE–PEDA)",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "Bio-Circular Innovation Sprint",
      slug: "bio-circular-innovation-sprint",
      landscapePoster: "/Assests/29.jpg",
      portraitPoster: "/Assests/29.jpg",
      date: new Date("2026-02-20"),
      time: "10:00",
      duration: "2 days",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Biotech Lab",
      price: "FREE",
      description:
        "A sprint-format competition focused on bio-circular economy innovations. Dates: 20th - 21st February 2026. Prizes: ₹10,000.",
      performers: "Department of Biotechnology",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "CodeRelay 2.0",
      slug: "coderelay-2-0",
      landscapePoster: "/Assests/29.jpg",
      portraitPoster: "/Assests/29.jpg",
      date: new Date("2026-02-20"),
      time: "09:00",
      duration: "2 days",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Computer Lab 1",
      price: "FREE",
      description:
        "A team-based coding relay competition testing programming skills and collaboration. Dates: 20th - 21st February 2026. Prizes: ₹30,000.",
      performers: "Coding Club",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "Hovermania",
      slug: "hovermania",
      landscapePoster: "/Assests/12.jpg",
      portraitPoster: "/Assests/12.jpg",
      date: new Date("2026-02-20"),
      time: "09:00",
      duration: "2 days",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Mechanical Workshop",
      price: "FREE",
      description:
        "A competition focused on hovercraft design and technology. Dates: 20th - 21st February 2026. Prizes: ₹18,000.",
      performers: "Department of Mechanical Engineering",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "Tech for Truth: AI in Criminal Investigations and Beyond",
      slug: "tech-for-truth-ai-in-criminal-investigations-and-beyond",
      landscapePoster: "/Assests/31.jpg",
      portraitPoster: "/Assests/31.jpg",
      date: new Date("2026-02-20"),
      time: "10:00",
      duration: "2 days",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Forensics Lab",
      price: "FREE",
      description:
        "Exploring the application of AI technology in forensics and criminal investigation. Dates: 20th - 21st February 2026. Prizes: ₹5,000.",
      performers: "Department of Forensic Science",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "Innovative Healthy Street Foods",
      slug: "innovative-healthy-street-foods",
      landscapePoster: "/Assests/14.jpg",
      portraitPoster: "/Assests/14.jpg",
      date: new Date("2026-02-20"),
      time: "10:00",
      duration: "2 days",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Culinary Lab",
      price: "FREE",
      description:
        "A culinary innovation challenge focused on creating healthy street food alternatives. Dates: 20th - 21st February 2026. Prizes: ₹5,000.",
      performers: "Department of Culinary Arts",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "Virtual Patient Journey Challenge",
      slug: "virtual-patient-journey-challenge",
      landscapePoster: "/Assests/15.jpg",
      portraitPoster: "/Assests/15.jpg",
      date: new Date("2026-02-20"),
      time: "10:00",
      duration: "2 days",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Health Sciences Simulation Lab",
      price: "FREE",
      description:
        "A healthcare simulation competition focusing on patient care pathways. Dates: 20th - 21st February 2026. Prizes: To be announced.",
      performers: "School of Health Sciences",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "Pharma-Manthan 1.0",
      slug: "pharma-manthan-1-0",
      landscapePoster: "/Assests/16.jpg",
      portraitPoster: "/Assests/16.jpg",
      date: new Date("2026-02-20"),
      time: "10:00",
      duration: "2 days",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Pharmacy Block",
      price: "FREE",
      description:
        "A pharmaceutical sciences competition and knowledge challenge. Dates: 20th - 21st February 2026. Prizes: ₹18,000.",
      performers: "Department of Pharmacy",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "ShelterGenius",
      slug: "sheltergenius",
      landscapePoster: "/Assests/18.jpg",
      portraitPoster: "/Assests/18.jpg",
      date: new Date("2026-02-06"),
      time: "10:00",
      duration: "1 day",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Architecture Studio",
      price: "FREE",
      description:
        "An architecture and shelter design innovation competition. Date: 6th February 2026. Prizes: ₹30,000.",
      performers: "Department of Architecture",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "TechCouture: Fashion Meets Innovation (Fashion Show)",
      slug: "techcouture-fashion-meets-innovation-fashion-show",
      landscapePoster: "/Assests/17.jpg",
      portraitPoster: "/Assests/17.jpg",
      date: new Date("2026-02-20"),
      time: "17:00",
      duration: "2 days",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Fashion Runway Hall",
      price: "FREE",
      description:
        "A fashion show combining technology and haute couture for innovative wearable designs. Dates: 20th - 21st February 2026. Prizes: ₹23,000.",
      performers: "Department of Fashion Technology",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "Learning Carnival 2026: Celebrating Creative Classrooms",
      slug: "learning-carnival-2026-celebrating-creative-classrooms",
      landscapePoster: "/Assests/32.jpg",
      portraitPoster: "/Assests/32.jpg",
      date: new Date("2026-02-20"),
      time: "10:00",
      duration: "2 days",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Education Block",
      price: "FREE",
      description:
        "An educational event showcasing innovative teaching methodologies and creative classroom practices. Dates: 20th - 21st February 2026. Prizes: To be announced.",
      performers: "Department of Education",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName:
        "Synergy AI Summit 2026: Unleashing AI-Powered Strategic HR Excellence",
      slug: "synergy-ai-summit-2026-unleashing-ai-powered-strategic-hr-excellence",
      landscapePoster: "/Assests/33.jpg",
      portraitPoster: "/Assests/33.jpg",
      date: new Date("2026-02-07"),
      time: "09:30",
      duration: "2 days",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "HR Innovation Hall",
      price: "FREE",
      description:
        "A summit exploring AI applications in human resources and strategic management. Dates: 7th - 8th February 2026. Prizes: ₹24,000.",
      performers: "School of Management",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "Chef de Campus",
      slug: "chef-de-campus",
      landscapePoster: "/Assests/34.jpg",
      portraitPoster: "/Assests/34.jpg",
      date: new Date("2026-02-11"),
      time: "11:00",
      duration: "1 day",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Culinary Arena",
      price: "FREE",
      description:
        "A culinary competition showcasing cooking skills and creativity. Date: 11th February 2026. Prizes: ₹26,000.",
      performers: "Culinary Arts Department",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "Itinerary Innovator Challenge",
      slug: "itinerary-innovator-challenge",
      landscapePoster: "/Assests/19.jpg",
      portraitPoster: "/Assests/19.jpg",
      date: new Date("2026-02-19"),
      time: "10:00",
      duration: "1 day",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Tourism & Hospitality Lab",
      price: "FREE",
      description:
        "A travel and tourism planning competition focused on creating innovative itineraries. Date: 19th February 2026. Prizes: ₹44,000.",
      performers: "Department of Tourism Studies",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "Vanity Cup",
      slug: "vanity-cup",
      landscapePoster: "/Assests/35.jpg",
      portraitPoster: "/Assests/35.jpg",
      date: new Date("2026-02-18"),
      time: "15:00",
      duration: "1 day",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Beauty & Grooming Studio",
      price: "FREE",
      description:
        "A beauty and grooming competition event. Date: 18th February 2026. Prizes: ₹15,000.",
      performers: "Department of Cosmetology",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "Wealthcraft Challenge 2.0",
      slug: "wealthcraft-challenge-2-0",
      landscapePoster: "/Assests/20.jpg",
      portraitPoster: "/Assests/20.jpg",
      date: new Date("2026-02-09"),
      time: "10:00",
      duration: "1 day",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Finance Lab",
      price: "FREE",
      description:
        "A financial planning and wealth management competition. Date: 9th February 2026. Prizes: ₹35,000.",
      performers: "Department of Finance",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "Think Like an Economist 5.0",
      slug: "think-like-an-economist-5-0",
      landscapePoster: "/Assests/36.jpg",
      portraitPoster: "/Assests/36.jpg",
      date: new Date("2026-02-19"),
      time: "10:00",
      duration: "2 days",
      ageLimit: "U",
      eventType: "campus-event",
      language: "English",
      category: "",
      campus: "cu",
      fest: "innovfest",
      venue: "Economics Seminar Hall",
      price: "FREE",
      description:
        "An economics challenge testing analytical thinking and economic problem-solving skills. Dates: 19th - 20th February 2026. Prizes: To be announced.",
      performers: "Department of Economics",
      creatorEmail: "admin@rkade.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  
  ],

  // Users
  users: [
    {
      _id: generateId(),
      email: "student1@campus.edu",
      password: "$2a$12$example.hash.for.demo",
      firstName: "John",
      lastName: "Doe",
      countryCode: "+1",
      phoneNumber: "555-0101",
      country: "USA",
      currentCity: "Campus City",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      email: "student2@campus.edu",
      password: "$2a$12$example.hash.for.demo",
      firstName: "Jane",
      lastName: "Smith",
      countryCode: "+1",
      phoneNumber: "555-0102",
      country: "USA",
      currentCity: "Campus City",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      email: "student3@campus.edu",
      password: "$2a$12$example.hash.for.demo",
      firstName: "Mike",
      lastName: "Johnson",
      countryCode: "+1",
      phoneNumber: "555-0103",
      country: "USA",
      currentCity: "Campus City",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      email: "alice.smith@campus.edu",
      password: "$2a$12$example.hash.for.demo",
      firstName: "Alice",
      lastName: "Smith",
      countryCode: "+1",
      phoneNumber: "555-0104",
      country: "USA",
      currentCity: "Campus City",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      email: "bob.jones@campus.edu",
      password: "$2a$12$example.hash.for.demo",
      firstName: "Bob",
      lastName: "Jones",
      countryCode: "+1",
      phoneNumber: "555-0105",
      country: "USA",
      currentCity: "Campus City",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      email: "charlie.brown@campus.edu",
      password: "$2a$12$example.hash.for.demo",
      firstName: "Charlie",
      lastName: "Brown",
      countryCode: "+1",
      phoneNumber: "555-0106",
      country: "USA",
      currentCity: "Campus City",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      email: "diana.wilson@campus.edu",
      password: "$2a$12$example.hash.for.demo",
      firstName: "Diana",
      lastName: "Wilson",
      countryCode: "+1",
      phoneNumber: "555-0107",
      country: "USA",
      currentCity: "Campus City",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      email: "eve.garcia@campus.edu",
      password: "$2a$12$example.hash.for.demo",
      firstName: "Eve",
      lastName: "Garcia",
      countryCode: "+1",
      phoneNumber: "555-0108",
      country: "USA",
      currentCity: "Campus City",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      email: "frank.miller@campus.edu",
      password: "$2a$12$example.hash.for.demo",
      firstName: "Frank",
      lastName: "Miller",
      countryCode: "+1",
      phoneNumber: "555-0109",
      country: "USA",
      currentCity: "Campus City",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      email: "admin@campus.edu",
      password: "$2a$12$example.hash.for.demo",
      firstName: "Admin",
      lastName: "User",
      countryCode: "+1",
      phoneNumber: "555-0100",
      country: "USA",
      currentCity: "Campus City",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      email: "sports@campus.edu",
      password: "$2a$12$example.hash.for.demo",
      firstName: "Sports",
      lastName: "Coordinator",
      countryCode: "+1",
      phoneNumber: "555-0200",
      country: "USA",
      currentCity: "Campus City",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      email: "cs@campus.edu",
      password: "$2a$12$example.hash.for.demo",
      firstName: "CS",
      lastName: "Department",
      countryCode: "+1",
      phoneNumber: "555-0300",
      country: "USA",
      currentCity: "Campus City",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      email: "biz@campus.edu",
      password: "$2a$12$example.hash.for.demo",
      firstName: "Business",
      lastName: "Department",
      countryCode: "+1",
      phoneNumber: "555-0400",
      country: "USA",
      currentCity: "Campus City",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      email: "culture@campus.edu",
      password: "$2a$12$example.hash.for.demo",
      firstName: "Cultural",
      lastName: "Committee",
      countryCode: "+1",
      phoneNumber: "555-0500",
      country: "USA",
      currentCity: "Campus City",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      email: "admin@rkade.com",
      password: "$2a$12$example.hash.for.demo",
      firstName: "Rkade",
      lastName: "Admin",
      countryCode: "+91",
      phoneNumber: "999-999-9999",
      country: "India",
      currentCity: "Delhi",
      role: "SUPER_ADMIN",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Logistics Officers
    {
      _id: generateId(),
      email: "prabhjots933@gmail.com",
      password: "$2a$12$example.hash.for.demo",
      firstName: "Prabhjot",
      lastName: "Singh",
      countryCode: "+91",
      phoneNumber: "987-654-3210",
      country: "India",
      currentCity: "Delhi",
      role: "LO",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      email: "raj.kumar@rkade.com",
      password: "$2a$12$example.hash.for.demo",
      firstName: "Raj",
      lastName: "Kumar",
      countryCode: "+91",
      phoneNumber: "981-234-5678",
      country: "India",
      currentCity: "Delhi",
      role: "LO",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      email: "priya.sharma@rkade.com",
      password: "$2a$12$example.hash.for.demo",
      firstName: "Priya",
      lastName: "Sharma",
      countryCode: "+91",
      phoneNumber: "982-234-5678",
      country: "India",
      currentCity: "Mumbai",
      role: "LO",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      email: "amit.patel@rkade.com",
      password: "$2a$12$example.hash.for.demo",
      firstName: "Amit",
      lastName: "Patel",
      countryCode: "+91",
      phoneNumber: "983-234-5678",
      country: "India",
      currentCity: "Bangalore",
      role: "LO",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Moderators
    {
      _id: generateId(),
      email: "sarah.johnson@rkade.com",
      password: "$2a$12$example.hash.for.demo",
      firstName: "Sarah",
      lastName: "Johnson",
      countryCode: "+91",
      phoneNumber: "984-234-5678",
      country: "India",
      currentCity: "Delhi",
      role: "MODERATOR",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      email: "vikram.singh@rkade.com",
      password: "$2a$12$example.hash.for.demo",
      firstName: "Vikram",
      lastName: "Singh",
      countryCode: "+91",
      phoneNumber: "985-234-5678",
      country: "India",
      currentCity: "Pune",
      role: "MODERATOR",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      email: "neha.gupta@rkade.com",
      password: "$2a$12$example.hash.for.demo",
      firstName: "Neha",
      lastName: "Gupta",
      countryCode: "+91",
      phoneNumber: "986-234-5678",
      country: "India",
      currentCity: "Chennai",
      role: "MODERATOR",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
};

// Function to seed the database
async function seedDatabase() {
  const client = new MongoClient(uri);

  try {
    console.log("🔌 Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(dbName);

    // Drop existing collections (optional - remove if you want to preserve existing data)
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      console.log(`🗑️  Dropping collection: ${collection.name}`);
      await db.collection(collection.name).drop();
    }

    // Create indexes and seed data
    console.log("\n📊 Seeding Event Types...");
    const eventTypesCollection = db.collection("eventTypes");
    await eventTypesCollection.createIndex({ slug: 1 }, { unique: true });
    await eventTypesCollection.insertMany(seedData.eventTypes);
    console.log(`✅ Inserted ${seedData.eventTypes.length} event types`);

    console.log("\n📊 Seeding Categories...");
    const categoriesCollection = db.collection("categories");
    await categoriesCollection.createIndex({ slug: 1 }, { unique: true });
    await categoriesCollection.insertMany(seedData.categories);
    console.log(`✅ Inserted ${seedData.categories.length} categories`);

    console.log("\n📊 Seeding Languages...");
    const languagesCollection = db.collection("languages");
    await languagesCollection.createIndex({ slug: 1 }, { unique: true });
    await languagesCollection.insertMany(seedData.languages);
    console.log(`✅ Inserted ${seedData.languages.length} languages`);

    console.log("\n📊 Seeding Age Ratings...");
    const ageRatingsCollection = db.collection("ageRatings");
    await ageRatingsCollection.createIndex({ slug: 1 }, { unique: true });
    await ageRatingsCollection.createIndex({ code: 1 }, { unique: true });
    await ageRatingsCollection.insertMany(seedData.ageRatings);
    console.log(`✅ Inserted ${seedData.ageRatings.length} age ratings`);

    console.log("\n📊 Seeding Subtypes...");
    const subtypesCollection = db.collection("subtypes");
    await subtypesCollection.createIndex({ slug: 1 }, { unique: true });
    await subtypesCollection.createIndex({ eventTypeSlug: 1 });
    await subtypesCollection.insertMany(seedData.subtypes);
    console.log(`✅ Inserted ${seedData.subtypes.length} subtypes`);

    console.log("\n📊 Seeding Events...");
    const eventsCollection = db.collection("events");
    await eventsCollection.createIndex({ slug: 1 }, { unique: true });
    await eventsCollection.createIndex({ eventType: 1 });
    await eventsCollection.createIndex({ category: 1 });
    await eventsCollection.createIndex({ date: 1 });
    await eventsCollection.createIndex({ creatorEmail: 1 });
    await eventsCollection.insertMany(seedData.events);
    console.log(`✅ Inserted ${seedData.events.length} events`);

    console.log("\n📊 Seeding Users...");
    const usersCollection = db.collection("users");
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.insertMany(seedData.users);
    console.log(`✅ Inserted ${seedData.users.length} users`);

    // Create teams collection with sample data
    console.log("\n📊 Creating Teams collection...");
    const teamsCollection = db.collection("teams");
    await teamsCollection.createIndex({ teamCode: 1 }, { unique: true });
    await teamsCollection.createIndex({ eventId: 1 });

    // Get event IDs for team events
    const hackathonEvent = await eventsCollection.findOne({
      slug: "campus-hackathon-2025",
    });

    if (hackathonEvent) {
      const sampleTeams = [
        {
          _id: generateId(),
          eventId: hackathonEvent._id,
          teamName: "Code Warriors",
          teamCode: "CW2024",
          creatorEmail: "student1@campus.edu",
          members: [
            { userEmail: "student1@campus.edu", joinedAt: new Date() },
            { userEmail: "alice.smith@campus.edu", joinedAt: new Date() },
            { userEmail: "bob.jones@campus.edu", joinedAt: new Date() },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: generateId(),
          eventId: hackathonEvent._id,
          teamName: "Tech Innovators",
          teamCode: "TI2024",
          creatorEmail: "student2@campus.edu",
          members: [
            { userEmail: "student2@campus.edu", joinedAt: new Date() },
            { userEmail: "charlie.brown@campus.edu", joinedAt: new Date() },
            { userEmail: "diana.wilson@campus.edu", joinedAt: new Date() },
            { userEmail: "eve.garcia@campus.edu", joinedAt: new Date() },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: generateId(),
          eventId: hackathonEvent._id,
          teamName: "Binary Builders",
          teamCode: "BB2024",
          creatorEmail: "student3@campus.edu",
          members: [
            { userEmail: "student3@campus.edu", joinedAt: new Date() },
            { userEmail: "frank.miller@campus.edu", joinedAt: new Date() },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      await teamsCollection.insertMany(sampleTeams);
      console.log(`✅ Inserted ${sampleTeams.length} teams`);
    }

    // Create bookings collection
    console.log("\n📊 Creating Bookings collection...");
    const bookingsCollection = db.collection("bookings");
    await bookingsCollection.createIndex({ eventId: 1 });
    await bookingsCollection.createIndex({ userId: 1 });
    console.log("✅ Bookings collection created");

    // Create staff assignments collection (empty - admins will create assignments)
    console.log("\n📊 Creating Staff Assignments collection...");
    const assignmentsCollection = db.collection("assignments");
    await assignmentsCollection.createIndex({ eventId: 1 });
    await assignmentsCollection.createIndex({ userId: 1 });
    console.log("✅ Assignments collection created (empty - ready for admin use)");

    // Create tasks collection (empty - admins will create tasks)
    console.log("\n📊 Creating Tasks collection...");
    const tasksCollection = db.collection("tasks");
    await tasksCollection.createIndex({ eventId: 1 });
    await tasksCollection.createIndex({ assignedTo: 1 });
    await tasksCollection.createIndex({ status: 1 });
    console.log("✅ Tasks collection created (empty - ready for admin use)");

    // Create messages collection (empty - admins will send messages)
    console.log("\n📊 Creating Messages collection...");
    const messagesCollection = db.collection("messages");
    await messagesCollection.createIndex({ senderId: 1 });
    await messagesCollection.createIndex({ recipientId: 1 });
    await messagesCollection.createIndex({ eventId: 1 });
    await messagesCollection.createIndex({ senderEmail: 1, createdAt: -1 });
    await messagesCollection.createIndex({ recipientEmail: 1, createdAt: -1 });
    await messagesCollection.createIndex({ isBroadcast: 1, createdAt: -1 });
    console.log("✅ Messages collection created (empty - ready for staff messaging)");

    // Create community_messages collection (empty - users will chat in event communities)
    console.log("\n📊 Creating Community Messages collection...");
    const communityMessagesCollection = db.collection("community_messages");
    await communityMessagesCollection.createIndex({ eventId: 1, createdAt: 1 });
    await communityMessagesCollection.createIndex({ userEmail: 1 });
    console.log("✅ Community Messages collection created (empty - ready for community chat)");

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Event Types: ${seedData.eventTypes.length}`);
    console.log(`   - Categories: ${seedData.categories.length}`);
    console.log(`   - Languages: ${seedData.languages.length}`);
    console.log(`   - Age Ratings: ${seedData.ageRatings.length}`);
    console.log(`   - Subtypes: ${seedData.subtypes.length}`);
    console.log(`   - Events: ${seedData.events.length}`);
    console.log(`   - Users: ${seedData.users.length} (includes 4 LOs and 3 Moderators)`);
    console.log(`   - Teams: 3 (for hackathon event)`);
    console.log(`   - Staff Assignments: 0 (ready for admin to create)`);
    console.log(`   - Tasks: 0 (ready for admin to create)`);
    console.log(`   - Messages: 0 (ready for admin to send)`);
    console.log("\n📚 Collections created:");
    console.log("   - eventTypes");
    console.log("   - categories");
    console.log("   - languages");
    console.log("   - ageRatings");
    console.log("   - subtypes");
    console.log("   - events");
    console.log("   - users");
    console.log("   - teams");
    console.log("   - bookings");
    console.log("   - assignments (empty)");
    console.log("   - tasks (empty)");
    console.log("   - messages (empty)");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await client.close();
    console.log("\n👋 Connection closed");
  }
}

// Run the seed function
// Run the seed function
seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export { seedDatabase, seedData };
