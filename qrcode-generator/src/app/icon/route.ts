import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import mime from "mime";

// Force dynamic rendering since we need request headers and URL parsing
export const dynamic = "force-dynamic";

// Handle favicon requests separately
async function handleFaviconRequest(
  fileBuffer: Buffer,
  targetSize: { width: number; height: number },
  acceptHeader: string,
) {
  let outputContentType = "image/x-icon";
  const sharpInstance = sharp(fileBuffer).resize(targetSize.width, targetSize.height);

  // Some browsers handle PNG favicons better than ICO
  if (acceptHeader.includes("image/png")) {
    outputContentType = "image/png";
    const resizedBuffer = await sharpInstance.png().toBuffer();
    return new NextResponse(new Uint8Array(resizedBuffer), {
      headers: {
        "Content-Type": outputContentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  // Default to PNG format with x-icon content type for compatibility
  const resizedBuffer = await sharpInstance.png().toBuffer();
  return new NextResponse(new Uint8Array(resizedBuffer), {
    headers: {
      "Content-Type": outputContentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const acceptHeader = request.headers.get("accept") ?? "";
    const isAppleTouchIcon =
      url.pathname.includes("apple-touch-icon") || acceptHeader.includes("image/png");

    // Determine target size based on the request
    let targetSize = { width: 32, height: 32 };

    if (isAppleTouchIcon) {
      // Check for specific apple touch icon sizes in the URL
      if (url.pathname.includes("152x152")) {
        targetSize = { width: 152, height: 152 };
      } else if (url.pathname.includes("167x167")) {
        targetSize = { width: 167, height: 167 };
      } else if (url.pathname.includes("180x180")) {
        targetSize = { width: 180, height: 180 };
      } else {
        // Default apple touch icon size
        targetSize = { width: 180, height: 180 };
      }
    }

    const acceptedFormats = ["svg", "png", "jpg", "jpeg", "ico"];

    let filePath;
    for (const format of acceptedFormats) {
      const potentialPath = path.join(process.cwd(), "public", `Logo_TP.${format}`);
      if (fs.existsSync(potentialPath)) {
        filePath = potentialPath;
        break;
      }
    }

    if (!filePath) {
      console.error("Icon file not found in public directory");
      return new NextResponse("Icon not found", { status: 404 });
    }

    const fileExt = path.extname(filePath).substring(1).toLowerCase();
    const contentType = mime.getType(filePath) ?? "application/octet-stream";
    const fileBuffer = fs.readFileSync(filePath);

    // For SVG format - return directly without sharp processing
    if (fileExt === "svg" || contentType === "image/svg+xml") {
      let svgContent = fileBuffer.toString("utf8");
      svgContent = svgContent
        .replace(/width="[^"]+"/, `width="${targetSize.width}"`)
        .replace(/height="[^"]+"/, `height="${targetSize.height}"`);

      return new NextResponse(svgContent, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // Special handling for favicon.ico requests
    const isFaviconRequest =
      url.pathname.includes("favicon.ico") || acceptHeader.includes("image/x-icon");

    if (isFaviconRequest) {
      return handleFaviconRequest(fileBuffer, targetSize, acceptHeader);
    }

    // For other image formats, determine output format based on the file extension
    let outputFormat = fileExt;
    if (!["png", "jpg", "jpeg", "webp"].includes(fileExt)) {
      // Default to PNG for unsupported formats
      outputFormat = "png";
    }

    // Create a Sharp instance with the appropriate format
    let sharpInstance = sharp(fileBuffer).resize(targetSize.width, targetSize.height);

    // Apply the appropriate output format
    switch (outputFormat) {
      case "jpg":
      case "jpeg":
        sharpInstance = sharpInstance.jpeg({ quality: 90 });
        break;
      case "webp":
        sharpInstance = sharpInstance.webp({ quality: 90 });
        break;
      default:
        // Default to PNG
        sharpInstance = sharpInstance.png();
    }

    const resizedBuffer = await sharpInstance.toBuffer();

    // Use the content type from the original file or derive it from the output format
    const outputContentType = mime.getType(outputFormat) ?? contentType;

    return new NextResponse(new Uint8Array(resizedBuffer), {
      headers: {
        "Content-Type": outputContentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error processing icon request:", error);
    return new NextResponse("Error processing icon", { status: 500 });
  }
}

export async function generateStaticParams() {
  return [];
}
