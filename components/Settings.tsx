import React, { useState } from 'react';
import { ArrowLeft, Settings as GearIcon } from 'lucide-react';

interface SettingsProps {
    onBack: () => void;
}

interface SettingItemProps {
    title: string;
    description?: string;
    hasToggle?: boolean;
    hasGear?: boolean;
    defaultValue?: boolean;
    valueLabel?: string;
}

const SettingItem: React.FC<SettingItemProps> = ({ 
    title, 
    description, 
    hasToggle = false, 
    hasGear = false, 
    defaultValue = false,
    valueLabel 
}) => {
    const [isOn, setIsOn] = useState(defaultValue);

    return (
        <div className="py-4 border-b border-gray-100 last:border-0 flex items-start justify-between">
            <div className="pr-4 flex-1">
                <h4 className="text-gray-700 font-medium text-sm">{title}</h4>
                {description && <p className="text-gray-400 text-xs mt-1 font-light leading-relaxed">{description}</p>}
                {valueLabel && !description && <p className="text-gray-400 text-xs mt-1 font-light">{valueLabel}</p>}
            </div>
            <div className="flex items-center gap-3">
                {hasGear && (
                    <button className="text-yellow-400 hover:text-yellow-500">
                        <GearIcon size={18} />
                    </button>
                )}
                {hasToggle && (
                    <button 
                        onClick={() => setIsOn(!isOn)}
                        className={`w-10 h-5 rounded-full relative transition-colors duration-200 ease-in-out ${isOn ? 'bg-yellow-400' : 'bg-gray-200'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transform transition-transform duration-200 ${isOn ? 'left-5' : 'left-0.5'}`} />
                    </button>
                )}
            </div>
        </div>
    );
};

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Header */}
            <header className="bg-[#1e88e5] p-4 flex items-center gap-4 text-white shadow-md sticky top-0 z-10">
                <button onClick={onBack} className="p-1 hover:bg-blue-600 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-bold tracking-wide">Ayarlar</h1>
            </header>

            {/* Content */}
            <div className="p-4 pb-24 overflow-y-auto">
                {/* General Section */}
                <div className="mb-6">
                    <h3 className="text-yellow-400 font-bold text-sm mb-2">Genel</h3>
                    <div className="bg-white">
                        <SettingItem 
                            title="Karanlık mod" 
                            description="Cihaz ayarlarını uygula" 
                            hasGear={true}
                        />
                        <SettingItem 
                            title="Büyük yazı tipi" 
                            description="Uygulama genelinde büyük yazı tipi kullan." 
                            hasToggle={true} 
                        />
                        <SettingItem 
                            title="Bildirimleri al" 
                            description="Uygulama için gönderilen çeşitli bildirimleri alın." 
                            hasToggle={true} 
                            defaultValue={true}
                        />
                        <SettingItem 
                            title="Çalışma hatırlatması" 
                            description="14:00" 
                            hasGear={true} 
                            hasToggle={true} 
                            defaultValue={true}
                        />
                    </div>
                </div>

                {/* Learning Section */}
                <div className="mb-6">
                    <h3 className="text-yellow-400 font-bold text-sm mb-2">Öğrenme</h3>
                    <div className="bg-white">
                        <SettingItem 
                            title="Öğrenilen kelimeleri gizle" 
                            description="Öğrendiğiniz kelimelerin çalışma ve testlerde gizlenmesini istiyorsanız aktif edin." 
                            hasToggle={true} 
                        />
                        <SettingItem 
                            title="Günlük zor kelime hatırlatma sayısı" 
                            description="5" 
                            hasGear={true} 
                            hasToggle={true} 
                            defaultValue={true}
                        />
                        <SettingItem 
                            title="Karışık öğren" 
                            description="Çalışmalarda kelimeler karışık olarak seçilsin." 
                            hasToggle={true} 
                            defaultValue={true}
                        />
                        <SettingItem 
                            title="Yanlışları zor kelimelere ekle" 
                            description="Yanlış cevapladığınız kelimeler otomatik olarak zor kelimelere eklensin." 
                            hasToggle={true} 
                        />
                        <SettingItem 
                            title="Sözlükte İngilizce tanımları göster" 
                            description="Çalışma sırasında sözlükte Türkçe karşılıkların altında İngilizce açıklamaları gösterilsin." 
                            hasToggle={true} 
                            defaultValue={true}
                        />
                    </div>
                </div>

                {/* Sound Section */}
                <div className="mb-6">
                    <h3 className="text-yellow-400 font-bold text-sm mb-2">Seslendirme</h3>
                    <div className="bg-white">
                        <SettingItem 
                            title="Kelimeleri seslendir" 
                            description="Kelime çalışması sırasında kelimeler otomatik olarak telaffuz edilir." 
                            hasToggle={true} 
                            defaultValue={true}
                        />
                        <SettingItem 
                            title="Ses efektleri" 
                            description="Çalışmalar sırasında çalan ses efektlerini açıp kapatabilirsin." 
                            hasToggle={true} 
                            defaultValue={true}
                        />
                        <SettingItem 
                            title="Yerel seslendirme motorunu kullan" 
                            description="Kelimeleri seslendirirken gecikme problemi yaşıyorsanız seçin. Normal durumlarda önerilmez." 
                            hasToggle={true} 
                        />
                    </div>
                </div>

                {/* Other Section */}
                <div className="mb-6">
                    <h3 className="text-yellow-400 font-bold text-sm mb-2">Diğer</h3>
                    <div className="bg-white">
                        <SettingItem 
                            title="Kullanım koşulları" 
                        />
                        <SettingItem 
                            title="Gizlilik sözleşmesi" 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
