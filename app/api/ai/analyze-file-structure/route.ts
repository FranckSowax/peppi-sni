import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface ColumnMapping {
  name?: number;
  description?: number;
  category?: number;
  quantity?: number;
  unit?: number;
  price?: number;
  supplier?: number;
}

interface AnalysisResult {
  headerRowIndex: number;
  columns: ColumnMapping;
  currency: string;
  confidence: number;
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
          temperature: 0.1,
          maxOutputTokens: 2048,
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
          content: 'Tu es un expert en analyse de structure de fichiers Excel. Tu identifies les colonnes et leur mapping. Réponds uniquement en JSON valide.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 1024,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// Analyse heuristique des colonnes
function analyzeColumnsHeuristic(rows: any[][]): AnalysisResult {
  // Trouver la ligne d'en-tête (première ligne avec plusieurs cellules texte)
  let headerRowIndex = 0;
  
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const row = rows[i];
    if (!row) continue;
    
    const textCells = row.filter(cell => 
      typeof cell === 'string' && 
      cell.trim().length > 0 &&
      cell.trim().length < 50
    );
    
    // Si plus de 3 cellules texte courtes, c'est probablement l'en-tête
    if (textCells.length >= 3) {
      headerRowIndex = i;
      break;
    }
  }
  
  const headerRow = rows[headerRowIndex] || [];
  const columns: ColumnMapping = {};
  
  // Mapping des colonnes par mots-clés
  headerRow.forEach((cell, idx) => {
    if (!cell) return;
    const cellLower = String(cell).toLowerCase().trim();
    
    // Nom
    if (!columns.name && (
      cellLower.includes('nom') || cellLower.includes('désignation') || 
      cellLower.includes('designation') || cellLower.includes('article') ||
      cellLower.includes('produit') || cellLower.includes('libellé') ||
      cellLower.includes('libelle') || cellLower === 'name' || cellLower === 'item'
    )) {
      columns.name = idx;
    }
    
    // Description
    if (!columns.description && (
      cellLower.includes('description') || cellLower.includes('détail') ||
      cellLower.includes('detail') || cellLower.includes('spec')
    )) {
      columns.description = idx;
    }
    
    // Catégorie
    if (!columns.category && (
      cellLower.includes('catégorie') || cellLower.includes('categorie') ||
      cellLower.includes('category') || cellLower.includes('type') ||
      cellLower.includes('famille') || cellLower.includes('lot')
    )) {
      columns.category = idx;
    }
    
    // Quantité
    if (!columns.quantity && (
      cellLower.includes('quantité') || cellLower.includes('quantite') ||
      cellLower.includes('quantity') || cellLower.includes('qté') ||
      cellLower.includes('qty') || cellLower.includes('nombre') ||
      cellLower === 'q' || cellLower === 'qt'
    )) {
      columns.quantity = idx;
    }
    
    // Unité
    if (!columns.unit && (
      cellLower.includes('unité') || cellLower.includes('unite') ||
      cellLower.includes('unit') || cellLower === 'u' || cellLower === 'u.'
    )) {
      columns.unit = idx;
    }
    
    // Prix
    if (!columns.price && (
      cellLower.includes('prix') || cellLower.includes('price') ||
      cellLower.includes('tarif') || cellLower.includes('cout') ||
      cellLower.includes('coût') || cellLower.includes('montant') ||
      cellLower.includes('pu') || cellLower.includes('p.u') ||
      cellLower.includes('valeur')
    )) {
      columns.price = idx;
    }
    
    // Fournisseur
    if (!columns.supplier && (
      cellLower.includes('fournisseur') || cellLower.includes('supplier') ||
      cellLower.includes('vendor') || cellLower.includes('fabricant') ||
      cellLower.includes('marque') || cellLower.includes('brand')
    )) {
      columns.supplier = idx;
    }
  });
  
  // Si pas de colonne nom trouvée, prendre la première colonne avec du texte
  if (columns.name === undefined) {
    for (let i = 0; i < headerRow.length; i++) {
      if (headerRow[i] && String(headerRow[i]).trim().length > 0) {
        columns.name = i;
        break;
      }
    }
  }
  
