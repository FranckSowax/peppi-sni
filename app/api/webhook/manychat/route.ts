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
    
    // Stocker le raw body pour debug
    const rawBodyForDebug = JSON.stringify(body);

    // Extraire les champs ManyChat - chercher dans toutes les clés possibles
    const allKeys = Object.keys(body);
    console.log('All received keys:', allKeys);
    
    // Chercher le nom de l'expéditeur
    const senderName = body.cuf_13972417 || body.sender_name || body.name || body.user_name || body.full_name || body.first_name || 'Inconnu';
    const senderPhone = body.phone || body.wa_phone || body.whatsapp_phone || body.sender_phone || '';
    const projectInput = body.cuf_13972421 || body.project || body.project_name || body.projet || '';
    const reportTypeInput = body.report_type_sni || body.cuf_13972438 || body.type || body.report_type || '';
    
    // Priorité (utilisée pour les problèmes signalés)
    const priorityInput = body.priorite_sni || body.cuf_13972456 || body.priority || body.priorite || 'moyenne';
    
    // Messages selon le type de rapport SNI
    // ⚠️ Problème → pb_signales_sni
    // 📊 Avancement → avancees_sni  
    // 📦 Livraison → materiaux_sni
    const messageContent = 
      body.pb_signales_sni ||      // Message Problème
      body.avancees_sni ||         // Message Avancement
      body.materiaux_sni ||        // Message Livraison
      body.cuf_13972443 ||         // Fallback ancien format
      body.cuf_13972454 ||
      body.cuf_13972475 ||
      body.message || 
      body.content || 
      '';
    
    // Collecter toutes les photos individuelles
    const allPhotos: string[] = [];
    
    // Photos selon le type de rapport SNI
    const photoFields = [
      // Photos Problème
      'image_pb_sni_1', 'image_pb_sni_2', 'image_pb_sni_3',
      // Photos Avancement
      'image_avancee_sni_1', 'image_avancee_sni_2', 'image_avancee_sni_3',
      // Photos Livraison Matériaux
      'materiaux_sni_1', 'materiaux_sni_2', 'materiaux_sni_3',
      // Anciens formats (fallback)
      'cuf_13972469', 'cuf_13972470', 'cuf_13972471', 'cuf_13972472', 
      'cuf_13972473', 'cuf_13972474',
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
    const photos = Array.from(new Set(allPhotos));

    // Parser et normaliser les données
    const project = findProject(projectInput);
    const reportType = findReportType(reportTypeInput);
    const priority = findPriority(priorityInput);

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
      received_keys: allKeys,
      parsed_data: {
        sender: senderName,
        project: project.name,
        type: reportType,
        priority: priority,
        content: messageContent.substring(0, 100),
        photos_count: photos.length,
      },
      raw_body_sample: rawBodyForDebug.substring(0, 500)
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
    message: 'ManyChat Webhook SNI - Endpoint actif',
    variables_sni: {
      common: {
        cuf_13972417: '👤 Expéditeur',
        cuf_13972421: '🏗️ Projet',
        report_type_sni: '📋 Type de rapport',
        phone: '📱 Numéro WhatsApp',
      },
      probleme: {
        report_type_sni: '⚠️ Signaler Problème',
        pb_signales_sni: '📝 Contenu du problème',
        priorite_sni: '⚡ Priorité (haute/moyenne/basse)',
        image_pb_sni_1: '📸 Photo problème 1',
        image_pb_sni_2: '📸 Photo problème 2',
        image_pb_sni_3: '📸 Photo problème 3',
      },
      avancement: {
        report_type_sni: '📊 Avancement travaux',
        avancees_sni: '📝 Contenu avancement',
        image_avancee_sni_1: '📸 Photo avancement 1',
        image_avancee_sni_2: '📸 Photo avancement 2',
        image_avancee_sni_3: '📸 Photo avancement 3',
      },
      livraison: {
        report_type_sni: '📦 Livraison matériaux',
        materiaux_sni: '📝 Contenu livraison',
        materiaux_sni_1: '📸 Photo matériaux 1',
        materiaux_sni_2: '📸 Photo matériaux 2',
        materiaux_sni_3: '📸 Photo matériaux 3',
      },
    },
    supported_report_types: ['avancement', 'probleme', 'livraison', 'photos', 'message'],
    supported_priorities: ['haute', 'moyenne', 'basse'],
    example_probleme: {
      cuf_13972417: 'Jean Dupont',
      cuf_13972421: 'Résidence Les Palmiers',
      report_type_sni: '⚠️ Signaler Problème',
      priorite_sni: 'haute',
      pb_signales_sni: 'Fuite eau détectée au 2ème étage',
      image_pb_sni_1: 'https://example.com/fuite1.jpg',
      image_pb_sni_2: 'https://example.com/fuite2.jpg',
      phone: '+241770000000'
    },
    example_avancement: {
      cuf_13972417: 'Marie Martin',
      cuf_13972421: 'Centre Commercial Oloumi',
      report_type_sni: '📊 Avancement travaux',
      avancees_sni: 'Coulage béton 3ème étage terminé',
      image_avancee_sni_1: 'https://example.com/avancement1.jpg',
      phone: '+241770000001'
    },
    example_livraison: {
      cuf_13972417: 'Pierre Durand',
      cuf_13972421: 'École Akébé',
      report_type_sni: '📦 Livraison matériaux',
      materiaux_sni: 'Réception 500 sacs de ciment',
      materiaux_sni_1: 'https://example.com/livraison1.jpg',
      phone: '+241770000002'
    }
  });
}
