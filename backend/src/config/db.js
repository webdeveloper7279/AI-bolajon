import mongoose from "mongoose";

const DEFAULT_URI = "mongodb://localhost:27017/ai-bolajon";

export async function connectDB() {
  const uri = process.env.MONGODB_URI || DEFAULT_URI;

  if (!uri || uri.includes("cluster.mongodb.net") || uri.includes("username:password")) {
    console.error(
      "\n❌ MONGODB_URI is missing or still using placeholder.\n" +
        "   For MongoDB Atlas: use your real cluster hostname from Atlas Dashboard → Connect → Drivers.\n" +
        "   Example: mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/DBNAME?retryWrites=true&w=majority\n"
    );
    throw new Error("Invalid or placeholder MONGODB_URI");
  }

  const options = {
    serverSelectionTimeoutMS: 10000,
    retryWrites: true,
    w: "majority",
  };

  try {
    await mongoose.connect(uri, options);
    console.log("✅ MongoDB connected");
  } catch (err) {
    const message = err.message || "";
    if (message.includes("ENOTFOUND") || message.includes("querySrv")) {
      console.error(
        "\n❌ MongoDB connection failed: could not resolve cluster hostname.\n" +
          "   • Check that MONGODB_URI uses your actual Atlas cluster host (e.g. cluster0.xxxxx.mongodb.net).\n" +
          "   • Get it from: Atlas → your cluster → Connect → Drivers → copy connection string.\n" +
          "   • Ensure username/password are URL-encoded if they contain special characters (@ # : / etc.).\n"
      );
    } else if (message.includes("auth failed") || message.includes("Authentication failed")) {
      console.error(
        "\n❌ MongoDB authentication failed.\n" +
          "   • Check username and password in MONGODB_URI.\n" +
          "   • In Atlas: Database Access → user must have read/write permissions.\n" +
          "   • Encode special characters in password: @ → %40, # → %23, : → %3A, / → %2F\n"
      );
    } else {
      console.error("\n❌ MongoDB connection error:", message);
    }
    throw err;
  }
}
