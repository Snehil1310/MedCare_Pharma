import { createServerFn } from '@tanstack/react-start';
import { getDb } from '@/db';

export const getChatMessages = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb();
  const rows = db.prepare('SELECT id, role, content, timestamp FROM chat_messages ORDER BY id ASC').all();
  return rows;
});

export const sendChatMessage = createServerFn({ method: 'POST' })
  .validator((data: { text: string }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    
    // Save user message
    db.prepare("INSERT INTO chat_messages (role, content) VALUES ('user', ?)").run(data.text);
    
    // Parse user text for SKU names, quantities, and facilities
    const text = data.text.toLowerCase();
    const inventoryItems = db.prepare('SELECT sku, code, dc, stock FROM inventory_items').all() as any[];
    const suppliers = db.prepare('SELECT name, price, lead_time, reliability, score FROM suppliers').all() as any[];
    
    // Try to find a matching SKU
    const matchedItems = inventoryItems.filter((item: any) => {
      const skuLower = item.sku.toLowerCase();
      const codeLower = item.code.toLowerCase();
      
      // 1. Exact code match
      if (text.includes(codeLower)) return true;
      
      // 2. Significant word match
      const skuWords = skuLower.split(' ').filter((w: string) => w.length > 3 && !['500mg', '100ml', '250mg', 'mask', 'sachets', 'disposable', '5ml'].includes(w));
      const hasSkuWord = skuWords.some((w: string) => text.includes(w));
      
      // 3. Category match (demo NLP aliases)
      const isAntibiotic = text.includes('antibiotic') && (skuLower.includes('amoxicillin') || skuLower.includes('azithromycin'));
      const isPainkiller = (text.includes('painkiller') || text.includes('fever') || text.includes('para')) && skuLower.includes('paracetamol');
      const isSyringe = text.includes('syring') && skuLower.includes('syringe');
      const isMask = text.includes('mask') && skuLower.includes('n95');
      const isCough = text.includes('cough') && skuLower.includes('cough');
      const isAmox = text.includes('amox') && skuLower.includes('amoxicillin');
      const isAzith = text.includes('azith') && skuLower.includes('azithromycin');
      const isOrs = text.includes('ors') && skuLower.includes('ors');
      const isInsulin = text.includes('insulin') && skuLower.includes('insulin');
      
      return hasSkuWord || isAntibiotic || isPainkiller || isSyringe || isMask || isCough || isAmox || isAzith || isOrs || isInsulin;
    });
    
    // Extract quantity (look for number patterns)
    const qtyMatch = text.match(/(\d[\d,]*)\s*(units?|pcs?|pieces?|masks?|syringes?|tablets?|bottles?)?/i);
    const qty = qtyMatch ? parseInt(qtyMatch[1].replace(/,/g, ''), 10) : null;
    
    // Extract facility
    const facilities = ['chennai', 'mumbai', 'vellore', 'delhi', 'chnai', 'chenai', 'mumb', 'vel', 'del'];
    let rawFacility = facilities.find(f => text.includes(f));
    let facility = rawFacility;
    if (rawFacility === 'chnai' || rawFacility === 'chenai') facility = 'chennai';
    if (rawFacility === 'mumb') facility = 'mumbai';
    if (rawFacility === 'vel') facility = 'vellore';
    if (rawFacility === 'del') facility = 'delhi';
    
    // Build structured AI response
    let aiResponse: any;
    
    if (matchedItems.length === 0 && !facility) {
      aiResponse = {
        text: "Invalid input. Neither a valid medical product nor a destination facility was identified. Please specify an item (e.g., Paracetamol, Amoxicillin) and a facility (e.g., Chennai, Mumbai)."
      };
    } else if (matchedItems.length === 0) {
      aiResponse = {
        text: `Invalid input. No valid medical product identified for the ${facility ? facility.charAt(0).toUpperCase() + facility.slice(1) : ''} facility. Please specify an item like Paracetamol, Amoxicillin, or N95 masks.`
      };
    } else if (!facility) {
      aiResponse = {
        text: `Invalid input. No valid destination facility identified for ${matchedItems[0].sku}. Please specify a facility like Chennai, Mumbai, Vellore, or Delhi.`
      };
    } else {
      const matchedItem = matchedItems[0];
      const itemName = matchedItem?.sku || 'Requested Item';
      
      // Assign specific base prices depending on the product
      const itemNameLower = itemName.toLowerCase();
      let unitPrice = 100; // default
      if (itemNameLower.includes('paracetamol')) unitPrice = 85;
      else if (itemNameLower.includes('mask') || itemNameLower.includes('n95')) unitPrice = 120;
      else if (itemNameLower.includes('amoxicillin') || itemNameLower.includes('azithromycin')) unitPrice = 250;
      else if (itemNameLower.includes('syringe')) unitPrice = 15;
      else if (itemNameLower.includes('cough')) unitPrice = 65;
      else if (itemNameLower.includes('ors')) unitPrice = 22;
      else if (itemNameLower.includes('insulin')) unitPrice = 450;
      
      const estimatedCost = qty ? `₹${(qty * unitPrice).toLocaleString('en-IN')}` : 'To be quoted';
      
      // Calculate supplier prices relative to the product's base price
      const supplierUnitPrices: Record<string, number> = {
        "Supplier A": Math.round(unitPrice * 0.96), // slightly cheaper
        "Supplier B": Math.round(unitPrice * 0.93), // cheapest but slow
        "Supplier C": Math.round(unitPrice * 1.01), // slightly premium but fast/reliable
      };
      
      aiResponse = {
        text: "I've identified the requirement:",
        requirement: {
          item: itemName,
          qty: qty || 'Not specified',
          facility: facility ? facility.charAt(0).toUpperCase() + facility.slice(1) : 'Not specified',
          estimatedCost,
        },
        suppliers: suppliers.map((s: any) => {
          const sUnitPrice = supplierUnitPrices[s.name] || unitPrice;
          const dynamicPrice = qty ? `₹${(qty * sUnitPrice).toLocaleString('en-IN')}` : 'To be quoted';
          return {
            name: s.name,
            price: dynamicPrice,
            delivery: s.lead_time,
          };
        }),
        recommendation: `Considering price, delivery and supplier reliability together, I recommend ${suppliers.sort((a: any, b: any) => b.score - a.score)[0]?.name || 'the best-scoring supplier'}.`,
      };
    }
    
    // Save AI message
    db.prepare("INSERT INTO chat_messages (role, content) VALUES ('ai', ?)").run(JSON.stringify(aiResponse));
    
    return { success: true, aiResponse };
  });

