import { NextResponse } from "next/server";
import { extractText } from "unpdf";
import mammoth from "mammoth";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileName = file.name.toLowerCase();

    let extractedText = "";

    if (fileName.endsWith(".pdf") || file.type === "application/pdf") {
      const uint8Array = new Uint8Array(arrayBuffer);
      const res = await extractText(uint8Array);
      if (Array.isArray(res.text)) {
        extractedText = res.text.join("\n\n");
      } else if (typeof res.text === "string") {
        extractedText = res.text;
      }
    } else if (
      fileName.endsWith(".docx") ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const buffer = Buffer.from(arrayBuffer);
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value || "";
    } else {
      // Plain text formats (.txt, .md, .rtf, .json, .csv)
      const buffer = Buffer.from(arrayBuffer);
      extractedText = buffer.toString("utf-8");
    }

    // Clean up excessive empty lines and strange whitespace
    const cleanedText = extractedText
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!cleanedText || cleanedText.length < 5) {
      return NextResponse.json(
        {
          error:
            "Could not extract readable text from this file. If this is a scanned image/PDF without selectable text, please copy and paste the text directly.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      text: cleanedText,
      fileName: file.name,
      fileSize: file.size,
      characterCount: cleanedText.length,
    });
  } catch (error: unknown) {
    console.error("Document parsing error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to parse document file.";
    return NextResponse.json(
      {
        error: `Failed to extract text from file: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
