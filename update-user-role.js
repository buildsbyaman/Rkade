import { MongoClient } from "mongodb";

// MongoDB connection
const uri = "mongodb://localhost:27017";
const dbName = "rkade";

// Usage: node update-user-role.js <email> <role>
// Example: node update-user-role.js user@example.com LO
// Available roles: USER, ADMIN, SUPER_ADMIN, LO, MODERATOR

async function updateUserRole() {
  const email = process.argv[2];
  const role = process.argv[3];

  if (!email || !role) {
    console.error("❌ Usage: node update-user-role.js <email> <role>");
    console.log("\n📝 Available roles: USER, ADMIN, SUPER_ADMIN, LO, MODERATOR");
    console.log("\n💡 Example: node update-user-role.js prabhjots933@gmail.com LO");
    process.exit(1);
  }

  const validRoles = ["USER", "ADMIN", "SUPER_ADMIN", "LO", "MODERATOR"];
  if (!validRoles.includes(role.toUpperCase())) {
    console.error(`❌ Invalid role: ${role}`);
    console.log(`📝 Valid roles: ${validRoles.join(", ")}`);
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    console.log("🔌 Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    // Check if user exists
    const user = await usersCollection.findOne({ email });
    
    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`\n📊 Current user details:`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current Role: ${user.role}`);
    console.log(`   New Role: ${role.toUpperCase()}`);

    // Update the role
    const result = await usersCollection.updateOne(
      { email },
      { 
        $set: { 
          role: role.toUpperCase(),
          updatedAt: new Date()
        } 
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`\n✅ Successfully updated role for ${email} to ${role.toUpperCase()}`);
      console.log(`\n💡 User can now access:`);
      
      switch (role.toUpperCase()) {
        case "ADMIN":
        case "SUPER_ADMIN":
          console.log("   - Admin Dashboard (/admin)");
          console.log("   - Event Logistics & Management");
          break;
        case "LO":
        case "MODERATOR":
          console.log("   - Staff Dashboard (/staff/dashboard)");
          console.log("   - Tasks Management (/staff/tasks)");
          console.log("   - Messages (/staff/messages)");
          break;
        case "USER":
          console.log("   - User Dashboard (/dashboard)");
          console.log("   - Event Booking & Registration");
          break;
      }
    } else {
      console.log(`\n⚠️  No changes made (role was already ${role.toUpperCase()})`);
    }

  } catch (error) {
    console.error("❌ Error updating user role:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("\n👋 Connection closed");
  }
}

updateUserRole();
