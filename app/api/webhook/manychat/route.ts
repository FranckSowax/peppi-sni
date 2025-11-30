import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Créer un client Supabase avec la clé service pour bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mapping des projets
const PROJECT_MAPPING: Record<string, { id: number; name: string }> = {
  'residence_palmiers': { id: 1, name: 'Résidence Les Palmiers' },
  'palmiers': { id: 1, name: 'Résidence Les Palmiers' },
  'les palmiers': { id: 1, name: 'Résidence Les Palmiers' },
  'centre_oloumi': { id: 2, name: 'Centre Commercial Oloumi' },
  'oloumi': { id: 2, name: 'Centre Commercial Oloumi' },
  'logements_nzeng': { id: 3, name: 'Logements Sociaux Nzeng-Ayong' },
  'nzeng': { id: 3, name: 'Logements Sociaux Nzeng-Ayong' },
  'nzeng-ayong': { id: 3, name: 'Logements Sociaux Nzeng-Ayong' },
  'bureaux_ministeriels': { id: 4, name: 'Bureaux Ministériels' },
  'ministeriels': { id: 4, name: 'Bureaux Ministériels' },
  'ecole_akebe': { id: 5, name: 'École Primaire Akébé' },
  'akebe': { id: 5, name: 'École Primaire Akébé' },
  'hopital_franceville': { id: 6, name: 'Hôpital Régional Franceville' },
  'franceville': { id: 6, name: 'Hôpital Régional Franceville' },
};

// Mapping des types de rapport
const REPORT_TYPE_MAPPING: Record<string, string> = {
  'avancement': 'avancement',
  'avancée': 'avancement',
  'avancee': 'avancement',
  'progression': 'avancement',
  'problème': 'probleme',
  'probleme': 'probleme',
  'pb': 'probleme',
  'incident': 'probleme',
  'urgence': 'probleme',
  'livraison': 'livraison',
  'materiau': 'livraison',
  'matériaux': 'livraison',
  'reception': 'livraison',
  'photos': 'photos',
  'photo': 'photos',
  'images': 'photos',
  'message': 'message',
  'autre': 'message',
};

// Mapping des priorités
const PRIORITY_MAPPING: Record<string, string> = {
  'haute': 'haute',
  'high': 'haute',
  'urgent': 'haute',
  'urgente': 'haute',
  'critique': 'haute',
  '🔴': 'haute',
  'moyenne': 'moyenne',
  'medium': 'moyenne',
  'normal': 'moyenne',
  'modérée': 'moyenne',
  '🟡': 'moyenne',
  'basse': 'basse',
  'low': 'basse',
  'faible': 'basse',
  'info': 'basse',
  '🟢': 'basse',
};

function normalizeString(str: string): string {
  return str.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function findProject(projectInput: string): { id: number | null; name: string | null } {
  if (!projectInput) return { id: null, name: null };
  
  const normalized = normalizeString(projectInput);
  
  // Chercher une correspondance exacte ou partielle
  for (const [key, value] of Object.entries(PROJECT_MAPPING)) {
    if (normalized.includes(normalizeString(key)) || normalizeString(key).includes(normalized)) {
      return value;
    }
  }
  
  // Si pas trouvé, retourner le nom tel quel
  return { id: null, name: projectInput };
}

function findReportType(typeInput: string): string {
  if (!typeInput) return 'message';
  
  const normalized = normalizeString(typeInput);
  
  for (const [key, value] of Object.entries(REPORT_TYPE_MAPPING)) {
    if (normalized.includes(normalizeString(key))) {
      return value;
    }
  }
  
  return 'message';
}

function findPriority(priorityInput: string): string {
  if (!priorityInput) return 'moyenne';
  
  const normalized = normalizeString(priorityInput);
  
  for (const [key, value] of Object.entries(PRIORITY_MAPPING)) {
    if (normalized.includes(normalizeString(key))) {
      return value;
    }
  }
  
  return 'moyenne';
}

function parsePhotos(photosInput: string | string[] | null): string[] {
  if (!photosInput) return [];
  
  if (Array.isArray(photosInput)) {
    return photosInput.filter(url => url && url.startsWith('http'));
  }
  
  if (typeof photosInput === 'string') {
    // Peut être une URL unique ou plusieurs séparées par virgule/espace
    const urls = photosInput.split(/[,\s]+/).filter(url => url && url.startsWith('http'));
    return urls;
  }
  
  return [];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('ManyChat Webhook received:', JSON.stringify(body, null, 2));

    // Extraire les champs ManyChat (custom user fields)
    // Format ManyChat: cuf_XXXXXXX ou directement les noms
    const senderName = body.cuf_13972417 || body.sender_name || body.name || body.user_name || 'Inconnu';
    const senderPhone = body.phone || body.wa_phone || body.whatsapp_phone || body.sender_phone || '';
    const projectInput = body.cuf_13972421 || body.project || body.project_name || body.projet || '';
    const reportTypeInput = body.cuf_13972438 || body.type || body.report_type || body.type_rapport || '';
    const priorityInput = body.cuf_13972456 || body.priority || body.priorite || body.urgence || '';
    const messageContent = body.cuf_13972454 || body.message || body.content || body.description || body.text || '';
    const photosInput = body.cuf_13972469 || body.photos || body.images || body.media || [];

    // Parser et normaliser les données
    const project = findProject(projectInput);
    const reportType = findReportType(reportTypeInput);
    const priority = findPriority(priorityInput);
    const photos = parsePhotos(photosInput);

    // Construire l'objet à insérer
    const messageData = {
      sender_name: senderName,
      sender_phone: senderPhone,
      project_id: project.id,
      project_name: project.name,
      report_type: reportType,
      content: messageContent,
      priority: priority,
      photos: photos,
      status: 'nouveau',
    };

    console.log('Inserting message:', messageData);

    // Insérer dans Supabase
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert([messageData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log('Message inserted:', data);

    return NextResponse.json({
      success: true,
      message: 'Rapport reçu avec succès',
      id: data.id,
      data: {
        sender: senderName,
        project: project.name,
        type: reportType,
        priority: priority,
        photos_count: photos.length,
      }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du traitement du webhook' },
      { status: 500 }
    );
  }
}

// Permettre aussi GET pour tester
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'ManyChat Webhook endpoint is active',
    expected_fields: {
      cuf_13972417: 'Expéditeur (sender_name)',
      cuf_13972421: 'Projet (project)',
      cuf_13972438: 'Type de rapport (report_type)',
      cuf_13972456: 'Priorité (priority)',
      cuf_13972454: 'Message (content)',
      cuf_13972469: 'Photos (photos array)',
      phone: 'Numéro WhatsApp',
    },
    supported_report_types: ['avancement', 'probleme', 'livraison', 'photos', 'message'],
    supported_priorities: ['haute', 'moyenne', 'basse'],
  });
}
