#!/usr/bin/env tsx

async function triggerSnapshots() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("❌ CRON_SECRET environment variable is required");
    console.log("Add CRON_SECRET=your_secret_token_here to your .env file");
    process.exit(1);
  }

  console.log("🚀 Triggering update-snapshots locally...");
  console.log(`📡 Calling: ${baseUrl}/api/cron/update-snapshots`);
  console.log("=====================================");

  try {
    const response = await fetch(`${baseUrl}/api/cron/update-snapshots`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${cronSecret}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ SUCCESS!");
      console.log("📊 Response:", data);
    } else {
      console.error("❌ FAILED!");
      console.error("Status:", response.status);
      console.error("Response:", data);
    }
  } catch (error) {
    console.error("❌ Error occurred:", error);
  }

  console.log("=====================================");
}

// Run the trigger
triggerSnapshots().catch((error) => {
  console.error("💥 Unexpected error:", error);
  process.exit(1);
});
