import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Flashcard, AspectRatio, ImageSize, CustomPackage, CustomWord, User } from '../types';
import { 
    Volume2, Wand2, Edit, Save, 
    Home, Dumbbell, BarChart2, 
    ArrowLeft, GraduationCap, Flame, Info, 
    CheckCircle2, Lock, MessageCircle,
    TrendingUp, BookOpen, Settings as SettingsIcon,
    Menu, HelpCircle, Bell, Crown, Share2, Award, Clock, Calendar,
    PenLine, Diamond, Search, Library, ThumbsUp, X, Download, MessageSquare, Mail,
    Plus, FolderPlus, Package, Check, Image as ImageIcon, ChevronRight, ChevronLeft,
    Pin, XCircle, Shuffle, Sprout, PenTool, Layers, FileText, CheckSquare,
    DraftingCompass, List, FileCheck, Equal, Zap, Leaf, Mic, RefreshCw, Trophy,
    User as UserIcon, Heart, GitBranch
} from 'lucide-react';
import { generateVocabImage, getSpeechBase64, editImage } from '../services/geminiService';
import { decode, decodeAudioData } from '../services/audioUtils';
import Settings from './Settings';

interface DashboardProps {
    onStartLive: () => void;
    user: User | null;
}

// --- MOCK DATA ---
interface UnitWord {
    id: string;
    german: string;
    english: string; // Used for Word Type (Kelime Türü) in Goethe Context, or English translation
    turkish: string;
    image: string;
    level: 1 | 2 | 3; // 1: Seed, 2: Sprout, 3: Tree (Learned)
    exampleSentence?: string;
    sentenceTranslation?: string;
    synonyms?: string;
}

// Helper to generate unique IDs for mock data (Restored full list)
const generateMockWords = (count: number, prefix: string): UnitWord[] => {
    const baseWords: UnitWord[] = [
        { id: `${prefix}_1`, german: 'erscheinen', english: 'appear', turkish: 'ortaya çıkmak, görünmek', synonyms: 'auftauchen, sich zeigen', image: '🎩', level: 1 },
        { id: `${prefix}_2`, german: 'glauben', english: 'believe', turkish: 'inanmak, güvenmek', synonyms: 'denken, vermuten', image: '🙏', level: 2 },
        { id: `${prefix}_3`, german: 'betrachten', english: 'consider', turkish: 'düşünmek, göz önünde bulundurmak', synonyms: 'ansehen, beobachten', image: '🤔', level: 1 },
        { id: `${prefix}_4`, german: 'schaffen', english: 'create', turkish: 'yaratmak, oluşturmak', synonyms: 'erstellen, machen', image: '🎨', level: 3 },
        { id: `${prefix}_5`, german: 'erwarten', english: 'expect', turkish: 'ummak, beklemek', synonyms: 'hoffen, rechnen mit', image: '⏳', level: 1 },
        { id: `${prefix}_6`, german: 'wachsen', english: 'grow', turkish: 'gelişmek, büyümek', synonyms: 'zunehmen, groß werden', image: '🌱', level: 2 },
        { id: `${prefix}_7`, german: 'geschehen', english: 'happen', turkish: 'olmak, meydana gelmek', synonyms: 'passieren, vorkommen', image: '💥', level: 1 },
        { id: `${prefix}_8`, german: 'beinhalten', english: 'include', turkish: 'kapsamak, içermek', synonyms: 'enthalten, umfassen', image: '📦', level: 1 },
        { id: `${prefix}_9`, german: 'bieten', english: 'provide', turkish: 'sağlamak, temin etmek', synonyms: 'geben, anbieten', image: '🤲', level: 1 },
        { id: `${prefix}_10`, german: 'heben', english: 'raise', turkish: 'yükseltmek, kaldırmak', synonyms: 'erhöhen, steigern', image: '📈', level: 2 },
        { id: `${prefix}_11`, german: 'bleiben', english: 'remain', turkish: 'kalmak, sürdürmek', synonyms: 'verharren, andauern', image: '🏛️', level: 1 },
        { id: `${prefix}_12`, german: 'erinnern', english: 'remember', turkish: 'hatırlamak', synonyms: 'gedenken, merken', image: '🧠', level: 1 },
        { id: `${prefix}_13`, german: 'benötigen', english: 'require', turkish: 'gerektirmek, ihtiyaç duymak', synonyms: 'brauchen, erfordern', image: '📋', level: 1 },
        { id: `${prefix}_14`, german: 'rennen', english: 'run', turkish: 'koşmak, işletmek', synonyms: 'laufen, eilen', image: '🏃', level: 1 },
        { id: `${prefix}_15`, german: 'stehen', english: 'stand', turkish: 'durmak, ayakta durmak', synonyms: 'sich befinden', image: '🧍', level: 1 },
        { id: `${prefix}_16`, german: 'vorschlagen', english: 'suggest', turkish: 'önermek', synonyms: 'empfehlen, raten', image: '💡', level: 2 },
        { id: `${prefix}_17`, german: 'ziehen', english: 'pull', turkish: 'çekmek', synonyms: 'schleppen, zerren', image: '✊', level: 1 },
        { id: `${prefix}_18`, german: 'drücken', english: 'push', turkish: 'itmek, basmak', synonyms: 'schieben, pressen', image: '✋', level: 1 },
        { id: `${prefix}_19`, german: 'erreichen', english: 'reach', turkish: 'ulaşmak, erişmek', synonyms: 'gelangen, ankommen', image: '📍', level: 3 },
        { id: `${prefix}_20`, german: 'berichten', english: 'report', turkish: 'rapor etmek, bildirmek', synonyms: 'mitteilen, erzählen', image: '📝', level: 1 },
    ];
    return baseWords.slice(0, count);
};

// Specific Data for "Fiiller" (Verbs) - Unit 2 (Restored with Synonyms)
const mockFiillerUnit2Words: UnitWord[] = [
    { id: 'A1_U2_1', german: 'zustimmen', english: 'agree', turkish: 'aynı görüşte olmak, katılmak', synonyms: 'einwilligen', image: '🤝', level: 1, exampleSentence: 'Ich stimme dir vollkommen zu.', sentenceTranslation: 'Sana tamamen katılıyorum.' },
    { id: 'A1_U2_2', german: 'basieren', english: 'base', turkish: 'dayandırmak, kurmak', synonyms: 'gründen', image: '🏗️', level: 1, exampleSentence: 'Der Film basiert auf einer wahren Geschichte.', sentenceTranslation: 'Film gerçek bir hikayeye dayanıyor.' },
    { id: 'A1_U2_3', german: 'verursachen', english: 'cause', turkish: 'yol açmak, neden olmak', synonyms: 'auslösen', image: '🔥', level: 1, exampleSentence: 'Das schlechte Wetter verursacht Probleme.', sentenceTranslation: 'Kötü hava sorunlara neden oluyor.' },
    { id: 'A1_U2_4', german: 'behandeln', english: 'deal with', turkish: 'üstesinden gelmek, ele almak', synonyms: 'umgehen mit', image: '🪨', level: 1, exampleSentence: 'Die Regierung muss das Problem behandeln.', sentenceTranslation: 'Hükümet sorunla ilgilenmek zorunda.' },
    { id: 'A1_U2_5', german: 'entscheiden', english: 'decide', turkish: 'karar vermek, belirlemek', synonyms: 'beschließen', image: '⚖️', level: 1, exampleSentence: 'Die Jury muss entscheiden.', sentenceTranslation: 'Jüri karar vermek zorunda.' },
    { id: 'A1_U2_6', german: 'beschreiben', english: 'describe', turkish: 'tanımlamak, betimlemek', synonyms: 'schildern', image: '📝', level: 1, exampleSentence: 'Beschreibe das Bild.', sentenceTranslation: 'Resmi tanımla.' },
    { id: 'A1_U2_7', german: 'entwickeln', english: 'develop', turkish: 'gelişmek, büyümek', synonyms: 'entfalten', image: '🌱', level: 1, exampleSentence: 'Wir entwickeln eine neue App.', sentenceTranslation: 'Yeni bir uygulama geliştiriyoruz.' },
    { id: 'A1_U2_8', german: 'erklären', english: 'explain', turkish: 'açıklamak, izah etmek', synonyms: 'erläutern', image: '👨‍🏫', level: 1, exampleSentence: 'Kannst du das erklären?', sentenceTranslation: 'Bunu açıklayabilir misin?' },
    { id: 'A1_U2_9', german: 'gegenüberstehen', english: 'face', turkish: 'yüzleşmek, karşı karşıya kalmak', synonyms: 'konfrontieren', image: '🫣', level: 1, exampleSentence: 'Wir stehen einem Problem gegenüber.', sentenceTranslation: 'Bir sorunla karşı karşıyayız.' },
    { id: 'A1_U2_10', german: 'fokussieren', english: 'focus', turkish: 'odaklanmak', synonyms: 'konzentrieren', image: '🎯', level: 1, exampleSentence: 'Fokussiere dich auf die Arbeit.', sentenceTranslation: 'İşe odaklan.' },
    { id: 'A1_U2_11', german: 'erhöhen', english: 'increase', turkish: 'artırmak, yükseltmek', synonyms: 'steigern', image: '📈', level: 1, exampleSentence: 'Die Preise erhöhen sich.', sentenceTranslation: 'Fiyatlar artıyor.' },
    { id: 'A1_U2_12', german: 'einbeziehen', english: 'involve', turkish: 'içermek, kapsamak', synonyms: 'integrieren', image: '📦', level: 1, exampleSentence: 'Das Projekt bezieht alle ein.', sentenceTranslation: 'Proje herkesi kapsıyor.' },
    { id: 'A1_U2_13', german: 'produzieren', english: 'produce', turkish: 'üretmek', synonyms: 'herstellen', image: '🏭', level: 1, exampleSentence: 'Die Fabrik produziert Autos.', sentenceTranslation: 'Fabrika araba üretiyor.' },
    { id: 'A1_U2_14', german: 'erkennen', english: 'realize', turkish: 'farketmek, anlamak', synonyms: 'bemerken', image: '💡', level: 1, exampleSentence: 'Ich erkenne das Problem.', sentenceTranslation: 'Sorunu fark ediyorum.' },
    { id: 'A1_U2_15', german: 'erhalten', english: 'receive', turkish: 'almak, kabul etmek', synonyms: 'bekommen', image: '🎁', level: 1, exampleSentence: 'Ich habe einen Brief erhalten.', sentenceTranslation: 'Bir mektup aldım.' },
    { id: 'A1_U2_16', german: 'reduzieren', english: 'reduce', turkish: 'azaltmak, düşürmek', synonyms: 'verringern', image: '📉', level: 1, exampleSentence: 'Wir müssen Kosten reduzieren.', sentenceTranslation: 'Maliyetleri düşürmeliyiz.' },
    { id: 'A1_U2_17', german: 'berichten', english: 'report', turkish: 'rapor etmek, bildirmek', synonyms: 'melden', image: '📄', level: 1, exampleSentence: 'Der Reporter berichtet live.', sentenceTranslation: 'Muhabir canlı bildiriyor.' },
    { id: 'A1_U2_18', german: 'vertreten', english: 'represent', turkish: 'temsil etmek', synonyms: 'repräsentieren', image: '🚩', level: 1, exampleSentence: 'Er vertritt die Firma.', sentenceTranslation: 'O firmayı temsil ediyor.' },
    { id: 'A1_U2_19', german: 'suchen', english: 'seek', turkish: 'aramak', synonyms: 'fahnden', image: '🔍', level: 1, exampleSentence: 'Ich suche meinen Schlüssel.', sentenceTranslation: 'Anahtarımı arıyorum.' },
    { id: 'A1_U2_20', german: 'unterstützen', english: 'support', turkish: 'desteklemek', synonyms: 'helfen', image: '🤝', level: 1, exampleSentence: 'Ich unterstütze dich.', sentenceTranslation: 'Seni destekliyorum.' }
];

// --- GOETHE A1 DATA SETS (FROM PDF) ---

