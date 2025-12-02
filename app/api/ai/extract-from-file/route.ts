import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface ExtractedItem {
  name: string;
  description?: string;
  category?: string;
  quantity?: number;
  unit?: string;
  price?: number;
  currency?: string;
  supplier?: string;
}

// Détection de devise
function detectCurrency(text: string): string | null {
  if (!text) return null;
  const textLower = text.toLowerCase();
  
  if (textLower.includes('€') || textLower.includes('eur')) return 'EUR';
  if (textLower.includes('$') && !textLower.includes('fcfa')) return 'USD';
  if (textLower.includes('fcfa') || textLower.includes('xaf') || textLower.includes('cfa')) return 'XAF';
  if (textLower.includes('£') || textLower.includes('gbp')) return 'GBP';
  if (textLower.includes('¥') || textLower.includes('cny') || textLower.includes('rmb')) return 'CNY';
  if (textLower.includes('dh') || textLower.includes('mad')) return 'MAD';
  if (textLower.includes('da') || textLower.includes('dzd')) return 'DZD';
  
  return null;
}

// Parsing des prix
function parsePrice(value: string): { price: number | null; currency: string | null } {
  if (!value) return { price: null, currency: null };
  
  const currency = detectCurrency(value);
  
  // Nettoyage
  let cleanPrice = value
    .replace(/[€$£¥]/g, '')
    .replace(/fcfa|xaf|eur|usd|cfa/gi, '')
    .replace(/\s/g, '')
    .replace(/,/g, '.')
    .trim();
  
  const match = cleanPrice.match(/[\d.]+/);
  const price = match ? parseFloat(match[0]) : null;
  
  return { price, currency };
}

