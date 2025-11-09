// الملف: api/save-draft.js

// هذه هي الدالة الرئيسية التي سيقوم Vercel بتشغيلها
// تستقبل `request` و `response` مثل أي خادم ويب
export default async function handler(request, response) {
    // 1. التأكد من أن الطلب من نوع POST
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. تفعيل CORS للسماح لملف Tampermonkey بالوصول للدالة
    response.setHeader('Access-Control-Allow-Origin', '*'); // يسمح بالوصول من أي مصدر
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Vercel يتعامل مع طلبات OPTIONS تلقائيًا، ولكن نضيف هذا للاحتياط
    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    try {
        // 3. قراءة البيانات المرسلة من ملفك (بيانات الفاتورة والتوكن)
        const { invoicePayload, accessToken } = request.body;

        // التحقق من وجود البيانات اللازمة
        if (!invoicePayload || !accessToken) {
            return response.status(400).json({ error: 'invoicePayload and accessToken are required.' });
        }

        // 4. استدعاء API الخاص بمصلحة الضرائب لحفظ المسودة
        const etaApiResponse = await fetch("https://api-portal.invoicing.eta.gov.eg/api/v1/documents/drafts", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}` // استخدام التوكن المرسل
            },
            body: JSON.stringify(invoicePayload ) // إرسال بيانات الفاتورة كما هي
        });

        // 5. تحليل الرد من مصلحة الضرائب
        const responseData = await etaApiResponse.json();

        // إذا فشل الطلب إلى مصلحة الضرائب، قم بإرجاع الخطأ للمستخدم
        if (!etaApiResponse.ok) {
            // إرجاع نفس كود الحالة ورسالة الخطأ من مصلحة الضرائب
            return response.status(etaApiResponse.status).json(responseData);
        }

        // 6. في حالة النجاح، قم بإرجاع الرد الناجح للمستخدم
        return response.status(200).json(responseData);

    } catch (error) {
        // في حالة حدوث أي خطأ غير متوقع في الخادم
        return response.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