// Unit 1: Temel Kavramlar ve İletişim (30 Words)
const goetheA1_Unit1: UnitWord[] = [
    { id: 'GA1_1', german: 'ab', english: 'edat', turkish: 'itibaren', synonyms: 'von', image: '▶️', level: 1, exampleSentence: 'Wir sind ab Montag im Urlaub.', sentenceTranslation: 'Pazartesiden itibaren tatildeyiz.' },
    { id: 'GA1_2', german: 'aber', english: 'bağlaç', turkish: 'ama', synonyms: 'jedoch', image: '🤔', level: 1, exampleSentence: 'Ich will kommen, aber ich habe keine Zeit.', sentenceTranslation: 'Gelmek istiyorum ama zamanım yok.' },
    { id: 'GA1_3', german: 'abfahren', english: 'fiil', turkish: 'hareket etmek, kalkmak', synonyms: 'losfahren', image: '🚆', level: 1, exampleSentence: 'Der Zug fährt ab.', sentenceTranslation: 'Tren kalkıyor.' },
    { id: 'GA1_4', german: 'die Abfahrt', english: 'isim', turkish: 'kalkış', synonyms: 'Start', image: '🛫', level: 1, exampleSentence: 'Die Abfahrt ist um 10 Uhr.', sentenceTranslation: 'Kalkış saat 10’da.' },
    { id: 'GA1_5', german: 'abgeben', english: 'fiil', turkish: 'vermek, uzatmak', synonyms: 'einreichen', image: '🤲', level: 1, exampleSentence: 'Er gibt seine Tasche ab.', sentenceTranslation: 'Çantasını uzatıyor.' },
    { id: 'GA1_6', german: 'abholen', english: 'fiil', turkish: 'almak (bir yerden)', synonyms: 'mitnehmen', image: '🏫', level: 1, exampleSentence: 'Ich hole meine Kinder von der Schule ab.', sentenceTranslation: 'Çocuklarımı okuldan alıyorum.' },
    { id: 'GA1_7', german: 'der Absender', english: 'isim', turkish: 'gönderen', synonyms: 'Sender', image: '✉️', level: 1, exampleSentence: 'Der Absender des Pakets ist unbekannt.', sentenceTranslation: 'Paketin göndereni bilinmiyor.' },
    { id: 'GA1_8', german: 'Achtung', english: 'isim', turkish: 'dikkat', synonyms: 'Vorsicht', image: '⚠️', level: 1, exampleSentence: 'Achtung! Der Boden ist rutschig.', sentenceTranslation: 'Dikkat! Zemin kaygan.' },
    { id: 'GA1_9', german: 'die Adresse', english: 'isim', turkish: 'adres', synonyms: 'Anschrift', image: '🏠', level: 1, exampleSentence: 'Was ist deine Adresse?', sentenceTranslation: 'Adresin nedir?' },
    { id: 'GA1_10', german: 'all-', english: 'zamir', turkish: 'tüm, hepsi, her şey', synonyms: 'gesamt', image: '🌐', level: 1, exampleSentence: 'Alles Gute!', sentenceTranslation: 'Her şey gönlünce olsun!' },
    { id: 'GA1_11', german: 'allein', english: 'sıfat', turkish: 'yalnız', synonyms: 'einsam', image: '👤', level: 1, exampleSentence: 'Ich bin allein zu Hause.', sentenceTranslation: 'Ben evde yalnızım.' },
    { id: 'GA1_12', german: 'also', english: 'zarf', turkish: 'o halde, bu yüzden', synonyms: 'folglich', image: '👉', level: 1, exampleSentence: 'Es regnet, also nehmen wir den Schirm.', sentenceTranslation: 'Yağmur yağıyor, o halde şemsiyeyi alalım.' },
    { id: 'GA1_13', german: 'alt', english: 'sıfat', turkish: 'yaşlı, eski', synonyms: 'bejahrt', image: '👴', level: 1, exampleSentence: 'Das ist ein altes Haus.', sentenceTranslation: 'Bu eski bir ev.' },
    { id: 'GA1_14', german: 'das Alter', english: 'isim', turkish: 'yaş', synonyms: 'Lebensalter', image: '🎂', level: 1, exampleSentence: 'Wie alt bist du?', sentenceTranslation: 'Kaç yaşındasın?' },
    { id: 'GA1_15', german: 'anbieten', english: 'fiil', turkish: 'teklif etmek', synonyms: 'offerieren', image: '☕', level: 1, exampleSentence: 'Er bietet ihr einen Kaffee an.', sentenceTranslation: 'Ona bir kahve teklif ediyor.' },
    { id: 'GA1_16', german: 'das Angebot', english: 'isim', turkish: 'teklif', synonyms: 'Offerte', image: '🏷️', level: 1, exampleSentence: 'Das Angebot ist sehr gut.', sentenceTranslation: 'Teklif çok iyi.' },
    { id: 'GA1_17', german: 'ander', english: 'sıfat', turkish: 'diğer, başka', synonyms: 'verschieden', image: '📚', level: 1, exampleSentence: 'Ich werde ein anderes Buch lesen.', sentenceTranslation: 'Başka bir kitap okuyacağım.' },
    { id: 'GA1_18', german: 'anfangen', english: 'fiil', turkish: 'başlamak', synonyms: 'beginnen', image: '🏁', level: 1, exampleSentence: 'Die Schule fängt um 8 Uhr an.', sentenceTranslation: 'Okul 8’de başlıyor.' },
    { id: 'GA1_19', german: 'der Anfang', english: 'isim', turkish: 'başlangıç', synonyms: 'Start', image: '🚀', level: 1, exampleSentence: 'Am Anfang war es schwer.', sentenceTranslation: 'Başlangıçta zordu.' },
    { id: 'GA1_20', german: 'anklicken', english: 'fiil', turkish: 'tıklamak', synonyms: 'wählen', image: '🖱️', level: 1, exampleSentence: 'Bitte klicken Sie auf den Link.', sentenceTranslation: 'Lütfen bağlantıya tıklayın.' },
    { id: 'GA1_21', german: 'ankommen', english: 'fiil', turkish: 'varmak', synonyms: 'eintreffen', image: '🏁', level: 1, exampleSentence: 'Wir kommen um 6 Uhr an.', sentenceTranslation: 'Saat 6’da varıyoruz.' },
    { id: 'GA1_22', german: 'die Ankunft', english: 'isim', turkish: 'varış', synonyms: 'Eintreffen', image: '🛬', level: 1, exampleSentence: 'Die Ankunft ist um 12 Uhr.', sentenceTranslation: 'Varış saat 12’de.' },
    { id: 'GA1_23', german: 'ankreuzen', english: 'fiil', turkish: 'işaretlemek', synonyms: 'markieren', image: '❎', level: 1, exampleSentence: 'Bitte kreuzen Sie die richtige Antwort an.', sentenceTranslation: 'Lütfen doğru yanıtı işaretleyin.' },
    { id: 'GA1_24', german: 'anmachen', english: 'fiil', turkish: 'açmak (elektronik)', synonyms: 'einschalten', image: '💡', level: 1, exampleSentence: 'Ich mache das Licht an.', sentenceTranslation: 'Işıkları açıyorum.' },
    { id: 'GA1_25', german: 'sich anmelden', english: 'fiil', turkish: 'kayıt olmak', synonyms: 'registrieren', image: '📝', level: 1, exampleSentence: 'Ich melde mich für den Kurs an.', sentenceTranslation: 'Kursa kayıt oluyorum.' },
    { id: 'GA1_26', german: 'die Anmeldung', english: 'isim', turkish: 'kayıt', synonyms: 'Registrierung', image: '📋', level: 1, exampleSentence: 'Die Anmeldung für das Seminar ist morgen.', sentenceTranslation: 'Seminer için kayıtlar yarın başlıyor.' },
    { id: 'GA1_27', german: 'die Anrede', english: 'isim', turkish: 'hitap', synonyms: 'Titel', image: '🗣️', level: 1, exampleSentence: 'Die Anrede in dem Brief ist falsch.', sentenceTranslation: 'Mektuptaki hitap şekli yanlış.' },
    { id: 'GA1_28', german: 'anrufen', english: 'fiil', turkish: 'aramak (telefon)', synonyms: 'telefonieren', image: '📞', level: 1, exampleSentence: 'Ich rufe meine Mutter an.', sentenceTranslation: 'Annemi arıyorum.' },
    { id: 'GA1_29', german: 'der Anruf', english: 'isim', turkish: 'telefon görüşmesi', synonyms: 'Telefonat', image: '📱', level: 1, exampleSentence: 'Ich habe einen Anruf von ihm bekommen.', sentenceTranslation: 'Ondan bir telefon geldi.' },
    { id: 'GA1_30', german: 'die Ansage', english: 'isim', turkish: 'duyuru', synonyms: 'Durchsage', image: '📢', level: 1, exampleSentence: 'Die Ansage war sehr wichtig.', sentenceTranslation: 'Duyuru çok önemliydi.' }
];

