import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateQuizRequest {
  quizId: string;
  title: string;
  category: string;
  questionCount: number;
  optionCount: number;
  resultCount: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { quizId, title, category, questionCount, optionCount, resultCount }: GenerateQuizRequest = await req.json();

    console.log('Generating quiz content for:', { quizId, title, category, questionCount, optionCount, resultCount });

    // Create prompt for AI to generate quiz content
    const prompt = `Kamu adalah pembuat quiz kepribadian profesional. Buatkan konten quiz dengan detail berikut:

Judul Quiz: ${title}
Kategori: ${category}
Jumlah Pertanyaan: ${questionCount}
Jumlah Pilihan per Pertanyaan: ${optionCount}
Jumlah Tipe Hasil/Kepribadian: ${resultCount}

PENTING: Semua konten HARUS dalam Bahasa Indonesia.

Buat quiz yang menarik dengan:
1. ${questionCount} pertanyaan yang berkaitan dengan tema "${title}"
2. Setiap pertanyaan memiliki ${optionCount} pilihan jawaban
3. ${resultCount} tipe kepribadian/hasil yang berbeda dengan skor minimum dan maksimum

Format output HARUS dalam JSON yang valid dengan struktur berikut:
{
  "questions": [
    {
      "question_text": "Teks pertanyaan dalam Bahasa Indonesia",
      "question_order": 1,
      "options": [
        {
          "option_text": "Teks pilihan dalam Bahasa Indonesia",
          "option_order": 1,
          "personality_scores": {"tipe1": 5, "tipe2": 2, "tipe3": 1}
        }
      ]
    }
  ],
  "results": [
    {
      "personality_type": "Nama Tipe (contoh: INTJ, Pemimpin, dll)",
      "title": "Judul hasil yang menarik",
      "description": "Deskripsi lengkap tentang tipe ini dalam 2-3 kalimat",
      "strengths": ["Kelebihan 1", "Kelebihan 2", "Kelebihan 3"],
      "weaknesses": ["Kelemahan 1", "Kelemahan 2", "Kelemahan 3"],
      "min_score": 0,
      "max_score": 30
    }
  ]
}

Pastikan:
- Skor pada personality_scores menggunakan key yang sesuai dengan personality_type
- Range min_score dan max_score tidak overlap dan mencakup semua kemungkinan skor
- Semua teks dalam Bahasa Indonesia yang natural dan menarik`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Kamu adalah AI pembuat quiz kepribadian. Selalu output dalam format JSON yang valid. Semua konten dalam Bahasa Indonesia.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let contentText = aiData.choices?.[0]?.message?.content || '';
    
    console.log('AI Response:', contentText.substring(0, 500));

    // Extract JSON from the response
    const jsonMatch = contentText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from AI response');
    }

    const quizContent = JSON.parse(jsonMatch[0]);

    // Insert questions into database
    for (const question of quizContent.questions) {
      const { data: questionData, error: questionError } = await supabase
        .from('quiz_questions')
        .insert({
          quiz_id: quizId,
          question_text: question.question_text,
          question_order: question.question_order,
        })
        .select()
        .single();

      if (questionError) {
        console.error('Error inserting question:', questionError);
        throw questionError;
      }

      // Insert options for this question
      const optionsToInsert = question.options.map((opt: any, index: number) => ({
        question_id: questionData.id,
        option_text: opt.option_text,
        option_order: opt.option_order || index + 1,
        personality_scores: opt.personality_scores || {},
      }));

      const { error: optionsError } = await supabase
        .from('quiz_options')
        .insert(optionsToInsert);

      if (optionsError) {
        console.error('Error inserting options:', optionsError);
        throw optionsError;
      }
    }

    // Insert results into database
    for (const result of quizContent.results) {
      const { error: resultError } = await supabase
        .from('quiz_results')
        .insert({
          quiz_id: quizId,
          personality_type: result.personality_type,
          title: result.title,
          description: result.description,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          min_score: result.min_score,
          max_score: result.max_score,
        });

      if (resultError) {
        console.error('Error inserting result:', resultError);
        throw resultError;
      }
    }

    // Update quiz with question count
    await supabase
      .from('quizzes')
      .update({ 
        estimated_time: Math.ceil(questionCount * 0.5) // Estimate 30 seconds per question
      })
      .eq('id', quizId);

    console.log('Quiz content generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Quiz berhasil di-generate',
        questionCount: quizContent.questions.length,
        resultCount: quizContent.results.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