// Découpage en chunks
function splitTextIntoChunks(text: string, maxChunkSize: number = 6000): string[] {
  const chunks: string[] = [];
  const lines = text.split('\n');
  let currentChunk = '';
  
  for (const line of lines) {
    if (currentChunk.length + line.length + 1 > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
    currentChunk += line + '\n';
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.length > 0 ? chunks : [text];
}

// Parsing CSV
function parseCSV(content: string): { headers: string[]; rows: string[][] } {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  
  const firstLine = lines[0];
  
  // Détection du séparateur
  let separator = ',';
  if (firstLine.includes(';') && !firstLine.includes(',')) separator = ';';
  if (firstLine.includes('\t')) separator = '\t';
  
  const headers = lines[0].split(separator).map(h => h.trim().replace(/"/g, ''));
  const rows = lines.slice(1).map(line => 
    line.split(separator).map(cell => cell.trim().replace(/"/g, ''))
  );
  
  return { headers, rows };
}

// Mapping intelligent des colonnes CSV
function mapCSVColumns(headers: string[]): Record<string, number> {
  const headerLower = headers.map(h => h.toLowerCase());
  const mapping: Record<string, number> = {};
  
  // Nom
  const nameIdx = headerLower.findIndex(h => 
    h.includes('nom') || h.includes('désignation') || h.includes('designation') ||
    h.includes('article') || h.includes('produit') || h.includes('name') || 
    h.includes('item') || h.includes('libellé') || h.includes('libelle')
  );
  if (nameIdx >= 0) mapping.name = nameIdx;
  
  // Description
  const descIdx = headerLower.findIndex(h => 
    h.includes('description') || h.includes('desc') || h.includes('détail')
  );
  if (descIdx >= 0) mapping.description = descIdx;
  
  // Catégorie
  const catIdx = headerLower.findIndex(h => 
    h.includes('catégorie') || h.includes('categorie') || h.includes('category') ||
    h.includes('type') || h.includes('famille')
  );
  if (catIdx >= 0) mapping.category = catIdx;
  
  // Quantité
  const qtyIdx = headerLower.findIndex(h => 
    h.includes('quantité') || h.includes('quantite') || h.includes('quantity') ||
    h.includes('qté') || h.includes('qty') || h.includes('nombre')
  );
  if (qtyIdx >= 0) mapping.quantity = qtyIdx;
  
  // Unité
  const unitIdx = headerLower.findIndex(h => 
    h.includes('unité') || h.includes('unite') || h.includes('unit') || h.includes('u.')
  );
  if (unitIdx >= 0) mapping.unit = unitIdx;
  
  // Prix
  const priceIdx = headerLower.findIndex(h => 
    h.includes('prix') || h.includes('price') || h.includes('tarif') ||
    h.includes('cout') || h.includes('coût') || h.includes('pu') || 
    h.includes('p.u') || h.includes('montant')
  );
  if (priceIdx >= 0) mapping.price = priceIdx;
  
  // Fournisseur
  const supplierIdx = headerLower.findIndex(h => 
    h.includes('fournisseur') || h.includes('supplier') || h.includes('vendor') ||
    h.includes('fabricant') || h.includes('marque') || h.includes('brand')
  );
  if (supplierIdx >= 0) mapping.supplier = supplierIdx;
  
  return mapping;
}

// Extraction depuis CSV
function extractFromCSV(content: string): ExtractedItem[] {
  const { headers, rows } = parseCSV(content);
  if (headers.length === 0) return [];
  
  const mapping = mapCSVColumns(headers);
  const items: ExtractedItem[] = [];
  
  // Détecter la devise globale
  const globalCurrency = detectCurrency(content) || 'XAF';
  
  for (const row of rows) {
    if (row.length === 0 || row.every(cell => !cell)) continue;
    
    const nameIdx = mapping.name ?? 0;
    const name = row[nameIdx];
    
    if (!name || name.toLowerCase().includes('total') || name.toLowerCase().includes('sous-total')) {
      continue;
    }
    
    const item: ExtractedItem = { name };
    
    if (mapping.description !== undefined && row[mapping.description]) {
      item.description = row[mapping.description];
    }
    if (mapping.category !== undefined && row[mapping.category]) {
      item.category = row[mapping.category];
    }
    if (mapping.quantity !== undefined && row[mapping.quantity]) {
      const qty = parseFloat(row[mapping.quantity].replace(',', '.'));
      if (!isNaN(qty)) item.quantity = qty;
    }
    if (mapping.unit !== undefined && row[mapping.unit]) {
      item.unit = row[mapping.unit];
    }
    if (mapping.price !== undefined && row[mapping.price]) {
      const { price, currency } = parsePrice(row[mapping.price]);
      if (price) item.price = price;
      item.currency = currency || globalCurrency;
    }
    if (mapping.supplier !== undefined && row[mapping.supplier]) {
      item.supplier = row[mapping.supplier];
    }
    
    items.push(item);
  }
  
  return items;
}

// Génération avec Gemini
async function generateWithGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8192,
        },
      }),
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }
  
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// Génération avec OpenAI
async function generateWithOpenAI(prompt: string): Promise<string> {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en extraction de données BTP. Tu extrais les matériaux, quantités, prix et fournisseurs depuis des documents. Réponds uniquement en JSON valide.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// Extraction IA depuis texte
async function extractWithAI(textContent: string, globalCurrency: string, chunkIndex: number, totalChunks: number): Promise<ExtractedItem[]> {
  const prompt = `Tu es un expert en extraction de données BTP.

CONTEXTE: Document texte, partie ${chunkIndex + 1}/${totalChunks}
DEVISE DÉTECTÉE: ${globalCurrency}

CONTENU À ANALYSER:
"""
${textContent.substring(0, 8000)}
"""

MISSION - EXTRACTION COMPLÈTE DES MATÉRIAUX:
1. Identifie CHAQUE matériau, article, équipement, produit
2. Extrais les quantités (même approximatives)
3. Détecte les unités (m, m², m³, kg, L, U, pièce, lot, sac, etc.)
4. PRIX: Extrais le prix unitaire si mentionné
5. DEVISE: Identifie la devise (EUR, USD, XAF/FCFA, etc.)
6. FOURNISSEUR: Identifie le fournisseur ou marque si mentionné
7. CATÉGORIE: Classe dans une catégorie BTP

CATÉGORIES POSSIBLES:
- Gros œuvre (ciment, béton, fer, parpaings...)
- Second œuvre (plâtre, peinture, carrelage...)
- Menuiserie (portes, fenêtres, bois...)
- Électricité (câbles, prises, disjoncteurs...)
- Plomberie (tuyaux, robinets, sanitaires...)
- Couverture (tuiles, tôles, étanchéité...)
- Équipements (climatisation, ascenseurs...)

RÉPONDS UNIQUEMENT EN JSON VALIDE:
{
  "items": [
    {
      "name": "Ciment CEM II 42.5",
      "description": "Sac de 50kg haute résistance",
      "category": "Gros œuvre",
      "quantity": 50,
      "unit": "sac",
      "price": 4500,
      "currency": "XAF",
      "supplier": "CIMENCAM"
    }
  ]
}

IMPORTANT: 
- Extrais TOUS les matériaux trouvés
- Si pas de prix/quantité, omets le champ
- JSON valide uniquement, pas de texte avant/après`;

  let result = '';
  
  // Essayer Gemini d'abord
  if (GEMINI_API_KEY) {
    try {
      result = await generateWithGemini(prompt);
    } catch (e) {
      console.log('Gemini failed, trying OpenAI:', e);
    }
  }
  
  // Fallback OpenAI
  if (!result && OPENAI_API_KEY) {
    try {
      result = await generateWithOpenAI(prompt);
    } catch (e) {
      console.error('OpenAI also failed:', e);
    }
  }
  
  if (!result) {
    return [];
  }
  
  // Parser le JSON
  try {
    // Nettoyer la réponse
    let jsonStr = result;
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    const parsed = JSON.parse(jsonStr);
    return parsed.items || [];
  } catch (e) {
    console.error('JSON parse error:', e);
    return [];
  }
}

// Déduplication intelligente
function deduplicateItems(items: ExtractedItem[]): ExtractedItem[] {
  const seen = new Map<string, ExtractedItem>();
  
  for (const item of items) {
    const key = item.name.toLowerCase().trim().replace(/\s+/g, ' ');
    
    if (seen.has(key)) {
      const existing = seen.get(key)!;
      
      // Fusionner les quantités
      if (item.quantity && existing.quantity) {
        existing.quantity += item.quantity;
      } else if (item.quantity) {
        existing.quantity = item.quantity;
      }
      
      // Garder la description la plus longue
      if (item.description && (!existing.description || item.description.length > existing.description.length)) {
        existing.description = item.description;
      }
      
      // Garder le prix s'il n'existe pas
      if (item.price && !existing.price) {
        existing.price = item.price;
        existing.currency = item.currency;
      }
      
      // Garder le fournisseur s'il n'existe pas
      if (item.supplier && !existing.supplier) {
        existing.supplier = item.supplier;
      }
      
      // Garder la catégorie s'il n'existe pas
      if (item.category && !existing.category) {
        existing.category = item.category;
      }
    } else {
      seen.set(key, { ...item });
    }
  }
  
  return Array.from(seen.values());
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const textContent = formData.get('textContent') as string | null;
    const fileType = formData.get('fileType') as string || 'txt';
    
    let content = textContent || '';
    let method = 'ai-extraction';
    
    // Si fichier fourni, lire le contenu
    if (file) {
      const fileName = file.name.toLowerCase();
      
      if (fileName.endsWith('.csv')) {
        content = await file.text();
        method = 'csv-deterministic';
      } else if (fileName.endsWith('.txt')) {
        content = await file.text();
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        // Excel sera traité côté client avec xlsx
        return NextResponse.json({
          error: 'Excel files should be processed client-side with xlsx library',
          hint: 'Use /api/ai/analyze-file-structure for Excel column mapping'
        }, { status: 400 });
      }
    }
    
    if (!content) {
      return NextResponse.json({ error: 'No content to extract' }, { status: 400 });
    }
    
    // Détecter la devise globale
    const globalCurrency = detectCurrency(content) || 'XAF';
    
    let items: ExtractedItem[] = [];
    
    // Extraction selon le type
    if (method === 'csv-deterministic' || fileType === 'csv') {
      items = extractFromCSV(content);
      method = 'csv-deterministic';
    } else {
      // Extraction IA pour PDF, TXT, DOC
      const chunks = splitTextIntoChunks(content, 6000);
      
      for (let i = 0; i < chunks.length; i++) {
        const chunkItems = await extractWithAI(chunks[i], globalCurrency, i, chunks.length);
        items.push(...chunkItems);
      }
      
      method = 'ai-extraction';
    }
    
    // Déduplication
    const uniqueItems = deduplicateItems(items);
    
    // Statistiques
    const categories = Array.from(new Set(uniqueItems.map(i => i.category).filter(Boolean)));
    const suppliers = Array.from(new Set(uniqueItems.map(i => i.supplier).filter(Boolean)));
    
    return NextResponse.json({
      success: true,
      items: uniqueItems,
      categories,
      suppliers,
      detectedCurrency: globalCurrency,
      method,
      fileType,
      stats: {
        totalChars: content.length,
        rawItems: items.length,
        uniqueItems: uniqueItems.length,
        itemsWithPrice: uniqueItems.filter(i => i.price).length,
        itemsWithSupplier: uniqueItems.filter(i => i.supplier).length,
        itemsWithCategory: uniqueItems.filter(i => i.category).length,
      }
    });
    
  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'extraction', details: String(error) },
      { status: 500 }
    );
  }
}