// Unit 2: Günlük Yaşam, İş ve Sağlık (30 Words)
const goetheA1_Unit2: UnitWord[] = [
    { id: 'GA1_31', german: 'der Anschluss', english: 'isim', turkish: 'bağlantı', synonyms: 'Verbindung', image: '🔌', level: 1, exampleSentence: 'Ich habe einen Anschluss in Frankfurt.', sentenceTranslation: 'Frankfurt’ta bir bağlantım var.' },
    { id: 'GA1_32', german: 'an sein', english: 'fiil', turkish: 'açık olmak', synonyms: 'eingeschaltet', image: '💡', level: 1, exampleSentence: 'Das Licht ist an.', sentenceTranslation: 'Işık açık.' },
    { id: 'GA1_33', german: 'antworten', english: 'fiil', turkish: 'yanıtlamak', synonyms: 'erwidern', image: '💬', level: 1, exampleSentence: 'Er antwortet auf die Frage.', sentenceTranslation: 'Soruya cevap veriyor.' },
    { id: 'GA1_34', german: 'die Antwort', english: 'isim', turkish: 'yanıt', synonyms: 'Erwiderung', image: '🗨️', level: 1, exampleSentence: 'Die Antwort ist richtig.', sentenceTranslation: 'Yanıt doğru.' },
    { id: 'GA1_35', german: 'die Anzeige', english: 'isim', turkish: 'ilan', synonyms: 'Inserat', image: '📰', level: 1, exampleSentence: 'Die Anzeige steht in der Zeitung.', sentenceTranslation: 'İlan gazetede yer alıyor.' },
    { id: 'GA1_36', german: 'anziehen', english: 'fiil', turkish: 'giyinmek', synonyms: 'kleiden', image: '👕', level: 1, exampleSentence: 'Ich ziehe mich an.', sentenceTranslation: 'Ben giyiniyorum.' },
    { id: 'GA1_37', german: 'das Apartment', english: 'isim', turkish: 'daire, apartman', synonyms: 'Wohnung', image: '🏢', level: 1, exampleSentence: 'Das Apartment ist sehr groß.', sentenceTranslation: 'Daire çok büyük.' },
    { id: 'GA1_38', german: 'der Apfel', english: 'isim', turkish: 'elma', synonyms: 'Obst', image: '🍎', level: 1, exampleSentence: 'Der Apfel ist rot.', sentenceTranslation: 'Elma kırmızıdır.' },
    { id: 'GA1_39', german: 'der Appetit', english: 'isim', turkish: 'iştah', synonyms: 'Esslust', image: '😋', level: 1, exampleSentence: 'Ich habe keinen Appetit.', sentenceTranslation: 'Hiç iştahım yok.' },
    { id: 'GA1_40', german: 'arbeiten', english: 'fiil', turkish: 'çalışmak', synonyms: 'tätig sein', image: '💼', level: 1, exampleSentence: 'Er arbeitet bei Google.', sentenceTranslation: 'O Google’da çalışıyor.' },
    { id: 'GA1_41', german: 'die Arbeit', english: 'isim', turkish: 'iş', synonyms: 'Job', image: '⚒️', level: 1, exampleSentence: 'Ich habe viel Arbeit zu erledigen.', sentenceTranslation: 'Yapmam gereken çok iş var.' },
    { id: 'GA1_42', german: 'arbeitslos', english: 'sıfat', turkish: 'işsiz', synonyms: 'beschäftigungslos', image: '🚫', level: 1, exampleSentence: 'Er ist arbeitslos.', sentenceTranslation: 'O işsiz.' },
    { id: 'GA1_43', german: 'der Arbeitsplatz', english: 'isim', turkish: 'iş yeri', synonyms: 'Büro', image: '🏭', level: 1, exampleSentence: 'Mein Arbeitsplatz ist in der Nähe.', sentenceTranslation: 'İş yerim yakın.' },
    { id: 'GA1_44', german: 'der Arm', english: 'isim', turkish: 'kol', synonyms: 'Gliedmaße', image: '💪', level: 1, exampleSentence: 'Mein Arm tut weh.', sentenceTranslation: 'Kolum acıyor.' },
    { id: 'GA1_45', german: 'der Arzt', english: 'isim', turkish: 'doktor', synonyms: 'Mediziner', image: '👨‍⚕️', level: 1, exampleSentence: 'Wir müssen ihn zum Arzt bringen.', sentenceTranslation: 'Onu doktora götürmeliyiz.' },
    { id: 'GA1_46', german: 'auch', english: 'bağlaç', turkish: 'ayrıca, -de/da', synonyms: 'ebenfalls', image: '➕', level: 1, exampleSentence: 'Ich möchte auch kommen.', sentenceTranslation: 'Ben de gelmek istiyorum.' },
    { id: 'GA1_47', german: 'auf', english: 'edat', turkish: 'üzerinde, -de/da', synonyms: 'oberhalb', image: '🔛', level: 1, exampleSentence: 'Das Buch liegt auf dem Tisch.', sentenceTranslation: 'Kitap masanın üzerinde.' },
    { id: 'GA1_48', german: 'die Aufgabe', english: 'isim', turkish: 'görev', synonyms: 'Auftrag', image: '🎯', level: 1, exampleSentence: 'Das ist eine schwere Aufgabe.', sentenceTranslation: 'Bu zor bir görev.' },
    { id: 'GA1_49', german: 'aufhören', english: 'fiil', turkish: 'durmak, sona ermek', synonyms: 'stoppen', image: '🛑', level: 1, exampleSentence: 'Der Kurs hört in einer Woche auf.', sentenceTranslation: 'Kurs bir hafta içinde sona erecektir.' },
    { id: 'GA1_50', german: 'auf sein', english: 'fiil', turkish: 'açık olmak', synonyms: 'geöffnet', image: '🔓', level: 1, exampleSentence: 'Die Tür ist auf.', sentenceTranslation: 'Kapı açık.' },
    { id: 'GA1_51', german: 'aufstehen', english: 'fiil', turkish: 'kalkmak, uyanmak', synonyms: 'erwachen', image: '🛌', level: 1, exampleSentence: 'Ich stehe um 7 Uhr auf.', sentenceTranslation: 'Saat 7’de kalkıyorum.' },
    { id: 'GA1_52', german: 'der Aufzug', english: 'isim', turkish: 'asansör', synonyms: 'Lift', image: '🛗', level: 1, exampleSentence: 'Der Aufzug ist kaputt.', sentenceTranslation: 'Asansör bozuk.' },
    { id: 'GA1_53', german: 'das Auge', english: 'isim', turkish: 'göz', synonyms: 'Sehorgan', image: '👁️', level: 1, exampleSentence: 'Mein Auge tut weh.', sentenceTranslation: 'Gözlerim ağrıyor.' },
    { id: 'GA1_54', german: 'aus', english: 'edat', turkish: 'dışında, -den/dan', synonyms: 'von', image: '🇹🇷', level: 1, exampleSentence: 'Ich komme aus der Türkei.', sentenceTranslation: 'Ben Türkiye’den geliyorum.' },
    { id: 'GA1_55', german: 'der Ausflug', english: 'isim', turkish: 'gezi', synonyms: 'Reise', image: '🚌', level: 1, exampleSentence: 'Der Ausflug war sehr schön.', sentenceTranslation: 'Gezi çok güzeldi.' },
    { id: 'GA1_56', german: 'ausfüllen', english: 'fiil', turkish: 'doldurmak', synonyms: 'ergänzen', image: '📝', level: 1, exampleSentence: 'Bitte füllen Sie das Formular aus.', sentenceTranslation: 'Lütfen formu doldurun.' },
    { id: 'GA1_57', german: 'der Ausgang', english: 'isim', turkish: 'çıkış', synonyms: 'Tür', image: '🚪', level: 1, exampleSentence: 'Der Ausgang ist dort.', sentenceTranslation: 'Çıkış orada.' },
    { id: 'GA1_58', german: 'die Auskunft', english: 'isim', turkish: 'bilgi', synonyms: 'Information', image: 'ℹ️', level: 1, exampleSentence: 'Ich brauche eine Auskunft.', sentenceTranslation: 'Biraz bilgiye ihtiyacım var.' },
    { id: 'GA1_59', german: 'das Ausland', english: 'isim', turkish: 'yurt dışı', synonyms: 'Fremde', image: '🌍', level: 1, exampleSentence: 'Er lebt im Ausland.', sentenceTranslation: 'O yurt dışında yaşıyor.' },
    { id: 'GA1_60', german: 'der Ausländer', english: 'isim', turkish: 'yabancı', synonyms: 'Fremder', image: '🗺️', level: 1, exampleSentence: 'Er ist ein Ausländer.', sentenceTranslation: 'O bir yabancı.' }
];

// Unit 3: Şehir, Ulaşım ve Çevre (30 Words)
const goetheA1_Unit3: UnitWord[] = [
    { id: 'GA1_61', german: 'ausländisch', english: 'sıfat', turkish: 'yabancı', synonyms: 'fremd', image: '🌐', level: 1, exampleSentence: 'Das ist eine ausländische Marke.', sentenceTranslation: 'Bu yabancı bir marka.' },
    { id: 'GA1_62', german: 'ausmachen', english: 'fiil', turkish: 'kapatmak', synonyms: 'ausschalten', image: '🔌', level: 1, exampleSentence: 'Ich mache das Licht aus.', sentenceTranslation: 'Işıkları kapatıyorum.' },
    { id: 'GA1_63', german: 'die Aussage', english: 'isim', turkish: 'ifade, beyan', synonyms: 'Äußerung', image: '🗣️', level: 1, exampleSentence: 'Seine Aussage war falsch.', sentenceTranslation: 'Beyanı yanlıştı.' },
    { id: 'GA1_64', german: 'aussehen', english: 'fiil', turkish: 'görünmek', synonyms: 'wirken', image: '👀', level: 1, exampleSentence: 'Du siehst müde aus.', sentenceTranslation: 'Yorgun görünüyorsun.' },
    { id: 'GA1_65', german: 'aus sein', english: 'fiil', turkish: 'kapalı olmak', synonyms: 'ausgeschaltet', image: '🌑', level: 1, exampleSentence: 'Das Licht ist aus.', sentenceTranslation: 'Işık kapalı.' },
    { id: 'GA1_66', german: 'aussteigen', english: 'fiil', turkish: 'inmek (araçtan)', synonyms: 'verlassen', image: '🚌', level: 1, exampleSentence: 'Ich steige an der nächsten Station aus.', sentenceTranslation: 'Bir sonraki istasyonda ineceğim.' },
    { id: 'GA1_67', german: 'der Ausweis', english: 'isim', turkish: 'kimlik kartı', synonyms: 'Pass', image: '🪪', level: 1, exampleSentence: 'Zeigen Sie bitte Ihren Ausweis.', sentenceTranslation: 'Lütfen kimlik kartınızı gösterin.' },
    { id: 'GA1_68', german: 'ausziehen', english: 'fiil', turkish: 'soyunmak', synonyms: 'ablegen', image: '👕', level: 1, exampleSentence: 'Ich ziehe mich aus.', sentenceTranslation: 'Soyunuyorum.' },
    { id: 'GA1_69', german: 'das Auto', english: 'isim', turkish: 'otomobil, araba', synonyms: 'Wagen', image: '🚗', level: 1, exampleSentence: 'Mein Auto ist neu.', sentenceTranslation: 'Arabam yeni.' },
    { id: 'GA1_70', german: 'die Autobahn', english: 'isim', turkish: 'otoyol', synonyms: 'Schnellstraße', image: '🛣️', level: 1, exampleSentence: 'Die Autobahn ist leer.', sentenceTranslation: 'Otoyol boş.' },
    { id: 'GA1_71', german: 'der Automat', english: 'isim', turkish: 'otomat', synonyms: 'Maschine', image: '🤖', level: 1, exampleSentence: 'Der Automat ist kaputt.', sentenceTranslation: 'Otomat bozuk.' },
    { id: 'GA1_72', german: 'automatisch', english: 'sıfat', turkish: 'otomatik', synonyms: 'selbsttätig', image: '⚙️', level: 1, exampleSentence: 'Die Tür öffnet automatisch.', sentenceTranslation: 'Kapı otomatik açılıyor.' },
    { id: 'GA1_73', german: 'das Baby', english: 'isim', turkish: 'bebek', synonyms: 'Säugling', image: '👶', level: 1, exampleSentence: 'Das Baby schläft ruhig.', sentenceTranslation: 'Bebek huzur içinde uyuyor.' },
    { id: 'GA1_74', german: 'die Bäckerei', english: 'isim', turkish: 'fırın', synonyms: 'Backstube', image: '🥐', level: 1, exampleSentence: 'Ich kaufe Brot in der Bäckerei.', sentenceTranslation: 'Fırından ekmek alıyorum.' },
    { id: 'GA1_75', german: 'das Bad', english: 'isim', turkish: 'banyo', synonyms: 'Badezimmer', image: '🛁', level: 1, exampleSentence: 'Das Bad ist sauber.', sentenceTranslation: 'Banyo temiz.' },
    { id: 'GA1_76', german: 'baden', english: 'fiil', turkish: 'banyo yapmak', synonyms: 'schwimmen', image: '🚿', level: 1, exampleSentence: 'Sie badet jeden Morgen.', sentenceTranslation: 'Her sabah banyo yapar.' },
    { id: 'GA1_77', german: 'die Bahn', english: 'isim', turkish: 'tren', synonyms: 'Zug', image: '🚆', level: 1, exampleSentence: 'Die Bahn kommt spät.', sentenceTranslation: 'Tren geç geliyor.' },
    { id: 'GA1_78', german: 'der Bahnhof', english: 'isim', turkish: 'tren istasyonu', synonyms: 'Station', image: '🚉', level: 1, exampleSentence: 'Der Bahnhof ist voll.', sentenceTranslation: 'Tren istasyonu kalabalık.' },
    { id: 'GA1_79', german: 'der Bahnsteig', english: 'isim', turkish: 'peron', synonyms: 'Gleis', image: '🛤️', level: 1, exampleSentence: 'Der Bahnsteig ist nass.', sentenceTranslation: 'Peron ıslak.' },
    { id: 'GA1_80', german: 'bald', english: 'zarf', turkish: 'yakında', synonyms: 'demnächst', image: '🔜', level: 1, exampleSentence: 'Sie kommt bald.', sentenceTranslation: 'O yakında gelecek.' },
    { id: 'GA1_81', german: 'der Balkon', english: 'isim', turkish: 'balkon', synonyms: 'Terrasse', image: '🪴', level: 1, exampleSentence: 'Der Balkon ist groß.', sentenceTranslation: 'Balkon büyük.' },
    { id: 'GA1_82', german: 'die Banane', english: 'isim', turkish: 'muz', synonyms: 'Südfrucht', image: '🍌', level: 1, exampleSentence: 'Die Banane ist süß.', sentenceTranslation: 'Muz tatlıdır.' },
    { id: 'GA1_83', german: 'die Bank', english: 'isim', turkish: 'banka', synonyms: 'Geldinstitut', image: '🏦', level: 1, exampleSentence: 'Ich gehe zur Bank.', sentenceTranslation: 'Bankaya gidiyorum.' },
    { id: 'GA1_84', german: 'bar', english: 'sıfat', turkish: 'nakit', synonyms: 'Bargeld', image: '💶', level: 1, exampleSentence: 'Ich zahle bar.', sentenceTranslation: 'Nakit ödüyorum.' },
    { id: 'GA1_85', german: 'der Bauch', english: 'isim', turkish: 'karın', synonyms: 'Magen', image: '🤢', level: 1, exampleSentence: 'Mein Bauch tut weh.', sentenceTranslation: 'Karnım ağrıyor.' },
    { id: 'GA1_86', german: 'der Baum', english: 'isim', turkish: 'ağaç', synonyms: 'Pflanze', image: '🌳', level: 1, exampleSentence: 'Der Baum ist groß.', sentenceTranslation: 'Ağaç büyük.' },
    { id: 'GA1_87', german: 'der Beamte', english: 'isim', turkish: 'memur', synonyms: 'Staatsdiener', image: '👮', level: 1, exampleSentence: 'Der Beamte arbeitet im Büro.', sentenceTranslation: 'Memur ofiste çalışıyor.' },
    { id: 'GA1_88', german: 'bedeuten', english: 'fiil', turkish: 'anlamına gelmek', synonyms: 'heißen', image: '❓', level: 1, exampleSentence: 'Was bedeutet das Wort?', sentenceTranslation: 'Bu kelime ne anlama geliyor?' },
    { id: 'GA1_89', german: 'beginnen', english: 'fiil', turkish: 'başlamak', synonyms: 'starten', image: '▶️', level: 1, exampleSentence: 'Sie beginnt zu arbeiten.', sentenceTranslation: 'Çalışmaya başlıyor.' },
    { id: 'GA1_90', german: 'bei', english: 'edat', turkish: 'yanında, sırasında', synonyms: 'neben', image: '📍', level: 1, exampleSentence: 'Ich bin bei meiner Mutter.', sentenceTranslation: 'Annemin yanındayım.' }
];

