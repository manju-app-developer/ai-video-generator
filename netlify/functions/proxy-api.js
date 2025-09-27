exports.handler = async function(event) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { type, payload } = JSON.parse(event.body);
        const apiKey = process.env.GOOGLE_API_KEY; // Securely access the API key

        if (!apiKey) {
            return { statusCode: 500, body: JSON.stringify({ error: 'API key is not configured.' }) };
        }

        let apiUrl;
        switch (type) {
            case 'text':
                apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
                break;
            case 'image':
                apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
                break;
            case 'tts':
                apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
                break;
            default:
                return { statusCode: 400, body: JSON.stringify({ error: 'Invalid API type specified.' }) };
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Google API Error:', data);
            return { statusCode: response.status, body: JSON.stringify(data) };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        };

    } catch (error) {
        console.error('Proxy function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An internal server error occurred.' }),
        };
    }
};
