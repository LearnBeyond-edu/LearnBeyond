/**
 * Lesson Content Formatter & Normalizer
 * Ensures lesson content is always formatted in a clean, human-readable manner
 * across staff portal lesson creation, editing, and previewing.
 */

export function formatReadableContent(raw: any): string {
  if (!raw) return "";

  let text = typeof raw === "string" ? raw.trim() : JSON.stringify(raw);

  // Check if text is a JSON string or contains a JSON wrapper
  if (text.startsWith("{") || (text.includes('"content"') && text.includes('"title"'))) {
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === "object") {
        if (parsed.content && typeof parsed.content === "string") {
          text = parsed.content;
        } else if (parsed.notes && typeof parsed.notes === "string") {
          text = parsed.notes;
        } else if (parsed.body && typeof parsed.body === "string") {
          text = parsed.body;
        }
      }
    } catch {
      // Regex extraction if JSON.parse fails due to unescaped control chars / literal linebreaks
      const contentMatch = text.match(/"content"\s*:\s*"([\s\S]*?)(?:",\s*"(?:tactile_data|youtube_videos|description|title)"|"\s*\}|\s*$)/i);
      if (contentMatch && contentMatch[1]) {
        text = contentMatch[1];
      }
    }
  }

  // Unescape literal backslash-n, backslash-r, backslash-t (even if multiple backslashes exist)
  text = text
    .replace(/\\+r\\+n/g, "\n")
    .replace(/\\+n/g, "\n")
    .replace(/\\+r/g, "\r")
    .replace(/\\+t/g, "\t")
    .replace(/\\"/g, '"');

  // Strip all comments and technical metadata so the content is 100% clean, human-readable text
  text = text
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<!--[\s\S]*$/g, "")
    .replace(/^"|"$/g, "")
    .trim();

  // If the extracted content is still wrapped in another layer of JSON, unwrap it recursively
  if (text.startsWith('{"title"') || (text.includes('"content"') && text.includes('"description"'))) {
    try {
      const nested = JSON.parse(text);
      if (nested.content && typeof nested.content === "string") {
        text = formatReadableContent(nested.content);
      }
    } catch {
      const nestedMatch = text.match(/"content"\s*:\s*"([\s\S]*?)(?:",\s*"(?:tactile_data|youtube_videos|description|title)"|"\s*\}|\s*$)/i);
      if (nestedMatch && nestedMatch[1]) {
        text = nestedMatch[1].replace(/\\+n/g, "\n").replace(/\\"/g, '"').trim();
      }
    }
  }

  return text
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<!--[\s\S]*$/g, "")
    .trim();
}

/**
 * Strips technical comments like TACTILE_DATA for clean visual presentation in Previews and Reading modes.
 */
export function getDisplayPreviewContent(content?: string): string {
  if (!content) return "Nothing to preview yet.";
  return content
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<!--[\s\S]*$/g, "")
    .trim();
}

/**
 * Parses and extracts structured lesson fields from AI generation responses.
 * Guarantees that content is ALWAYS clean, human-readable text and never raw JSON.
 */
export function parseAILessonResponse(aiResponse: string, topic: string) {
  let title = "";
  let description = "";
  let content = "";
  let tactile_data: any = null;
  let youtube_videos: any[] = [];

  const cleanJsonStr = aiResponse.replace(/```json/gi, '').replace(/```/g, '').trim();

  // Attempt 1: Standard JSON parse
  try {
    const parsed = JSON.parse(cleanJsonStr);
    if (parsed && typeof parsed === "object") {
      title = parsed.title || "";
      description = parsed.description || "";
      content = parsed.content || parsed.notes || parsed.body || "";
      tactile_data = parsed.tactile_data || null;
      youtube_videos = parsed.youtube_videos || [];
    }
  } catch {
    // Attempt 2: Sanitized control character parse
    try {
      const sanitized = cleanJsonStr.replace(/[\u0000-\u001F]+/g, (m) => (m === '\n' || m === '\r' ? '\\n' : ' '));
      const parsed = JSON.parse(sanitized);
      if (parsed && typeof parsed === "object") {
        title = parsed.title || "";
        description = parsed.description || "";
        content = parsed.content || parsed.notes || parsed.body || "";
        tactile_data = parsed.tactile_data || null;
        youtube_videos = parsed.youtube_videos || [];
      }
    } catch {
      // Attempt 3: Regex field extraction
      const titleMatch = cleanJsonStr.match(/"title"\s*:\s*"([^"]+)"/i);
      const descMatch = cleanJsonStr.match(/"description"\s*:\s*"([^"]+)"/i);
      const contentMatch = cleanJsonStr.match(/"content"\s*:\s*"([\s\S]*?)(?:",\s*"(?:tactile_data|youtube_videos|description|title)"|"\s*\}|\s*$)/i);

      title = titleMatch ? titleMatch[1] : "";
      description = descMatch ? descMatch[1] : "";
      content = contentMatch ? contentMatch[1] : "";
    }
  }

  // Format content through formatReadableContent to guarantee proper paragraphs and no JSON artifacts
  content = formatReadableContent(content);

  // If content is still empty or was the entire unparsed JSON, build clean structured educational notes
  if (!content || content.startsWith('{"') || content.length < 20) {
    content = `Learning Objectives:
- Master the fundamental concepts and principles of ${topic}.
- Understand key real-world applications and structural mechanisms.
- Gain practical experience analyzing and solving problems related to ${topic}.

Proper Notes:
${topic} represents a vital subject in modern curriculum. When studying this topic, students examine the foundational mechanisms that dictate how systems interact, transfer energy, and perform work. 

Understanding these core concepts allows students to bridge theory with practical implementation, examining how individual components coordinate to produce cohesive, predictable results.

Simulation Calibration Target: Interactive Teardown Target: Successfully dissect the outer layers to reveal the internal mechanisms and core.

Assignment / Activity:
Review the core principles discussed in these notes and complete the interactive hands-on lab exercises.`;
  }

  if (!title) title = `Exploring ${topic}`;
  if (!description) description = `An engaging, comprehensive lesson about ${topic} tailored for middle-schoolers.`;

  return {
    title,
    description,
    content,
    tactile_data,
    youtube_videos
  };
}
