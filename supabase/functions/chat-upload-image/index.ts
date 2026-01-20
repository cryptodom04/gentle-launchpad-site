import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validate image magic bytes
function isValidImage(bytes: Uint8Array): { valid: boolean; type: string } {
  if (bytes.length < 4) return { valid: false, type: '' };
  
  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return { valid: true, type: 'jpeg' };
  }
  
  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return { valid: true, type: 'png' };
  }
  
  // GIF: 47 49 46 38
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return { valid: true, type: 'gif' };
  }
  
  // WebP: 52 49 46 46 ... 57 45 42 50
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    if (bytes.length >= 12 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
      return { valid: true, type: 'webp' };
    }
  }
  
  return { valid: false, type: '' };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get content type
    const contentType = req.headers.get('content-type') || '';
    
    let conversationId: string;
    let sessionToken: string;
    let fileData: Uint8Array;
    let fileType: string;

    if (contentType.includes('multipart/form-data')) {
      // Handle multipart form data
      const formData = await req.formData();
      conversationId = formData.get('conversationId') as string;
      sessionToken = formData.get('sessionToken') as string;
      const file = formData.get('file') as File;
      
      if (!file) {
        return new Response(
          JSON.stringify({ error: 'No file provided' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Server-side size validation (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        return new Response(
          JSON.stringify({ error: 'File too large. Maximum size is 5MB' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const buffer = await file.arrayBuffer();
      fileData = new Uint8Array(buffer);
      fileType = file.type;
    } else {
      // Handle JSON request with base64 data (fallback)
      const body = await req.json();
      conversationId = body.conversationId;
      sessionToken = body.sessionToken;
      
      if (!body.fileData) {
        return new Response(
          JSON.stringify({ error: 'No file data provided' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Decode base64
      const base64Data = body.fileData.replace(/^data:image\/\w+;base64,/, '');
      fileData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      fileType = body.fileType || 'image/jpeg';
      
      // Server-side size validation (5MB limit)
      if (fileData.length > 5 * 1024 * 1024) {
        return new Response(
          JSON.stringify({ error: 'File too large. Maximum size is 5MB' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate required fields
    if (!conversationId || !sessionToken) {
      return new Response(
        JSON.stringify({ error: 'Conversation ID and session token are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(conversationId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid conversation ID format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate session token - check if user owns this conversation
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('session_token', sessionToken)
      .maybeSingle();

    if (convError || !conv) {
      return new Response(
        JSON.stringify({ error: 'Invalid session or conversation not found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting: max 10 images per conversation per hour
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { data: recentImages, error: countError } = await supabase
      .from('chat_messages')
      .select('id')
      .eq('conversation_id', conversationId)
      .not('image_url', 'is', null)
      .gte('created_at', oneHourAgo);

    if (!countError && recentImages && recentImages.length >= 10) {
      return new Response(
        JSON.stringify({ error: 'Too many images. Please wait before uploading more.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate image magic bytes (server-side file type verification)
    const imageValidation = isValidImage(fileData);
    if (!imageValidation.valid) {
      return new Response(
        JSON.stringify({ error: 'Invalid image file. Only JPEG, PNG, GIF, and WebP are allowed.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine file extension from validated type
    const extension = imageValidation.type === 'jpeg' ? 'jpg' : imageValidation.type;
    const fileName = `chat/${conversationId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;

    // Upload with service role (bypasses client-side RLS)
    const { error: uploadError } = await supabase.storage
      .from('chat-images')
      .upload(fileName, fileData, {
        contentType: `image/${imageValidation.type}`,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('chat-images')
      .getPublicUrl(fileName);

    console.log(`Image uploaded successfully: ${fileName}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: urlData.publicUrl,
        fileName: fileName 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error uploading image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
