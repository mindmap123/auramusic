import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: 'dx31tv94m',
    api_key: '784985174196517',
    api_secret: 'tM2BHBqKtmcC8XXfov5pRANwXSI',
});

async function listAllResources() {
    console.log("🔍 Recherche des fichiers sur Cloudinary...\n");

    try {
        // Lister les images (covers)
        console.log("📷 IMAGES (Covers):");
        console.log("==================");
        const images = await cloudinary.api.resources({
            type: 'upload',
            resource_type: 'image',
            max_results: 100,
        });
        
        if (images.resources.length === 0) {
            console.log("Aucune image trouvée");
        } else {
            images.resources.forEach((img: any) => {
                console.log(`- ${img.public_id}`);
                console.log(`  URL: ${img.secure_url}`);
                console.log(`  Créé: ${img.created_at}\n`);
            });
        }

        // Lister les vidéos/audio (mixes)
        console.log("\n🎵 AUDIO/VIDEO (Mixes):");
        console.log("=======================");
        const videos = await cloudinary.api.resources({
            type: 'upload',
            resource_type: 'video',
            max_results: 100,
        });
        
        if (videos.resources.length === 0) {
            console.log("Aucun fichier audio trouvé");
        } else {
            videos.resources.forEach((vid: any) => {
                console.log(`- ${vid.public_id}`);
                console.log(`  URL: ${vid.secure_url}`);
                console.log(`  Durée: ${vid.duration || 'N/A'}s`);
                console.log(`  Créé: ${vid.created_at}\n`);
            });
        }

        // Résumé
        console.log("\n📊 RÉSUMÉ:");
        console.log("==========");
        console.log(`Images: ${images.resources.length}`);
        console.log(`Audio/Video: ${videos.resources.length}`);

    } catch (error: any) {
        console.error("Erreur:", error.message);
    }
}

listAllResources();
