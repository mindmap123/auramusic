import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('image') as File;
        const horizontalPosition = formData.get('horizontal') as string || 'center';
        const verticalPosition = formData.get('vertical') as string || 'center';
        const width = parseInt(formData.get('width') as string) || 800;
        const height = parseInt(formData.get('height') as string) || 280;

        if (!file) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        // Convertir le fichier en buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Obtenir les dimensions de l'image source
        const metadata = await sharp(buffer).metadata();
        const sourceWidth = metadata.width!;
        const sourceHeight = metadata.height!;

        // Calculer les positions de crop
        const cropPositions = calculateCropPosition(
            sourceWidth,
            sourceHeight,
            width,
            height,
            horizontalPosition as 'left' | 'center' | 'right',
            verticalPosition as 'top' | 'center' | 'bottom'
        );

        // Générer la bannière
        const processedImage = await sharp(buffer)
            .extract({
                left: cropPositions.left,
                top: cropPositions.top,
                width: cropPositions.width,
                height: cropPositions.height
            })
            .resize(width, height, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 90 })
            .toBuffer();

        return new NextResponse(processedImage, {
            headers: {
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000',
            },
        });

    } catch (error) {
        console.error('Banner generation error:', error);
        return NextResponse.json({ error: 'Failed to generate banner' }, { status: 500 });
    }
}

function calculateCropPosition(
    sourceWidth: number,
    sourceHeight: number,
    targetWidth: number,
    targetHeight: number,
    horizontal: 'left' | 'center' | 'right',
    vertical: 'top' | 'center' | 'bottom'
) {
    // Calculer le ratio de la bannière cible
    const targetRatio = targetWidth / targetHeight;
    
    // Déterminer la taille du crop pour maintenir le ratio
    let cropWidth: number;
    let cropHeight: number;
    
    if (sourceWidth / sourceHeight > targetRatio) {
        // L'image source est plus large que le ratio cible
        cropHeight = sourceHeight;
        cropWidth = cropHeight * targetRatio;
    } else {
        // L'image source est plus haute que le ratio cible
        cropWidth = sourceWidth;
        cropHeight = cropWidth / targetRatio;
    }

    // Calculer les positions de départ selon les options
    let left: number;
    let top: number;

    // Position horizontale
    switch (horizontal) {
        case 'left':
            left = 0;
            break;
        case 'right':
            left = sourceWidth - cropWidth;
            break;
        case 'center':
        default:
            left = (sourceWidth - cropWidth) / 2;
            break;
    }

    // Position verticale
    switch (vertical) {
        case 'top':
            top = 0;
            break;
        case 'bottom':
            top = sourceHeight - cropHeight;
            break;
        case 'center':
        default:
            top = (sourceHeight - cropHeight) / 2;
            break;
    }

    return {
        left: Math.max(0, Math.round(left)),
        top: Math.max(0, Math.round(top)),
        width: Math.round(cropWidth),
        height: Math.round(cropHeight)
    };
}