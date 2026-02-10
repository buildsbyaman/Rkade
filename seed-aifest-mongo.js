import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "rkade";

if (!uri) {
  console.error('Please define the MONGODB_URI environment variable');
  process.exit(1);
}

const generateId = () => new ObjectId();

// AIFEST Seed Data
const aifestData = {
  campus: {
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

  fest: {
    _id: generateId(),
    eventTypeSlug: "fest",
    name: "AIFEST",
    slug: "aifest",
    location: "Chandigarh University, CU Campus",
    description: "India's premier AI Fest uniting passionate innovators with distinguished leaders to collaborate, create, and innovate. Experience immersive hackathons, expert panels, innovation competitions, and skill-driven workshops that fuel next-generation ideas and accelerate breakthroughs in AI. Transform your ideas into impactful solutions at this dynamic confluence of AI Innovation & Impact.",
    landscape_url: "/Assests/aifest-landscape.jpg",
    portrait_url: "/Assests/aifest-portrait.jpg",
    dateFrom: new Date("2026-02-19"),
    dateTo: new Date("2026-02-21"),
    campus: "cu",
    position: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  events: [
    {
      _id: generateId(),
      eventName: "Sandbox - AI Innovation Arena",
      slug: "sandbox-ai-innovation-arena",
      landscapePoster: "/Assests/sandbox.jpg",
      portraitPoster: "/Assests/sandbox.jpg",
      date: new Date("2026-02-19"),
      time: "10:00",
      duration: "1 day",
      ageLimit: "U",
      eventType: "event",
      language: "English",
      category: "Fests",
      campus: "cu",
      fest: "aifest",
      venue: "Chandigarh University - Innovation Arena",
      price: "FREE",
      description:
        "Experience an interactive playground where cutting-edge AI innovations come to life. Explore live demos, prototype testing zones, and hands-on experimentation stations. Engage with pioneering startups, research labs, and tech giants showcasing breakthrough AI solutions. Perfect for innovators, developers, and enthusiasts eager to witness the future of artificial intelligence.",
      performers: "AI Startups, Research Teams, Tech Companies",
      timeline: [
        { id: "1", time: "10:00", title: "Arena Opens - Registration & Welcome", description: "Welcome participants and complete registration process. Get your access badges and event kits. Explore the innovation arena and familiarize yourself with demo zones." },
        { id: "2", time: "11:00", title: "Product Demo Sessions Begin", description: "Interactive demonstrations of cutting-edge AI products and prototypes. Engage directly with innovators and experience live AI solutions in action." },
        { id: "3", time: "13:00", title: "Lunch & Networking Zone", description: "Break for lunch with networking opportunities. Connect with fellow attendees, startups, and industry professionals over informal conversations." },
        { id: "4", time: "14:30", title: "Hands-on Workshop Sessions", description: "Participate in interactive workshops where you can build, test, and experiment with AI tools. Learn from experts through practical coding sessions." },
        { id: "5", time: "16:00", title: "Innovation Showcase & Judging", description: "Witness the best innovations compete for recognition. Expert judges evaluate groundbreaking AI solutions addressing real-world problems." },
        { id: "6", time: "17:30", title: "Closing & Networking", description: "Day concludes with final networking session. Exchange contacts, discuss collaborations, and celebrate innovation achievements." },
      ],
      isTeamEvent: false,
      creatorEmail: "admin@rkade.com",
      registrationStart: new Date("2026-01-22T00:00:00"),
      registrationEnd: new Date("2026-02-18T23:59:00"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "CampusTank - Startup Pitching Battle",
      slug: "campustank-startup-pitching-battle",
      landscapePoster: "/Assests/campus_tank.png",
      portraitPoster: "/Assests/campus_tank.png",
      date: new Date("2026-02-20"),
      time: "14:00",
      duration: "1 day",
      ageLimit: "U",
      eventType: "event",
      language: "English",
      category: "Fests",
      campus: "cu",
      fest: "aifest",
      venue: "Chandigarh University - Main Auditorium",
      price: "FREE",
      description:
        "India’s premier AI fest bringing innovators and industry leaders together to collaborate and create. Dive into hackathons, expert panels, competitions, and hands-on workshops that spark next-gen AI ideas and real-world impact.",
      performers: "Student Founders, Angel Investors, VC Panel, Industry Leaders",
      timeline: [
        { id: "1", time: "14:00", title: "Opening Ceremony & Rules Briefing", description: "Event kicks off with introduction of judges panel, competition rules, and pitch format. Teams prepare for their presentations." },
        { id: "2", time: "14:30", title: "Round 1 - Startup Pitches (10 Teams)", description: "First round featuring 10 promising startups presenting their AI ventures. Each team gets 5 minutes to pitch followed by Q&A from judges." },
        { id: "3", time: "16:00", title: "Break & Networking", description: "Refreshment break allowing teams and audience to network. Judges discuss and shortlist top 5 finalists for the final round." },
        { id: "4", time: "16:30", title: "Final Round - Top 5 Startups", description: "Elite finalists present extended pitches with deeper insights into market strategy, business model, and scalability plans. Intense Q&A session follows." },
        { id: "5", time: "18:00", title: "Judges Deliberation & Audience Q&A", description: "Judges finalize their decisions in closed-door deliberation. Meanwhile, audience engages with teams through interactive Q&A session." },
        { id: "6", time: "18:30", title: "Winner Announcement & Prizes", description: "Grand finale with winners revealed. Top 3 startups receive funding commitments, mentorship opportunities, and cash prizes. Celebration and photo session." },
      ],
      isTeamEvent: true,
      minTeamSize: 1,
      maxTeamSize: 5,
      creatorEmail: "admin@rkade.com",
      registrationStart: new Date("2026-01-22T00:00:00"),
      registrationEnd: new Date("2026-02-19T23:59:00"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      eventName: "InnovFest - AI Solutions Expo",
      slug: "innovfest-ai-solutions-expo",
      landscapePoster: "/Assests/innovfest.jpg",
      portraitPoster: "/Assests/innovfest.jpg",
      date: new Date("2026-02-21"),
      time: "09:00",
      duration: "1 day",
      ageLimit: "U",
      eventType: "event",
      language: "English",
      category: "Fests",
      campus: "cu",
      fest: "aifest",
      venue: "Chandigarh University - Exhibition Complex",
      price: "FREE",
      description:
        "The grand finale showcasing transformative AI solutions addressing real-world challenges. Explore groundbreaking projects from students, researchers, and enterprises spanning healthcare, education, sustainability, and beyond. Network with innovators, attend masterclasses, and celebrate excellence with awards ceremony. Experience the convergence of innovation, impact, and inspiration at AIFEST's spectacular conclusion.",
      performers: "Student Innovators, Research Scholars, Industry Experts, Award Winners",
      timeline: [
        { id: "1", time: "09:00", title: "Expo Opens - Exhibition Setup Complete", description: "Exhibition hall opens with all project booths ready. Early attendees can explore displays before the keynote address begins." },
        { id: "2", time: "10:00", title: "Keynote: Future of AI Innovation", description: "Inspirational keynote from renowned AI leader discussing emerging trends, ethical considerations, and the transformative potential of artificial intelligence." },
        { id: "3", time: "11:30", title: "Project Exhibition & Judging Rounds", description: "Main exhibition phase where students and researchers showcase AI solutions. Expert judges evaluate projects based on innovation, impact, and implementation quality." },
        { id: "4", time: "13:00", title: "Lunch & Networking Session", description: "Catered lunch with dedicated networking zones. Connect with exhibitors, judges, industry leaders, and fellow innovators in relaxed setting." },
        { id: "5", time: "14:30", title: "Masterclass Sessions (Parallel Tracks)", description: "Choose from multiple concurrent masterclasses covering advanced AI topics, practical implementations, career guidance, and startup strategies." },
        { id: "6", time: "16:30", title: "Final Judging & Deliberation", description: "Judges conduct final evaluations and deliberate to determine award winners across multiple categories including Best Innovation, Social Impact, and Technical Excellence." },
        { id: "7", time: "17:30", title: "Grand Awards Ceremony & Closing", description: "AIFEST culminates with spectacular awards ceremony. Winners across all categories receive trophies, certificates, and prizes. Event concludes with closing remarks and call to action for continued innovation." },
      ],
      isTeamEvent: true,
      minTeamSize: 1,
      maxTeamSize: 6,
      creatorEmail: "admin@rkade.com",
      registrationStart: new Date("2026-01-22T00:00:00"),
      registrationEnd: new Date("2026-02-20T23:59:00"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]
};

async function seedAIFEST() {
  const client = new MongoClient(uri);

  try {
    console.log("🔌 Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(dbName);

    // Insert CU Campus into subtypes collection
    console.log("\n🏫 Seeding CU Campus...");
    const subtypesCollection = db.collection("subtypes");
    
    // Check if CU campus already exists
    const existingCampus = await subtypesCollection.findOne({ slug: "cu" });
    
    if (existingCampus) {
      console.log("⚠️  CU Campus already exists. Updating...");
      const { _id, ...campusUpdateData } = aifestData.campus;
      await subtypesCollection.updateOne(
        { slug: "cu" },
        { $set: campusUpdateData }
      );
      console.log("✅ CU Campus updated");
    } else {
      await subtypesCollection.insertOne(aifestData.campus);
      console.log("✅ CU Campus inserted");
    }

    // Insert AIFEST fest into subtypes collection
    console.log("\n🎊 Seeding AIFEST Fest...");
    
    // Check if AIFEST already exists
    const existingFest = await subtypesCollection.findOne({ slug: "aifest" });
    
    if (existingFest) {
      console.log("⚠️  AIFEST fest already exists. Updating...");
      const { _id, ...festUpdateData } = aifestData.fest;
      await subtypesCollection.updateOne(
        { slug: "aifest" },
        { $set: festUpdateData }
      );
      console.log("✅ AIFEST fest updated");
    } else {
      await subtypesCollection.insertOne(aifestData.fest);
      console.log("✅ AIFEST fest inserted");
    }

    // Insert AIFEST events
    console.log("\n🎯 Seeding AIFEST Events...");
    const eventsCollection = db.collection("events");
    
    for (const event of aifestData.events) {
      // Check if event already exists
      const existingEvent = await eventsCollection.findOne({ slug: event.slug });
      
      if (existingEvent) {
        console.log(`⚠️  Event "${event.eventName}" already exists. Updating...`);
        const { _id, ...eventUpdateData } = event;
        await eventsCollection.updateOne(
          { slug: event.slug },
          { $set: eventUpdateData }
        );
        console.log(`✅ Event "${event.eventName}" updated`);
      } else {
        await eventsCollection.insertOne(event);
        console.log(`✅ Event "${event.eventName}" inserted`);
      }
    }

    console.log("\n🎉 AIFEST seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Campus: ${aifestData.campus.name} (${aifestData.campus.location})`);
    console.log(`   - Fest: AIFEST (${aifestData.fest.location})`);
    console.log(`   - Dates: ${aifestData.fest.dateFrom.toLocaleDateString()} - ${aifestData.fest.dateTo.toLocaleDateString()}`);
    console.log(`   - Events: ${aifestData.events.length}`);
    console.log("\n📅 Events Schedule:");
    aifestData.events.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.eventName}`);
      console.log(`      📅 ${event.date.toLocaleDateString()} at ${event.time}`);
      console.log(`      📍 ${event.venue}`);
      console.log(`      👥 Team Event: ${event.isTeamEvent ? 'Yes' : 'No'}`);
    });
    
  } catch (error) {
    console.error("❌ Error seeding AIFEST data:", error);
    throw error;
  } finally {
    await client.close();
    console.log("\n👋 Connection closed");
  }
}

// Run the seed function
seedAIFEST()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export { seedAIFEST, aifestData };