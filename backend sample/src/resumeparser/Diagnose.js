#!/usr/bin/env node

/**
 * Diagnostic script to test Gemini API configuration and timeout settings
 * Run with: node diagnose.js
 */

const { getGeminiStatus } = require("./resumeparser");

console.log("=".repeat(60));
console.log("GEMINI API DIAGNOSTIC TOOL");
console.log("=".repeat(60));
console.log();

// Check Gemini configuration
const status = getGeminiStatus();

console.log("📋 Configuration Status:");
console.log("  ✓ API Key Configured:", status.configured ? "✅ YES" : "❌ NO");
console.log("  ✓ Key Source:", status.keySource);
console.log("  ✓ Gemini Enabled:", status.enabled ? "✅ YES" : "❌ NO");
console.log(
  "  ✓ Timeout:",
  `${status.timeoutMs}ms (${status.timeoutMs / 1000}s)`,
);
console.log("  ✓ Available Models:", status.modelCandidates.join(", "));
console.log();

if (status.unsupportedModels.length > 0) {
  console.log("⚠️  Unsupported Models:", status.unsupportedModels.join(", "));
  console.log();
}

if (status.rateLimitedUntil) {
  console.log("🚫 Rate Limited Until:", status.rateLimitedUntil);
  console.log();
}

// Provide recommendations
console.log("💡 Recommendations:");

if (!status.configured) {
  console.log("  ❌ API key not configured!");
  console.log(
    "     Set GEMINI_API_KEY environment variable or add to config.yaml",
  );
  console.log("     Get your key at: https://makersuite.google.com/app/apikey");
}

if (status.timeoutMs < 30000) {
  console.log("  ⚠️  Timeout is low (< 30s)");
  console.log("     Consider increasing: export GEMINI_TIMEOUT_MS=30000");
}

if (status.timeoutMs >= 30000) {
  console.log("  ✅ Timeout is adequate (>= 30s)");
}

if (status.configured && status.enabled) {
  console.log("  ✅ System is ready for resume processing");
}

console.log();
console.log("=".repeat(60));
console.log();

// Test API with a simple request
if (status.configured && status.enabled) {
  console.log("🧪 Testing API with simple request...");
  console.log();

  const { atsExtractor } = require("./resumeparser");

  const testResume = `
    John Doe
    john.doe@email.com
    555-1234
    
    EXPERIENCE
    Software Engineer at Tech Corp
    2020 - Present
    
    SKILLS
    JavaScript, Python, React
    
    EDUCATION
    B.S. Computer Science
    University of Example, 2020
    GPA: 3.8
  `.trim();

  (async () => {
    try {
      const startTime = Date.now();
      console.log("  Sending test resume to Gemini...");

      const result = await atsExtractor(testResume);
      const duration = Date.now() - startTime;

      console.log(`  ✅ Success! Response received in ${duration}ms`);
      console.log();

      if (result) {
        try {
          const parsed = JSON.parse(result);
          console.log("  📊 Sample parsed data:");
          console.log("    Name:", parsed.full_name || "N/A");
          console.log("    Email:", parsed.email || "N/A");
          console.log("    Phone:", parsed.phone || "N/A");
        } catch (e) {
          console.log("  ⚠️  Response received but could not parse as JSON");
        }
      }

      console.log();
      console.log("=".repeat(60));
      console.log("✅ DIAGNOSTIC COMPLETE - System is working!");
      console.log("=".repeat(60));
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`  ❌ Failed after ${duration}ms`);
      console.log(`  Error: ${error.message}`);
      console.log();
      console.log("  Troubleshooting tips:");

      if (error.message.includes("timeout")) {
        console.log("    • Increase timeout: export GEMINI_TIMEOUT_MS=45000");
        console.log("    • Check your internet connection");
        console.log(
          "    • Try a different model: export GEMINI_MODEL=gemini-1.5-flash",
        );
      } else if (error.message.includes("rate limit")) {
        console.log("    • You've hit the API rate limit");
        console.log("    • Wait a few minutes and try again");
        console.log("    • Check your quota in Google Cloud Console");
      } else if (error.message.includes("API key")) {
        console.log("    • Verify your API key is correct");
        console.log("    • Check billing is enabled in Google Cloud");
        console.log("    • Ensure API key has Gemini API permissions");
      } else {
        console.log("    • Check the error message above");
        console.log(
          "    • Verify Gemini API status: https://status.cloud.google.com/",
        );
        console.log("    • Try running with DEBUG_API_CALLS=true");
      }

      console.log();
      console.log("=".repeat(60));
      console.log("❌ DIAGNOSTIC FAILED - See errors above");
      console.log("=".repeat(60));
    }
  })();
} else {
  console.log("⏭️  Skipping API test (not configured or disabled)");
  console.log();
  console.log("=".repeat(60));
  console.log("⚠️  DIAGNOSTIC COMPLETE - Configuration needed");
  console.log("=".repeat(60));
}
