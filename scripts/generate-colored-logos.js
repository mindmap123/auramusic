/**
 * Script pour générer automatiquement les logos colorés
 * à partir d'un fichier logo.svg source
 * 
 * Usage: node scripts/generate-colored-logos.js
 */

const fs = require('fs');
const path = require('path');

const colors = {
    green: '#10b981',
    blue: '#3b82f6',
    cyan: '#06b6d4',
    violet: '#8b5cf6',
    pink: '#ec4899',
    red: '#ef4444',
    orange: '#f59e0b',
};

const sourceLogo = path.join(__dirname, '../public/logo.svg');
const outputDir = path.join(__dirname, '../public/images/logos');

// Vérifier si le fichier source existe
if (!fs.existsSync(sourceLogo)) {
    console.error('❌ Fichier logo.svg non trouvé à la racine de public/');
    console.log('📝 Créez d\'abord votre fichier public/logo.svg');
    process.exit(1);
}

// Lire le contenu du logo source
let logoContent = fs.readFileSync(sourceLogo, 'utf8');

// Créer le dossier de sortie s'il n'existe pas
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🎨 Génération des logos colorés...\n');

// Générer un logo pour chaque couleur
Object.entries(colors).forEach(([colorName, colorCode]) => {
    // Remplacer toutes les couleurs dans le SVG par la couleur cible
    // Cette regex cherche les attributs fill, stroke avec des codes couleur
    let coloredLogo = logoContent
        .replace(/fill="[^"]*"/g, `fill="${colorCode}"`)
        .replace(/stroke="[^"]*"/g, `stroke="${colorCode}"`)
        .replace(/fill:[^;"]*/g, `fill:${colorCode}`)
        .replace(/stroke:[^;"]*/g, `stroke:${colorCode}`);
    
    // Sauvegarder le logo coloré
    const outputPath = path.join(outputDir, `logo-${colorName}.svg`);
    fs.writeFileSync(outputPath, coloredLogo);
    
    console.log(`✅ logo-${colorName}.svg généré (${colorCode})`);
});

console.log('\n🎉 Tous les logos ont été générés avec succès !');
console.log(`📁 Emplacement: ${outputDir}`);
