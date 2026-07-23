import Jimp from 'jimp';

async function generateLUT() {
    const size = 512;
    const blockSize = 64;
    const blocksPerRow = size / blockSize;

    // Create a new 512x512 image
    const image = await new Promise((resolve, reject) => {
        new Jimp(size, size, 0x000000FF, (err, img) => {
            if (err) reject(err);
            else resolve(img);
        });
    });

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            
            // Calculate original RGB (0 to 63) based on OBS LUT layout
            let r = x % blockSize;
            let g = y % blockSize;
            let b = Math.floor(x / blockSize) + Math.floor(y / blockSize) * blocksPerRow;

            // Normalize to 0.0 - 1.0
            r /= 63.0;
            g /= 63.0;
            b /= 63.0;

            // Luminance
            const luma = 0.299 * r + 0.587 * g + 0.114 * b;

            // Teal shadows
            const teal_r = r * 0.6;
            const teal_g = g * 1.0 + 0.05;
            const teal_b = b * 1.3 + 0.1;

            // Orange highlights
            const orange_r = r * 1.3 + 0.1;
            const orange_g = g * 1.1;
            const orange_b = b * 0.8;

            // Blend based on luminance
            let mix = (luma - 0.25) / 0.5;
            mix = Math.max(0, Math.min(1, mix)); // clamp 0-1
            mix = mix * mix * (3 - 2 * mix); // smoothstep

            let out_r = teal_r * (1 - mix) + orange_r * mix;
            let out_g = teal_g * (1 - mix) + orange_g * mix;
            let out_b = teal_b * (1 - mix) + orange_b * mix;

            // Contrast
            const contrast = (val, amount = 1.20) => {
                let v = ((val - 0.5) * amount) + 0.5;
                return Math.max(0, Math.min(1, v));
            };

            out_r = contrast(out_r);
            out_g = contrast(out_g);
            out_b = contrast(out_b);

            // Convert back to 0-255
            const finalR = Math.min(255, Math.max(0, Math.round(out_r * 255)));
            const finalG = Math.min(255, Math.max(0, Math.round(out_g * 255)));
            const finalB = Math.min(255, Math.max(0, Math.round(out_b * 255)));

            const rgbaColor = Jimp.rgbaToInt(finalR, finalG, finalB, 255);
            image.setPixelColor(rgbaColor, x, y);
        }
    }

    await image.writeAsync('cinematic_lut.png');
    console.log("Generated cinematic_lut.png successfully!");
}

generateLUT().catch(console.error);
