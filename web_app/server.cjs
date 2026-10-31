var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_config = require("dotenv/config");
var import_express = __toESM(require("express"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
process.on("unhandledRejection", (reason, promise) => {
  console.error("[Server] Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[Server] Uncaught Exception:", err);
});
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "50mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "50mb" }));
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.get("/api/heartbeat", (req, res) => {
    res.json({ status: "alive" });
  });
  app.post("/api/ocr", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/png", courier = "AUTO" } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "imageBase64 is required" });
      }
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: "GEMINI_API_KEY not configured on server",
          fallback: true
        });
      }
      const ai = new import_genai.GoogleGenAI({ apiKey });
      const cleanData = imageBase64.replace(/^data:[^;]+;base64,/, "");
      const isPdf = mimeType === "application/pdf" || imageBase64.startsWith("data:application/pdf");
      const finalMimeType = isPdf ? "application/pdf" : mimeType || "image/png";
      const prompt = `You are an expert OCR parser for Indian courier shipping receipts, invoices, and shipping labels.
You specialize in DTDC, Blue Dart, and Delhivery documents (Active courier preference: ${courier}).
Analyze the provided image/document and extract all courier information into pure JSON without markdown code fences.

Courier detection guidelines:
- DTDC: Usually has "DTDC" branding, AWB starts with 7D, 7X, or 7 followed by 8-11 digits/letters. Products: B2C SMART EXPRESS, B2C PRIORITY, DOMESTIC.
- Blue Dart: Has "Blue Dart" or "Air Waybill" branding. AWB/Waybill is typically 8 to 11 digits (e.g. 7839420194, 84930192834, 351249821). Products: APEX, DOMESTIC PRIORITY, SURFACE, SMART BOX.
- Delhivery: Has "Delhivery" or "Powered by Delhivery" branding. AWB/Waybill is typically 12 to 15 digits (e.g. 1412345678901, 34084710004874). Products: Express Parcel, Heavy Surface, Standard.

CRITICAL MULTI-COPY & MULTI-LABEL SHEET RULES (DTDC, BLUE DART, DELHIVERY):
- Courier documents frequently contain 2, 3, or 4 copies or multiple labels on a single page:
  - DTDC: "Sender's Copy", "Account's Copy", "POD Copy"
  - Blue Dart: "Shipper's Copy", "Consignee's Copy", "POD Copy", "Accounts Copy"
  - Delhivery: 4-Up label sheets (4 labels on 1 sheet) or "Consignor Copy", "Transporter Copy"
- You MUST extract information ONLY from the TOP PRIMARY copy ("Sender's Copy" or "Shipper's Copy" or the first label)!
- NEVER concatenate, repeat, or blend addresses or names from the lower/subsequent copies or adjacent labels.
- If phone is dummy like "0000000000" or "9999999999", ignore it and extract the genuine 10-digit mobile number or leave empty.

CRITICAL WEIGHT EXTRACTION RULES (ALL COURIERS):
- Always extract "Actual Weight", "Gross Weight", "Physical Weight", or "Dead Weight" (e.g. "100 Gms", "0.50 Kgs", "0.35 kg").
- Always extract "Charged weight", "Chargeable Weight", or "Volumetric Weight" (e.g. "500 Gms", "1.00 Kgs", "0.50 kg").
- Retain the exact unit ("Gms", "Kgs", etc.). If only a number is given (e.g. "0.5"), format as "0.5 Kgs". Do NOT drop or omit the weight!

CRITICAL CONTENT SPECIFICATION AUTO-FILL (ALL COURIERS):
- If "Content Specification :", "Declared Description of Goods", "Commodity", "Description of Goods", or "Product Description" is empty, blank, or "Not Applicable":
  - If Type is "DOCUMENT" or "DOX", you MUST set contentSpec to "DOCUMENTS".
  - If Type is "NON-DOCUMENT" or "PARCEL", set contentSpec to "ELECTRIC ITEMS" or infer the primary product name.
- NEVER return empty contentSpec for DTDC, Blue Dart, or Delhivery.

CRITICAL INVOICE ADDRESS EXTRACTION RULES (IMPORTANT):
- Invoices frequently show BOTH "SHIPPING ADDRESS" and "BILLING ADDRESS" side-by-side or one after another.
- consigneeName and consigneeAddress MUST be extracted ONLY from "SHIPPING ADDRESS" (or "SHIP TO").
- NEVER concatenate, combine, or repeat the address even if "BILLING ADDRESS" is identical or also present.
- Strip out any labels like "BILLING ADDRESS", "SHIPPING ADDRESS", "ORDER DETAILS".
- consigneeAddress must contain the destination address lines ONLY ONCE (absolutely no duplicate repetitions).
- "BILL FROM", "SOLD BY", or "Consignor's Name" is the Consignor / Sender. Extract company name into consignorName, full address into consignorAddress, and GSTIN into consignorGstin.

Extract these exact fields into JSON:
- detectedCourier: "DTDC" | "BLUEDART" | "DELHIVERY"
- awb: Airway Bill / Waybill / LR Number (e.g. 34084710004874, 7D134850072)
- origin: Origin city (e.g. SATNA, NAGOD, MUMBAI, DELHI)
- dest: Destination city or hub (e.g. AGRA, AMBALA, MEHSANA, KOTA)
- product: Product type (e.g. B2C SMART EXPRESS, Express Parcel, APEX, DOMESTIC PRIORITY, SURFACE)
- type: "DOCUMENT" or "NON-DOCUMENT"
- mode: "AIR" or "SURFACE"
- date: Date string found on receipt (e.g. Thu Oct 01 2026, 2026-9-23)
- consigneeName: Full name of consignee / recipient (from top copy only)
- consigneeAddress: Full clean single address of consignee with PIN code (from top copy only, NO duplicates)
- consigneePhone: Phone / mobile number of consignee / recipient (must not be all zeros)
- customerRefNo: Customer Reference Number / Order Number / Invoice ID if present
- consigneeGstin: Recipient GSTIN if present
- consignorName: Sender / Shipper / Consignor name (e.g. MAA SHARDA ENTERPRISES)
- consignorAddress: Sender address (e.g. Near satna simariya chowk, NEAR AXIS BANK ATM, SATNA, MADHYA PRADESH, 485001)
- consignorPhone: Sender phone / mobile (must not be all zeros, check booking branch phone if consignor phone is 0000000000)
- consignorGstin: Sender GSTIN if visible (e.g. 23BCPPD5853C1ZT)
- contentSpec: Content specification (e.g. DOCUMENTS, MILK ANALYSER, LAPTOP, ELECTRIC ITEMS. MUST NOT be empty)
- declaredValue: Declared value number or total amount (e.g. 10000, Not Applicable)
- pieces: Number of pieces (e.g. 1)
- actualWeight: Actual weight string (e.g. 100 Gms, 0.23 Kgs, 2.5 Kgs)
- chargedWeight: Charged weight string (e.g. 500 Gms, 2.715 Kgs)
- dim: Dimensions string (e.g. 10x10x10 cm, Not Applicable)
- courierCharges: Courier charges or freight amount number if visible

Return ONLY valid JSON matching this schema.`;
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: finalMimeType,
                  data: cleanData
                }
              },
              {
                text: prompt
              }
            ]
          }
        ]
      });
      const responseText = response.text?.trim() || "{}";
      const jsonText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsedData = JSON.parse(jsonText);
      if (parsedData.consigneeAddress) {
        let addr = parsedData.consigneeAddress.replace(/(?:BILLING\s*ADDRESS|BILL\s*TO\s*ADDRESS|BILL\s*TO|ORDER\s*DETAILS)[\s\S]*/i, "").replace(/^(?:SHIPPING\s*ADDRESS|SHIP\s*TO\s*ADDRESS|SHIP\s*TO|DELIVERY\s*ADDRESS|ADDRESS)\s*[:\-]?\s*/i, "").trim();
        if (parsedData.consigneeName) {
          const esc = parsedData.consigneeName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          addr = addr.replace(new RegExp(`^${esc}\\s*[,\\-\\n\\s]*`, "i"), "");
        }
        const parts = addr.split(/[,;\n\r]+/).map((s) => s.trim()).filter(Boolean);
        const seen = /* @__PURE__ */ new Set();
        const deduped = [];
        for (const p of parts) {
          const lower = p.toLowerCase();
          if (lower === "billing address" || lower === "shipping address") continue;
          if (!seen.has(lower)) {
            seen.add(lower);
            deduped.push(p);
          }
        }
        parsedData.consigneeAddress = deduped.join(", ");
      }
      if (parsedData.consignorPhone && /^0+$/.test(parsedData.consignorPhone.replace(/\D/g, ""))) {
        parsedData.consignorPhone = "";
      }
      if (parsedData.consigneePhone && /^0+$/.test(parsedData.consigneePhone.replace(/\D/g, ""))) {
        parsedData.consigneePhone = "";
      }
      if (!parsedData.contentSpec || parsedData.contentSpec.trim() === "" || parsedData.contentSpec.toUpperCase().includes("NOT APPLICABLE")) {
        parsedData.contentSpec = parsedData.type === "DOCUMENT" ? "DOCUMENTS" : "ELECTRIC ITEMS";
      }
      if (!parsedData.pieces || isNaN(Number(parsedData.pieces))) {
        parsedData.pieces = "1";
      }
      return res.json({ success: true, data: parsedData });
    } catch (err) {
      console.error("OCR Error:", err);
      return res.status(500).json({ error: err.message || "Failed to process OCR" });
    }
  });
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.path} not found` });
  });
  if (process.env.NODE_ENV !== "production") {
    try {
      const vite = await (0, import_vite.createServer)({
        server: { middlewareMode: true },
        appType: "spa"
      });
      app.use(vite.middlewares);
    } catch (viteError) {
      console.error("[Server] Failed to initialize Vite dev server middleware:", viteError);
      throw viteError;
    }
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    const indexPath = import_path.default.join(distPath, "index.html");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      if (import_fs.default.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Build assets not found in dist/. Run "npm run build" first.');
      }
    });
  }
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`DTDC Bill Generator Server running on http://0.0.0.0:${PORT}`);
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`[Server] Port ${PORT} is already in use.`);
    } else {
      console.error("[Server] Listen error:", err);
    }
  });
}
startServer().catch((err) => {
  console.error("[Server] Fatal initialization error:", err);
  process.exit(1);
});
//# sourceMappingURL=server.cjs.map
