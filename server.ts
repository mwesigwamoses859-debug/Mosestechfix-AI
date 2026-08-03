import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel, Modality } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy init Gemini AI
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System instruction for MosesTech Fix AI IT Diagnostic Assistant
const MOSESTECH_FIX_AI_SYSTEM_INSTRUCTION = `
You are MosesTech Fix AI, an expert IT Diagnostic Assistant and Local Technician Helpdesk for Uganda, powered by MosesTech IT Services & Fix Solution in Kampala (Official website: https://mosestechfixsolution.com).

YOUR PURPOSE:
Help users diagnose simple Windows laptops/desktops, printers, Wi-Fi/routers, Android phones, and CCTV issues. Guide users through ONE safe step at a time, and seamlessly escalate to a real technician booking when the problem cannot be solved safely.

OFFICIAL DIRECT CONTACTS & WEBSITE:
- WhatsApp Line 1 (Airtel): 0708262179 (+256708262179)
- WhatsApp Line 2 (MTN): 0789218570 (+256789218570)
- Official Company Website: https://mosestechfixsolution.com
- When recommending a technician booking or providing a summary, explicitly mention that users can chat on WhatsApp (0708262179 / 0789218570) or visit https://mosestechfixsolution.com for more IT services, hardware packages, and technical support details!

SPECIALIZED SCOPE & TROUBLESHOOTING CATEGORIES:
1. Windows Laptops & Desktops: Not starting, orange/blinking diagnostic lights, no display with fan running, blue screen errors (BSOD), slow PC, Wi-Fi missing, no sound, keyboard/mouse unresponsive, battery not charging, camera/mic not detected, storage full, malware warnings.
2. Printers & Scanners: Paper jams, spooler error, offline status, red light blinking.
3. Wi-Fi & Routers: Connected but no internet, yellow triangle icon, network adapter disabled, MiFi APN setup.
4. Android Phones: Boot loop, charging port, battery drain, USB tethering.

CRITICAL SAFETY SYSTEM ENGINE:
Classify every instruction into 3 safety levels:
- GREEN (Safe): Cable inspection, restarting, official troubleshooters, network reset, sound settings, Windows updates.
- AMBER (Caution Required): BIOS/UEFI changes, Command Prompt (sfc, chkdsk, diskpart), RAM stick reseating, OS reinstall, driver uninstallation. (ALWAYS warn user to backup data first!).
- RED (Hazardous / Immediate Technician Escalation): Swollen battery casing, smoke/burning smell, liquid spill on motherboard, exposed power supply internal wires.
  * RED RULE: Stop user immediately! Say "For your physical safety and device protection, do not attempt to open or turn on this device. Please contact our technical team on WhatsApp 0708262179 or 0789218570 or visit https://mosestechfixsolution.com." Trigger "BOOK_TECHNICIAN" action!

UGANDAN CONTEXT & TERMINOLOGY:
- Speak in friendly, clear English, supporting Luganda technical phrases.
- Use UGX for estimated repair/service fees (e.g., Remote Support: UGX 20,000–50,000; Onsite Visit: UGX 30,000+; Drop-off at Ntinda shop).
- Offer MTN Mobile Money and Airtel Money payment options.

OUTPUT FORMATTING:
Always present 1 concise step at a time. Include a structured JSON block if a case summary or action is required:
\`\`\`json
{
  "actionType": "TROUBLESHOOT_STEP" | "BOOK_TECHNICIAN" | "CREATE_QUOTATION" | "CREATE_INVOICE" | "RECORD_SALE" | "RECORD_EXPENSE" | "ADVICE",
  "data": { ... }
}
\`\`\`
`;

// Helper to extract grounding chunks
function extractGroundingMetadata(candidate: any) {
  const metadata = candidate?.groundingMetadata;
  if (!metadata) return null;

  const webSources = metadata.groundingChunks
    ?.filter((chunk: any) => chunk.web)
    ?.map((chunk: any) => ({
      title: chunk.web.title || 'Source Link',
      uri: chunk.web.uri,
    })) || [];

  const mapSources = metadata.groundingChunks
    ?.filter((chunk: any) => chunk.maps)
    ?.map((chunk: any) => ({
      title: chunk.maps.title || 'Map Location',
      uri: chunk.maps.uri,
    })) || [];

  const searchQueries = metadata.webSearchQueries || [];

  return { webSources, mapSources, searchQueries };
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'MosesTech Fix AI' });
});

