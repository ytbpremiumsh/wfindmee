import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateScoresRequest {
  questionText: string;
  options: Array<{
    option_text: string;
    option_order: number;
  }>;
  personalityTypes: Array<{
    personality_type: string;
    title: string;
    description?: string;
  }>;
  quizTitle?: string;
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

    const { questionText, options, personalityTypes, quizTitle }: GenerateScoresRequest = await req.json();

    console.log('Generating scores for:', { questionText, optionsCount: options.length, typesCount: personalityTypes.length });

    if (!options || options.length === 0) {
      throw new Error('No options provided');
    }

    if (!personalityTypes || personalityTypes.length === 0) {
      throw new Error('No personality types provided');
    }

    // Create personality type descriptions for context
    const typesContext = personalityTypes.map(pt => 
      `- ${pt.personality_type}: ${pt.title}${pt.description ? ` - ${pt.description.substring(0, 100)}` : ''}`
    ).join('\n');

    const systemPrompt = `Kamu adalah ahli analisis kepribadian. Tugasmu adalah memberikan skor (1-5) untuk setiap pilihan jawaban berdasarkan kesesuaiannya dengan tipe kepribadian.

TIPE KEPRIBADIAN YANG TERSEDIA:
${typesContext}

ATURAN PEMBERIAN SKOR:
- 5 = Sangat sesuai dengan tipe tersebut
- 4 = Cukup sesuai
- 3 = Netral/agak sesuai
- 2 = Kurang sesuai
- 1 = Tidak sesuai

Berikan skor yang bervariasi dan masuk akal. Tidak semua pilihan harus punya skor tinggi untuk semua tipe.`;

    const userPrompt = `${quizTitle ? `Quiz: "${quizTitle}"\n` : ''}Pertanyaan: "${questionText}"

Pilihan jawaban:
${options.map((opt, i) => `${i + 1}. ${opt.option_text}`).join('\n')}

Berikan skor kepribadian (1-5) untuk SETIAP pilihan terhadap SETIAP tipe kepribadian.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'assign_personality_scores',
              description: 'Assign personality scores (1-5) to each option for each personality type',
              parameters: {
                type: 'object',
                properties: {
                  options_scores: {
                    type: 'array',
                    description: 'Array of scores for each option',
                    items: {
                      type: 'object',
                      properties: {
                        option_index: { type: 'number', description: 'Index of the option (0-based)' },
                        scores: { 
                          type: 'object',
                          description: 'Scores for each personality type (key: personality_type, value: score 1-5)'
                        }
                      },
                      required: ['option_index', 'scores']
                    }
                  }
                },
                required: ['options_scores']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'assign_personality_scores' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI Response received');

    let scoresData;
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      scoresData = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: generate random but sensible scores
      console.log('No tool call, generating fallback scores');
      scoresData = {
        options_scores: options.map((_, optIndex) => ({
          option_index: optIndex,
          scores: personalityTypes.reduce((acc, pt, i) => {
            // Create varied but sensible scores
            const baseScore = Math.floor(Math.random() * 3) + 1;
            const variance = i % options.length === optIndex ? 2 : 0;
            acc[pt.personality_type] = Math.min(5, Math.max(1, baseScore + variance));
            return acc;
          }, {} as Record<string, number>)
        }))
      };
    }

    console.log('Generated scores:', JSON.stringify(scoresData, null, 2));

    // Transform to the expected format
    const result = options.map((opt, index) => {
      const optionScores = scoresData.options_scores?.find((s: any) => s.option_index === index);
      return {
        option_order: opt.option_order,
        personality_scores: optionScores?.scores || {}
      };
    });

    return new Response(
      JSON.stringify({ success: true, scores: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-scores function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
