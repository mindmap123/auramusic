import BannerGenerator from "@/components/BannerGenerator";

export default function BannerGeneratorPage() {
    return (
        <div style={{ padding: '2rem', minHeight: '100vh', background: 'var(--bg-base)' }}>
            <BannerGenerator 
                onBannerGenerated={(url) => console.log('Banner generated:', url)}
                defaultWidth={800}
                defaultHeight={280}
            />
        </div>
    );
}