// AI Diagnostic & Troubleshooting Chat Endpoint
app.post('/api/ai/diagnose-chat', async (req, res) => {
  try {
    const { prompt, deviceCategory, manufacturer, model, history, useSearch, useMaps, enableThinking } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const ai = getGenAI();

    const formattedHistory = Array.isArray(history)
      ? history.map((h: { role: string; content: string }) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n')
      : '';

    const contentPrompt = `
Device Details:
- Category: ${deviceCategory || 'Windows Laptop / PC'}
- Manufacturer: ${manufacturer || 'Generic / HP / Dell'}
- Model: ${model || 'Unspecified'}

User Symptoms / Question:
"${prompt}"

Chat History:
${formattedHistory}

Instructions:
1. Analyze symptoms & device category.
2. If hazardous RED situation, warn user and set actionType "BOOK_TECHNICIAN".
3. If safe (GREEN or AMBER), provide 1 clear step-by-step diagnostic instruction.
4. If issue resolved or user wants tech, trigger actionType "BOOK_TECHNICIAN".

Respond with helpful text and include a JSON block:
\`\`\`json
{
  "actionType": "TROUBLESHOOT_STEP" | "BOOK_TECHNICIAN" | "ADVICE",
  "data": {
    "safetyLevel": "Green" | "Amber" | "Red",
    "stepNumber": 1,
    "instruction": "...",
    "expectedResult": "...",
    "warningText": "...",
    "estimatedFeeUGX": 25000,
    "bookingType": "Remote Support" | "Onsite Technician Visit" | "Shop Repair Drop-off",
    "deviceCategory": "${deviceCategory || 'Windows Laptop'}",
    "manufacturer": "${manufacturer || 'HP'}",
    "model": "${model || 'Laptop'}",
    "symptoms": "${prompt}"
  }
}
\`\`\`
`;

    let selectedModel = 'gemini-3.6-flash';
    const config: any = {
      systemInstruction: MOSESTECH_FIX_AI_SYSTEM_INSTRUCTION,
      temperature: 0.6,
    };

    if (enableThinking) {
      selectedModel = 'gemini-3.1-pro-preview';
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    }

    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    } else if (useMaps) {
      config.tools = [{ googleMaps: {} }];
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: contentPrompt,
      config,
    });

    const grounding = extractGroundingMetadata(response.candidates?.[0]);

    res.json({ text: response.text, grounding });
  } catch (err: any) {
    console.error('Diagnose Chat Error:', err);
    res.status(500).json({ error: err.message || 'Diagnostic failed' });
  }
});

