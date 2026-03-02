# 🎨 Guide du Logo Aura Music

## Comment remplacer le logo

### Étape 1 : Préparez votre logo SVG

Créez ou exportez votre logo au format SVG avec ces caractéristiques :
- **Format** : SVG (vectoriel)
- **Dimensions recommandées** : 180x50px (ratio 3.6:1)
- **Couleur** : Utilisez `#10b981` (vert) pour tous les éléments qui doivent changer de couleur

### Étape 2 : Remplacez le fichier

Placez votre logo SVG ici :
```
public/logo.svg
```

### Étape 3 : Générez les variantes colorées

Exécutez la commande :
```bash
npm run logo:generate
```

Ou directement :
```bash
node scripts/generate-colored-logos.js
```

### Étape 4 : Vérifiez le résultat

Les 7 logos colorés sont automatiquement créés dans :
```
public/images/logos/
├── logo-blue.svg
├── logo-cyan.svg
├── logo-green.svg
├── logo-orange.svg
├── logo-pink.svg
├── logo-red.svg
└── logo-violet.svg
```

## 🎯 Exemple de logo.svg

```svg
<svg width="180" height="50" viewBox="0 0 180 50" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Votre logo ici -->
  <!-- Utilisez fill="#10b981" pour les éléments colorés -->
  <path d="M10,25 L50,10 L50,40 Z" fill="#10b981"/>
  <text x="60" y="35" font-family="Arial" font-size="24" fill="#10b981">
    AURA
  </text>
</svg>
```

## 🔄 Workflow complet

1. Modifiez `public/logo.svg`
2. Lancez `npm run logo:generate`
3. Rafraîchissez votre navigateur
4. Le logo s'adapte automatiquement à la couleur d'accent choisie !

## 🎨 Couleurs disponibles

| Couleur | Code Hex | Utilisation |
|---------|----------|-------------|
| Vert    | #10b981  | Couleur par défaut |
| Bleu    | #3b82f6  | Thème bleu |
| Cyan    | #06b6d4  | Thème cyan |
| Violet  | #8b5cf6  | Thème violet |
| Rose    | #ec4899  | Thème rose |
| Rouge   | #ef4444  | Thème rouge |
| Orange  | #f59e0b  | Thème orange |

## 💡 Conseils

- **Simplicité** : Un logo simple fonctionne mieux en petit format
- **Contraste** : Assurez-vous que le logo est visible sur fond sombre
- **Test** : Testez toutes les couleurs pour vérifier le rendu
- **Backup** : Gardez une copie de votre logo original

## 🐛 Dépannage

**Le logo ne s'affiche pas ?**
- Vérifiez que `public/logo.svg` existe
- Vérifiez la syntaxe SVG (pas d'erreurs)
- Rafraîchissez le cache du navigateur (Cmd+Shift+R)

**Les couleurs ne changent pas ?**
- Assurez-vous d'utiliser `fill="#10b981"` dans votre SVG
- Évitez les styles inline CSS dans le SVG
- Relancez `npm run logo:generate`

**Le logo est coupé ?**
- Ajustez le `viewBox` dans votre SVG
- Vérifiez les dimensions (180x50 recommandé)
- Assurez-vous que tous les éléments sont dans le viewBox
