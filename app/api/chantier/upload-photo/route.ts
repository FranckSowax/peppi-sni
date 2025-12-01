import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const taskId = formData.get('taskId') as string;
    const chantierId = formData.get('chantierId') as string;
    const caption = formData.get('caption') as string || '';
    const takenBy = formData.get('takenBy') as string || 'Technicien';

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = `chantier-${chantierId}/task-${taskId}/${timestamp}.${extension}`;

    // Convertir le fichier en ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload vers Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('chantier-photos')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 });
    }

    // Obtenir l'URL publique
    const { data: urlData } = supabase.storage
      .from('chantier-photos')
      .getPublicUrl(fileName);

    const photoUrl = urlData.publicUrl;

    // Enregistrer dans la table chantier_photos
    const { data: photoRecord, error: dbError } = await supabase
      .from('chantier_photos')
      .insert({
        task_id: taskId ? parseInt(taskId) : null,
        chantier_id: chantierId ? parseInt(chantierId) : null,
        url: photoUrl,
        caption: caption,
        taken_by: takenBy,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // L'upload a réussi mais pas l'enregistrement en DB
      return NextResponse.json({
        success: true,
        url: photoUrl,
        warning: 'Photo uploadée mais non enregistrée en base',
      });
    }

    // Mettre à jour le compteur de photos dans la tâche si taskId fourni
    if (taskId) {
      const { data: task } = await supabase
        .from('chantier_tasks')
        .select('photos')
        .eq('id', parseInt(taskId))
        .single();

      if (task) {
        const currentPhotos = task.photos || [];
        await supabase
          .from('chantier_tasks')
          .update({
            photos: [...currentPhotos, photoUrl],
            updated_at: new Date().toISOString(),
          })
          .eq('id', parseInt(taskId));
      }
    }

    return NextResponse.json({
      success: true,
      photo: photoRecord,
      url: photoUrl,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// GET - Récupérer les photos d'un chantier ou d'une tâche
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chantierId = searchParams.get('chantierId');
  const taskId = searchParams.get('taskId');

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