// AI Diagnostic Image Analysis Endpoint
app.post('/api/ai/diagnose-image', async (req, res) => {
  try {
    const { imageBase64, userNotes } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'imageBase64 is required' });

    const ai = getGenAI();

    // Extract mime type and clean base64 data
    let mimeType = 'image/jpeg';
    let cleanBase64 = imageBase64;
    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,');
      mimeType = parts[0].replace('data:', '');
      cleanBase64 = parts[1];
    }

    const promptText = `
You are analyzing a diagnostic screenshot or device photograph uploaded by a user for IT troubleshooting.
User Notes: "${userNotes || 'Inspect image for hardware fault, diagnostic LED pattern, error message, or blue screen code.'}"

Instructions:
1. Identify the device or error shown on screen or physical condition (e.g. BSOD error code, printer blink pattern, swollen battery casing, cable connection issue).
2. Classify safety level: Green (safe settings/cables), Amber (cautious opening/driver/command), or Red (physical danger/smoke/liquid/swollen battery).
3. Provide concise, step-by-step diagnostic instructions or immediate technician booking advice if Red.

Respond with diagnosis text and include a JSON block:
\`\`\`json
{
  "actionType": "TROUBLESHOOT_STEP" | "BOOK_TECHNICIAN" | "ADVICE",
  "data": {
    "safetyLevel": "Green" | "Amber" | "Red",
    "stepNumber": 1,
    "instruction": "...",
    "expectedResult": "...",
    "warningText": "...",
    "estimatedFeeUGX": 30000,
    "bookingType": "Remote Support" | "Onsite Technician Visit" | "Shop Repair Drop-off",
    "symptoms": "Diagnosed from uploaded photo/screenshot: ${userNotes || 'Hardware/Screen Inspection'}"
  }
}
\`\`\`
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        {
          inlineData: {
            mimeType,
            data: cleanBase64,
          },
        },
        promptText,
      ],
      config: {
        systemInstruction: MOSESTECH_FIX_AI_SYSTEM_INSTRUCTION,
        temperature: 0.5,
      },
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error('Diagnose Image Error:', err);
    res.status(500).json({ error: err.message || 'Image diagnostic failed' });
  }
});

// AI Assistant Chat & General Business Route (Multi-turn + Grounding + Thinking)
app.post('/api/ai/assistant', async (req, res) => {
  try {
    const { prompt, businessContext, history, useSearch, useMaps, enableThinking } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGenAI();

    const formattedHistory = Array.isArray(history)
      ? history.map((h: { role: string; content: string }) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n')
      : '';

    const fullPrompt = `
Business Profile:
- Name: ${businessContext?.name || 'MosesTech Fix AI'}
- Category: ${businessContext?.category || 'IT Technician & Computer Repairs'}
- Location/Phone: ${businessContext?.address || 'Ntinda, Kampala, Uganda'} / ${businessContext?.phone || ''}

User Prompt:
"${prompt}"

Chat History:
${formattedHistory}

Task: Respond clearly to the user as MosesTech Fix AI - expert IT diagnostic assistant & Ugandan IT repair helpdesk.
If the request is IT troubleshooting, guide them step-by-step or offer a technician booking.
If creating a quotation for computer repair, invoice, or recording sale, format structured JSON.

JSON block structure:
\`\`\`json
{
  "actionType": "TROUBLESHOOT_STEP" | "BOOK_TECHNICIAN" | "CREATE_QUOTATION" | "CREATE_INVOICE" | "RECORD_SALE" | "RECORD_EXPENSE" | "DEBT_REMINDER" | "ADD_PRODUCT" | "ADVICE",
  "data": { ... }
}
\`\`\`
`;

    let selectedModel = 'gemini-3.6-flash';
    const config: any = {
      systemInstruction: MOSESTECH_FIX_AI_SYSTEM_INSTRUCTION,
      temperature: 0.7,
    };

    if (enableThinking) {
      selectedModel = 'gemini-3.1-pro-preview';
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    }

    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    } else if (useMaps) {
      config.tools = [{ googleMaps: {} }];
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: fullPrompt,
      config,
    });

    const grounding = extractGroundingMetadata(response.candidates?.[0]);

    res.json({ text: response.text, grounding });
  } catch (err: any) {
    console.error('Gemini Assistant Error:', err);
    res.status(500).json({ error: err.message || 'Failed to process AI request' });
  }
});

