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
    
    // Messages selon le type de rapport (plusieurs variables possibles)
    // cuf_13972443 = message avancement
    // cuf_13972454 = message problème  
    // cuf_13972475 = message livraison
    const messageContent = 
      body.cuf_13972443 ||  // Message avancement
      body.cuf_13972454 ||  // Message problème
      body.cuf_13972475 ||  // Message livraison
      body.message || 
      body.content || 
      body.description || 
      body.text || 
      '';
    
    // Photos - plusieurs variables possibles pour les images collectées
    // cuf_13972469 = photos array ou count
    // Autres variables d'images possibles
    const photosInput = 
      body.cuf_13972469 ||  // Photos principales
      body.cuf_13972470 ||  // Photo 1
      body.cuf_13972471 ||  // Photo 2
      body.cuf_13972472 ||  // Photo 3
      body.cuf_13972473 ||  // Photo 4
      body.cuf_13972474 ||  // Photo 5
      body.photos || 
      body.images || 
      body.media || 
      [];
    
    // Collecter toutes les photos individuelles si elles existent
    const allPhotos: string[] = [];
    
    // Ajouter les photos depuis différentes variables
    const photoFields = [
      'cuf_13972469', 'cuf_13972470', 'cuf_13972471', 'cuf_13972472', 
      'cuf_13972473', 'cuf_13972474', 'cuf_13972476', 'cuf_13972477',
      'cuf_13972478', 'cuf_13972479', 'cuf_13972480',
      'photo_1', 'photo_2', 'photo_3', 'photo_4', 'photo_5',
      'image_1', 'image_2', 'image_3', 'image_4', 'image_5',
      'photos', 'images', 'media'
    ];
    
    for (const field of photoFields) {
      const value = body[field];
      if (value) {
        if (Array.isArray(value)) {
          allPhotos.push(...value.filter((url: string) => url && typeof url === 'string' && url.startsWith('http')));
        } else if (typeof value === 'string' && value.startsWith('http')) {
          allPhotos.push(value);
        } else if (typeof value === 'string' && value.includes('http')) {
          // Peut contenir plusieurs URLs séparées
          const urls = value.split(/[,\s]+/).filter((url: string) => url.startsWith('http'));
          allPhotos.push(...urls);
        }
      }
    }
    
    // Dédupliquer les photos
    const uniquePhotos = Array.from(new Set(allPhotos));

    // Parser et normaliser les données
    const project = findProject(projectInput);
    const reportType = findReportType(reportTypeInput);
    const priority = findPriority(priorityInput);
    
    // Utiliser les photos collectées ou parser l'input
    const photos = uniquePhotos.length > 0 ? uniquePhotos : parsePhotos(photosInput);

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
      cuf_13972417: '👤 Expéditeur (sender_name)',
      cuf_13972421: '🏗️ Projet (project)',
      cuf_13972438: '📋 Type de rapport (report_type)',
      cuf_13972456: '⚡ Priorité (priority)',
      phone: '📱 Numéro WhatsApp',
    },
    message_fields: {
      cuf_13972443: '📝 Message Avancement',
      cuf_13972454: '📝 Message Problème',
      cuf_13972475: '📝 Message Livraison',
    },
    photo_fields: {
      cuf_13972469: '📸 Photos (array ou URLs)',
      cuf_13972470: '📸 Photo 1',
      cuf_13972471: '📸 Photo 2',
      cuf_13972472: '📸 Photo 3',
      cuf_13972473: '📸 Photo 4',
      cuf_13972474: '📸 Photo 5',
    },
    supported_report_types: ['avancement', 'probleme', 'livraison', 'photos', 'message'],
    supported_priorities: ['haute', 'moyenne', 'basse'],
    example_body: {
      cuf_13972417: 'Jean Dupont',
      cuf_13972421: 'Résidence Les Palmiers',
      cuf_13972438: 'avancement',
      cuf_13972456: 'haute',
      cuf_13972443: 'Les travaux avancent bien, coulage béton terminé',
      cuf_13972469: 'https://example.com/photo1.jpg',
      phone: '+241770000000'
    }
  });
}
