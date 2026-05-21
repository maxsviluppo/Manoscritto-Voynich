import { useState, useEffect } from "react";
import { Hotspot, Theory, LetterMap, DecryptionResult } from "./types";
import { FO_F34V_HOTSPOTS, DECRYPTION_THEORIES, EVA_ALPHABET } from "./data";
import { ManuscriptMap } from "./components/ManuscriptMap";
import { VoynichText } from "./components/VoynichText";
import { DocumentLoader } from "./components/DocumentLoader";
import { 
  Compass, 
  Brain, 
  Keyboard, 
  Sparkles, 
  RefreshCw, 
  Sliders, 
  BookOpen, 
  FileText, 
  Languages, 
  ChevronRight, 
  TrendingUp, 
  Info, 
  CheckCircle2, 
  HelpCircle,
  Hash
} from "lucide-react";

export default function App() {
  const [language, setLanguage] = useState<"it" | "en">("it");
  const [activeTab, setActiveTab] = useState<"analyzer" | "sandbox" | "keyboard">("analyzer");
  
  // Selected hotspot for local inspection and AI query
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(FO_F34V_HOTSPOTS[0]);
  
  // Custom AI query state
  const [customQuestion, setCustomQuestion] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Decryption Sandbox state
  const [selectedParagraph, setSelectedParagraph] = useState<Hotspot>(
    FO_F34V_HOTSPOTS.find(h => h.id === "paragraph_top_left") || FO_F34V_HOTSPOTS[4]
  );
  const [selectedTheory, setSelectedTheory] = useState<Theory>(DECRYPTION_THEORIES[0]);
  const [letterMapping, setLetterMapping] = useState<Record<string, string>>(
    DECRYPTION_THEORIES[0].exampleSubstitution || {}
  );
  
  // AI auto-decrypt states
  const [autoDecryptLoading, setAutoDecryptLoading] = useState<boolean>(false);
  const [autoDecryptResult, setAutoDecryptResult] = useState<DecryptionResult | null>(null);

  // Interactive Voynich Keyboard state
  const [typedText, setTypedText] = useState<string>("8am croda ttey");

  // Custom document integration states
  const [documentSource, setDocumentSource] = useState<"default" | "custom" | "voynich_pdf">("default");
  const [isCustomActive, setIsCustomActive] = useState<boolean>(false);
  const [activeUploadedImage, setActiveUploadedImage] = useState<string>("");
  const [allUploadedImages, setAllUploadedImages] = useState<string[]>([]);
  
  const VOYNICH_PDF_URL = "https://archive.org/download/TheVoynichManuscript/The%20Voynich%20Manuscript.pdf";

  // Analyze custom page via Gemini
  const handleAnalyzeCustomPage = async (base64Data: string, pageNum: number) => {
    setAiLoading(true);
    setAiResponse("");
    setActiveTab("analyzer");

    try {
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          elementId: `custom_page_${pageNum}`,
          label: language === "it" ? `Pagina Caricata ${pageNum}` : `Uploaded Page ${pageNum}`,
          imageBase64: base64Data,
          customQuestion: customQuestion || (language === "it" 
            ? `Analizza la pagina ${pageNum} del documento. Fornisci SEMPRE una sezione 'TRASCRIZIONE EVA:' con i glifi identificati e una sezione 'TRADUZIONE:' con l'ipotesi di significato.`
            : `Analyze page ${pageNum}. Always include a 'TRASCRIZIONE EVA:' section with identified glyphs and a 'TRANSLATION:' section with the hypothesized meaning.`),
          language
        })
      });

      const data = await resp.json();
      if (data.success) {
        setAiResponse(data.text);
        setAiCache(prev => ({ ...prev, [base64Data]: data.text }));
      } else {
        setAiResponse(language === "it"
          ? `Errore durante l'analisi della pagina: ${data.error}`
          : `Page analysis failed: ${data.error}`
        );
      }
    } catch (err: any) {
      setAiResponse(language === "it"
        ? `Impossibile comunicare con il server per l'analisi: ${err.message}`
        : `Could not reach backend parser: ${err.message}`
      );
    } finally {
      setAiLoading(false);
    }
  };

  // Analyze all sheets sequentially
  const handleAnalyzeCustomAll = async (base64Array: string[]) => {
    setAiLoading(true);
    setAiResponse("");
    setActiveTab("analyzer");

    try {
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          elementId: "custom_full_doc",
          label: language === "it" ? `Documento Completo (${base64Array.length} pag)` : `Full Document (${base64Array.length} pages)`,
          imagesBase64: base64Array,
          customQuestion: customQuestion || (language === "it"
            ? `Esegui uno studio approfondito di tutte le ${base64Array.length} pagine di questo documento. Cerca correlazioni visuali, coerenza stilistica di scrittura e formula un responso paleografico sintetico sul manoscritto.`
            : `Analyze all ${base64Array.length} pages of this custom document sequentially. Track correlations, scribal consistency, and formulate a unified paleographic synopsis.`),
          language
        })
      });

      const data = await resp.json();
      if (data.success) {
        setAiResponse(data.text);
      } else {
        setAiResponse(language === "it"
          ? `Errore durante l'analisi globale: ${data.error}`
          : `Full analysis failed: ${data.error}`
        );
      }
    } catch (err: any) {
      setAiResponse(language === "it"
        ? `Rete non raggiungibile per studio globale: ${err.message}`
        : `Network problem parsing document: ${err.message}`
      );
    } finally {
      setAiLoading(false);
    }
  };

  // Load example substitution map whenever the selected historical theory shifts
  useEffect(() => {
    if (selectedTheory.exampleSubstitution) {
      setLetterMapping(selectedTheory.exampleSubstitution);
    } else {
      setLetterMapping({});
    }
    setAutoDecryptResult(null);
  }, [selectedTheory]);

  // Sync Sandbox with Custom Analysis
  useEffect(() => {
    if (documentSource === "custom" || documentSource === "voynich_pdf") {
      if (aiResponse && !aiLoading) {
        // Create a virtual hotspot for the custom page to be used in Sandbox
        const virtualHotspot: Hotspot = {
          id: "custom_active_scan",
          name: language === "it" ? "Pagina Caricata (Analisi Attiva)" : "Uploaded Page (Active Scan)",
          nameIt: "Pagina Caricata (Analisi Attiva)",
          x: 0, y: 0, width: 100, height: 100,
          description: language === "it" ? "Risultati dell'analisi IA corrente." : "Current AI analysis results.",
          descriptionIt: "Risultati dell'analisi IA corrente.",
          evaTranscription: extractEvaTranscription(aiResponse),
          translationIt: extractTranslation(aiResponse, "it"),
          translationEn: extractTranslation(aiResponse, "en")
        };
        setSelectedParagraph(virtualHotspot);
      } else if (!aiLoading) {
        // Reset or set to a placeholder when no analysis is available for the current custom page
        const placeholder: Hotspot = {
          id: "custom_no_scan",
          name: language === "it" ? "In attesa di analisi..." : "Awaiting scan...",
          nameIt: "In attesa di analisi...",
          x: 0, y: 0, width: 0, height: 0,
          description: language === "it" ? "Esegui una scansione per visualizzare i dati." : "Run a scan to view data.",
          descriptionIt: "Esegui una scansione per visualizzare i dati.",
          evaTranscription: "",
          translationIt: "",
          translationEn: ""
        };
        setSelectedParagraph(placeholder);
      }
    }
  }, [aiResponse, aiLoading, documentSource, language]);

  // Helper to extract EVA text or sections from AI response
  function extractEvaTranscription(text: string): string {
    const lines = text.split("\n");
    // Look for patterns that look like EVA or a specific section
    const startIdx = lines.findIndex(l => 
      l.toUpperCase().includes("EVA") || 
      l.toUpperCase().includes("TRASCRIZIONE") ||
      l.toUpperCase().includes("TRANSCRIPTION")
    );
    
    if (startIdx !== -1) {
      // Collect lines until next header or end
      const collected = [];
      for (let i = startIdx + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        if (line.includes(":") && (line.includes("TRADUZIONE") || line.includes("ANALISI"))) break;
        if (line.startsWith("#") || line.startsWith("**")) break;
        collected.push(line);
        if (collected.length > 10) break; // limit
      }
      if (collected.length > 0) return collected.join("\n");
    }
    
    // Fallback: try to find any text that looks like EVA (lowercase, words like '8am', 'odal')
    const evaRegex = /[a-z89]{3,}/g;
    const matches = text.match(evaRegex);
    if (matches && matches.length > 5) {
      return matches.slice(0, 20).join(" ");
    }

    return text.slice(0, 200) + "...";
  }

  function extractTranslation(text: string, lang: string): string {
    const searchValues = lang === "it" 
      ? ["TRADUZIONE", "ITALIANO", "TESTO CHIARO"] 
      : ["TRANSLATION", "ENGLISH", "CLEARTEXT"];
      
    const lines = text.split("\n");
    let foundIdx = -1;
    
    for (const search of searchValues) {
      foundIdx = lines.findIndex(l => l.toUpperCase().includes(search));
      if (foundIdx !== -1) break;
    }

    if (foundIdx !== -1) {
      const collected = [];
      for (let i = foundIdx + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        if (line.includes(":") && (line.includes("EVA") || line.includes("TRASCRIZIONE"))) break;
        if (line.startsWith("#") || (line.startsWith("**") && !line.includes(searchValues[0]))) break;
        collected.push(line);
        if (collected.length > 5) break; 
      }
      if (collected.length > 0) return collected.join(" ").replace(/[*_]/g, "");
    }
    return "";
  }

  // Reset the paleographic botanical analysis output when changing hotspots or uploaded custom files/pages
  // Improved: Load from cache if available to prevent "reporting previous" or losing data on page switch
  const [aiCache, setAiCache] = useState<Record<string, string>>({});

  useEffect(() => {
    let key = "none";
    if (documentSource === "custom" || documentSource === "voynich_pdf") {
      key = activeUploadedImage || "custom_empty";
    } else {
      key = selectedHotspot?.id || "none";
    }
    
    if (aiCache[key]) {
      setAiResponse(aiCache[key]);
    } else {
      setAiResponse("");
    }
  }, [selectedHotspot, activeUploadedImage, documentSource]);

  // Handler to perform full paleographic image search / region query using server-side Gemini
  const handleConsultAi = async (spot: Hotspot | null, overrideQuestion?: string) => {
    setAiLoading(true);
    // Do not clear aiResponse immediately to avoid flickering if we have cached data
    // setAiResponse(""); 
    
    const elementId = spot ? spot.id : "custom_query";
    const label = spot ? (language === "it" ? spot.nameIt : spot.name) : "Custom";
    const questionText = overrideQuestion || customQuestion;

    try {
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          elementId,
          label,
          imageBase64: (documentSource === "custom" || documentSource === "voynich_pdf") ? activeUploadedImage : undefined,
          customQuestion: questionText,
          language
        })
      });

      const data = await resp.json();
      if (data.success) {
        setAiResponse(data.text);
        const key = (documentSource === "custom" || documentSource === "voynich_pdf") ? activeUploadedImage : elementId;
        setAiCache(prev => ({ ...prev, [key]: data.text }));
      } else {
        const errorMsg = language === "it" 
          ? `Errore durante la decifrazione: ${data.error}`
          : `Decompiling error: ${data.error}`;
        setAiResponse(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = language === "it"
        ? `Impossibile contattare la cabina paleografica: ${err.message}`
        : `Could not reach decryption core: ${err.message}`;
      setAiResponse(errorMsg);
    } finally {
      setAiLoading(false);
    }
  };

  // Perform automatic AI decryption attempt using the server-side auto-solver
  const handleAutoDecrypt = async () => {
    setAutoDecryptLoading(true);
    setAutoDecryptResult(null);

    try {
      const resp = await fetch("/api/decrypt-auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textToDecrypt: selectedParagraph.evaTranscription,
          cipherMethod: selectedTheory.nameIt,
          customMapping: letterMapping,
          language
        })
      });

      const data = await resp.json();
      if (data.success) {
        setAutoDecryptResult(data);
        if (data.suggestedMapping) {
          // Merge or replace mapping
          setLetterMapping(data.suggestedMapping);
        }
      } else {
        console.error("Auto decrypt error:", data.error);
      }
    } catch (err: any) {
      console.error("Network problem on decryption solver:", err);
    } finally {
      setAutoDecryptLoading(false);
    }
  };

  // Apply custom single key map modification
  const handleUpdateLetterMapping = (evaChar: string, targetValue: string) => {
    const updated = { ...letterMapping, [evaChar]: targetValue.toLowerCase().slice(0, 3) };
    setLetterMapping(updated);
  };

  // Resets substitutions to the basic template
  const handleResetMapping = () => {
    if (selectedTheory.exampleSubstitution) {
      setLetterMapping(selectedTheory.exampleSubstitution);
    } else {
      setLetterMapping({});
    }
    setAutoDecryptResult(null);
  };

  // Decipher function - translates a given prompt by looking up letters inside the substitution map
  const decipherTextStr = (sourceText: string): string => {
    return sourceText
      .split("")
      .map(char => {
        const lower = char.toLowerCase();
        if (lower === "\n") return "\n";
        if (lower === " ") return "  ";
        
        // Find mapped character
        if (letterMapping[lower] !== undefined && letterMapping[lower] !== "") {
          return letterMapping[lower];
        }
        return `_${char}_`; // Unresolved markers
      })
      .join("");
  };

  // Calculate raw text frequencies for the selected text block
  const calculateLetterFrequencies = (text: string) => {
    const filtered = text.replace(/[\s\n]/g, "").toLowerCase();
    const map: Record<string, number> = {};
    for (const char of filtered) {
      map[char] = (map[char] || 0) + 1;
    }
    
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([char, count]) => ({
        char,
        count,
        percent: ((count / filtered.length) * 100).toFixed(1)
      }));
  };

  // Approximation of text Index of Coincidence (measures probability of duplicate letters)
  const calculateIndexOfCoincidence = (text: string): number => {
    const filtered = text.replace(/[\s\n]/g, "").toLowerCase();
    const length = filtered.length;
    if (length <= 1) return 0;
    
    const counts: Record<string, number> = {};
    for (const char of filtered) {
      counts[char] = (counts[char] || 0) + 1;
    }
    
    let sum = 0;
    for (const count of Object.values(counts)) {
      sum += count * (count - 1);
    }
    
    return sum / (length * (length - 1));
  };

  const textFrequencies = calculateLetterFrequencies(selectedParagraph.evaTranscription || "");
  const textIC = calculateIndexOfCoincidence(selectedParagraph.evaTranscription || "");

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 flex flex-col font-sans overflow-x-hidden relative selection:bg-cyan-500/30 selection:text-white">
      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
      
      {/* Top Cybernetic Immersive Header */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 sm:px-8 bg-[#080b10] relative z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500/20 border border-cyan-500 flex items-center justify-center rounded-sm shrink-0">
            <div className="w-4 h-4 border-2 border-cyan-400 rotate-45"></div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm sm:text-lg font-light tracking-[0.1em] sm:tracking-[0.2em] text-white uppercase font-sans">
              {language === "it" ? "DECIFRATORE VOYNICH" : "VOYNICH DECIPHERER"}
              <span className="font-bold opacity-45 uppercase text-[9px] sm:text-[10px] tracking-widest ml-2">v4.0.2</span>
            </h1>
            <p className="hidden xs:block text-[9px] sm:text-[10px] font-mono text-cyan-400/80 tracking-normal uppercase">
              {language === "it" 
                ? "Processore di Crittanalisi Botanica f34v" 
                : "Botanical Cryptanalysis Core f34v"}
            </p>
          </div>
        </div>

        {/* Interactive controllers, indicators and switches */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs tracking-widest uppercase font-mono">
          {/* Active status */}
          <div className="hidden md:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_#22d3ee]"></span>
            <span className="text-cyan-400 text-[10px]">Processore Attivo</span>
          </div>

          <div className="hidden sm:block h-4 w-px bg-white/10"></div>

          {/* Language selection pills */}
          <div className="flex items-center bg-white/5 rounded border border-white/10 p-0.5">
            <button
              onClick={() => setLanguage("it")}
              className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                language === "it" 
                  ? "bg-cyan-500 text-black font-semibold shadow-[0_0_8px_#22d3ee]" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              IT
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                language === "en" 
                  ? "bg-cyan-500 text-black font-semibold shadow-[0_0_8px_#22d3ee]" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              EN
            </button>
          </div>

          <div className="h-4 w-px bg-white/10"></div>

          <a 
            href="https://it.wikipedia.org/wiki/Manoscritto_Voynich" 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center gap-1.5 opacity-60 hover:opacity-100 text-cyan-400 hover:text-cyan-300 transition-all text-[10px] cursor-pointer"
            title={language === "it" ? "Documentazione Storica" : "Historical Docs"}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WIKI</span>
          </a>
        </div>
      </header>

      {/* Main Grid Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
        
        {/* LEFT COLUMN: Zoomable interactive leaf panel (lg:span-5) */}
        <section className="lg:col-span-5 flex flex-col h-full min-h-[500px]" id="manuscript-stage-col">
          {/* Source Selector Swapper */}
          <div className="flex bg-[#0b0f19] border border-white/10 rounded-xl p-1 mb-4 items-center justify-between z-10 shrink-0 select-none">
            <span className="text-[10px] font-mono font-bold text-cyan-400 tracking-wider uppercase ml-2">
              {language === "it" ? "SORGENTE MANOSCRITTO:" : "MANUSCRIPT SOURCE:"}
            </span>
            <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar select-none">
              <button
                onClick={() => {
                  setDocumentSource("default");
                  // Reset to a valid static paragraph when returning to default view
                  setSelectedParagraph(FO_F34V_HOTSPOTS.find(h => h.id === "paragraph_top_left") || FO_F34V_HOTSPOTS[4]);
                  setAiResponse("");
                }}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  documentSource === "default"
                    ? "bg-cyan-500 text-black font-semibold shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {language === "it" ? "TAVOLA f34v" : "FOLIO f34v"}
              </button>

              <button
                onClick={() => {
                  setDocumentSource("voynich_pdf");
                  setAiResponse("");
                }}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  documentSource === "voynich_pdf"
                    ? "bg-cyan-500 text-black font-semibold shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {language === "it" ? "MANOSCRITTO PDF" : "FULL PDF MS"}
              </button>

              <button
                onClick={() => {
                  setDocumentSource("custom");
                  setAiResponse("");
                }}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  documentSource === "custom"
                    ? "bg-cyan-500 text-black font-semibold shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {language === "it" ? "CARICA ALTRO" : "UPLOAD OTHER"}
               </button>
            </div>
          </div>

          {documentSource === "default" ? (
            <ManuscriptMap
              activeHotspotId={selectedHotspot?.id || null}
              onSelectHotspot={(spot) => {
                setSelectedHotspot(spot);
                // Auto-sync sandbox selected paragraph if selected spot is a paragraph
                if (spot && spot.id.startsWith("paragraph_")) {
                  setSelectedParagraph(spot);
                }
              }}
              language={language}
            />
          ) : (
            <DocumentLoader
              language={language}
              onAnalyzePage={handleAnalyzeCustomPage}
              onAnalyzeAll={handleAnalyzeCustomAll}
              aiLoading={aiLoading}
              onSelectExternalActiveStatus={setIsCustomActive}
              onActiveImageChange={(activeImg, allImgs) => {
                setActiveUploadedImage(activeImg);
                setAllUploadedImages(allImgs);
              }}
              initialUrl={documentSource === "voynich_pdf" ? VOYNICH_PDF_URL : undefined}
            />
          )}
        </section>

        {/* RIGHT COLUMN: Controls Workbench (lg:span-7) */}
        <section className="lg:col-span-7 flex flex-col bg-[#080b10]/90 border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]" id="decryption-workbench-col">
          
          {/* Navigation Tabs for Sandbox styled with high-tech look */}
          <div className="flex bg-[#0b0f19] border-b border-white/10 overflow-x-auto">
            <button
              onClick={() => setActiveTab("analyzer")}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-4.5 text-[11px] font-mono tracking-wider font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === "analyzer"
                  ? "border-cyan-400 text-cyan-300 bg-white/5 shadow-[inset_0_-10px_20px_rgba(6,182,212,0.05)]"
                  : "border-transparent text-slate-400 hover:text-white hover:bg-white/2"
              }`}
            >
              <Brain className={`w-4 h-4 ${activeTab === "analyzer" ? "text-cyan-400" : "text-slate-500"}`} />
              {language === "it" ? "ANALISI BOTANICA (IA)" : "AI BOTANIC ANALYZER"}
            </button>
            
            <button
              onClick={() => setActiveTab("sandbox")}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-4.5 text-[11px] font-mono tracking-wider font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === "sandbox"
                  ? "border-indigo-500 text-indigo-400 bg-white/5 shadow-[inset_0_-10px_20px_rgba(99,102,241,0.05)]"
                  : "border-transparent text-slate-400 hover:text-white hover:bg-white/2"
              }`}
            >
              <Sliders className={`w-4 h-4 ${activeTab === "sandbox" ? "text-indigo-400" : "text-slate-500"}`} />
              {language === "it" ? "CRITTANALISI" : "CIPHER SANDBOX"}
            </button>

            <button
              onClick={() => setActiveTab("keyboard")}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-4.5 text-[11px] font-mono tracking-wider font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === "keyboard"
                  ? "border-cyan-400 text-cyan-300 bg-white/5 shadow-[inset_0_-10px_20px_rgba(6,182,212,0.05)]"
                  : "border-transparent text-slate-400 hover:text-white hover:bg-white/2"
              }`}
            >
              <Keyboard className={`w-4 h-4 ${activeTab === "keyboard" ? "text-cyan-400" : "text-slate-500"}`} />
              {language === "it" ? "TASTIERA EVA" : "EVA GLYPH WRITER"}
            </button>
          </div>

          {/* TAB 1 CONTENT: Paleography Botanical & Text Explorer with Gemini */}
          {activeTab === "analyzer" && (
            <div className="flex-1 p-6 overflow-y-auto space-y-6 max-h-[72vh] flex flex-col justify-between">
              
              <div className="space-y-5">
                {/* Selected Element Header */}
                <div className="p-5 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden group shadow-[inset_0_0_30px_rgba(255,255,255,0.02)]">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
                    <Compass className="w-24 h-24 text-cyan-400" />
                  </div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_#22d3ee]"></span>
                    <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
                      {language === "it" ? "ELEMENTO SELEZIONATO" : "ACTIVE COMPONENT"}
                    </h3>
                  </div>
                  
                  <h2 className="text-lg font-bold text-white mb-2 font-display tracking-tight">
                    {documentSource === "voynich_pdf" ? (
                      language === "it" ? "Manoscritto Voynich (PDF Intero)" : "Full Voynich Manuscript (PDF)"
                    ) : documentSource === "custom" ? (
                      language === "it" ? "Sorgente Documento Esterno" : "External Document Source"
                    ) : selectedHotspot ? (
                      (language === "it" ? selectedHotspot.nameIt : selectedHotspot.name)
                    ) : (
                      (language === "it" ? "Clicca sulla Tavola a sinistra" : "Click on the Left Folio Map")
                    )}
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {(documentSource === "custom" || documentSource === "voynich_pdf") ? (
                      language === "it"
                        ? "Richiedi l'analisi euristica e paleografica d'avanguardia su questa pagina. Clicca sui pulsanti della scheda a sinistra per analizzare con Gemini."
                        : "Query an in-depth scan of this folio. Use the navigation panel on the left to trigger Gemini core validation."
                    ) : selectedHotspot ? (
                      (language === "it" ? selectedHotspot.descriptionIt : selectedHotspot.description)
                    ) : (
                      (language === "it" ? "Seleziona fusti, fiori o frammenti d'erbario medievale per avviarne l'autopsia linguistica automatizzata." : "Select plant nodes, stems or paragraphs on the image to activate real-time paleographic study.")
                    )}
                  </p>

                  {/* If selecting paragraph and not in custom source mode, show inline EVA preview directly */}
                  {!(documentSource === "custom" || documentSource === "voynich_pdf") && selectedHotspot && selectedHotspot.evaTranscription && (
                    <div className="mt-4 p-3.5 bg-black/40 border border-white/5 rounded-lg relative overflow-hidden">
                      {/* Scanning visual bar overlay */}
                      <div className="absolute left-0 right-0 h-px bg-cyan-400/20 shadow-[0_0_8px_#22d3ee] pointer-events-none scan-beam"></div>
                      <span className="text-[9px] font-mono text-cyan-400/80 uppercase font-bold tracking-widest block mb-2">
                        Trascrizione EVA Originale:
                      </span>
                      <div className="font-mono text-xs text-slate-100 whitespace-pre-line leading-relaxed italic">
                        {selectedHotspot.evaTranscription}
                      </div>
                    </div>
                  )}
                </div>

                {/* Gemini Interactive Call Actions (Only for default mode) */}
                {!(documentSource === "custom" || documentSource === "voynich_pdf") && (
                  <div className="space-y-3">
                    <button
                      onClick={() => handleConsultAi(selectedHotspot)}
                      disabled={aiLoading}
                      className="w-full py-4 bg-cyan-500 text-black hover:bg-cyan-400 disabled:bg-white/5 disabled:text-slate-500 font-bold uppercase tracking-widest text-xs rounded transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2.5 cursor-pointer"
                    >
                      {aiLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                          <span className="font-mono text-[11px] tracking-widest">
                            {language === "it" ? "ELABORAZIONE MATRICE AI..." : "DECRYPTING VIA AI CORE..."}
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span className="font-mono text-[11px] tracking-widest">
                            {language === "it" 
                              ? `AVVIA ANALISI IA REGIONE` 
                              : `QUERY REGION INTEGRITY`
                            }
                          </span>
                        </>
                      )}
                    </button>

                    <p className="text-[9px] text-slate-400 text-center uppercase tracking-wider font-mono">
                      {language === "it" 
                        ? "⚡ Analisi euristica avanzata dei legami storici, d'erbario medievale e morfologici." 
                        : "⚡ Advanced heuristic match of medieval herbarium indices, codicology & patterns."}
                    </p>
                  </div>
                )}

                {/* AI response box */}
                {(aiResponse || aiLoading) && (
                  <div className="p-5 bg-black/40 border border-cyan-500/30 rounded-xl relative shadow-[inset_0_0_30px_rgba(34,211,238,0.03)] overflow-hidden">
                    <div className="absolute left-0 right-0 h-px bg-cyan-400/20 shadow-[0_0_10px_#22d3ee] pointer-events-none scan-beam"></div>
                    <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                        <span className="text-[10px] font-mono font-bold text-cyan-404 uppercase tracking-widest">
                          {language === "it" ? "PALEOGRAFO IA RISPONDE:" : "DECODED CLEAR ANSWER:"}
                        </span>
                      </div>
                      <button 
                        onClick={() => setAiResponse("")}
                        className="text-[9px] font-mono hover:text-cyan-400 text-slate-500 transition-colors uppercase tracking-widest cursor-pointer"
                      >
                        {language === "it" ? "CANCELLA" : "CLEAR"}
                      </button>
                    </div>

                    {/* Streamer typing behavior or simple rich body response */}
                    {aiLoading ? (
                      <div className="py-4 flex flex-col gap-2">
                        <div className="h-3 w-4/5 bg-white/5 rounded animate-pulse"></div>
                        <div className="h-3 w-11/12 bg-white/5 rounded animate-pulse"></div>
                        <div className="h-3 w-2/3 bg-white/5 rounded animate-pulse"></div>
                      </div>
                    ) : (
                      <div className="text-xs sm:text-sm text-slate-100 leading-relaxed max-h-[300px] overflow-y-auto pr-1 whitespace-pre-line font-serif space-y-2 select-text">
                        {aiResponse}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Custom Prompt Form */}
              <div className="border-t border-white/10 pt-4 mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1 h-3 bg-indigo-500 rounded-sm"></span>
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    {language === "it" ? "Parámetri di input personalizzati su f34v:" : "Custom heuristic parameters query:"}
                  </label>
                </div>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!customQuestion.trim()) return;
                    handleConsultAi(null, customQuestion);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    placeholder={language === "it" ? "es. Quali teorie associano questo foglio alla Satureja?" : "e.g., Does this leaf match Ruta graveolens?"}
                    className="flex-1 bg-black/40 rounded px-4 py-3 text-xs border border-white/10 text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none transition-colors font-mono"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !customQuestion.trim()}
                    className="bg-indigo-500 hover:bg-indigo-400 text-white disabled:bg-white/5 disabled:text-slate-500 px-5 py-2.5 rounded text-[10px] font-mono font-extrabold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] disabled:shadow-none cursor-pointer duration-200 shrink-0"
                  >
                    {language === "it" ? "INVIA" : "SEND"}
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 2 CONTENT: Cryptanalysis and Active Substitution Sandbox */}
          {activeTab === "sandbox" && (
            <div className="flex-1 overflow-y-auto p-6 max-h-[72vh] flex flex-col justify-between space-y-6">
              
              <div className="space-y-6">
                
                {/* 1. Selector of Target Pars */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono text-cyan-400 uppercase font-bold block mb-1.5 tracking-wider">
                      {language === "it" ? "Seleziona Blocco di Testo:" : "Select Written Block:"}
                    </label>
                    <div className="relative">
                      {(documentSource === "custom" || documentSource === "voynich_pdf") ? (
                        <div className="w-full bg-cyan-900/20 border border-cyan-500/30 text-xs font-mono font-bold text-cyan-100 rounded px-3 py-2.5">
                          {language === "it" ? "SCANSIONE PAGINA ATTIVA" : "ACTIVE PAGE SCAN"}
                        </div>
                      ) : (
                        <select
                          value={selectedParagraph.id}
                          onChange={(e) => {
                            const spot = FO_F34V_HOTSPOTS.find(h => h.id === e.target.value);
                            if (spot) setSelectedParagraph(spot);
                          }}
                          className="w-full bg-black/40 border border-white/10 text-xs font-mono font-bold text-slate-100 rounded px-3 py-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer appearance-none"
                        >
                          {FO_F34V_HOTSPOTS.filter(h => h.id.startsWith("paragraph_")).map(p => (
                            <option key={p.id} value={p.id} className="bg-[#080b10] text-slate-300">
                              {language === "it" ? p.nameIt : p.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Selecting Interpretation Theories */}
                  <div>
                    <label className="text-[10px] font-mono text-cyan-400 uppercase font-bold block mb-1.5 tracking-wider">
                      {language === "it" ? "Dottrina di Interpretazione:" : "Applied Cipher theory:"}
                    </label>
                    <select
                      value={selectedTheory.id}
                      onChange={(e) => {
                        const th = DECRYPTION_THEORIES.find(t => t.id === e.target.value);
                        if (th) setSelectedTheory(th);
                      }}
                      className="w-full bg-black/40 border border-white/10 text-xs font-mono font-bold text-slate-100 rounded px-3 py-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer appearance-none"
                    >
                      {DECRYPTION_THEORIES.map(t => (
                        <option key={t.id} value={t.id} className="bg-[#080b10] text-slate-300">
                          {language === "it" ? t.nameIt : t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Theoretical Information Banner */}
                <div className="p-4 bg-white/5 border border-white/10 border-l-2 border-l-indigo-500 rounded-lg flex items-start gap-3">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 block uppercase">
                      {language === "it" ? `TEORIA SELEZIONATA: ${selectedTheory.proponent}` : `PROPOSED BY: ${selectedTheory.proponent}`}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed italic mt-1 font-sans">
                      {language === "it" ? selectedTheory.descriptionIt : selectedTheory.description}
                    </p>
                    <div className="mt-2 text-xs text-slate-300 font-mono">
                      <strong className="text-white">{language === "it" ? "Concetto: " : "Core concept: "}</strong>
                      {language === "it" ? selectedTheory.conceptIt : selectedTheory.concept}
                    </div>
                  </div>
                </div>

                {/* 2. Side-by-Side: Original Voynich Fonts & Custom substitution result */}
                <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0c121d] relative shadow-[inset_0_0_30px_rgba(34,211,238,0.03)]">
                  {/* Cyber scanning visual bar overlay */}
                  <div className="absolute left-0 right-0 h-px bg-cyan-400/20 shadow-[0_0_8px_#22d3ee] pointer-events-none scan-beam"></div>

                  <div className="px-4 py-3.5 bg-black/40 border-b border-white/10 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-slate-300 uppercase">
                      {language === "it" ? "DECIFRAZIONE IN TEMPO REALE" : "LIVE DECRYPTED OUTPUT"}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={handleResetMapping}
                        className="text-[9px] font-mono font-bold text-cyan-400 border border-cyan-400/20 px-2.5 py-1 rounded hover:bg-cyan-400/10 cursor-pointer transition-colors uppercase tracking-widest"
                      >
                        {language === "it" ? "RIPRISTINA CHIAVE" : "RESET KEY"}
                      </button>
                    </div>
                  </div>

                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch divide-y md:divide-y-0 md:divide-x divide-white/5">
                    
                    {/* Character inline vector display */}
                    <div className="pb-4 md:pb-0 md:pr-4 flex flex-col justify-between space-y-3">
                      <span className="text-[9px] font-mono text-cyan-400/80 uppercase tracking-widest block font-bold">
                        {language === "it" ? "Lettere Voynich (EVA Render)" : "Voynich Glyph String (EVA)"}
                      </span>
                      <div className="p-3.5 bg-black/40 border border-white/5 rounded font-serif">
                        <VoynichText text={selectedParagraph.evaTranscription || ""} size={16} />
                      </div>
                    </div>

                    {/* Mapped Characters output */}
                    <div className="pt-4 md:pt-0 md:pl-4 flex flex-col justify-between space-y-3">
                      <span className="text-[9px] font-mono text-indigo-400/80 uppercase tracking-widest block font-bold">
                        {language === "it" ? `Decodificato (${selectedTheory.nameIt})` : `Decoded output (${selectedTheory.name})`}
                      </span>
                      <div className="p-3.5 bg-black/60 border border-white/5 rounded">
                        <pre className="font-mono text-emerald-400 text-xs whitespace-pre-line leading-relaxed italic select-all">
                          {decipherTextStr(selectedParagraph.evaTranscription || "")}
                        </pre>
                      </div>
                    </div>

                  </div>

                  {/* Highlighted paragraph translation */}
                  {(selectedParagraph.translationIt || selectedParagraph.translationEn) && (
                    <div className="px-5 pb-5 pt-4 border-t border-white/5 bg-cyan-950/20">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest block mb-2">
                        {language === "it" ? "🔮 TRADUZIONE IPOTETICA DEL PARAGRAFO" : "🔮 HYPOTHETICAL PARAGRAPH TRANSLATION"}
                      </span>
                      <p className="text-xs text-slate-250 leading-relaxed font-serif italic bg-black/40 border border-white/5 rounded-lg p-3.5 shadow-inner">
                        "{language === "it" ? selectedParagraph.translationIt : selectedParagraph.translationEn}"
                      </p>
                    </div>
                  )}

                </div>

                {/* 3. Substitution Key Customizer */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      {language === "it" ? "MATRICE DI SOSTITUZIONE MANUALE:" : "MANUAL SUBSTITUTION MATRIX:"}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                      Voynich &rarr; Sostituto
                    </span>
                  </div>
                  
                  {/* Mapping input nodes grid layout */}
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {EVA_ALPHABET.map((letter) => {
                      const activeMappedVal = letterMapping[letter.eva] || "";
                      return (
                        <div key={letter.eva} className="flex flex-col bg-white/5 border border-white/10 rounded p-2 items-center justify-center gap-1.5 hover:border-cyan-500/50 transition-colors">
                          <div className="flex items-center gap-1 select-none">
                            <span className="text-xs font-serif text-cyan-400 font-bold">{letter.eva}</span>
                            <span className="text-[9px] text-slate-500 font-mono">
                              ({letter.eva})
                            </span>
                          </div>
                          <input
                            type="text"
                            maxLength={3}
                            value={activeMappedVal}
                            placeholder="-"
                            onChange={(e) => handleUpdateLetterMapping(letter.eva, e.target.value)}
                            className="w-8 select-all bg-black/40 border border-white/10 text-center text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-cyan-500 rounded p-1"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Auto analysis statistics block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Letter Frequency chart snippet */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold mb-3 tracking-wider">
                        {language === "it" ? "FREQUENZA CARATTERI TOP" : "TOP CHARACTER FREQUENCIES"}
                      </span>
                      <div className="space-y-2.5">
                        {textFrequencies.slice(0, 4).map((f) => (
                          <div key={f.char} className="flex items-center text-xs gap-3">
                            <span className="w-4 font-mono font-bold text-cyan-400">{f.char}</span>
                            <div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-cyan-500 h-full shadow-[0_0_8px_#06b6d4]" style={{ width: `${Math.min(100, parseFloat(f.percent) * 3)}%` }}></div>
                            </div>
                            <span className="font-mono text-[10px] text-slate-400 w-10 text-right">{f.percent}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Math calculations metrics */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold mb-3 tracking-wider">
                        {language === "it" ? "INDICE DI COINCIDENZA" : "INDEX OF COINCIDENCE"}
                      </span>
                      <div className="space-y-3">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-bold font-mono text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                            {textIC.toFixed(4)}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500">
                            (f34v: {selectedParagraph.id.split("_").pop()})
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal font-sans">
                          {language === "it"
                            ? "I testi normali variano tra 0.065 e 0.080. L'entropia Voynich insolitamente bassa indica un sistema di abbreviazioni fitte o un falso artificiale."
                            : "Standard text ranges from 0.065 to 0.080. Voynich's lower index suggests extreme abbreviation rules or generative artificial patterns."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Server-grounded machine auto decryption triggers */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <button
                  onClick={handleAutoDecrypt}
                  disabled={autoDecryptLoading}
                  className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white disabled:bg-white/5 disabled:text-slate-500 font-bold uppercase tracking-widest text-xs rounded transition-all shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] disabled:shadow-none cursor-pointer flex items-center justify-center gap-2"
                >
                  {autoDecryptLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span className="font-mono text-[11px] tracking-widest">{language === "it" ? "CALCOLO ALGORITMICO IN CORSO..." : "RUNNING CIPHER CRUNCHER..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span className="font-mono text-[11px] tracking-widest">
                        {language === "it" 
                          ? `RIELABORA STRUTTURA CIPHER IA`
                          : `RUN GEMINI DECIPHER ATTEMPT`
                        }
                      </span>
                    </>
                  )}
                </button>

                {/* Print AI decryption results layout */}
                {autoDecryptResult && (
                  <div className="mt-4 p-5 bg-[#0c121d] border border-cyan-500/30 rounded-xl space-y-4 max-h-[250px] overflow-y-auto relative shadow-[inset_0_0_25px_rgba(34,211,238,0.04)]">
                    <div className="absolute left-0 right-0 h-px bg-cyan-400/20 shadow-[0_0_8px_#22d3ee] pointer-events-none scan-beam"></div>
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                      <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                        {language === "it" ? "Matrice di Decodifica Gemini" : "Heuristic Matrix Solution"}
                      </span>
                    </div>

                    {autoDecryptResult.hypotheticalTranslation && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono text-cyan-400/80 tracking-widest block uppercase font-bold">
                          {language === "it" ? "Traduzione Ipotetica Sostitutiva:" : "Hypothetical Content Translation:"}
                        </span>
                        <p className="text-xs text-slate-100 bg-black/40 p-3.5 rounded border border-white/5 italic font-serif leading-relaxed select-text">
                          "{autoDecryptResult.hypotheticalTranslation}"
                        </p>
                      </div>
                    )}

                    {autoDecryptResult.statisticalCommentary && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono text-slate-400 tracking-widest block uppercase font-bold">
                          {language === "it" ? "Rilevanza Statistica:" : "Statistical Soundness:"}
                        </span>
                        <p className="text-xs text-slate-350 leading-relaxed font-sans">
                          {autoDecryptResult.statisticalCommentary}
                        </p>
                      </div>
                    )}

                    {autoDecryptResult.wordByWordAnalysis && autoDecryptResult.wordByWordAnalysis.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <span className="text-[9px] font-mono text-slate-400 tracking-widest block uppercase font-bold">
                          {language === "it" ? "Studio Parola per Parola:" : "Vocabulary Analysis:"}
                        </span>
                        <div className="text-xs space-y-2 select-text">
                          {autoDecryptResult.wordByWordAnalysis.map((w, index) => (
                            <div key={index} className="bg-black/35 p-2.5 rounded flex flex-wrap gap-2 items-center justify-between border border-white/5">
                              <span className="font-serif font-bold text-cyan-400">{w.voynichWord}</span>
                              <span className="text-emerald-400 font-serif font-semibold">&rarr; "{w.translation}"</span>
                              <span className="text-slate-400 text-[10px] font-mono">{w.explanation}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3 CONTENT: Interactive Virtual Keyboard and Symbol reference library */}
          {activeTab === "keyboard" && (
            <div className="flex-1 overflow-y-auto p-6 max-h-[72vh] flex flex-col justify-between space-y-6">
              
              <div className="space-y-6">
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase block font-bold mb-1 tracking-widest">
                    {language === "it" ? "LIBRERIA SCRITTURA MANUALE (Crea Testo Voynich)" : "MANUAL INTERACTIVE CODE EDITOR"}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {language === "it" 
                      ? "Digita caratteri EVA standard sul sistema o clicca sulla matrice di tasti sottratti per visualizzare in tempo reale la scrittura a mano." 
                      : "Type normal letters or click keys below to render real-time vector Voynich drawings."}
                  </p>
                </div>

                {/* Typed text visualization dashboard container */}
                <div className="space-y-4">
                  {/* Styled Input Row */}
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400/80 font-bold tracking-widest uppercase block mb-1.5">
                      {language === "it" ? "Trascrizione Alfabeto EVA (Input modificabile):" : "Normal Keyboard Transcription (EVA):"}
                    </span>
                    <input
                      type="text"
                      value={typedText}
                      onChange={(e) => setTypedText(e.target.value)}
                      placeholder="Scrivi qui usando lettere EVA..."
                      className="w-full bg-black/40 border border-white/10 rounded px-4 py-3 text-sm font-mono text-emerald-400 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>

                  {/* Rendered output panel styled in gold borders */}
                  <div className="p-5 bg-[#0c121d] border border-cyan-500/20 rounded-xl flex flex-col gap-2 min-h-[100px] relative overflow-hidden shadow-[inset_0_0_30px_rgba(34,211,238,0.03)]">
                    {/* Scan line overlay inside preview element */}
                    <div className="absolute left-0 right-0 h-px bg-cyan-400/20 shadow-[0_0_8px_#22d3ee] pointer-events-none scan-beam"></div>

                    <span className="text-[8px] font-mono text-cyan-400/60 font-bold uppercase tracking-widest absolute top-2 right-3">
                      CARATTERI VETTORIALI
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block mb-1">
                      {language === "it" ? "Resa Grafica Manoscritta (Voynich Text):" : "Handwritten Render Output:"}
                    </span>
                    
                    {typedText.trim() ? (
                      <div className="p-2 select-text bg-black/30 rounded border border-white/5 leading-loose">
                        <VoynichText text={typedText} size={24} />
                      </div>
                    ) : (
                      <span className="text-xs italic text-slate-500 font-mono">
                        {language === "it" ? "Vuoto. Fai clic sui tasti per generare grafi..." : "Empty. Start hitting key switches below to output glyphs..."}
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Custom Ornate Medieval Voynich key switchpad */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      {language === "it" ? "Tastiera Virtuale Voynich:" : "Virtual Glyph Keypad:"}
                    </span>
                    <button
                      onClick={() => setTypedText("")}
                      className="text-[9px] font-mono text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded transition-colors uppercase tracking-widest cursor-pointer"
                    >
                      CLEAR
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {EVA_ALPHABET.map((letter) => {
                      return (
                        <button
                          key={letter.eva}
                          onClick={() => setTypedText(prev => prev + letter.eva)}
                          className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 p-2 rounded transition-all cursor-pointer text-left group"
                        >
                          <div className="w-8 h-8 bg-black/40 rounded flex items-center justify-center border border-white/5 group-hover:bg-cyan-500/10 group-hover:border-cyan-400/40 transition-colors">
                            <VoynichText text={letter.eva} size={15} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-mono font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                              {letter.name.split(" ")[0]} 
                              <span className="text-slate-500 text-[9px] ml-1">("{letter.eva}")</span>
                            </span>
                            <span className="text-[9px] text-slate-400 uppercase truncate max-w-[90px]">
                              {letter.approxSound}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Symbol index summary details page footer */}
              <div className="border-t border-white/10 pt-4 mt-6 text-[10px] text-slate-400 flex items-start gap-2.5 italic">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-sans">
                  {language === "it"
                    ? "La combinazione di lettere 'daiin' (EVA: 8an) costituisce circa il 25% del vocabolario erboristico. Spesso interpretato come desinenza sacramentale o ripetitore di sillabe casuali."
                    : "The special word combination 'daiin' (represented in EVA as 8an) represents up to 25% of herbal sections vocabulary. Identified as sacramental indicators or pseudo-text loops."}
                </p>
              </div>

            </div>
          )}

        </section>
      </main>

      {/* Cybernetic Footer Bar replica matching the Immersive UI design */}
      <footer className="h-12 border-t border-white/10 bg-[#080b10] flex items-center justify-between px-6 sm:px-8 text-[9px] sm:text-[10px] tracking-widest text-white/40 font-mono relative z-20 shrink-0">
        <div className="flex gap-6">
          <span>ENCRYPT_SYSTEM_v4_STABLE</span>
          <span className="hidden sm:inline">BUFFER_STATUS: OPTIMAL</span>
        </div>
        <div className="flex gap-6">
          <span className="text-cyan-600 font-semibold">{language === "it" ? "CONNESSIONE SICURA: AES_GCM_v2" : "SECURE CONNECTION: AES_GCM_v2"}</span>
          <span className="hidden xs:inline">&copy; 2026 LABORATORIO CRITTOGRAFICO</span>
        </div>
      </footer>

    </div>
  );
}