// AI Health Audit & Proactive Business Advisor Endpoint
app.post('/api/ai/health-audit', async (req, res) => {
  try {
    const { salesSummary, expensesSummary, debtsSummary, inventorySummary, businessContext, enableThinking } = req.body;
    const ai = getGenAI();

    const auditPrompt = `
Perform an exhaustive AI Business Health Audit for "${businessContext?.name || 'Ugandan Business'}" (${businessContext?.category || 'Retail Shop'}).

FINANCIAL & OPERATIONAL METRICS:
- Total Sales Recorded: UGX ${salesSummary?.totalSalesUGX || 0} (${salesSummary?.count || 0} sales)
- Total Expenses Recorded: UGX ${expensesSummary?.totalExpensesUGX || 0}
- Estimated Net Profit: UGX ${(salesSummary?.totalSalesUGX || 0) - (expensesSummary?.totalExpensesUGX || 0)}
- Outstanding Customer Debts: UGX ${debtsSummary?.totalDebtUGX || 0} across ${debtsSummary?.activeDebtorsCount || 0} debtors
- Low Stock Items: ${inventorySummary?.lowStockCount || 0} products low out of ${inventorySummary?.totalProducts || 0} total products

Analyze these figures and provide structured JSON response containing:
1. healthScore (0-100)
2. healthStatus ("Excellent" | "Good" | "Needs Attention" | "Critical")
3. summaryOverview (2-3 concise sentences)
4. keyStrengths (array of strings)
5. criticalRisks (array of strings)
6. actionableAdvice (array of 3 specific recommendations for a Ugandan business owner, e.g., cashflow strategy, URA compliance, debt recovery via Mobile Money, high-margin stock)
`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        healthScore: { type: Type.NUMBER },
        healthStatus: { type: Type.STRING },
        summaryOverview: { type: Type.STRING },
        keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        criticalRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
        actionableAdvice: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['healthScore', 'healthStatus', 'summaryOverview', 'keyStrengths', 'criticalRisks', 'actionableAdvice'],
    };

    let selectedModel = 'gemini-3.6-flash';
    const config: any = {
      systemInstruction: MOSESTECH_FIX_AI_SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: schema,
    };

    if (enableThinking) {
      selectedModel = 'gemini-3.1-pro-preview';
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: auditPrompt,
      config,
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ audit: parsed });
  } catch (err: any) {
    console.error('Health Audit Error:', err);
    res.status(500).json({ error: err.message || 'Failed to conduct AI business audit' });
  }
});

// AI Quick Natural Language Transaction Parsing Route
app.post('/api/ai/quick-natural-log', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text required' });

    const ai = getGenAI();

    const schema = {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, description: 'SALE or EXPENSE or UNKNOWN' },
        description: { type: Type.STRING },
        amountUGX: { type: Type.NUMBER },
        customerOrRecipient: { type: Type.STRING },
        paymentMethod: { type: Type.STRING, description: 'Cash | MTN Mobile Money | Airtel Money | Bank' },
        category: { type: Type.STRING },
      },
      required: ['type', 'description', 'amountUGX', 'paymentMethod'],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Parse this natural language transaction entry into structured data:\n"${text}"`,
      config: {
        systemInstruction: 'Determine if this is a SALE (income) or EXPENSE (outflow). Extract UGX amount, description, payment method (Cash, MTN Mobile Money, Airtel Money, Bank), recipient/customer.',
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ parsed });
  } catch (err: any) {
    console.error('Quick Log Error:', err);
    res.status(500).json({ error: err.message || 'Failed to parse natural transaction' });
  }
});

// AI Structured Document Generator Route (Quotation / Invoice / Reminder)
app.post('/api/ai/parse-document', async (req, res) => {
  try {
    const { inputPrompt } = req.body;
    const ai = getGenAI();

    const schema = {
      type: Type.OBJECT,
      properties: {
        docType: { type: Type.STRING, description: 'quotation or invoice' },
        customerName: { type: Type.STRING },
        customerPhone: { type: Type.STRING },
        includeVAT: { type: Type.BOOLEAN },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              quantity: { type: Type.NUMBER },
              unitPriceUGX: { type: Type.NUMBER },
            },
            required: ['description', 'quantity', 'unitPriceUGX'],
          },
        },
        paymentTerms: { type: Type.STRING },
        notes: { type: Type.STRING },
      },
      required: ['docType', 'customerName', 'items', 'includeVAT'],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Parse this user request into a structured document request for a Ugandan business:\n"${inputPrompt}"`,
      config: {
        systemInstruction: 'Extract items, quantities, prices in UGX, VAT status (18% in Uganda if requested), customer details.',
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ document: parsed });
  } catch (err: any) {
    console.error('Parse Document Error:', err);
    res.status(500).json({ error: err.message || 'Failed to parse document request' });
  }
});

