import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import mime from "mime";

export async function GET() {
  const acceptedFormats = ["png", "jpg", "jpeg", "ico", "svg"];
  const targetSize = { width: 32, height: 32 };

  let filePath;
  for (const format of acceptedFormats) {
    const potentialPath = path.join(
      process.cwd(),
      "public",
      `Logo_TP.${format}`
    );
    if (fs.existsSync(potentialPath)) {
      filePath = potentialPath;
      break;
    }
  }

  if (!filePath) {
    return new NextResponse("Favicon not found", { status: 404 });
  }

  const contentType = mime.getType(filePath);
  const fileBuffer = fs.readFileSync(filePath);

  if (contentType === "image/svg+xml") {
    let svgContent = fileBuffer.toString("utf8");

    svgContent = svgContent
      .replace(/width="[^"]+"/, `width="${targetSize.width}"`)
      .replace(/height="[^"]+"/, `height="${targetSize.height}"`);

    return new NextResponse(svgContent, {
      headers: {
        "Content-Type": "image/svg+xml",
      },
    });
  }

  const resizedBuffer = await sharp(fileBuffer)
    .resize(targetSize.width, targetSize.height)
    .toBuffer();

  return new NextResponse(resizedBuffer, {
    headers: {
      "Content-Type": contentType ?? "application/octet-stream",
    },
  });
}

export async function generateStaticParams() {
  return [];
}