export const createRequisition = createServerFn({ method: 'POST' }).handler(async () => {
  const db = getDb();
  
  // Get latest AI message
  const lastAiMsg = db.prepare("SELECT content FROM chat_messages WHERE role = 'ai' ORDER BY id DESC LIMIT 1").get() as any;
  if (!lastAiMsg) return { success: false, error: 'No recommendation found' };
  
  let content;
  try {
    content = JSON.parse(lastAiMsg.content);
  } catch (e) {
    return { success: false, error: 'Failed to parse AI message' };
  }
  
  const req = content.requirement;
  const suppliers = content.suppliers;
  const rec = content.recommendation || "";
  
  if (!req || !req.item) return { success: false, error: 'Incomplete requirement data' };

  // Determine chosen supplier from recommendation
  let chosenSupplier = suppliers?.[0]?.name || "Auto-Selected Supplier";
  if (rec.includes("Supplier A")) chosenSupplier = "Supplier A";
  else if (rec.includes("Supplier B")) chosenSupplier = "Supplier B";
  else if (rec.includes("Supplier C")) chosenSupplier = "Supplier C";
  else if (rec.includes("MedSupply")) chosenSupplier = "MedSupply Pvt Ltd";

  // Determine total cost
  let totalCost = 0;
  let totalStr = req.estimatedCost;
  if (suppliers && suppliers.length > 0) {
     const s = suppliers.find((s:any) => s.name === chosenSupplier) || suppliers[0];
     totalStr = s.price;
  }
  
  if (typeof totalStr === 'string') {
    totalCost = parseInt(totalStr.replace(/[^\d]/g, ''), 10) || 0;
  }
  
  // Get threshold from settings
  const thresholdRow = db.prepare("SELECT value FROM settings_thresholds WHERE label LIKE 'Auto-approval limit%'").get() as any;
  const thresholdVal = thresholdRow ? thresholdRow.value * 1000 : 100000;
  
  const status = totalCost <= thresholdVal ? "Auto-Approved" : "AI Generated";

  // Insert PO
  const reqNum = `REQ-2026-${String(1184 + Math.floor(Math.random() * 1000)).padStart(4, '0')}`;
  const poNum = `PO-${reqNum.replace('REQ-', '')}`;
  
  const insertPO = db.prepare(
    "INSERT INTO purchase_orders (number, supplier, total, delivery, terms, status) VALUES (?, ?, ?, ?, ?, ?)"
  );
  
  const chosenS = suppliers?.find((s:any) => s.name === chosenSupplier);
  const delivery = chosenS?.delivery || "7 days";
  
  const poDate = req.deadline && req.deadline !== 'Not specified' ? req.deadline : "Soon";
  
  const res = insertPO.run(poNum, chosenSupplier, totalStr, poDate, "Net 30", status);
  const poId = res.lastInsertRowid;
  
  // Insert PO item
  const insertPOItem = db.prepare(
    "INSERT INTO purchase_order_items (po_id, name, qty, price) VALUES (?, ?, ?, ?)"
  );
  
  const qtyNum = parseInt(String(req.qty).replace(/[^\d]/g, ''), 10) || 1;
  const unitPrice = `₹${Math.round(totalCost / qtyNum)}/unit`;
  
  insertPOItem.run(poId, req.item, req.qty, unitPrice);

  return { success: true, requisitionNumber: reqNum, poNumber: poNum, status };
});
