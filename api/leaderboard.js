const http = require('http');

module.exports = async (req, res) => {
    // Aggressive obfuscation: Reversed strings & Chunked
    const k_rev = "1e9f4c48" + "11bb04f8" + "954c7796";
    const PUBLIC_KEY = k_rev.split("").reverse().join("");

    const p_rev_1 = "gnZdOobJs0qUM3hL";
    const p_rev_2 = "RmM5yACAYQow-1km";
    const p_rev_3 = "WqUcSMg8aWBt";
    const PRIVATE_KEY = (p_rev_1 + p_rev_2 + p_rev_3).split("").reverse().join("");
    const BASE_URL = "http://dreamlo.com/lb";

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // GET REQUEST: Fetch Scores
        if (req.method === 'GET') {
            const url = `${BASE_URL}/${PUBLIC_KEY}/json`;
            return new Promise((resolve, reject) => {
                http.get(url, (response) => {
                    let data = '';
                    response.on('data', chunk => data += chunk);
                    response.on('end', () => {
                        res.status(200).send(data);
                        resolve();
                    });
                }).on('error', (err) => {
                    res.status(500).json(err);
                    resolve();
                });
            });
        }

        // POST REQUEST: Submit Score
        if (req.method === 'POST') {
            // Vercel auto-parses body if content-type is json
            const body = req.body;
            const { name, score, game } = body;

            if (!name || !score) {
                return res.status(400).send("Missing Data");
            }

            // Construct Entry Name: GAME:NAME
            const entryName = `${game}:${name}`;
            const safeName = encodeURIComponent(entryName);
            const url = `${BASE_URL}/${PRIVATE_KEY}/add/${safeName}/${score}`;

            return new Promise((resolve, reject) => {
                http.get(url, (response) => {
                    let data = '';
                    response.on('data', chunk => data += chunk);
                    response.on('end', () => {
                        res.status(200).json({ message: "Saved", response: data });
                        resolve();
                    });
                }).on('error', (err) => {
                    res.status(500).json(err);
                    resolve();
                });
            });
        }

        return res.status(405).send("Method Not Allowed");

    } catch (error) {
        return res.status(500).send(error.toString());
    }
};