// -- DATA STORE --
const emptyUnits = Array.from({length: 20}, (_, i) => i + 1).reduce((acc, curr) => ({...acc, [curr]: []}), {});

const vocabularyDB: Record<string, Record<number, UnitWord[]>> = {
    'A1': {
        ...emptyUnits, 
        1: generateMockWords(20, 'A1_U1'), // Unit 1 (Restored)
        2: mockFiillerUnit2Words,          // Unit 2 (Restored)
    },
    'A2': { ...emptyUnits },
    'B1': { ...emptyUnits },
    'B2': { ...emptyUnits },
    'C1': { ...emptyUnits },
    'C2': { ...emptyUnits },
    'GoetheA1': {
        ...emptyUnits,
        1: goetheA1_Unit1, 
        2: goetheA1_Unit2, 
        3: goetheA1_Unit3, 
    },
    'GoetheA2': { ...emptyUnits } 
};

// --- SUB-COMPONENTS ---

const LearningLevelIcon: React.FC<{ level: 1 | 2 | 3 }> = ({ level }) => {
    return (
        <div className="flex items-end justify-center w-8 h-8 relative transition-all duration-300">
            {level === 1 && (
                <div className="flex flex-col items-center">
                     <Sprout size={20} className="text-gray-300" />
                     <div className="w-4 h-0.5 bg-gray-200 mt-0.5 rounded-full"></div>
                </div>
            )}
            {level === 2 && (
                <div className="flex flex-col items-center">
                    <Sprout size={24} className="text-[#8BC34A] fill-[#DCEDC8]" />
                    <div className="w-5 h-0.5 bg-gray-200 mt-0.5 rounded-full"></div>
                </div>
            )}
            {level === 3 && (
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <Sprout size={24} className="text-[#4CAF50] fill-[#4CAF50]" />
                        <CheckCircle2 size={12} className="absolute -top-1 -right-1 text-white bg-green-500 rounded-full" />
                    </div>
                    <div className="w-5 h-0.5 bg-green-200 mt-0.5 rounded-full"></div>
                </div>
            )}
        </div>
    );
};

const WordDetailModal: React.FC<{ word: UnitWord | null; onClose: () => void }> = ({ word, onClose }) => {
    const [isZapActive, setIsZapActive] = useState(false);

    // Reset zap state when word changes
    useEffect(() => {
        setIsZapActive(false);
    }, [word]);

    if (!word) return null;
    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-6 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-[32px] w-full max-w-sm relative pt-14 pb-8 px-6 shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 w-14 h-14 bg-[#A01B46] text-white rounded-full flex items-center justify-center text-xl font-bold border-[6px] border-gray-100 shadow-sm z-10">
                   {word.id.split('_').pop()}
                </div>
                <div className="text-center mb-6">
                    <h2 className="text-4xl font-bold text-gray-800 mb-1">{word.german}</h2>
                    <p className="text-lg text-[#E91E63] font-medium mb-1">{word.english}</p>
                    <p className="text-sm text-gray-500 font-light">{word.turkish}</p>
                </div>
                <div className="flex justify-center mb-8 relative">
                   <div className="w-40 h-40 flex items-center justify-center text-9xl">
                        {word.image.startsWith('http') ? (
                            <img src={word.image} alt={word.german} className="w-full h-full object-contain" />
                        ) : (
                            <span>{word.image}</span>
                        )}
                   </div>
                   <button 
                        onClick={() => setIsZapActive(!isZapActive)}
                        className={`absolute right-4 bottom-2 transition-colors duration-300 ${isZapActive ? 'text-green-500' : 'text-yellow-400'}`}
                   >
                       <Zap size={32} className="fill-current" />
                   </button>
                </div>
                <div className="space-y-4">
                   <div className="bg-gray-50 rounded-2xl p-4 flex gap-3 items-start border border-gray-100">
                      <span className="text-yellow-500 font-bold text-sm mt-0.5 shrink-0">Ör.</span>
                      <p className="text-gray-600 text-base leading-snug">
                          {word.exampleSentence || "Bu kelime için henüz örnek cümle eklenmedi."}
                      </p>
                   </div>
                   <div className="bg-gray-50 rounded-2xl p-4 flex gap-3 items-start border border-gray-100">
                      <span className="text-yellow-500 font-bold text-sm mt-0.5 shrink-0">Çev.</span>
                      <p className="text-gray-600 text-base leading-snug">
                          {word.sentenceTranslation || "Örnek cümlenin çevirisi mevcut değil."}
                      </p>
                   </div>
                   {word.synonyms && (
                       <div className="bg-gray-50 rounded-2xl p-4 flex gap-3 items-start border border-gray-100">
                          <span className="text-yellow-500 font-bold text-sm mt-0.5 shrink-0">Eş.</span>
                          <p className="text-gray-600 text-base leading-snug">{word.synonyms}</p>
                       </div>
                   )}
                </div>
            </div>
        </div>
    );
};

