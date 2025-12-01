import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Récupérer tous les chantiers ou un chantier spécifique avec ses séries et tâches
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chantierId = searchParams.get('id');

  try {
    if (chantierId) {
      // Récupérer un chantier spécifique avec ses séries et tâches
      const { data: chantier, error: chantierError } = await supabase
        .from('chantiers')
        .select('*')
        .eq('id', parseInt(chantierId))
        .single();

      if (chantierError) {
        return NextResponse.json({ error: chantierError.message }, { status: 404 });
      }

      // Récupérer les séries
      const { data: series, error: seriesError } = await supabase
        .from('chantier_series')
        .select('*')
        .eq('chantier_id', parseInt(chantierId))
        .order('sort_order', { ascending: true });

      if (seriesError) {
        return NextResponse.json({ error: seriesError.message }, { status: 500 });
      }

      // Récupérer les tâches pour chaque série
      const seriesWithTasks = await Promise.all(
        (series || []).map(async (serie) => {
          const { data: tasks } = await supabase
            .from('chantier_tasks')
            .select('*')
            .eq('serie_id', serie.id)
            .order('task_code', { ascending: true });

          return {
            ...serie,
            tasks: tasks || [],
          };
        })
      );

      return NextResponse.json({
        chantier,
        series: seriesWithTasks,
      });
    } else {
      // Récupérer tous les chantiers
      const { data: chantiers, error } = await supabase
        .from('chantiers')
        .select('*, projects(name)')
        .order('updated_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ chantiers: chantiers || [] });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un nouveau chantier avec ses séries et tâches
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, location, chef_name, project_id, series } = body;

    // Créer le chantier
    const { data: chantier, error: chantierError } = await supabase
      .from('chantiers')
      .insert({
        name,
        location,
        chef_name,
        project_id,
        status: 'on_track',
        progress: 0,
      })
      .select()
      .single();

    if (chantierError) {
      return NextResponse.json({ error: chantierError.message }, { status: 500 });
    }

    // Créer les séries et tâches si fournies
    if (series && series.length > 0) {
      for (const serie of series) {
        const { data: newSerie, error: serieError } = await supabase
          .from('chantier_series')
          .insert({
            chantier_id: chantier.id,
            serie_code: serie.id,
            title: serie.title,
            category: serie.category || 'logement',
            progress: serie.progress || 0,
            sort_order: series.indexOf(serie),
          })
          .select()
          .single();

        if (serieError) {
          console.error('Serie error:', serieError);
          continue;
        }

        // Créer les tâches de la série
        if (serie.tasks && serie.tasks.length > 0) {
          const tasksToInsert = serie.tasks.map((task: { id: string; name: string; unit: string; target: number; done: number }) => ({
            serie_id: newSerie.id,
            task_code: task.id,
            name: task.name,
            unit: task.unit,
            target_quantity: task.target,
            done_quantity: task.done || 0,
            progress: task.done || 0,
          }));

          await supabase.from('chantier_tasks').insert(tasksToInsert);
        }
      }
    }

    return NextResponse.json({ success: true, chantier });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH - Mettre à jour une tâche
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, progress, notes } = body;

    if (!taskId) {
      return NextResponse.json({ error: 'taskId requis' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (progress !== undefined) {
      updateData.progress = progress;
      updateData.done_quantity = progress;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const { data, error } = await supabase
      .from('chantier_tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Recalculer le progrès de la série
    const { data: task } = await supabase
      .from('chantier_tasks')
      .select('serie_id')
      .eq('id', taskId)
      .single();

    if (task) {
      const { data: allTasks } = await supabase
        .from('chantier_tasks')
        .select('progress')
        .eq('serie_id', task.serie_id);

      if (allTasks && allTasks.length > 0) {
        const avgProgress = Math.round(
          allTasks.reduce((sum, t) => sum + (t.progress || 0), 0) / allTasks.length
        );

        await supabase
          .from('chantier_series')
          .update({ progress: avgProgress })
          .eq('id', task.serie_id);

        // Recalculer le progrès du chantier
        const { data: serie } = await supabase
          .from('chantier_series')
          .select('chantier_id')
          .eq('id', task.serie_id)
          .single();

        if (serie) {
          const { data: allSeries } = await supabase
            .from('chantier_series')
            .select('progress')
            .eq('chantier_id', serie.chantier_id);

          if (allSeries && allSeries.length > 0) {
            const chantierProgress = Math.round(
              allSeries.reduce((sum, s) => sum + (s.progress || 0), 0) / allSeries.length
            );

            await supabase
              .from('chantiers')
              .update({
                progress: chantierProgress,
                last_update: new Date().toISOString(),
              })
              .eq('id', serie.chantier_id);
          }
        }
      }
    }

    return NextResponse.json({ success: true, task: data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
