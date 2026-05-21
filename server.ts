import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable JSON request bodies with larger limit for base64 images
  app.use(express.json({ limit: "15mb" }));

  // Initialize Gemini client lazily to avoid startup crash if key is missing
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined in environment secrets. AI deciphering will be mock-simulated.");
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  // API Endpoint: Intelligent analysis of the manuscript image or specific hotspots
  app.get("/api/proxy-pdf", async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL is required" });
    }
    
    try {
      console.log(`[PROXY] Requesting PDF from: ${url}`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'application/pdf,application/octet-stream,*/*',
          'Referer': 'https://archive.org/'
        }
      });

      if (!response.ok) {
        console.error(`[PROXY] Remote server returned ${response.status}: ${response.statusText}`);
        const errorText = await response.text().catch(() => "Unknown error body");
        console.error(`[PROXY] Error body: ${errorText.slice(0, 200)}`);
        return res.status(response.status).json({ 
          error: `Remote server error: ${response.statusText} (${response.status})`
        });
      }
      
      const contentType = response.headers.get("Content-Type");
      console.log(`[PROXY] Success! Content-Type: ${contentType}`);
      if (contentType) {
        res.setHeader("Content-Type", contentType);
      } else {
        res.setHeader("Content-Type", "application/pdf");
      }
      
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (error: any) {
      console.error("PDF Proxy error:", error);
      res.status(500).json({ error: error.message || "Failed to proxy PDF" });
    }
  });

  app.post("/api/analyze", async (req, res) => {
    try {
      const { elementId, label, imageBase64, imagesBase64, customQuestion, language = "it" } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: true,
          text: `[Modalità Demo - Chiave API non configurata]\n\nQuesto è un feedback simulato per l'elemento: **${label || elementId}**.\n\nHai chiesto: "${customQuestion || 'Analisi generale'}"\n\nNello studio storico del Manoscritto Voynich, questa sezione (f34v) rappresenta un tipico campione di erbario medievale. Le foglie bicolore alternate indicano un possibile significato medicinale o alchemico. Per sbloccare l'analisi in tempo reale basata su intelligenza artificiale con Gemini, inserisci una corretta chiave API nel pannello Secrets di AI Studio.`
        });
      }

      let systemInstruction = "Sei un paleografo esperto, glottologo e appassionato decifratore del Manoscritto Voynich. " +
        "Il tuo compito è analizzare dettagliatamente le immagini delle pagine e dei testi forniti dall'utente o dal sistema. " +
        "IMPORTANTE: Per soddisfare le richieste dell'utente, a seguito di ogni analisi botanica, crittografica o paleografica, DEVI SEMPRE includere due sezioni finali ben evidenziate in Markdown:\n\n" +
        "### 🔮 DECIFRAZIONE E TRADUZIONE IPOTETICA\n" +
        "Qui devi decifrare in modo audace, concreto e creativo il testo Voynich adiacente all'elemento analizzato (o quello fornito, come la trascrizione EVA). Proponi una o più decodifiche plausibili secondo le teorie storiche (es. Latino Abbreviato, Ebraico, Turco) e forniscine una traduzione in italiano corrente, riga per riga o parola per parola, svelando un'ipotetica formula medievale o ricetta segreta.\n\n" +
        "### 🔬 LE MIE DEDUZIONI (COSA DEDUCO)\n" +
        "Spiega in modo esplicito 'cosa si deduce' da questa decifrazione e dall'analisi visuale dell'elemento. Formula deduzioni concrete sulle proprietà della pianta (es. sonnifero, antidoto, anestetico, veleno), sulla valenza magico-alchemica o sulla natura asemica del manoscritto, portando risposte chiare alle ipotesi aperte.";

      if (language === "en") {
        systemInstruction = "You are an expert paleographer, linguist, and Voynich Manuscript cryptanalyst. " +
          "Your task is to analyze details of the pages and texts. Respond in English with scholarly rigour and engaging tone. " +
          "IMPORTANT: After every botanical, cryptographic, or general paleographic analysis, YOU MUST ALWAYS append two distinct, beautifully formatted Markdown sections:\n\n" +
          "### 🔮 HYPOTHETICAL DECIPHERMENT & TRANSLATION\n" +
          "Decipher the Voynich EVA text nearby or provided. Design a concrete translation under historical models (Abbreviated Latin, Hebrew, Proto-Turkish) into elegant readable modern language, showing what secret recipe or formula is hidden.\n\n" +
          "### 🔬 MY DEDUCTIONS (WHAT I DEDUCE)\n" +
          "State clearly what you deduce from this decipherment and the visual element. Provide sharp, conclusive deductions about the plant's medicinal qualities (e.g. sedative, antidote, toxics), alchemical meanings, or script authenticity.";
      }

      let prompt = "";
      if (elementId === "flowers") {
        prompt = `Analizza il bocciolo o infiorescenza in cima allo stelo del foglio f34v del Manoscritto Voynich. Che cosa potrebbe essere dal punto di vista botanico? È stato accostato al papavero da oppio, al melograno, o ad altri boccioli? Fornisci ipotesi storiche. Abbina la tua analisi a una decifrazione ipotetica del testo soprastante della pagina e dimmi cosa deduci su questo fiore medicinale.`;
      } else if (elementId === "green_leaves") {
        prompt = `Analizza le foglie verdi del foglio f34v del Voynich. Nota la disposizione alternata tra rami verdi e rami ocra/gialli. Cosa rappresenta graficamente e a livello botanico questa colorazione bicolore? Proponi una decifrazione ipotetica delle diciture vicine alle foglie verdi e spiega cosa deduci da esse.`;
      } else if (elementId === "yellow_leaves") {
        prompt = `Analizza le foglie color ocra/giallo appassite o secche del foglio f34v. Perché l'autore ha scelto di colorare accuratamente solo alcune foglie di giallo? Qual è l'effetto medicinale o l'influsso stagionale associato a queste foglie secche? Decifra ipoteticamente e spiega cosa deduci.`;
      } else if (elementId === "roots") {
        prompt = `Analizza la radice bulbosa rigonfia ("rhizome") e il terreno lavorato (le collinette tratteggiate) ai piedi della pianta nel foglio f34v del Voynich. Qual è lo stile tipico delle radici nel Voynich? Ha somiglianze con altri erbari del XV secolo (es. Erbario Alchemico)? Dedica una decifrazione al testo inferiore e fammi capire cosa deduci sul rizoma.`;
      } else if (elementId === "paragraph_top_left" || elementId === "paragraph_top_right" || elementId === "paragraph_bottom_left" || elementId === "paragraph_bottom_right") {
        prompt = `Analizza questo blocco di testo trascritto nel foglio f34v del Voynich. Parlaci del sistema di scrittura EVA (European Voynich Alphabet), delle peculiarità di questo blocco di testo, e delle frequenze delle parole (es. la radice '8am'/ 'daiin', i gallows 'p', 'f', 't', 'k'). Esegui una decifrazione e traduzione ipotetica approfondita riga per riga di questo blocco e illustra dettagliatamente cosa deduci sul suo significato.`;
      } else {
        prompt = customQuestion || `Analizza questo documento o manoscritto medievale inserito. Identificane lo stile grafico, la scrittura, gli ornamenti biologici, astronomici o alchemici se presenti. Fornisci SEMPRE una decifrazione ipotetica di una porzione di testo visibile e descrivi esplicitamente cosa deduci da essa.`;
      }

      const contents: any[] = [];
      if (imagesBase64 && Array.isArray(imagesBase64)) {
        imagesBase64.forEach((imgBase64) => {
          const matches = imgBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            contents.push({
              inlineData: {
                mimeType: matches[1],
                data: matches[2]
              }
            });
          }
        });
      } else if (imageBase64) {
        // Parse base64
        const matches = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          contents.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2]
            }
          });
        }
      }

      contents.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.2,
        }
      });

      res.json({
        success: true,
        text: response.text
      });

    } catch (error: any) {
      console.error("Gemini active analysis error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Errore sconosciuto durante l'analisi con Gemini."
      });
    }
  });

  // API Endpoint: Automated Cypher solver attempts
  app.post("/api/decrypt-auto", async (req, res) => {
    try {
      const { textToDecrypt, cipherMethod, customMapping, language = "it" } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: true,
          mapping: customMapping || { "o": "e", "d": "r", "k": "t", "y": "a" },
          text: `[Modalità Demo - Chiave API mancante]\n\nAnalisi del testo Voynich: "${textToDecrypt}" tramite metodo "${cipherMethod}".\n\nNello scenario reale, Gemini analizzerà la struttura fonotattica ed eseguirà abbinamenti basati sulla teoria selezionata (es. Romano-Celtico, Abbreviazioni Latine, Turco-Persiano o Asemico). Inserisci la tua chiave GEMINI_API_KEY nei Secrets del progetto per abilitare l'intelligenza artificiale.`
        });
      }

      const prompt = `Sei un computer crittanalitico dedicato allo studio del Manoscritto Voynich.
Ti viene fornito il seguente testo Voynich in caratteri EVA: "${textToDecrypt}"
L'utente ha selezionato l'approccio interpretativo storico: "${cipherMethod}"

Nel formato JSON specificato, produci un'analisi crittanalitica formale del testo in lingua ${language === "it" ? "italiana" : "inglese"}.
Devi includere:
1. Una potenziale chiave di sostituzione monovocalica/consonantica sensata basata sull'approccio interpretativo (es. se latino, mappare certi grafemi a vocali latine; se turco medievale, suoni fonetici turchi).
2. Una traduzione ipotetica parola per parola e poi contestualizzata.
3. Un commento di plausibilità statistica (es. entropia del testo Voynich che è insolitamente bassa rispetto al latino, assunzione di ripetizioni, ecc.).

Importante: Rispondi ESCLUSIVAMENTE con un oggetto JSON valido contenente queste chiavi:
- "suggestedMapping": un oggetto chiave-valore di coppie di sostituzione (es. {"o": "e", ...})
- "hypotheticalTranslation": stringa con la traduzione ipotetica contestualizzata.
- "wordByWordAnalysis": array di oggetti con { voynichWord: string, translation: string, explanation: string }
- "statisticalCommentary": stringa descrivente le anomalie linguistiche della decifrazione selezionata.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        }
      });

      const parsedResult = JSON.parse(response.text || "{}");
      res.json({
        success: true,
        ...parsedResult
      });

    } catch (error: any) {
      console.error("Decryption API error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Errore nel motore di decifrazione."
      });
    }
  });

  // Web Server routing for Static Assets & Development integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Voynich Decipherer server running on port ${PORT}`);
  });
}

startServer();
