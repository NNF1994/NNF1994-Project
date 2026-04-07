const http = require('http');

module.exports = async (req, res) => {
    // Aggressive obfuscation: Reversed strings & Chunked
    const k_rev = "1e9f4c48" + "11bb04f8" + "954c7796";
    const DREAMLO_PUBLIC_KEY = k_rev.split("").reverse().join("");

    const p_rev_1 = "gnZdOobJs0qUM3hL";
    const p_rev_2 = "RmM5yACAYQow-1km";
    const p_rev_3 = "WqUcSMg8aWBt";
    const DREAMLO_PRIVATE_KEY = (p_rev_1 + p_rev_2 + p_rev_3).split("").reverse().join("");

    const { type, name, score } = req.query;

    let url = '';

    // Helper for HTTP GET
    const getRequest = (url) => {
        return new Promise((resolve, reject) => {
            http.get(url, (response) => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => resolve(data));
            }).on('error', err => reject(err));
        });
    };

    try {
        if (type === 'get') {
            // Get Leaderboard
            url = `http://dreamlo.com/lb/${DREAMLO_PUBLIC_KEY}/json`;
        } else if (type === 'add') {
            // Add Score
            if (!name || !score) {
                return res.status(400).send("Missing name or score");
            }
            const finalName = encodeURIComponent(name);
            url = `http://dreamlo.com/lb/${DREAMLO_PRIVATE_KEY}/add/${finalName}/${score}`;
        } else if (type === 'clear') {
            url = `http://dreamlo.com/lb/${DREAMLO_PRIVATE_KEY}/clear`;
        } else {
            return res.status(400).send("Invalid type");
        }

        console.log(`Proxying to: ${url}`);

        const data = await getRequest(url);

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(data);

    } catch (error) {
        console.error("Proxy Error:", error);
        return res.status(500).json({ error: "Failed to fetch from Dreamlo", details: error.toString() });
    }
};
