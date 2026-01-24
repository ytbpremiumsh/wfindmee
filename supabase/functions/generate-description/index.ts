import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateDescriptionRequest {
  title: string;
  category: string;
  tone?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, category, tone = 'netral' }: GenerateDescriptionRequest = await req.json();

    if (!title) {
      throw new Error('Title is required');
    }

    console.log('Generating description for:', { title, category, tone });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Map tone to writing style instructions
    const toneStyles: Record<string, string> = {
      'netral': 'Gunakan gaya bahasa yang netral dan informatif.',
      'humoris': 'Gunakan gaya bahasa yang lucu, jenaka, dan menghibur.',
      'serius': 'Gunakan gaya bahasa yang formal, profesional, dan serius.',
      'santai': 'Gunakan gaya bahasa yang santai, friendly, dan akrab.',
      'motivasi': 'Gunakan gaya bahasa yang inspiratif dan memotivasi.',
      'dramatis': 'Gunakan gaya bahasa yang dramatis dan menarik perhatian.'
    };
    
    const toneInstruction = toneStyles[tone] || toneStyles['netral'];

    // Create unique timestamp-based seed for variety
    const uniqueSeed = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

    const systemPrompt = `Kamu adalah penulis kreatif profesional untuk website quiz kepribadian.

ATURAN MUTLAK:
1. Buat deskripsi yang UNIK dan KREATIF untuk setiap quiz
2. JANGAN gunakan template atau kalimat yang sama untuk quiz berbeda
3. Deskripsi harus menarik pembaca untuk mengikuti quiz
4. Gunakan bahasa Indonesia yang baik dan benar
5. Deskripsi minimal 100 kata, maksimal 200 kata

GAYA PENULISAN:
${toneInstruction}

FORMAT OUTPUT:
- Berikan deskripsi lengkap dalam format HTML sederhana
- Gunakan paragraf (<p>), bold (<strong>), dan list (<ul><li>) jika perlu
- JANGAN gunakan heading (<h1>, <h2>, dll)

VARIASI UNIK (seed: ${uniqueSeed}):
- Setiap deskripsi harus berbeda meski untuk topik serupa
- Gunakan sudut pandang yang berbeda setiap kali`;

    const userPrompt = `Buat deskripsi lengkap untuk quiz kepribadian:

JUDUL: "${title}"
KATEGORI: ${category}

Deskripsi harus:
1. Menjelaskan apa yang akan dipelajari pengguna dari quiz ini
2. Membuat penasaran dan menarik untuk diklik
3. Menyebutkan manfaat mengikuti quiz
4. UNIK dan tidak generik

Berikan deskripsi dalam format HTML (paragraf, bold, list jika perlu).`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.9, // Higher temperature for more creativity/uniqueness
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
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let description = aiData.choices?.[0]?.message?.content || '';

    // Clean up the response - remove markdown code blocks if present
    description = description
      .replace(/```html\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim();

    // Ensure it starts with proper HTML
    if (!description.startsWith('<')) {
      description = `<p>${description}</p>`;
    }

    console.log('Generated description length:', description.length);

    return new Response(
      JSON.stringify({ 
        success: true,
        description: description
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-description function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
