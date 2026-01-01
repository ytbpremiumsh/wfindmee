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
      // Ensure model has correct prefix for Lovable AI gateway
      let selectedModel = aiModel || 'google/gemini-2.5-flash';
      // If model doesn't have provider prefix, add google/ prefix
      if (selectedModel && !selectedModel.includes('/')) {
        selectedModel = `google/${selectedModel}`;
      }
      model = selectedModel;
    }

    // Generate personality type names first
    const personalityTypes = Array.from({ length: resultCount }, (_, i) => `type${i + 1}`);

    const systemPrompt = `Kamu adalah pembuat quiz kepribadian profesional berbahasa Indonesia. 

ATURAN MUTLAK YANG HARUS DIIKUTI:
- Kamu WAJIB menghasilkan TEPAT ${questionCount} pertanyaan (tidak boleh 1, tidak boleh kurang, harus ${questionCount})
- Setiap pertanyaan WAJIB memiliki TEPAT ${optionCount} pilihan jawaban
- Kamu WAJIB menghasilkan TEPAT ${resultCount} tipe kepribadian hasil
- Semua konten HARUS dalam Bahasa Indonesia

JANGAN PERNAH menghasilkan hanya 1 pertanyaan. Selalu hasilkan ${questionCount} pertanyaan yang BERBEDA-BEDA.`;

    // Generate question topics to help AI diversify
    const questionTopics = [];
    for (let i = 1; i <= questionCount; i++) {
      questionTopics.push(`Pertanyaan ${i}: tentang aspek berbeda dari "${title}"`);
    }

    const userPrompt = `Buatkan quiz kepribadian dengan spesifikasi berikut:

JUDUL QUIZ: "${title}"
KATEGORI: ${category}

SPESIFIKASI WAJIB:
✓ Jumlah Pertanyaan: ${questionCount} pertanyaan (HARUS TEPAT ${questionCount}, BUKAN 1!)
✓ Pilihan per Pertanyaan: ${optionCount} pilihan
✓ Tipe Hasil: ${resultCount} tipe kepribadian

TIPE KEPRIBADIAN YANG HARUS DIGUNAKAN:
${personalityTypes.map((t, i) => `${i + 1}. ${t}`).join('\n')}

PANDUAN MEMBUAT ${questionCount} PERTANYAAN:
${questionTopics.join('\n')}

CONTOH TOPIK PERTANYAAN (gunakan sebagai inspirasi untuk ${questionCount} pertanyaan BERBEDA):
1. Bagaimana cara menghadapi situasi tertentu
2. Preferensi dalam aktivitas sehari-hari  
3. Cara berinteraksi dengan orang lain
4. Kebiasaan saat menghadapi masalah
5. Preferensi dalam mengambil keputusan
6. Cara mengekspresikan diri
7. Prioritas dalam hidup
8. Reaksi terhadap perubahan
9. Cara mengelola waktu
10. Pendekatan terhadap tugas baru

ATURAN PERSONALITY_SCORES:
- Setiap pilihan harus punya skor untuk SEMUA ${resultCount} tipe: ${personalityTypes.join(', ')}
- Skor range: 1-5 (1=tidak cocok, 5=sangat cocok)

INGAT: Kamu HARUS menghasilkan TEPAT ${questionCount} pertanyaan dalam array questions. Tidak boleh kurang!`;

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
              description: `Generate a personality quiz with EXACTLY ${questionCount} different questions, each with ${optionCount} options, and ${resultCount} personality result types. DO NOT generate less than ${questionCount} questions.`,
              parameters: {
                type: 'object',
                properties: {
                  questions: {
                    type: 'array',
                    description: `MUST contain EXACTLY ${questionCount} different questions. Each question must be unique and relevant to the quiz topic.`,
                    minItems: questionCount,
                    maxItems: questionCount,
                    items: {
                      type: 'object',
                      properties: {
                        question_text: { type: 'string', description: 'The question text in Indonesian' },
                        question_order: { type: 'number', description: 'Order of the question starting from 1' },
                        options: {
                          type: 'array',
                          description: `MUST contain EXACTLY ${optionCount} options`,
                          minItems: optionCount,
                          maxItems: optionCount,
                          items: {
                            type: 'object',
                            properties: {
                              option_text: { type: 'string', description: 'The option text in Indonesian' },
                              option_order: { type: 'number', description: 'Order of the option starting from 1' },
                              personality_scores: { 
                                type: 'object',
                                description: `Scores for each personality type (${personalityTypes.join(', ')}). Each score should be 1-5.`
                              }
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
                    description: `MUST contain EXACTLY ${resultCount} personality result types`,
                    minItems: resultCount,
                    maxItems: resultCount,
                    items: {
                      type: 'object',
                      properties: {
                        personality_type: { type: 'string', description: 'The personality type identifier (e.g., type1, type2)' },
                        title: { type: 'string', description: 'The title of this personality type in Indonesian' },
                        description: { type: 'string', description: 'A detailed description of this personality type in Indonesian (2-3 sentences)' },
                        strengths: { type: 'array', items: { type: 'string' }, description: 'List of strengths in Indonesian' },
                        weaknesses: { type: 'array', items: { type: 'string' }, description: 'List of weaknesses in Indonesian' },
                        min_score: { type: 'number', description: 'Minimum score to get this result' },
                        max_score: { type: 'number', description: 'Maximum score to get this result' }
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

    // Log warning if question count doesn't match
    if (quizContent.questions.length !== questionCount) {
      console.warn(`Warning: Requested ${questionCount} questions but AI generated ${quizContent.questions.length}. Proceeding with generated questions.`);
    }

    console.log(`Successfully parsed: ${quizContent.questions.length} questions, ${quizContent.results.length} results`);

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