const UnitDetailView: React.FC<{
    unitId: number;
    onBack: () => void;
    words: UnitWord[];
    onUpdateWordLevel: (id: string, level: 1 | 2 | 3) => void;
    onStartStudying: () => void;
    onStartMultipleChoice: () => void;
    onStartWritingTest: () => void;
    onStartSynonymStudy: () => void;
}> = ({ 
    unitId, 
    onBack, 
    words, 
    onUpdateWordLevel, 
    onStartStudying, 
    onStartMultipleChoice, 
    onStartWritingTest, 
    onStartSynonymStudy 
}) => {
    const [selectedWord, setSelectedWord] = useState<UnitWord | null>(null);

    const handleLevelClick = (e: React.MouseEvent, word: UnitWord) => {
        e.stopPropagation();
        const nextLevel = word.level === 3 ? 1 : (word.level + 1) as 1 | 2 | 3;
        onUpdateWordLevel(word.id, nextLevel);
    };

    return (
        <div className="bg-white min-h-screen flex flex-col font-sans relative">
            {selectedWord && <WordDetailModal word={selectedWord} onClose={() => setSelectedWord(null)} />}

            <header className="bg-[#1e7eb6] p-4 flex items-center justify-between text-white shadow-md sticky top-0 z-20">
                <div className="flex items-center gap-4">
                     <button onClick={onBack} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="font-bold text-lg leading-none">Ünite {unitId}</h1>
                        <span className="text-xs opacity-80 font-light">Kelime Listesi</span>
                    </div>
                </div>
                <div className="flex gap-2">
                     <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <SettingsIcon size={20} />
                    </button>
                </div>
            </header>

            <div className="p-4 grid grid-cols-2 gap-3 bg-gray-50 border-b border-gray-200">
                <button onClick={onStartStudying} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:bg-blue-50 transition-colors active:scale-95">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <BookOpen size={20} />
                    </div>
                    <span className="text-xs font-bold text-gray-700">Kartlar</span>
                </button>
                <button onClick={onStartMultipleChoice} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:bg-pink-50 transition-colors active:scale-95">
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                        <HelpCircle size={20} />
                    </div>
                    <span className="text-xs font-bold text-gray-700">Test</span>
                </button>
                 <button onClick={onStartWritingTest} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:bg-green-50 transition-colors active:scale-95">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <PenTool size={20} />
                    </div>
                    <span className="text-xs font-bold text-gray-700">Yazma</span>
                </button>
                 <button onClick={onStartSynonymStudy} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:bg-orange-50 transition-colors active:scale-95">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                        <Shuffle size={20} />
                    </div>
                    <span className="text-xs font-bold text-gray-700">Eşleştirme</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-24 px-4 pt-2">
                <div className="flex items-center justify-between mb-2 mt-2">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Kelimeler ({words.length})</div>
                    <div className="text-xs text-gray-400 font-light">Seviye için tıkla</div>
                </div>
                <div className="space-y-3">
                    {words.map((word) => (
                        <div 
                            key={word.id} 
                            onClick={() => setSelectedWord(word)}
                            className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 cursor-pointer hover:border-blue-300 transition-all active:scale-[0.99]"
                        >
                            {/* Col 1: Level Icon (Fidan) */}
                            <button 
                                onClick={(e) => handleLevelClick(e, word)} 
                                className="w-10 flex flex-col items-center justify-center p-1 hover:bg-gray-50 rounded-lg"
                            >
                                <LearningLevelIcon level={word.level} />
                            </button>

                            {/* Col 2: Text Info */}
                            <div className="flex-1">
                                <div className="font-bold text-gray-800 text-base leading-tight">{word.german}</div>
                                <div className="text-xs text-[#E91E63] font-medium leading-tight mt-0.5">{word.english}</div>
                                <div className="text-[10px] text-gray-400 leading-tight mt-0.5">{word.turkish}</div>
                            </div>

                            {/* Col 3: Image */}
                            <div className="w-12 h-12 rounded-lg bg-gray-50 text-2xl flex items-center justify-center border border-gray-100 shrink-0">
                                {word.image.startsWith('http') ? (
                                    <img src={word.image} alt="" className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <span>{word.image}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ... (Rest of the file: SideMenu, SearchView, PackageSelectionView, CreatePackageView, ReadyPackagesView, HelpView, FlashcardStudyView, MultipleChoiceQuizView, WritingTestView, SynonymStudyView, AddWordView, ProgressView, LeaderboardView, UnitsView, HomeSelectionView, Dashboard) ...

const SideMenu: React.FC<{ isOpen: boolean; onClose: () => void; onNavigate: (view: string) => void }> = ({ isOpen, onClose, onNavigate }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
            <div className="relative bg-white w-64 h-full shadow-lg p-4 flex flex-col gap-4 animate-in slide-in-from-left duration-200">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="font-bold text-xl text-gray-700">Menü</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500"><X size={24} /></button>
                </div>
                <button onClick={() => onNavigate('home')} className="flex items-center gap-3 text-left p-2 hover:bg-gray-100 rounded text-gray-700 font-medium">
                    <Home size={20} /> Ana Sayfa
                </button>
                <button onClick={() => onNavigate('package_selection')} className="flex items-center gap-3 text-left p-2 hover:bg-gray-100 rounded text-gray-700 font-medium">
                    <Package size={20} /> Paketlerim
                </button>
                <button onClick={() => onNavigate('settings_view')} className="flex items-center gap-3 text-left p-2 hover:bg-gray-100 rounded text-gray-700 font-medium">
                    <SettingsIcon size={20} /> Ayarlar
                </button>
                <button onClick={() => onNavigate('help_view')} className="flex items-center gap-3 text-left p-2 hover:bg-gray-100 rounded text-gray-700 font-medium">
                    <HelpCircle size={20} /> Yardım
                </button>
                <div className="mt-auto border-t pt-4 text-center text-xs text-gray-400">
                    Version 1.0.0
                </div>
            </div>
        </div>
    );
};

const SearchView: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <div className="p-4 bg-gray-50 min-h-screen">
        <div className="flex items-center gap-4 mb-6">
            <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm text-gray-600"><ArrowLeft size={24} /></button>
            <h2 className="text-xl font-bold text-gray-800">Arama</h2>
        </div>
        <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input type="text" placeholder="Kelime ara..." className="w-full pl-10 p-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
        </div>
        <div className="mt-8 text-center text-gray-400">
            Aradığınız kelimeleri burada bulabilirsiniz.
        </div>
    </div>
);

const PackageSelectionView: React.FC<{ onBack: () => void; onCreatePackage: () => void; onBrowseReadyPackages: () => void }> = ({ onBack, onCreatePackage, onBrowseReadyPackages }) => (
    <div className="p-4 bg-gray-50 min-h-screen">
        <div className="flex items-center gap-4 mb-6">
            <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm text-gray-600"><ArrowLeft size={24} /></button>
            <h2 className="text-xl font-bold text-gray-800">Paket Seçimi</h2>
        </div>
        <div className="space-y-4">
             <button onClick={onCreatePackage} className="w-full p-6 bg-white border border-gray-100 shadow-sm rounded-xl flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Plus size={24} /></div>
                <div className="text-left">
                    <h3 className="font-bold text-gray-800">Yeni Paket Oluştur</h3>
                    <p className="text-sm text-gray-500">Kendi kelime listeni hazırla</p>
                </div>
             </button>
             <button onClick={onBrowseReadyPackages} className="w-full p-6 bg-white border border-gray-100 shadow-sm rounded-xl flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-green-100 text-green-600 rounded-lg"><Library size={24} /></div>
                <div className="text-left">
                    <h3 className="font-bold text-gray-800">Hazır Paketler</h3>
                    <p className="text-sm text-gray-500">Uzmanlarca hazırlanmış listeler</p>
                </div>
             </button>
        </div>
    </div>
);

const CreatePackageView: React.FC<{ onBack: () => void; onSave: (name: string) => void }> = ({ onBack, onSave }) => {
    const [name, setName] = useState('');
    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm text-gray-600"><ArrowLeft size={24} /></button>
                <h2 className="text-xl font-bold text-gray-800">Paket Oluştur</h2>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <label className="block text-gray-700 font-medium mb-2">Paket Adı</label>
                <input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Örn: Tatil Kelimeleri" 
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none mb-6" 
                />
                <button 
                    onClick={() => name && onSave(name)} 
                    disabled={!name}
                    className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg shadow-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Oluştur ve Devam Et
                </button>
            </div>
        </div>
    );
};

const ReadyPackagesView: React.FC<{ onBack: () => void; onSelectPackage: (code: string) => void }> = ({ onBack, onSelectPackage }) => (
    <div className="p-4 bg-gray-50 min-h-screen">
        <div className="flex items-center gap-4 mb-6">
            <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm text-gray-600"><ArrowLeft size={24} /></button>
            <h2 className="text-xl font-bold text-gray-800">Hazır Paketler</h2>
        </div>
        <div className="grid gap-4">
            <button onClick={() => onSelectPackage('A1')} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-left hover:border-blue-400 transition-colors">
                <h3 className="font-bold text-gray-800">A1 Başlangıç Paketi</h3>
                <p className="text-sm text-gray-500 mt-1">En temel 1000 kelime</p>
            </button>
            <button onClick={() => onSelectPackage('A2')} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-left hover:border-green-400 transition-colors">
                <h3 className="font-bold text-gray-800">A2 Temel Paket</h3>
                <p className="text-sm text-gray-500 mt-1">Günlük konuşma için gerekli kelimeler</p>
            </button>
        </div>
    </div>
);

const HelpView: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <div className="p-4 bg-gray-50 min-h-screen">
        <div className="flex items-center gap-4 mb-6">
            <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm text-gray-600"><ArrowLeft size={24} /></button>
            <h2 className="text-xl font-bold text-gray-800">Yardım Merkezi</h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-800">Sıkça Sorulan Sorular</h3>
            <div className="border-b pb-2">
                <h4 className="font-medium text-gray-700">Nasıl puan kazanırım?</h4>
                <p className="text-sm text-gray-500 mt-1">Kelimeleri doğru bildikçe ve testleri tamamladıkça XP kazanırsınız.</p>
            </div>
             <div className="border-b pb-2">
                <h4 className="font-medium text-gray-700">Paketlerimi nasıl düzenlerim?</h4>
                <p className="text-sm text-gray-500 mt-1">Paketlerim menüsünden kendi oluşturduğunuz paketleri düzenleyebilirsiniz.</p>
            </div>
             <div>
                <h4 className="font-medium text-gray-700">Canlı sohbet ücretli mi?</h4>
                <p className="text-sm text-gray-500 mt-1">Şu an için beta aşamasında olup ücretsizdir.</p>
            </div>
        </div>
    </div>
);

const FlashcardStudyView: React.FC<{ words: UnitWord[]; onBack: () => void; onUpdateLevel: (id: string, level: 1 | 2 | 3) => void }> = ({ words, onBack, onUpdateLevel }) => {
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const word = words[index];

    const next = () => {
        setFlipped(false);
        setIndex((i) => (i + 1) % words.length);
    };

    const playAudio = async (text: string) => {
        try {
            const base64 = await getSpeechBase64(text);
            if (base64) {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const audioBuffer = await decodeAudioData(decode(base64), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                source.start(0);
            }
        } catch (e) {
            console.error("Audio play failed", e);
        }
    };

    if (!word) return <div className="p-8 text-center bg-gray-50 h-screen flex flex-col items-center justify-center">
        <p className="text-xl text-gray-600 mb-4">Bu listede kelime yok.</p>
        <button onClick={onBack} className="bg-blue-500 text-white px-6 py-2 rounded-full">Geri Dön</button>
    </div>;

    return (
        <div className="h-screen flex flex-col bg-gray-100">
             <div className="p-4 flex justify-between items-center bg-white shadow-sm z-10">
                <button onClick={onBack} className="text-gray-500 hover:text-gray-800"><X size={28} /></button>
                <span className="font-mono text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{index + 1} / {words.length}</span>
                <button onClick={() => {}} className="text-gray-400 opacity-0 cursor-default"><SettingsIcon /></button>
            </div>
            
            <div className="flex-1 p-6 flex flex-col items-center justify-center max-w-md mx-auto w-full">
                <div 
                    className="w-full aspect-[3/4] bg-white rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-500 transform relative overflow-hidden group"
                    onClick={() => setFlipped(!flipped)}
                >
                    <div className="absolute top-4 right-4">
                        <button 
                            onClick={(e) => { e.stopPropagation(); playAudio(word.german); }}
                            className="p-3 bg-gray-100 rounded-full text-blue-500 hover:bg-blue-100 transition-colors"
                        >
                            <Volume2 size={24} />
                        </button>
                    </div>

                    {!flipped ? (
                         <>
                            <div className="text-8xl mb-12 transform group-hover:scale-110 transition-transform duration-300">{word.image}</div>
                            <h2 className="text-4xl font-bold text-gray-800 mb-4">{word.german}</h2>
                            <p className="text-gray-400 font-medium">{word.english || 'Kelime'}</p>
                         </>
                    ) : (
                        <>
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">{word.turkish}</h2>
                            {word.exampleSentence && (
                                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                    <p className="text-gray-700 italic text-lg leading-relaxed">"{word.exampleSentence}"</p>
                                    <p className="text-gray-400 text-sm mt-2">{word.sentenceTranslation}</p>
                                </div>
                            )}
                             {word.synonyms && (
                                <div className="mt-6 text-sm text-gray-500">
                                    <span className="font-bold text-gray-600">Eş Anlamlılar:</span> {word.synonyms}
                                </div>
                            )}
                        </>
                    )}
                    
                    <div className="absolute bottom-6 text-gray-300 text-sm flex items-center gap-1 animate-pulse">
                        <RefreshCw size={14} /> <span>Çevirmek için dokun</span>
                    </div>
                </div>
            </div>

            <div className="p-6 pb-10 flex justify-center gap-8 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-3xl">
                <button 
                    onClick={() => { onUpdateLevel(word.id, 1); next(); }} 
                    className="w-16 h-16 bg-red-100 rounded-full text-red-500 flex items-center justify-center hover:bg-red-200 hover:scale-110 transition-all shadow-sm"
                >
                    <X size={32} strokeWidth={3} />
                </button>
                <button 
                    onClick={() => { onUpdateLevel(word.id, 3); next(); }} 
                    className="w-16 h-16 bg-green-100 rounded-full text-green-500 flex items-center justify-center hover:bg-green-200 hover:scale-110 transition-all shadow-sm"
                >
                    <Check size={32} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
};

const MultipleChoiceQuizView: React.FC<{ 
    words: UnitWord[]; 
    unitId: number; 
    onBack: () => void; 
    onUpdateLevel: (id: string, level: 1 | 2 | 3) => void; 
    onWrongAnswer: (id: string) => void;
    onCorrectAnswer: (id: string) => void;
}> = ({ words, onBack, onUpdateLevel, onWrongAnswer, onCorrectAnswer }) => {
    const [index, setIndex] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const word = words[index];
    
    // Simple quiz logic: pick 3 random distractors
    const options = React.useMemo(() => {
        if (!word) return [];
        const others = words.filter(w => w.id !== word.id);
        const distractors = others.sort(() => 0.5 - Math.random()).slice(0, 3);
        return [...distractors, word].sort(() => 0.5 - Math.random());
    }, [word, words]);

    const handleAnswer = (selectedId: string) => {
        if (isAnswered) return; // Prevent changing answer
        
        setSelectedOptionId(selectedId);
        setIsAnswered(true);

        if (selectedId === word.id) {
            onCorrectAnswer(word.id);
            onUpdateLevel(word.id, 3);
        } else {
            onWrongAnswer(word.id);
            onUpdateLevel(word.id, 1);
        }
    };

    const handleNext = () => {
        if (index < words.length - 1) {
            setIndex(index + 1);
            setIsAnswered(false);
            setSelectedOptionId(null);
        } else {
            onBack();
        }
    };

    const handlePrev = () => {
        if (index > 0) {
            setIndex(index - 1);
            setIsAnswered(false); // Reset state for simplicity when going back, or you could store history
            setSelectedOptionId(null);
        }
    };

    if (!word) return <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-8 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"><Trophy size={40} /></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tebrikler!</h2>
        <p className="text-gray-500 mb-8">Testi başarıyla tamamladın.</p>
        <button onClick={onBack} className="bg-blue-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-600 transition-colors">Bitir</button>
    </div>;

    return (
        <div className="h-screen flex flex-col bg-gray-50">
             <div className="bg-white p-4 shadow-sm flex items-center">
                 <button onClick={onBack} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full"><ArrowLeft /></button>
                 <div className="flex-1 mx-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${((index + 1) / words.length) * 100}%` }}></div>
                 </div>
             </div>

             <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-lg mx-auto w-full">
                <div className="text-6xl mb-6">{word.image}</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">{word.german}</h2>
                
                <div className="grid grid-cols-1 gap-4 w-full">
                    {options.map(opt => {
                        let btnClass = "bg-white border-2 border-gray-100 text-gray-700";
                        if (isAnswered) {
                            if (opt.id === word.id) {
                                btnClass = "bg-green-100 border-green-500 text-green-700"; // Correct answer always green
                            } else if (opt.id === selectedOptionId) {
                                btnClass = "bg-red-100 border-red-500 text-red-700"; // Selected wrong answer red
                            } else {
                                btnClass = "bg-white border-gray-100 text-gray-400 opacity-50"; // Others dimmed
                            }
                        } else {
                            btnClass = "bg-white border-2 border-gray-100 hover:bg-blue-50 hover:border-blue-200 text-gray-700 active:scale-95";
                        }

                        return (
                            <button 
                                key={opt.id} 
                                onClick={() => handleAnswer(opt.id)}
                                disabled={isAnswered}
                                className={`p-5 rounded-2xl font-bold text-lg transition-all shadow-sm ${btnClass}`}
                            >
                                {opt.turkish}
                            </button>
                        );
                    })}
                </div>
             </div>

             {/* Navigation Controls */}
             <div className="p-4 bg-white border-t border-gray-100 flex justify-between items-center">
                <button 
                    onClick={handlePrev} 
                    disabled={index === 0}
                    className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                    Önceki
                </button>
                
                {isAnswered && (
                    <button 
                        onClick={handleNext} 
                        className="px-8 py-3 rounded-xl font-bold bg-blue-500 text-white hover:bg-blue-600 shadow-lg transition-all animate-in slide-in-from-right"
                    >
                        {index === words.length - 1 ? "Bitir" : "Sonraki Soru"}
                    </button>
                )}
             </div>
        </div>
    );
};

// NEW: Writing Test View (Spelling Quiz) - Restored
const WritingTestView: React.FC<{ words: UnitWord[]; unitId: number; unitTitle: string; onBack: () => void }> = ({ words, unitId, unitTitle, onBack }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [scrambledLetters, setScrambledLetters] = useState<{char: string, id: number}[]>([]);
    const [selectedLetters, setSelectedLetters] = useState<{char: string, id: number}[]>([]);
    const [feedback, setFeedback] = useState<'neutral' | 'correct' | 'wrong'>('neutral');

    const currentWord = words[currentIndex];
    const progress = ((currentIndex) / words.length) * 100;

    useEffect(() => {
        if (!currentWord) return;
        const targetWord = currentWord.german.toLowerCase();
        const letters = targetWord.split('').map((char, idx) => ({ char, id: idx }));
        const shuffled = [...letters];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setScrambledLetters(shuffled);
        setSelectedLetters([]);
        setFeedback('neutral');
    }, [currentIndex, currentWord]);

    const handleSelectLetter = (letter: {char: string, id: number}) => {
        if (feedback !== 'neutral') return;
        const newSelected = [...selectedLetters, letter];
        setSelectedLetters(newSelected);
        setScrambledLetters(prev => prev.filter(l => l.id !== letter.id));
        if (newSelected.length === currentWord.german.length) {
            checkAnswer(newSelected);
        }
    };

    const handleDeselectLetter = (letter: {char: string, id: number}) => {
         if (feedback !== 'neutral') return;
         setSelectedLetters(prev => prev.filter(l => l.id !== letter.id));
         setScrambledLetters(prev => [...prev, letter]);
    };

    const checkAnswer = (attempt: {char: string, id: number}[]) => {
        const attemptString = attempt.map(l => l.char).join('');
        const targetString = currentWord.german.toLowerCase();
        if (attemptString === targetString) {
            setFeedback('correct');
            setScore(prev => prev + 1);
            setTimeout(() => { handleNext(); }, 1000);
        } else {
            setFeedback('wrong');
            setTimeout(() => {
               setFeedback('neutral');
               setSelectedLetters([]);
               const letters = targetString.split('').map((char, idx) => ({ char, id: idx }));
                const shuffled = [...letters];
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
               setScrambledLetters(shuffled);
            }, 1000);
        }
    };

    const handleNext = () => {
        if (currentIndex < words.length - 1) setCurrentIndex(prev => prev + 1);
        else onBack();
    };

    if (!currentWord) return (
        <div className="p-8 text-center bg-gray-50 h-screen flex flex-col items-center justify-center">
            <p className="text-xl text-gray-600 mb-4">Bu listede kelime yok.</p>
            <button onClick={onBack} className="bg-blue-500 text-white px-6 py-2 rounded-full">Geri Dön</button>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col font-sans relative">
            <header className="bg-[#8BC34A] px-4 py-3 flex items-center justify-between text-white shadow-sm z-20">
                <button onClick={onBack} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={24} /></button>
                <div className="flex flex-col items-center"><span className="font-bold text-lg leading-none">{unitTitle}</span><span className="text-xs opacity-90 font-light">Ünite: {unitId}</span></div>
                <div className="flex items-center gap-2"><div className="bg-black/10 px-3 py-1 rounded-full text-sm font-bold">{score}</div><Zap size={20} className="fill-white text-white" /></div>
            </header>
            <div className="w-full bg-gray-200 h-1.5"><div className="bg-[#8BC34A] h-full transition-all duration-300" style={{ width: `${progress}%` }}></div></div>
            <div className="text-right px-4 pt-1 pb-2"><span className="text-[#8BC34A] font-bold text-xs">{currentIndex + 1}/{words.length}</span></div>
            <div className="flex-1 px-6 flex flex-col items-center justify-start pt-6 pb-24">
                <div className="bg-white w-full rounded-2xl p-8 shadow-sm mb-10 relative flex flex-col items-center text-center">
                    <div className="absolute top-4 right-4 bg-gray-50 p-2 rounded-full"><div className="text-xl">{currentWord.image.startsWith('http') ? '🖼️' : currentWord.image}</div></div>
                    <div className="mt-4 mb-2"><h2 className="text-2xl font-bold text-[#8BC34A] leading-tight">"{currentWord.turkish}"</h2><p className="text-gray-500 mt-2 text-lg font-light">anlamına gelen kelime</p></div>
                    <div className="w-full flex justify-between items-center absolute top-1/2 -translate-y-1/2 px-2 pointer-events-none opacity-20"><ChevronLeft size={32} /><ChevronRight size={32} /></div>
                    <div className="mt-12 mb-4 min-h-[50px] flex items-center justify-center gap-1 flex-wrap">
                        {selectedLetters.map((l, idx) => (<button key={`sel-${l.id}`} onClick={() => handleDeselectLetter(l)} className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg shadow-sm border-b-4 border-gray-200 text-xl font-bold text-gray-700 flex items-center justify-center animate-in zoom-in duration-200">{l.char}</button>))}
                        {selectedLetters.length === 0 && (<div className="w-32 h-1 bg-gray-300 rounded-full"></div>)}
                    </div>
                </div>
                <div className="flex flex-wrap justify-center gap-3 w-full max-w-sm">
                    {scrambledLetters.map((l) => (<button key={`scr-${l.id}`} onClick={() => handleSelectLetter(l)} className="w-12 h-12 md:w-14 md:h-14 bg-[#FFEB3B] hover:bg-[#FDD835] active:translate-y-1 active:border-b-0 transition-all rounded-lg shadow-sm border-b-4 border-[#FBC02D] text-2xl font-medium text-gray-800 flex items-center justify-center">{l.char}</button>))}
                </div>
                {feedback === 'correct' && (<div className="absolute top-1/3 bg-green-500 text-white px-8 py-4 rounded-xl shadow-xl font-bold text-xl animate-bounce z-50">DOĞRU!</div>)}
                {feedback === 'wrong' && (<div className="absolute top-1/3 bg-red-500 text-white px-8 py-4 rounded-xl shadow-xl font-bold text-xl animate-shake z-50">YANLIŞ!</div>)}
            </div>
            <div className="fixed bottom-6 left-6 right-6 z-30"><button onClick={() => handleNext()} className="w-full bg-[#FFC107] hover:bg-[#FFB300] text-gray-800 text-lg font-bold py-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 tracking-wide">ATLA <ChevronRight size={20} strokeWidth={3} /></button></div>
        </div>
    );
};

// NEW: Synonym Study View (Matching Game) - Restored
interface SynonymCard {
    id: string; // Unique ID for the card instance
    text: string;
    pairId: string; // ID of the word this card belongs to
    type: 'word' | 'synonym';
    state: 'default' | 'selected' | 'matched' | 'error';
}

const SynonymStudyView: React.FC<{ words: UnitWord[]; unitId: number; unitTitle: string; onBack: () => void }> = ({ words, unitId, unitTitle, onBack }) => {
    const [cards, setCards] = useState<SynonymCard[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [isInteractionLocked, setIsInteractionLocked] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(0);
    const ITEMS_PER_PAGE = 5;

    // Filter all words that have synonyms
    const allWordsWithSynonyms = words.filter(w => w.synonyms && w.synonyms.trim().length > 0);
    const totalPages = Math.ceil(allWordsWithSynonyms.length / ITEMS_PER_PAGE);

    // Track matches per page to know when to proceed
    const [matchedPairsInPage, setMatchedPairsInPage] = useState(0);

    // Initialize Game for Current Page
    useEffect(() => {
        // Reset state for new page
        setSelectedCardId(null);
        setMatchedPairsInPage(0);
        setIsInteractionLocked(false);

        const startIdx = currentPage * ITEMS_PER_PAGE;
        const currentBatch = allWordsWithSynonyms.slice(startIdx, startIdx + ITEMS_PER_PAGE);

        const newCards: SynonymCard[] = [];
        
        currentBatch.forEach((w) => {
            const synList = w.synonyms ? w.synonyms.split(',') : [];
            const primarySynonym = synList[0].trim(); // Take the first synonym

            // Card 1: German Word
            newCards.push({
                id: `${w.id}-word`,
                text: w.german,
                pairId: w.id,
                type: 'word',
                state: 'default'
            });

            // Card 2: Synonym
            newCards.push({
                id: `${w.id}-syn`,
                text: primarySynonym,
                pairId: w.id,
                type: 'synonym',
                state: 'default'
            });
        });

        // Shuffle
        for (let i = newCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
        }

        setCards(newCards);
    }, [currentPage, words]);

    const handleCardClick = (clickedCard: SynonymCard) => {
        if (isInteractionLocked) return;
        if (clickedCard.state === 'matched') return;
        if (clickedCard.id === selectedCardId) {
            // Deselect if clicking same card
            setCards(prev => prev.map(c => c.id === clickedCard.id ? { ...c, state: 'default' } : c));
            setSelectedCardId(null);
            return;
        }

        if (!selectedCardId) {
            // First selection
            setCards(prev => prev.map(c => c.id === clickedCard.id ? { ...c, state: 'selected' } : c));
            setSelectedCardId(clickedCard.id);
        } else {
            // Second selection
            const firstCard = cards.find(c => c.id === selectedCardId);
            if (!firstCard) return;

            // Update matched logic to color both green immediately
            if (firstCard.pairId === clickedCard.pairId) {
                // Match Found!
                setCards(prev => prev.map(c => {
                    if (c.id === firstCard.id || c.id === clickedCard.id) {
                        return { ...c, state: 'matched' };
                    }
                    return c;
                }));
                setSelectedCardId(null);
                setMatchedPairsInPage(prev => prev + 1);
            } else {
                // No Match - Error State (Red)
                setIsInteractionLocked(true);
                setCards(prev => prev.map(c => {
                    if (c.id === clickedCard.id || c.id === firstCard.id) {
                        return { ...c, state: 'error' };
                    }
                    return c;
                }));

                // Reset after delay to default (Blue)
                setTimeout(() => {
                    setCards(prev => prev.map(c => {
                        if (c.state === 'error') {
                            return { ...c, state: 'default' };
                        }
                        return c;
                    }));
                    setSelectedCardId(null);
                    setIsInteractionLocked(false);
                }, 800);
            }
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(prev => prev + 1);
        } else {
            onBack();
        }
    };

    const isPageComplete = matchedPairsInPage === Math.min(ITEMS_PER_PAGE, allWordsWithSynonyms.length - (currentPage * ITEMS_PER_PAGE)) && matchedPairsInPage > 0;
    const isLastPage = currentPage === totalPages - 1;

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
            {/* Header */}
            <header className="bg-[#1e7eb6] p-4 flex items-center justify-between text-white shadow-md sticky top-0 z-20">
                <button onClick={onBack} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                    <X size={24} />
                </button>
                <div className="flex flex-col items-center">
                    <span className="font-bold text-lg leading-none">{unitTitle}</span>
                    <span className="text-xs opacity-90 font-light">Eş Anlamlı Eşleştirme</span>
                </div>
                <div className="font-bold text-sm bg-black/20 px-3 py-1 rounded-full">
                    {currentPage + 1} / {totalPages || 1}
                </div>
            </header>

            {/* Grid Content */}
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3 pb-24">
                    {cards.map((card) => {
                        let cardClass = "";
                        // Default Blue: bg-[#03A9F4]
                        // Selected Green: bg-[#4CAF50]
                        // Matched Green: bg-[#4CAF50] (maybe distinct look)
                        // Error Red: bg-[#F44336]

                        if (card.state === 'selected') {
                            cardClass = "bg-[#4CAF50] text-white ring-4 ring-yellow-400 scale-[1.02] shadow-lg z-10";
                        } else if (card.state === 'matched') {
                            cardClass = "bg-[#4CAF50] text-white opacity-60 scale-95 border-none"; 
                        } else if (card.state === 'error') {
                            cardClass = "bg-[#F44336] text-white animate-shake ring-2 ring-red-600";
                        } else {
                            // Default State
                            cardClass = "bg-[#03A9F4] text-white hover:bg-[#039BE5] active:scale-95 shadow-sm";
                        }

                        return (
                            <button
                                key={card.id}
                                onClick={() => handleCardClick(card)}
                                disabled={card.state === 'matched'}
                                className={`
                                    relative h-32 rounded-2xl flex items-center justify-center p-4 text-center transition-all duration-200
                                    ${cardClass}
                                `}
                            >
                                <span className="text-lg font-bold leading-tight break-words">
                                    {card.state === 'matched' && <CheckCircle2 className="absolute top-2 right-2 text-white/50" size={16} />}
                                    {card.text}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Page Complete Overlay / Button */}
                {isPageComplete && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 animate-in fade-in">
                        <div className="bg-white rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl max-w-sm w-full">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <Trophy size={40} className="text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                {isLastPage ? "Tebrikler!" : "Harika!"}
                            </h2>
                            <p className="text-gray-500 mb-8">
                                {isLastPage 
                                    ? "Tüm kelimeleri başarıyla eşleştirdin." 
                                    : "Bu sayfadaki eşleştirmeleri tamamladın."}
                            </p>
                            <button 
                                onClick={handleNextPage}
                                className="w-full bg-[#1e7eb6] text-white font-bold py-3 rounded-xl hover:bg-[#1565C0] transition-colors"
                            >
                                {isLastPage ? "Tamamla" : "Sonraki Sayfa"}
                            </button>
                        </div>
                    </div>
                )}

                 {allWordsWithSynonyms.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <Info size={48} className="mb-4 opacity-50" />
                        <p>Bu ünitede eş anlamlısı tanımlanmış kelime bulunmamaktadır.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const AddWordView: React.FC<{ onBack: () => void; onSave: () => void }> = ({ onBack, onSave }) => (
    <div className="p-4 bg-gray-50 min-h-screen">
         <button onClick={onBack} className="mb-6 p-2 bg-white rounded-full shadow-sm"><ArrowLeft /></button>
         <h2 className="text-2xl font-bold text-gray-800 mb-6">Kelime Ekle</h2>
         <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
             <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Almanca</label>
                 <input className="w-full p-3 border rounded-lg" placeholder="Wort" />
             </div>
             <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Türkçe</label>
                 <input className="w-full p-3 border rounded-lg" placeholder="Kelime" />
             </div>
             <button onClick={onSave} className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg mt-4 shadow-lg hover:bg-blue-600">Kaydet</button>
         </div>
    </div>
);

const ProgressView: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <div className="p-4 bg-gray-50 min-h-screen">
         <button onClick={onBack} className="mb-6 p-2 bg-white rounded-full shadow-sm"><ArrowLeft /></button>
         <h2 className="text-2xl font-bold text-gray-800 mb-6">İlerlemem</h2>
         <div className="bg-white p-6 rounded-xl shadow-sm mb-4">
             <div className="flex justify-between items-center mb-2">
                 <span className="font-bold text-gray-700">Toplam İlerleme</span>
                 <span className="font-bold text-green-500">%35</span>
             </div>
             <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[35%]"></div>
             </div>
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm">
             <h3 className="font-bold text-gray-700 mb-4">Haftalık Aktivite</h3>
             <div className="flex justify-between items-end h-32 pb-2">
                 {[40, 70, 30, 85, 50, 20, 60].map((h, i) => (
                     <div key={i} className="w-8 bg-blue-100 rounded-t-lg relative group">
                         <div style={{height: `${h}%`}} className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg transition-all group-hover:bg-blue-600"></div>
                     </div>
                 ))}
             </div>
             <div className="flex justify-between text-xs text-gray-400 font-medium">
                 <span>Pzt</span><span>Sal</span><span>Çar</span><span>Per</span><span>Cum</span><span>Cmt</span><span>Paz</span>
             </div>
         </div>
    </div>
);

const LeaderboardView: React.FC<{ onBack: () => void; user: User | null }> = ({ onBack, user }) => (
    <div className="bg-purple-600 min-h-screen text-white p-4">
         <div className="flex items-center gap-4 mb-8">
            <button onClick={onBack} className="p-2 bg-white/20 rounded-full hover:bg-white/30"><ArrowLeft /></button>
            <h2 className="text-2xl font-bold">Liderlik Tablosu</h2>
         </div>
         
         <div className="flex justify-center items-end gap-4 mb-8 px-4">
             <div className="flex flex-col items-center">
                 <div className="w-16 h-16 rounded-full bg-gray-300 border-4 border-white mb-2 shadow-lg"></div>
                 <div className="text-sm font-bold">Mehmet</div>
                 <div className="h-24 w-16 bg-white/20 rounded-t-lg flex items-end justify-center pb-2">2</div>
             </div>
             <div className="flex flex-col items-center">
                 <div className="text-yellow-300 mb-2"><Crown size={32} /></div>
                 <div className="w-20 h-20 rounded-full bg-yellow-400 border-4 border-white mb-2 shadow-lg"></div>
                 <div className="text-lg font-bold">Ayşe</div>
                 <div className="h-32 w-20 bg-white/30 rounded-t-lg flex items-end justify-center pb-2 text-xl font-bold">1</div>
             </div>
             <div className="flex flex-col items-center">
                 <div className="w-16 h-16 rounded-full bg-orange-400 border-4 border-white mb-2 shadow-lg"></div>
                 <div className="text-sm font-bold">Can</div>
                 <div className="h-20 w-16 bg-white/20 rounded-t-lg flex items-end justify-center pb-2">3</div>
             </div>
         </div>

         <div className="bg-white rounded-t-3xl text-gray-800 p-6 shadow-2xl">
            <div className="space-y-4">
                {[4, 5, 6].map(i => (
                    <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                        <span className="font-bold text-gray-400 w-6">{i}</span>
                        <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                        <div className="flex-1 font-bold">Kullanıcı {i}</div>
                        <div className="font-bold text-purple-600">{1000 - i * 50} XP</div>
                    </div>
                ))}
                <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <span className="font-bold text-purple-600 w-6">12</span>
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                        {user?.name?.charAt(0) || 'S'}
                    </div>
                    <div className="flex-1 font-bold">{user?.name || 'Sen'}</div>
                    <div className="font-bold text-purple-600">450 XP</div>
                </div>
            </div>
         </div>
    </div>
);


// --- UPDATED UNITS VIEW (Matches "Akademik İsimler" Timeline Screenshot) ---
const UnitsView: React.FC<{
    title: string;
    levelCode: string;
    onBack: () => void;
    onUnitSelect: (id: number) => void;
    totalWords: number;
    learnedCount: number;
    correctCount: number;
    onStartWrongReview: () => void;
    onStartMixedReview: () => void;
}> = ({ title, levelCode, onBack, onUnitSelect, totalWords, learnedCount, correctCount, onStartWrongReview, onStartMixedReview }) => {
    
    // Determine number of units and titles based on level code
    let unitsCount = 20;
    let unitTitles: string[] = [];
    
    if (levelCode === 'GoetheA1') {
        // We have data for 3 units currently, but structure asks for 20 potential
        unitTitles = [
            'Temel Kavramlar ve İletişim',
            'Günlük Yaşam, İş ve Sağlık',
            'Şehir, Ulaşım ve Çevre'
        ];
    } else if (levelCode === 'GoetheA2') {
         unitTitles = []; // Empty for now
    }

    const units = Array.from({length: 20}, (_, i) => ({
        id: i + 1,
        title: unitTitles[i] || `Ünite ${i + 1}`,
        learned: 0, 
        total: 30 // Approx
    }));

    const correctPercentage = totalWords > 0 ? Math.round((correctCount / totalWords) * 100) : 0;
    const learnedPercentage = totalWords > 0 ? Math.round((learnedCount / totalWords) * 100) : 0;

    // Cycling colors for the timeline circles
    const colors = [
        'bg-[#E91E63]', // Pink
        'bg-[#03A9F4]', // Blue
        'bg-[#009688]', // Teal
        'bg-[#8BC34A]', // Lime
        'bg-[#F44336]', // Red
        'bg-[#FFC107]', // Amber
        'bg-[#795548]', // Brown
        'bg-[#CDDC39]', // Light Lime
        'bg-[#3F51B5]', // Indigo
        'bg-[#FF9800]', // Orange
        'bg-[#9C27B0]', // Purple
        'bg-[#FFEB3B]', // Yellow
    ];

    return (
        <div className="bg-white min-h-screen font-sans flex flex-col">
             {/* Header */}
             <header className="bg-[#167c9c] p-4 flex items-center gap-4 text-white shadow-md sticky top-0 z-20">
                <button onClick={onBack}>
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold flex-1">{title}</h1>
            </header>

            {/* Top Stats Action Bar */}
            <div className="p-4 z-10 bg-white">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="flex justify-between items-start mb-4 px-2">
                        {/* 1. Unutulabilecek - Placeholder for future logic */}
                        <div className="flex flex-col items-center w-1/3 cursor-pointer active:scale-95 transition-transform">
                            <div className="w-12 h-12 rounded-full bg-[#FFC107] flex items-center justify-center text-white mb-2 shadow-sm">
                                <Pin size={24} className="fill-current" />
                            </div>
                            <span className="text-[10px] text-gray-500 text-center leading-tight">Unutulabilecek<br/>Kelimeler</span>
                        </div>
                        {/* 2. Yanlış - Triggers Wrong Review */}
                        <div 
                            className="flex flex-col items-center w-1/3 relative cursor-pointer active:scale-95 transition-transform"
                            onClick={onStartWrongReview}
                        >
                            {/* Dividers */}
                            <div className="absolute top-2 left-0 w-px h-16 bg-gray-100"></div>
                            <div className="absolute top-2 right-0 w-px h-16 bg-gray-100"></div>
                            
                            <div className="w-12 h-12 rounded-full bg-[#F44336] flex items-center justify-center text-white mb-2 shadow-sm">
                                <XCircle size={24} className="fill-current" />
                            </div>
                            <span className="text-[10px] text-gray-500 text-center leading-tight">Yanlış<br/>Yapılanlar</span>
                        </div>
                        {/* 3. Karışık - Triggers Mixed Review */}
                        <div 
                            className="flex flex-col items-center w-1/3 cursor-pointer active:scale-95 transition-transform"
                            onClick={onStartMixedReview}
                        >
                            <div className="w-12 h-12 rounded-full bg-[#8BC34A] flex items-center justify-center text-white mb-2 shadow-sm">
                                <Shuffle size={24} />
                            </div>
                            <span className="text-[10px] text-gray-500 text-center leading-tight">Karışık<br/>Tekrar Çalışması</span>
                        </div>
                    </div>
                    
                    <div className="flex border-t border-gray-100 pt-3">
                        <div className="flex-1 text-center border-r border-gray-100 flex items-center justify-center gap-1">
                            <span className="font-bold text-gray-400 text-sm bg-gray-100 px-2 py-0.5 rounded">%{correctPercentage}</span> 
                            <span className="text-xs text-gray-400">Doğru yanıtlar</span>
                        </div>
                        <div className="flex-1 text-center flex items-center justify-center gap-1">
                            <span className="font-bold text-gray-400 text-sm bg-gray-100 px-2 py-0.5 rounded">%{learnedPercentage}</span>
                            <span className="text-xs text-gray-400">Öğrenilenler</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline List */}
            <div className="flex-1 px-6 pb-24 overflow-y-auto">
                <div className="relative pl-6">
                    {/* Dotted Line Background */}
                    <div className="absolute left-[29px] top-6 bottom-10 w-0 border-l-2 border-dotted border-gray-300 -z-0"></div>

                    {units.map((unit, index) => (
                        <div 
                            key={unit.id} 
                            onClick={() => onUnitSelect(unit.id)}
                            className="flex items-center mb-8 relative z-10 cursor-pointer group"
                        >
                            {/* Circle Number */}
                            <div className={`w-14 h-14 rounded-full ${colors[index % colors.length]} flex items-center justify-center text-white font-medium text-xl shadow-md border-4 border-white transition-transform group-hover:scale-110 flex-shrink-0`}>
                                {unit.id}
                            </div>
                            
                            {/* Text Info */}
                            <div className="ml-5 flex-1">
                                <h3 className="font-bold text-gray-700 text-lg">{unit.title}</h3>
                                <p className="text-gray-400 text-sm font-light">0/{unit.total} öğrenildi</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ... (LeaderboardView, SideMenu components remain the same) ...

const HomeSelectionView: React.FC<{ onNavigate: (view: string) => void; onLevelSelect: (level: string) => void; user: User | null; totalLearned: number }> = ({ onNavigate, onLevelSelect, user, totalLearned }) => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white p-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
                <button onClick={() => onNavigate('menu')} className="text-gray-600"><Menu size={24} /></button>
                <div className="flex items-center gap-2">
                    <Flame size={20} className="text-orange-500" />
                    <span className="font-bold text-orange-500">{totalLearned}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                    {user?.name.charAt(0) || 'U'}
                </div>
            </header>
            
            <div className="p-4 space-y-6 pb-20">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
                    <h2 className="text-2xl font-bold mb-2">Merhaba, {user?.name || "Kullanıcı"}!</h2>
                    <p className="opacity-90">Bugün Almanca öğrenmek için harika bir gün.</p>
                </div>

                {/* Main Levels Grid */}
                <div>
                    <h3 className="font-bold text-gray-700 mb-4">Seviyeler</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {/* New Goethe Buttons Added Here */}
                        <button 
                            onClick={() => onLevelSelect('GoetheA1')}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-yellow-400 transition-colors flex flex-col items-center justify-center gap-2 h-32 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400"></div>
                            <div className="w-20 h-20 rounded-full bg-yellow-50 flex items-center justify-center p-2 text-center shadow-sm border border-yellow-100 group-hover:scale-110 transition-transform">
                                <span className="font-bold text-gray-800 text-lg leading-tight">Goethe<br/><span className="text-yellow-600">A1</span></span>
                            </div>
                        </button>

                        <button 
                            onClick={() => onLevelSelect('GoetheA2')}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-green-400 transition-colors flex flex-col items-center justify-center gap-2 h-32 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-green-400"></div>
                            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center p-2 text-center shadow-sm border border-green-100 group-hover:scale-110 transition-transform">
                                <span className="font-bold text-gray-800 text-lg leading-tight">Goethe<br/><span className="text-green-600">A2</span></span>
                            </div>
                        </button>

                        {[
                            { code: 'A1', label: 'Fiiller' },
                            { code: 'A2', label: 'Sıfatlar' },
                            { code: 'B1', label: 'İsimler' },
                            { code: 'B2', label: 'Zarflar' },
                            { code: 'C1', label: 'Bağlaçlar' },
                            { code: 'C2', label: 'Öbek Fiiller' }
                        ].map((levelItem) => (
                            <button 
                                key={levelItem.code}
                                onClick={() => onLevelSelect(levelItem.code)}
                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-blue-300 transition-colors flex flex-col items-center justify-center gap-2 h-32"
                            >
                                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center p-2 text-center shadow-sm border border-gray-200">
                                    <span className="font-bold text-gray-700 text-sm leading-tight">{levelItem.label}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Other Options */}
                <div className="space-y-3">
                    <button onClick={() => onNavigate('package_selection')} className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Package size={20} /></div>
                            <span className="font-medium">Kelime Paketlerim</span>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                    </button>
                    <button onClick={() => onNavigate('progress')} className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-lg text-green-600"><BarChart2 size={20} /></div>
                            <span className="font-medium">İlerlemem</span>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                    </button>
                    <button onClick={() => onNavigate('leaderboard_view')} className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Award size={20} /></div>
                            <span className="font-medium">Sıralama</span>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ... (SearchView, PackageSelectionView, CreatePackageView, ReadyPackagesView, HelpView, AddWordView, ProgressView, UnitDetailView components remain unchanged) ...

const Dashboard: React.FC<DashboardProps> = ({ onStartLive, user }) => {
    const [view, setView] = useState('home');
    const [selectedUnit, setSelectedUnit] = useState<number>(1);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [createdPackageName, setCreatedPackageName] = useState<string | null>(null);
    const [unitWords, setUnitWords] = useState<UnitWord[]>([]);
    const [currentLevelCode, setCurrentLevelCode] = useState<string>('A1');
    const [currentLevelTitle, setCurrentLevelTitle] = useState("Fiiller"); 

    // Stats Tracking
    const [wrongWords, setWrongWords] = useState<Set<string>>(new Set());
    const [correctWords, setCorrectWords] = useState<Set<string>>(new Set());
    const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set());

    const handleNavigate = (target: string) => { if (target === 'menu') setIsMenuOpen(true); else setView(target); };
    
    // Update local state and reflect 'learned' status globally
    const handleUpdateWordLevel = (id: string, level: 1 | 2 | 3) => { 
        setUnitWords(prevWords => prevWords.map(word => { 
            if (word.id === id) return { ...word, level }; 
            return word; 
        }));
        if (level === 3) {
            setLearnedWords(prev => new Set(prev).add(id));
        } else {
            setLearnedWords(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const handleLevelSelect = (level: string) => { 
        const titles: any = { 
            'A1': 'Fiiller', 
            'A2': 'Sıfatlar', 
            'B1': 'İsimler', 
            'B2': 'Zarflar', 
            'C1': 'Bağlaçlar', 
            'C2': 'Öbek Fiiller', 
            'GoetheA1': 'Goethe A1 Kelimeler',
            'GoetheA2': 'Goethe A2 Kelimeler'
        };
        setCurrentLevelCode(level);
        setCurrentLevelTitle(titles[level] || `${level} Level`);
        setView('units_view'); 
    };

    // Global Stats Aggregation for the current Level (Section)
    const getAllWordsForLevel = (code: string) => {
        const levelData = vocabularyDB[code];
        if (!levelData) return [];
        return Object.values(levelData).flat();
    };

    const currentLevelAllWords = getAllWordsForLevel(currentLevelCode);
    const currentLevelTotal = currentLevelAllWords.length;
    // Calculate intersection of global stats and current level words
    const currentLevelCorrectCount = currentLevelAllWords.filter(w => correctWords.has(w.id)).length;
    const currentLevelLearnedCount = currentLevelAllWords.filter(w => learnedWords.has(w.id)).length; // Use explicit set or word.level check if we updated the DB directly

    const handleWrongAnswer = (id: string) => {
        setWrongWords(prev => new Set(prev).add(id));
        // Remove from correct if it was there
        setCorrectWords(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };

    const handleCorrectAnswer = (id: string) => {
        setCorrectWords(prev => new Set(prev).add(id));
        // Remove from wrong if it was there
        setWrongWords(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };

    const handleStartWrongReview = () => {
        const wrongList = currentLevelAllWords.filter(w => wrongWords.has(w.id));
        if (wrongList.length > 0) {
            setUnitWords(wrongList);
            setView('flashcard_study');
        } else {
            alert("Bu bölümde henüz yanlış yapılmış kelime yok.");
        }
    };

    const handleStartMixedReview = () => {
        // "Mixed Review" based on prompt: "o bölümün tüm ünitelerindeki yanlış yapılan kelimelerin harmanlaması"
        const wrongList = currentLevelAllWords.filter(w => wrongWords.has(w.id));
        if (wrongList.length > 0) {
            // Shuffle
            const shuffled = [...wrongList];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            setUnitWords(shuffled);
            setView('flashcard_study'); // Or quiz, sticking to study for review
        } else {
            alert("Tekrar edilecek yanlış kelime bulunamadı.");
        }
    };

    return (
        <div className="relative w-full min-h-screen bg-gray-50">
             <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onNavigate={(tab) => { setIsMenuOpen(false); setView(tab); }} />
            {view === 'home' && (<HomeSelectionView onNavigate={handleNavigate} onLevelSelect={handleLevelSelect} user={user} totalLearned={learnedWords.size} />)}
            {view === 'units_view' && (
                <UnitsView 
                    title={currentLevelTitle} 
                    levelCode={currentLevelCode}
                    onBack={() => setView('home')} 
                    onUnitSelect={(id) => { 
                        setSelectedUnit(id); 
                        // Load words for specific unit from DB
                        const words = vocabularyDB[currentLevelCode]?.[id] || [];
                        setUnitWords(words);
                        setView('unit_detail'); 
                    }}
                    totalWords={currentLevelTotal}
                    correctCount={currentLevelCorrectCount}
                    learnedCount={currentLevelLearnedCount}
                    onStartWrongReview={handleStartWrongReview}
                    onStartMixedReview={handleStartMixedReview}
                />
            )}
            {view === 'search_view' && <SearchView onBack={() => setView('home')} />}
            {view === 'package_selection' && (<PackageSelectionView onBack={() => setView('home')} onCreatePackage={() => setView('create_package')} onBrowseReadyPackages={() => setView('ready_packages')} />)}
            {view === 'create_package' && (<CreatePackageView onBack={() => setView('package_selection')} onSave={(name) => { setCreatedPackageName(name); setView('add_word'); }} />)}
            {view === 'ready_packages' && <ReadyPackagesView onBack={() => setView('package_selection')} onSelectPackage={(code) => handleLevelSelect(code)} />}
            {view === 'help_view' && <HelpView onBack={() => setView('home')} />}
            {view === 'settings_view' && <Settings onBack={() => setView('home')} />}
            {view === 'unit_detail' && (<UnitDetailView unitId={selectedUnit} onBack={() => setView('units_view')} words={unitWords} onUpdateWordLevel={handleUpdateWordLevel} onStartStudying={() => setView('flashcard_study')} onStartMultipleChoice={() => setView('multiple_choice')} onStartWritingTest={() => setView('writing_test')} onStartSynonymStudy={() => setView('synonym_study')} />)}
            {view === 'flashcard_study' && (<FlashcardStudyView words={unitWords} onBack={() => setView('unit_detail')} onUpdateLevel={handleUpdateWordLevel} />)}
            {view === 'multiple_choice' && (<MultipleChoiceQuizView words={unitWords} unitId={selectedUnit} onBack={() => setView('unit_detail')} onUpdateLevel={handleUpdateWordLevel} onWrongAnswer={handleWrongAnswer} onCorrectAnswer={handleCorrectAnswer} />)}
            {view === 'writing_test' && (<WritingTestView words={unitWords} unitId={selectedUnit} unitTitle={currentLevelTitle} onBack={() => setView('unit_detail')} />)}
            {view === 'synonym_study' && (<SynonymStudyView words={unitWords} unitId={selectedUnit} unitTitle={currentLevelTitle} onBack={() => setView('unit_detail')} />)}
            {view === 'add_word' && (<AddWordView onBack={() => setView('package_selection')} onSave={() => setView('package_selection')} />)}
            {view === 'progress' && <ProgressView onBack={() => setView('home')} />}
            {view === 'leaderboard_view' && <LeaderboardView onBack={() => setView('home')} user={user} />}
        </div>
    );
};

export default Dashboard;