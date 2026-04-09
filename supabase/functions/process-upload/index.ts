import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 80);
}

async function extractText(buffer: ArrayBuffer, fileType: string): Promise<string> {
  if (fileType === "txt") {
    return new TextDecoder().decode(buffer);
  }
  if (fileType === "pdf") {
    const pdfParse = await import("npm:pdf-parse@1.1.1");
    const uint8 = new Uint8Array(buffer);
    const result = await pdfParse.default(uint8);
    return result.text;
  }
  if (fileType === "docx") {
    const mammoth = await import("npm:mammoth@1.8.0");
    const uint8 = new Uint8Array(buffer);
    const result = await mammoth.extractRawText({ buffer: uint8 });
    return result.value;
  }
  throw new Error(`Unsupported file type: ${fileType}`);
}

async function callClaude(text: string): Promise<{
  title: string;
  summary: string;
  tags: string[];
  sections: Array<{ heading: string; body: string; level: number }>;
}> {
  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
  if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY secret not set");

  const truncatedText = text.length > 80000 ? text.substring(0, 80000) + "\n\n[Document truncated]" : text;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 8000,
      system: "You are a technical documentation specialist. Convert raw document text into a structured wiki article. Return ONLY valid JSON with no markdown code fences and no explanation text outside the JSON.",
      messages: [
        {
          role: "user",
          content: `Convert this document into a wiki article with this exact JSON structure:
{
  "title": "Article Title",
  "summary": "A 2-3 sentence overview of what this article covers.",
  "tags": ["tag1", "tag2", "tag3"],
  "sections": [
    {
      "heading": "Section Heading",
      "body": "Section content in Markdown. Use **bold**, \`code\`, lists, etc.",
      "level": 2
    }
  ]
}

Rules:
- title: clear, descriptive, title-cased
- summary: standalone 2-3 sentence lead paragraph, no jargon
- tags: 3-6 lowercase hyphenated tags relevant to the content
- sections: 3-8 sections. Each section body should be 2-6 paragraphs of Markdown.
- Preserve code examples exactly, wrap in fenced code blocks with language hints
- Use level 2 for main sections, level 3 for subsections

Document:
<document>
${truncatedText}
</document>`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const rawJson = data.content[0].text.trim();

  const jsonMatch = rawJson.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not extract JSON from Claude response");

  return JSON.parse(jsonMatch[0]);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let uploadId: string | undefined;

  try {
    const body = await req.json();
    uploadId = body.upload_id;
    if (!uploadId) throw new Error("upload_id is required");

    const { data: upload, error: fetchErr } = await supabase
      .from("uploads")
      .select("*")
      .eq("id", uploadId)
      .single();

    if (fetchErr || !upload) throw new Error("Upload not found");

    await supabase
      .from("uploads")
      .update({ status: "processing", updated_at: new Date().toISOString() })
      .eq("id", uploadId);

    const { data: fileData, error: downloadErr } = await supabase.storage
      .from("uploads")
      .download(upload.file_path);

    if (downloadErr || !fileData) throw new Error("Could not download file from storage");

    const buffer = await fileData.arrayBuffer();
    const text = await extractText(buffer, upload.file_type);

    if (!text.trim()) throw new Error("No text could be extracted from the document");

    const wikiContent = await callClaude(text);

    let slug = slugify(wikiContent.title);

    const { count } = await supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .like("slug", `${slug}%`);

    if (count && count > 0) slug = `${slug}-${Date.now()}`;

    const { data: article, error: articleErr } = await supabase
      .from("articles")
      .insert({
        title: wikiContent.title,
        slug,
        summary: wikiContent.summary,
        tags: wikiContent.tags,
        upload_id: uploadId,
      })
      .select()
      .single();

    if (articleErr || !article) throw new Error(`Failed to insert article: ${articleErr?.message}`);

    const sectionsPayload = wikiContent.sections.map((s, i) => ({
      article_id: article.id,
      heading: s.heading,
      body: s.body,
      level: s.level ?? 2,
      position: i,
    }));

    const { error: sectionsErr } = await supabase
      .from("article_sections")
      .insert(sectionsPayload);

    if (sectionsErr) throw new Error(`Failed to insert sections: ${sectionsErr.message}`);

    await supabase
      .from("uploads")
      .update({
        status: "done",
        article_id: article.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", uploadId);

    return new Response(
      JSON.stringify({ article_id: article.id, slug: article.slug }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    if (uploadId) {
      const errClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      await errClient
        .from("uploads")
        .update({ status: "error", error_msg: message, updated_at: new Date().toISOString() })
        .eq("id", uploadId);
    }

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
