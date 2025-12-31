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
  aiProvider?: 'lovable' | 'openrouter';
  aiModel?: string;
  openrouterApiKey?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      quizId, 
      title, 
      category, 
      questionCount, 
      optionCount, 
      resultCount,
      aiProvider = 'lovable',
      aiModel,
      openrouterApiKey
    }: GenerateQuizRequest = await req.json();

    console.log('Generating quiz content for:', { quizId, title, category, questionCount, optionCount, resultCount, aiProvider, aiModel });

    // Get API configuration based on provider
    let apiUrl: string;
    let apiKey: string;
    let model: string;

    if (aiProvider === 'openrouter' && openrouterApiKey) {
      apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
      apiKey = openrouterApiKey;
      model = aiModel || 'google/gemini-2.5-flash';
    } else {
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        throw new Error('LOVABLE_API_KEY is not configured');
      }
      apiUrl = 'https://ai.gateway.lovable.dev/v1/chat/completions';
      apiKey = LOVABLE_API_KEY;
      model = aiModel || 'google/gemini-2.5-flash';
    }

    // Generate personality type names first
    const personalityTypes = Array.from({ length: resultCount }, (_, i) => `type${i + 1}`);

    const systemPrompt = `Kamu adalah pembuat quiz kepribadian profesional. Kamu HARUS menghasilkan output dalam format JSON yang valid. Semua konten dalam Bahasa Indonesia.`;

    const userPrompt = `Buatkan quiz kepribadian dengan detail berikut:

Judul: ${title}
Kategori: ${category}
Jumlah Pertanyaan: ${questionCount}
Jumlah Pilihan per Pertanyaan: ${optionCount}
Jumlah Tipe Kepribadian: ${resultCount}

Tipe kepribadian yang harus digunakan: ${personalityTypes.join(', ')}

ATURAN PENTING:
1. Setiap pertanyaan HARUS memiliki tepat ${optionCount} pilihan
2. Setiap pilihan HARUS memiliki personality_scores dengan skor untuk SEMUA ${resultCount} tipe (${personalityTypes.join(', ')})
3. Skor berkisar 1-5 (1=tidak cocok, 5=sangat cocok)
4. Total skor maksimum per tipe = ${questionCount} x 5 = ${questionCount * 5}
5. min_score dan max_score untuk hasil tidak boleh overlap

Hasilkan JSON dengan struktur PERSIS seperti ini:
{
  "questions": [
    {
      "question_text": "Pertanyaan dalam Bahasa Indonesia?",
      "question_order": 1,
      "options": [
        {
          "option_text": "Pilihan A",
          "option_order": 1,
          "personality_scores": {${personalityTypes.map(t => `"${t}": 3`).join(', ')}}
        }
      ]
    }
  ],
  "results": [
    {
      "personality_type": "type1",
      "title": "Nama Tipe Kepribadian",
      "description": "Deskripsi lengkap 2-3 kalimat tentang tipe ini",
      "strengths": ["Kelebihan 1", "Kelebihan 2", "Kelebihan 3"],
      "weaknesses": ["Kekurangan 1", "Kekurangan 2"],
      "min_score": 0,
      "max_score": ${Math.floor((questionCount * 5) / resultCount)}
    }
  ]
}`;

    console.log('Calling AI API:', apiUrl, 'model:', model);

    // Use tool calling for structured output
    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...(aiProvider === 'openrouter' && {
          'HTTP-Referer': supabaseUrl,
          'X-Title': 'Quiz Generator'
        })
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_quiz_content',
              description: 'Generate quiz questions and personality results',
              parameters: {
                type: 'object',
                properties: {
                  questions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        question_text: { type: 'string' },
                        question_order: { type: 'number' },
                        options: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              option_text: { type: 'string' },
                              option_order: { type: 'number' },
                              personality_scores: { type: 'object' }
                            },
                            required: ['option_text', 'option_order', 'personality_scores']
                          }
                        }
                      },
                      required: ['question_text', 'question_order', 'options']
                    }
                  },
                  results: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        personality_type: { type: 'string' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        strengths: { type: 'array', items: { type: 'string' } },
                        weaknesses: { type: 'array', items: { type: 'string' } },
                        min_score: { type: 'number' },
                        max_score: { type: 'number' }
                      },
                      required: ['personality_type', 'title', 'description', 'strengths', 'weaknesses', 'min_score', 'max_score']
                    }
                  }
                },
                required: ['questions', 'results']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_quiz_content' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('Payment required. Please add credits.');
      }
      throw new Error(`AI API error: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI Response received');

    let quizContent;
    
    // Check if response has tool calls
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      console.log('Parsing tool call arguments');
      quizContent = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback to parsing content as JSON
      const contentText = aiData.choices?.[0]?.message?.content || '';
      console.log('AI Response content:', contentText.substring(0, 500));
      
      const jsonMatch = contentText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Full AI response:', JSON.stringify(aiData, null, 2));
        throw new Error('Could not extract JSON from AI response');
      }
      quizContent = JSON.parse(jsonMatch[0]);
    }

    console.log('Parsed quiz content:', {
      questionCount: quizContent.questions?.length,
      resultCount: quizContent.results?.length
    });

    if (!quizContent.questions || quizContent.questions.length === 0) {
      throw new Error('AI did not generate any questions');
    }

    if (!quizContent.results || quizContent.results.length === 0) {
      throw new Error('AI did not generate any results');
    }

    // Insert questions into database
    for (let i = 0; i < quizContent.questions.length; i++) {
      const question = quizContent.questions[i];
      console.log(`Inserting question ${i + 1}:`, question.question_text?.substring(0, 50));
      
      const { data: questionData, error: questionError } = await supabase
        .from('quiz_questions')
        .insert({
          quiz_id: quizId,
          question_text: question.question_text,
          question_order: question.question_order || i + 1,
        })
        .select()
        .single();

      if (questionError) {
        console.error('Error inserting question:', questionError);
        throw questionError;
      }

      // Insert options for this question
      const optionsToInsert = (question.options || []).map((opt: any, index: number) => ({
        question_id: questionData.id,
        option_text: opt.option_text,
        option_order: opt.option_order || index + 1,
        personality_scores: opt.personality_scores || {},
      }));

      if (optionsToInsert.length > 0) {
        const { error: optionsError } = await supabase
          .from('quiz_options')
          .insert(optionsToInsert);

        if (optionsError) {
          console.error('Error inserting options:', optionsError);
          throw optionsError;
        }
      }
    }

    // Calculate proper score ranges for results
    const maxPossibleScore = questionCount * 5;
    const scoreRangePerResult = Math.ceil(maxPossibleScore / resultCount);

    // Insert results into database
    for (let i = 0; i < quizContent.results.length; i++) {
      const result = quizContent.results[i];
      const minScore = i * scoreRangePerResult;
      const maxScore = i === quizContent.results.length - 1 
        ? maxPossibleScore 
        : (i + 1) * scoreRangePerResult - 1;

      console.log(`Inserting result ${i + 1}:`, result.title, `(${minScore}-${maxScore})`);
      
      const { error: resultError } = await supabase
        .from('quiz_results')
        .insert({
          quiz_id: quizId,
          personality_type: result.personality_type || `type${i + 1}`,
          title: result.title,
          description: result.description,
          strengths: result.strengths || [],
          weaknesses: result.weaknesses || [],
          min_score: minScore,
          max_score: maxScore,
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
        estimated_time: Math.ceil(questionCount * 0.5)
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
