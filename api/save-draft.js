// الملف: api/save-draft.js (النسخة المُعدَّلة والنهائية)

export default async function handler(request, response) {
    // --- ✅ الخطوة 1: إضافة ترويسات CORS للسماح بالوصول من أي مصدر ---
    // هذا الجزء سيتم تنفيذه لكل الطلبات (POST و OPTIONS)
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // --- ✅ الخطوة 2: التعامل مع طلب OPTIONS الاستكشافي ---
    // إذا كان الطلب من نوع OPTIONS، نرد بحالة 200 (OK) وننهي العملية.
    // هذا يخبر المتصفح "نعم، أنا أسمح بالطلب القادم".
    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    // --- ✅ الخطوة 3: التأكد من أن الطلب القادم هو POST ---
    // هذا الكود لن يتم تنفيذه إلا بعد نجاح طلب OPTIONS
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // --- (باقي الكود يبقى كما هو بدون أي تغيير) ---
    try {
        const { invoicePayload, accessToken } = request.body;

        if (!invoicePayload || !accessToken) {
            return response.status(400).json({ error: 'invoicePayload and accessToken are required.' });
        }

        const etaApiResponse = await fetch("https://api-portal.invoicing.eta.gov.eg/api/v1/documents/drafts", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify(invoicePayload )
        });

        const responseData = await etaApiResponse.json();

        if (!etaApiResponse.ok) {
            return response.status(etaApiResponse.status).json(responseData);
        }

        return response.status(200).json(responseData);

    } catch (error) {
        return response.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
