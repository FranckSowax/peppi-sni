import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Vérifier les variables d'environnement
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return NextResponse.json({ 
        error: 'Configuration Supabase manquante',
        details: { hasUrl: !!supabaseUrl, hasKey: !!supabaseKey }
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const taskId = formData.get('taskId') as string;
    const chantierId = formData.get('chantierId') as string;
    const takenBy = formData.get('takenBy') as string || 'Technicien';

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    console.log('Upload request:', { 
      fileName: file.name, 
      fileType: file.type, 
      fileSize: file.size,
      taskId, 
      chantierId 
    });

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${chantierId || 'unknown'}/${taskId || 'general'}/${timestamp}-${randomId}.${extension}`;

    // Convertir le fichier en ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload vers Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('chantier-photos')
      .upload(fileName, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true, // Permettre l'écrasement si le fichier existe
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ 
        error: 'Erreur upload Supabase',
        details: uploadError.message 
      }, { status: 500 });
    }

    // Obtenir l'URL publique
    const { data: urlData } = supabase.storage
      .from('chantier-photos')
      .getPublicUrl(fileName);

    const photoUrl = urlData.publicUrl;
    console.log('Photo uploaded successfully:', photoUrl);

    // Essayer d'enregistrer dans la table (optionnel, ne bloque pas si erreur)
    try {
      await supabase
        .from('chantier_photos')
        .insert({
          task_id: taskId && !isNaN(parseInt(taskId)) ? parseInt(taskId) : null,
          chantier_id: chantierId && !isNaN(parseInt(chantierId)) ? parseInt(chantierId) : null,
          url: photoUrl,
          taken_by: takenBy,
        });
    } catch (dbErr) {
      console.warn('Could not save to DB (non-blocking):', dbErr);
    }

    return NextResponse.json({
      success: true,
      url: photoUrl,
      fileName: fileName,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET - Récupérer les photos d'un chantier ou d'une tâche
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chantierId = searchParams.get('chantierId');
  const taskId = searchParams.get('taskId');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Configuration manquante' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    let query = supabase.from('chantier_photos').select('*');

    if (taskId) {
      query = query.eq('task_id', parseInt(taskId));
    } else if (chantierId) {
      query = query.eq('chantier_id', parseInt(chantierId));
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ photos: data });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
