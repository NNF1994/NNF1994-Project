const https = require('https');

module.exports = async (req, res) => {
    // Vercel handles query string in req.query
    const { pubKey } = req.query;

    if (!pubKey) {
        return res.status(400).json({ error: "Missing pubKey" });
    }

    const rpcEndpoints = [
        "https://rpc.ankr.com/solana",
        "https://solana-mainnet.rpc.extrnode.com",
        "https://api.mainnet-beta.solana.com"
    ];

    const tokenMint = "HU7YsnzuEvdBgRnEjk3GaJYTk7KgXXd1pfnTJ13npump";

    // Helper to make HTTPS request
    const postRequest = (url, data) => {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const options = {
                hostname: urlObj.hostname,
                path: urlObj.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length
                },
                timeout: 3000
            };

            const request = https.request(options, (response) => {
                let body = '';
                response.on('data', (chunk) => body += chunk);
                response.on('end', () => {
                    try {
                        if (response.statusCode >= 200 && response.statusCode < 300) {
                            resolve(JSON.parse(body));
                        } else {
                            reject(new Error(`HTTP ${response.statusCode}: ${body}`));
                        }
                    } catch (e) {
                        reject(e);
                    }
                });
            });

            request.on('error', (e) => reject(e));
            request.on('timeout', () => {
                request.destroy();
                reject(new Error("Request Timed Out"));
            });

            request.write(data);
            request.end();
        });
    };

    for (const rpcUrl of rpcEndpoints) {
        try {
            const body = JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "getTokenAccountsByOwner",
                params: [
                    pubKey,
                    { mint: tokenMint },
                    { encoding: "jsonParsed" }
                ]
            });

            const data = await postRequest(rpcUrl, body);

            if (data.result) {
                let amount = "0";
                if (data.result.value && data.result.value.length > 0) {
                    amount = data.result.value[0].account.data.parsed.info.tokenAmount.uiAmount.toLocaleString();
                }

                // Add CORS headers for Vercel
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Content-Type', 'application/json');
                return res.status(200).json({ balance: amount });
            }
        } catch (err) {
            console.error(`RPC Fail: ${rpcUrl}`, err.message);
        }
    }

    return res.status(500).json({ error: "Failed to fetch balance from all RPCs" });
};
