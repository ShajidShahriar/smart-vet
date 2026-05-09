const fs = require('fs');
const https = require('https');

// Read key manually to avoid dependencies
try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const match = env.match(/GEMINI_API_KEY=(.*)/);
    const key = match ? match[1].trim() : null;

    if (!key) {
        console.error("❌ No GEMINI_API_KEY found in .env.local");
        process.exit(1);
    }

    console.log("Checking models for key ending in ..." + key.slice(-4));

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                if (json.error) {
                    console.error("❌ API Error:", json.error.message);
                } else if (json.models) {
                    console.log("\n✅ AVAILABLE MODELS:");
                    console.log("-------------------");
                    json.models.forEach(m => {
                        // filter for models that can generate content
                        if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                            console.log(`• ${m.name.replace('models/', '')}`);
                        }
                    });
                    console.log("\n(Tip: 'gemini-1.5-flash' is usually the best free-tier option)");
                } else {
                    console.log("No models found?", json);
                }
            } catch (e) {
                console.error("Failed to parse response:", data);
            }
        });
    }).on('error', err => {
        console.error("Network Error:", err.message);
    });

} catch (err) {
    console.error("Error reading .env.local:", err.message);
}
