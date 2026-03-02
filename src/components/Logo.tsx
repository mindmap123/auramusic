import Image from "next/image";

interface LogoProps {
    color?: string;
    width?: number;
    height?: number;
    className?: string;
}

export default function Logo({ color = "green", width = 180, height = 50, className = "" }: LogoProps) {
    return (
        <div 
            className={className}
            style={{
                width: `${width}px`,
                height: `${height}px`,
                position: "relative",
            }}
        >
            <Image
                src="/logo.svg"
                alt="Aura Music"
                width={width}
                height={height}
                style={{
                    filter: `hue-rotate(${getHueRotation(color)}deg) saturate(${getSaturation(color)}) brightness(${getBrightness(color)})`,
                }}
            />
        </div>
    );
}

// Fonction pour calculer la rotation de teinte selon la couleur
function getHueRotation(color: string): number {
    const rotations: Record<string, number> = {
        green: 0,      // Couleur de base
        blue: -60,     // Rotation vers le bleu
        cyan: -90,     // Rotation vers le cyan
        violet: 60,    // Rotation vers le violet
        pink: 90,      // Rotation vers le rose
        red: 120,      // Rotation vers le rouge
        orange: 30,    // Rotation vers l'orange
    };
    return rotations[color] || 0;
}

function getSaturation(color: string): number {
    return 1.2; // Légère augmentation de saturation
}

function getBrightness(color: string): number {
    return 1; // Luminosité normale
}