  // Détecter la devise
  let currency = 'XAF';
  const allText = rows.flat().join(' ').toLowerCase();
  if (allText.includes('€') || allText.includes('eur')) currency = 'EUR';
  else if (allText.includes('$') && !allText.includes('fcfa')) currency = 'USD';
  else if (allText.includes('fcfa') || allText.includes('xaf') || allText.includes('cfa')) currency = 'XAF';
  
  // Calculer la confiance
  const foundColumns = Object.keys(columns).length;
  const confidence = Math.min(0.95, 0.5 + (foundColumns * 0.1));
  
  return {
    headerRowIndex,
    columns,
    currency,
    confidence
  };
}

export async function POST(request: NextRequest) {
  try {
    const { fileSample, fileName } = await request.json();
    
    if (!fileSample || !Array.isArray(fileSample)) {
      return NextResponse.json({ error: 'fileSample is required' }, { status: 400 });
    }
    
    // D'abord essayer l'analyse heuristique
    const heuristicResult = analyzeColumnsHeuristic(fileSample);
    
    // Si confiance élevée, retourner directement
    if (heuristicResult.confidence >= 0.8 && Object.keys(heuristicResult.columns).length >= 3) {
      return NextResponse.json({
        config: heuristicResult,
        method: 'heuristic'
      });
    }
    
    // Sinon, utiliser l'IA pour une analyse plus fine
    const prompt = `Analyse cette structure de fichier Excel pour identifier les colonnes.

FICHIER: ${fileName || 'unknown.xlsx'}

ÉCHANTILLON (25 premières lignes):
${JSON.stringify(fileSample.slice(0, 25), null, 2)}

MISSION:
1. Identifie la ligne d'en-tête (index 0-based)
2. Mappe chaque colonne à son type:
   - name: colonne contenant le nom du matériau/article
   - description: colonne description
   - category: colonne catégorie/type
   - quantity: colonne quantité
   - unit: colonne unité
   - price: colonne prix
   - supplier: colonne fournisseur

3. Détecte la devise utilisée (EUR, USD, XAF, etc.)

RÉPONDS UNIQUEMENT EN JSON:
{
  "headerRowIndex": 0,
  "columns": {
    "name": 1,
    "description": 2,
    "quantity": 3,
    "unit": 4,
    "price": 5
  },
  "currency": "XAF",
  "confidence": 0.9
}

IMPORTANT: Les index sont 0-based. Omets les colonnes non trouvées.`;

    let result = '';
    let method = 'ai';
    
    // Essayer Gemini
    if (GEMINI_API_KEY) {
      try {
        result = await generateWithGemini(prompt);
        method = 'gemini';
      } catch (e) {
        console.log('Gemini failed:', e);
      }
    }
    
    // Fallback OpenAI
    if (!result && OPENAI_API_KEY) {
      try {
        result = await generateWithOpenAI(prompt);
        method = 'openai';
      } catch (e) {
        console.error('OpenAI failed:', e);
      }
    }
    
    // Si IA échoue, retourner le résultat heuristique
    if (!result) {
      return NextResponse.json({
        config: heuristicResult,
        method: 'heuristic-fallback'
      });
    }
    
    // Parser le résultat IA
    try {
      let jsonStr = result;
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      
      const parsed = JSON.parse(jsonStr);
      
      return NextResponse.json({
        config: {
          headerRowIndex: parsed.headerRowIndex ?? heuristicResult.headerRowIndex,
          columns: parsed.columns || heuristicResult.columns,
          currency: parsed.currency || heuristicResult.currency,
          confidence: parsed.confidence || 0.85
        },
        method
      });
    } catch (e) {
      console.error('JSON parse error:', e);
      return NextResponse.json({
        config: heuristicResult,
        method: 'heuristic-fallback'
      });
    }
    
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse', details: String(error) },
      { status: 500 }
    );
  }
}
