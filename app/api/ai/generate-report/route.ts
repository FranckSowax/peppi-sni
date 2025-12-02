import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Gemini API (Google AI)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface WhatsAppMessage {
  id: string;
  sender_name: string;
  sender_phone: string;
  project_name: string | null;
  report_type: string | null;
  content: string;
  priority: string | null;
  photos: string[];
  created_at: string;
}

async function generateWithGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
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

async function generateWithOpenAI(prompt: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Tu es un assistant professionnel spécialisé dans la rédaction de rapports de chantier pour la direction. Tu rédiges en français de manière claire, concise et professionnelle.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
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

// Génération de rapport basique sans IA (fallback)
function generateBasicReport(messages: WhatsAppMessage[], startDate: string, endDate: string): string {
  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const problemes = messages.filter(m => m.report_type === 'probleme');
  const avancements = messages.filter(m => m.report_type === 'avancement');
  const livraisons = messages.filter(m => m.report_type === 'livraison');
  
  const projets = new Map<string, WhatsAppMessage[]>();
  messages.forEach(m => {
    const projet = m.project_name || 'Non spécifié';
    if (!projets.has(projet)) projets.set(projet, []);
    projets.get(projet)!.push(m);
  });

  let report = `# 📋 Rapport de Synthèse des Chantiers

📅 **Période:** Du ${formatDate(startDate)} au ${formatDate(endDate)}

---

## 📊 Résumé Exécutif

Durant cette période, **${messages.length} messages** ont été collectés via WhatsApp concernant **${projets.size} projet(s)**.

| Catégorie | Nombre |
|-----------|--------|
| 🔴 Problèmes signalés | ${problemes.length} |
| ✅ Avancées rapportées | ${avancements.length} |
| 📦 Livraisons | ${livraisons.length} |

---

## 🏗️ Projets Concernés

${Array.from(projets.keys()).map(p => `- **${p}** (${projets.get(p)!.length} messages)`).join('\n')}

`;

  if (problemes.length > 0) {
    report += `---

## ⚠️ Problèmes Signalés (${problemes.length})

`;
    problemes.forEach((p, i) => {
      const priority = p.priority === 'haute' ? '🔴' : p.priority === 'moyenne' ? '🟠' : '🟡';
      report += `### ${i + 1}. ${priority} ${p.project_name || 'Projet non spécifié'}

- **Signalé par:** ${p.sender_name}
- **Date:** ${new Date(p.created_at).toLocaleDateString('fr-FR')}
- **Description:** ${p.content}
${p.photos.length > 0 ? `- **Photos:** ${p.photos.length} photo(s) jointe(s)` : ''}

`;
    });
  }

  if (avancements.length > 0) {
    report += `---

## ✅ Avancées des Travaux (${avancements.length})

`;
    avancements.forEach((a, i) => {
      report += `### ${i + 1}. ${a.project_name || 'Projet non spécifié'}

- **Rapporté par:** ${a.sender_name}
- **Date:** ${new Date(a.created_at).toLocaleDateString('fr-FR')}
- **Description:** ${a.content}
${a.photos.length > 0 ? `- **Photos:** ${a.photos.length} photo(s) jointe(s)` : ''}

`;
    });
  }

  if (livraisons.length > 0) {
    report += `---

## 📦 Livraisons de Matériaux (${livraisons.length})

`;
    livraisons.forEach((l, i) => {
      report += `### ${i + 1}. ${l.project_name || 'Projet non spécifié'}

- **Rapporté par:** ${l.sender_name}
- **Date:** ${new Date(l.created_at).toLocaleDateString('fr-FR')}
- **Description:** ${l.content}

`;
    });
  }

  report += `---

## 📝 Note

*Ce rapport a été généré automatiquement à partir des messages WhatsApp collectés. Pour une analyse plus détaillée avec recommandations IA, veuillez configurer une clé API (Gemini ou OpenAI).*

---

**Généré le:** ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
`;

  return report;
}

function buildPrompt(messages: WhatsAppMessage[], startDate: string, endDate: string): string {
  // Grouper les messages par type
  const problemes = messages.filter(m => m.report_type === 'probleme');
  const avancements = messages.filter(m => m.report_type === 'avancement');
  const livraisons = messages.filter(m => m.report_type === 'livraison');
  const autres = messages.filter(m => !['probleme', 'avancement', 'livraison'].includes(m.report_type || ''));

  // Grouper par projet
  const projets = new Map<string, WhatsAppMessage[]>();
  messages.forEach(m => {
    const projet = m.project_name || 'Non spécifié';
    if (!projets.has(projet)) projets.set(projet, []);
    projets.get(projet)!.push(m);
  });

  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let prompt = `Tu es un assistant de direction pour la SNI (Société Nationale Immobilière du Gabon). 
Rédige un rapport professionnel de synthèse destiné à la direction générale.

📅 PÉRIODE DU RAPPORT: Du ${formatDate(startDate)} au ${formatDate(endDate)}

📊 DONNÉES COLLECTÉES VIA WHATSAPP:
- Total messages: ${messages.length}
- Problèmes signalés: ${problemes.length}
- Avancées rapportées: ${avancements.length}
- Livraisons de matériaux: ${livraisons.length}
- Autres messages: ${autres.length}

📁 PROJETS CONCERNÉS: ${Array.from(projets.keys()).join(', ')}

`;

  // Détail des problèmes
  if (problemes.length > 0) {
    prompt += `\n⚠️ PROBLÈMES SIGNALÉS (${problemes.length}):\n`;
    problemes.forEach((p, i) => {
      prompt += `${i + 1}. [${p.project_name || 'N/A'}] ${p.priority ? `(Priorité: ${p.priority})` : ''}\n`;
      prompt += `   Signalé par: ${p.sender_name} le ${new Date(p.created_at).toLocaleDateString('fr-FR')}\n`;
      prompt += `   Description: ${p.content}\n`;
      if (p.photos.length > 0) prompt += `   📸 ${p.photos.length} photo(s) jointe(s)\n`;
      prompt += '\n';
    });
  }

  // Détail des avancements
  if (avancements.length > 0) {
    prompt += `\n✅ AVANCÉES DES TRAVAUX (${avancements.length}):\n`;
    avancements.forEach((a, i) => {
      prompt += `${i + 1}. [${a.project_name || 'N/A'}]\n`;
      prompt += `   Rapporté par: ${a.sender_name} le ${new Date(a.created_at).toLocaleDateString('fr-FR')}\n`;
      prompt += `   Description: ${a.content}\n`;
      if (a.photos.length > 0) prompt += `   📸 ${a.photos.length} photo(s) jointe(s)\n`;
      prompt += '\n';
    });
  }

  // Détail des livraisons
  if (livraisons.length > 0) {
    prompt += `\n📦 LIVRAISONS DE MATÉRIAUX (${livraisons.length}):\n`;
    livraisons.forEach((l, i) => {
      prompt += `${i + 1}. [${l.project_name || 'N/A'}]\n`;
      prompt += `   Rapporté par: ${l.sender_name} le ${new Date(l.created_at).toLocaleDateString('fr-FR')}\n`;
      prompt += `   Description: ${l.content}\n`;
      if (l.photos.length > 0) prompt += `   📸 ${l.photos.length} photo(s) jointe(s)\n`;
      prompt += '\n';
    });
  }

  prompt += `
📝 INSTRUCTIONS POUR LE RAPPORT:

Rédige un rapport professionnel structuré avec les sections suivantes:

1. **RÉSUMÉ EXÉCUTIF** (3-4 phrases)
   - Vue d'ensemble de la période
   - Points clés à retenir

2. **AVANCEMENT DES PROJETS**
   - Synthèse des progrès par projet
   - Jalons atteints

3. **PROBLÈMES ET URGENCES**
   - Liste des problèmes critiques
   - Actions recommandées
   - Niveau d'urgence

4. **LOGISTIQUE ET APPROVISIONNEMENT**
   - Matériaux reçus
   - État des stocks si mentionné

5. **RECOMMANDATIONS**
   - Actions prioritaires à entreprendre
   - Points de vigilance

6. **CONCLUSION**
   - Perspective pour la période suivante

Utilise un ton professionnel et factuel. Mets en évidence les urgences avec des indicateurs visuels (⚠️, 🔴, etc.).
Le rapport doit être prêt à être présenté à la direction générale.
`;

  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    const { startDate, endDate } = await request.json();

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Les dates de début et fin sont requises' },
        { status: 400 }
      );
    }

    // Récupérer les messages WhatsApp pour la période
    const { data: messages, error: fetchError } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate + 'T23:59:59')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Supabase error:', fetchError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des messages' },
        { status: 500 }
      );
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json({
        success: true,
        report: `# Rapport de Synthèse\n\n📅 Période: Du ${new Date(startDate).toLocaleDateString('fr-FR')} au ${new Date(endDate).toLocaleDateString('fr-FR')}\n\n⚠️ **Aucun message WhatsApp n'a été collecté durant cette période.**\n\nAucune activité terrain à rapporter.`,
        stats: {
          total: 0,
          problemes: 0,
          avancements: 0,
          livraisons: 0,
        },
        provider: 'none',
      });
    }

    // Construire le prompt
    const prompt = buildPrompt(messages as WhatsAppMessage[], startDate, endDate);

    // Vérifier si au moins une clé API est configurée
    const hasGemini = !!GEMINI_API_KEY;
    const hasOpenAI = !!OPENAI_API_KEY;
    
    console.log('API Keys status:', { hasGemini, hasOpenAI });
    
    if (!hasGemini && !hasOpenAI) {
      return NextResponse.json(
        { error: 'Aucune clé API configurée. Veuillez configurer GEMINI_API_KEY ou OPENAI_API_KEY.' },
        { status: 500 }
      );
    }

    // Essayer Gemini d'abord, puis OpenAI en fallback
    let report = '';
    let provider = '';
    let lastError = '';

    if (hasGemini) {
      try {
        report = await generateWithGemini(prompt);
        provider = 'gemini';
      } catch (geminiError) {
        console.log('Gemini failed:', geminiError);
        lastError = String(geminiError);
      }
    }
    
    if (!report && hasOpenAI) {
      try {
        report = await generateWithOpenAI(prompt);
        provider = 'openai';
      } catch (openaiError) {
        console.error('OpenAI failed:', openaiError);
        lastError = String(openaiError);
      }
    }
    
    // Si aucune API ne fonctionne, générer un rapport basique
    if (!report) {
      console.log('Falling back to basic report generation');
      report = generateBasicReport(messages as WhatsAppMessage[], startDate, endDate);
      provider = 'basic';
    }

    // Statistiques
    const uniqueProjets = Array.from(new Set(messages.map((m: WhatsAppMessage) => m.project_name).filter(Boolean)));
    const stats = {
      total: messages.length,
      problemes: messages.filter((m: WhatsAppMessage) => m.report_type === 'probleme').length,
      avancements: messages.filter((m: WhatsAppMessage) => m.report_type === 'avancement').length,
      livraisons: messages.filter((m: WhatsAppMessage) => m.report_type === 'livraison').length,
      projets: uniqueProjets,
    };

    return NextResponse.json({
      success: true,
      report,
      stats,
      provider,
      period: {
        start: startDate,
        end: endDate,
      },
    });

  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du rapport' },
      { status: 500 }
    );
  }
}
