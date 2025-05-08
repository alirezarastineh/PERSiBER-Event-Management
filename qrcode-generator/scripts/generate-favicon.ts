// ESM style imports
import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";

interface IconSize {
  width: number;
  height: number;
}

/**
 * Generates a favicon.ico file from the Logo_TP.svg in the public directory
 * @returns {Promise<void>} A promise that resolves when the favicon is created
 */
async function generateFavicon(): Promise<void> {
  const inputPath: string = path.join(process.cwd(), "public", "Logo_TP.svg");
  const outputPath: string = path.join(process.cwd(), "public", "favicon.ico");

  // Standard favicon size
  const size: IconSize = { width: 32, height: 32 };

  try {
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    console.log(`Generating favicon from: ${inputPath}`);

    // Convert SVG to PNG with specified size
    const pngBuffer: Buffer = await sharp(inputPath)
      .resize(size.width, size.height)
      .png()
      .toBuffer();

    // Write the PNG buffer as a fallback favicon.ico
    fs.writeFileSync(outputPath, pngBuffer);
    console.log(`Favicon created successfully at: ${outputPath}`);
  } catch (error) {
    console.error(
      "Error generating favicon:",
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

// Execute the function
generateFavicon().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