// AI Marketing & Ad Copy Generator
app.post('/api/ai/generate-ad', async (req, res) => {
  try {
    const { productOrService, targetAudience, platform } = req.body;
    const ai = getGenAI();

    const prompt = `Generate a compelling, high-converting social media advertisement for a Ugandan business offering: "${productOrService}".
Target Platform: ${platform || 'WhatsApp Status / TikTok / Facebook'}
Target Audience: ${targetAudience || 'Ugandan customers, Kampala shoppers, tech buyers'}

Requirements:
- Include eye-catching headline
- Highlight key benefits & pricing in UGX
- Include friendly Call-to-Action with WhatsApp number placeholder
- Include popular Ugandan business hashtags (#Kampala #Uganda #TechUganda #SmallBizUG)
- Give 2 variations (1 Concise WhatsApp Status, 1 Engaging Facebook/TikTok post)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: MOSESTECH_FIX_AI_SYSTEM_INSTRUCTION,
      },
    });

    res.json({ adCopy: response.text });
  } catch (err: any) {
    console.error('Ad Gen Error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate ad' });
  }
});

// WhatsApp Cloud API Webhook Integration Endpoint
app.get('/api/webhook/whatsapp', (req, res) => {
  const verifyToken = req.query['hub.verify_token'] || process.env.WHATSAPP_VERIFY_TOKEN || 'mosestech_secret_token';
  const mode = req.query['hub.mode'];
  const challenge = req.query['hub.challenge'];

  if (mode && mode === 'subscribe') {
    console.log('WhatsApp Webhook Verified Successfully');
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

app.post('/api/webhook/whatsapp', async (req, res) => {
  try {
    const body = req.body;
    // Check if this is a WhatsApp status update or incoming message
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (message && message.type === 'text') {
        const from = message.from; // User's phone number
        const userText = message.text.body;

        const ai = getGenAI();
        const aiResponse = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: userText,
          config: {
            systemInstruction: MOSESTECH_FIX_AI_SYSTEM_INSTRUCTION + '\nFormat the response concisely for WhatsApp mobile reading. Include official support links https://mosestechfixsolution.com and contacts 0708262179 / 0789218570 when technician intervention is required.',
            temperature: 0.5,
          },
        });

        console.log(`WhatsApp AI Reply generated for ${from}:`, aiResponse.text?.substring(0, 100));

        // Return processed diagnosis for WhatsApp Bot response dispatcher
        return res.json({
          status: 'success',
          recipient: from,
          aiReply: aiResponse.text,
          officialSource: 'https://mosestechfixsolution.com'
        });
      }
    }
    res.sendStatus(200);
  } catch (err: any) {
    console.error('WhatsApp Webhook Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// AI Text-to-Speech (TTS) Endpoint for Voice Audio Diagnosis
app.post('/api/ai/tts', async (req, res) => {
  try {
    const { text, voice } = req.body;
    if (!text) return res.status(400).json({ error: 'Text required for TTS' });

    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({ audioBase64: base64Audio, mimeType: 'audio/pcm' });
    } else {
      res.status(500).json({ error: 'No audio generated' });
    }
  } catch (err: any) {
    console.error('TTS Error:', err);
    res.status(500).json({ error: err.message || 'Speech generation failed' });
  }
});

// AI Image Generation Endpoint for Marketing & Diagnostic Illustrations
app.post('/api/ai/generate-ai-image', async (req, res) => {
  try {
    const { prompt, aspectRatio } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt required' });

    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          {
            text: `High quality tech repair illustration: ${prompt}`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || '1:1',
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return res.json({ imageUrl: `data:image/png;base64,${part.inlineData.data}` });
      }
    }

    res.status(500).json({ error: 'Image generation did not produce inline image data' });
  } catch (err: any) {
    console.error('Image Gen Error:', err);
    res.status(500).json({ error: err.message || 'Image generation failed' });
  }
});

// Vite Middleware & Production Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MosesTech Business AI running on http://localhost:${PORT}`);
  });
}

startServer();

