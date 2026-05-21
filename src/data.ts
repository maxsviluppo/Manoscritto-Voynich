import { Hotspot, Theory, LetterMap } from "./types";

export const FO_F34V_HOTSPOTS: Hotspot[] = [
  {
    id: "flowers",
    name: "Inflorescence (Top Bud)",
    nameIt: "Infiorescenza (Bocciolo Apicale)",
    x: 48,
    y: 11,
    width: 14,
    height: 10,
    description: "The crown of the plant has a dark, shaded semi-spherical capsule. Historically identified with poppy pods, pomegranate seeds, or customized alchemical capsules.",
    descriptionIt: "La cima presenta una capsula semisferica scura e sfumata. Storicamente accostata al papavero da oppio, al melograno, o ad capsule protettive racchiuse ideate dagli alchimisti del XV secolo.",
    evaTranscription: ""
  },
  {
    id: "green_leaves",
    name: "Fresh Green Foliage",
    nameIt: "Fogliame Verde Smeraldo",
    x: 23,
    y: 28,
    width: 25,
    height: 18,
    description: "Symmetric leaves on lateral branches coated with a deep green pigment (likely copper verdigris). Some leaves remain uncolored draft templates.",
    descriptionIt: "Foglie simmetriche sui rami laterali colorate con un pigmento verde profondo (verderame). La disposizione si alterna ritmicamente con rami aventi foglie ocra.",
    evaTranscription: ""
  },
  {
    id: "yellow_leaves",
    name: "Deciduous Yellow Foliage",
    nameIt: "Fogliame Giallo Autunnale",
    x: 52,
    y: 20,
    width: 23,
    height: 18,
    description: "Opposite leaves colored of light ochre. This bicoloration might express a dry state, biological phases, or alchemical hot/cold polarities.",
    descriptionIt: "Foglie opposte tinte di ocra chiaro. Questa bicolorazione potrebbe indicare uno stato essiccato del vegetale, fasi biologiche o polarità alchemiche caldo/freddo.",
    evaTranscription: ""
  },
  {
    id: "roots",
    name: "Stylized Rhizome & Soil",
    nameIt: "Rizoma e Terreno Tratteggiato",
    x: 18,
    y: 81,
    width: 63,
    height: 15,
    description: "A solid, scaly root horizontal block resembling a scaly bulb or tuber, standing over stylized hills drawn with wavy hatching strokes.",
    descriptionIt: "Uscendo da un bulbo squadrato, la radice possiede un fusto orizzontale scaglioso che posa su basse collinette tratteggiate ondulate tipiche dell'autore.",
    evaTranscription: ""
  },
  {
    id: "paragraph_top_left",
    name: "Paragraph A (Top Left)",
    nameIt: "Paragrafo A (In Alto a Sinistra)",
    x: 16,
    y: 50,
    width: 25,
    height: 11,
    description: "Introductory paragraph surrounding the left side of the stem, featuring common Voynich beginnings and repetitive syllable grids.",
    descriptionIt: "Paragrafo di apertura a sinistra del fusto. Contiene termini corti con la classica frequenza ripetitiva tipica dei paragrafi erboristici Voynich.",
    evaTranscription: "tfccy dready or\no tteeo dyedy ot oorg\n8o ttey otteotey oty\n8or dtoltco 8an 8an",
    translationIt: "Raccogli le foglie bicolore mature e falle bollire nel vaso all'alba. Posa tre gocce sul ciglio dell'occhio malato per riposare l'anima tormentata.",
    translationEn: "Gather mature bi-colored leaves and boil them in the morning vessel. Place three drops upon the ailing eye to soothe the restless mind."
  },
  {
    id: "paragraph_top_right",
    name: "Paragraph B (Top Right)",
    nameIt: "Paragrafo B (In Alto a Destra)",
    x: 58,
    y: 52,
    width: 35,
    height: 10,
    description: "Paragraph on the right side of the main stem, featuring double-loop cursive-like glyphs ('gallows').",
    descriptionIt: "Paragrafo a destra dello stelo. Fornisce parole lunghe e ricche di lettere 'gallows' a doppia asola (caratteri t e k).",
    evaTranscription: "ot tteey oror dtan\n8oro dttoda ottoda8 cro8y\n8 ttooddy ettey totteorody 8an\n2ooudy eeolto8a",
    translationIt: "Unisci gli steli secchi del fiore d'oro con l'acqua sorgiva del monte sacro. Mescola lentamente finché la pozione non rilascia una fitta nebbia argentea.",
    translationEn: "Mix the withered golden stems with spring water from the high mount. Stir slowly until the liquor emits a thick, silvery mist."
  },
  {
    id: "paragraph_bottom_left",
    name: "Paragraph C (Bottom Left)",
    nameIt: "Paragrafo C (In Basso a Sinistra)",
    x: 16,
    y: 62,
    width: 32,
    height: 16,
    description: "Large paragraph on lower-left containing complex ligature clusters. Notice the highly nested letters resembling 15th-century abbreviations.",
    descriptionIt: "Grande blocco in basso a sinistra contenente sequenze di lettere concatenate ('ch', 'sh', 'ol'). Lo stile richiama molto le abbreviazioni notarili del XV secolo.",
    evaTranscription: "totla8 dror 8and dteoa8\ncrotly cror dteor 8tor ottas\nte or tteee occor 8or tteey\nottorteor llot tltey cror lta\ndor ottor cror 8ody lta 8an\ntlan ctotloccy 8as croda",
    translationIt: "L'autunno ritira la linfa dai rami inferiori per raccoglierla nel fusto grasso. Cuoci il rizoma scaglioso sul fuoco lento fino a ridurlo in pasta lenitiva per le infezioni della pelle.",
    translationEn: "Autumn draws the sap down from the lower branches into the swollen stalk. Roast the scaly rhizome over a slow flame for a soothing ointment against dermal plagues."
  },
  {
    id: "paragraph_bottom_right",
    name: "Paragraph D (Bottom Right)",
    nameIt: "Paragrafo D (In Basso a Destra)",
    x: 53,
    y: 64,
    width: 40,
    height: 16,
    description: "The concluding block on the right, ending with the standard 'tor cro8ad' formula, found in many Voynich herbal pages.",
    descriptionIt: "Blocco conclusivo sulla destra. Termina con la tipica formula ripetitiva 'tor cro8ad', ricorrente nelle chiusure di decine di capitoli botanici.",
    evaTranscription: "8an crty tlo8a olland crofdy\n8o rccca crodo qor cry ttey\nottos 8or 8oro qttos 8or cro8y\ncror etteor crody ctor 8and\ncroy sotol ottor 8ad croda\n2crody tor cro8ad",
    translationIt: "Conserva la miscela al riparo dal sole d'inverno. Somministra due cucchiai per lenire la tosse cupa ed indurre un sonno ristoratore privo di incubi molesti. Sigilla con cera vergine.",
    translationEn: "Store this mixture safe from the harsh winter sun. Administer two spoonfuls to quiet the heavy cough and induce a blessed sleep free of bad dreams. Seal with virgin wax."
  }
];

export const DECRYPTION_THEORIES: Theory[] = [
  {
    id: "abbreviated_latin",
    name: "Abbreviated Latin Shorthand",
    nameIt: "Latino Medievale Abbreviato (Sgografia)",
    proponent: "Dr. Albert C. Beck, Edith Sherwood",
    description: "The text is medieval Latin where most vowels and terminal sounds are replaced by astrological, medical, or standard scribal abbreviations (Sigla). Perfect fit for 15th-century Northern Italian scripts.",
    descriptionIt: "Il testo è latino medievale ultra-abbreviato, dove gran parte delle vocali e delle desinenze è soppressa o sostituita da sigle notarili medievali e glifi astronomici. Molto diffuso negli uffici amministrativi del Nord Italia nel 1400.",
    concept: "EVA Glyphs map to medieval Latin contractions: e.g. 8 (d), a (a), i (i), o (u), y (us). Words like 'daiin' are read as 'dominus' or 'dei'.",
    conceptIt: "I caratteri EVA mappano contrazioni latine: es. 8 (d), a (a), e (e), o (u), y (us). Termini ricorrenti come 'daiin' verrebbero letti come abbreviazioni di 'dominum' o 'daya'.",
    plausibility: 65,
    exampleSubstitution: {
      "o": "u",
      "e": "e",
      "a": "a",
      "8": "d",
      "y": "s",
      "t": "t",
      "r": "r",
      "c": "c",
      "l": "l",
      "n": "m",
      "h": "h",
      "d": "i"
    }
  },
  {
    id: "anatolian_turkish",
    name: "Proto-Turkish Phonetic Cipher",
    nameIt: "Codificazione Turco-Anatolica Antica",
    proponent: "Ahmet Ardıç (2018)",
    description: "Argues that Voynich symbols form a phonetic transcription of Old Anatolian Turkish dialect written without vocalic fillers and based on rhythmic syllabary.",
    descriptionIt: "Ipotizza che il testo sia un dialetto del Turco Anatolico Antico scritto foneticamente. La ritmicità estrema è legata alla presenza insolita del dialetto lirico e poetico del periodo oghuz.",
    concept: "Words are read phonetically according to a custom agglutinative mapping, where post-fixes determine plant properties like 'soothing' or 'toxic'.",
    conceptIt: "Le parole sono lette foneticamente e decodificate secondo suoni oghuz. I suffissi ripetitivi definiscono proprietà mediche specifiche del vegetale come astringente, amaro o digestivo.",
    plausibility: 45,
    exampleSubstitution: {
      "o": "a",
      "e": "e",
      "8": "b",
      "y": "r",
      "t": "t",
      "r": "l",
      "c": "s",
      "l": "n",
      "n": "m",
      "d": "k",
      "a": "u"
    }
  },
  {
    id: "sephardic_hebrew",
    name: "Encrypted Sephardic Hebrew",
    nameIt: "Ebraico Sefardita Cifrato",
    proponent: "Stephen Skinner, Gerard Cheshire (partially)",
    description: "A substitution cipher representing early Judeo-Spanish, Sephardic Hebrew, or Ladino dialect containing medicinal recipes written to preserve kabbalistic secrecy.",
    descriptionIt: "Una cifratura a sostituzione che nasconde l'Ebraico Sefardita medievale o il Ladino giudaico-spagnolo. Veniva utilizzato dagli speziali ebrei per tramandare formule mediche alchemiche preservandone la segretezza.",
    concept: "Voynich letters are consonant skeletons of Hebrew, readable from right to left or rearranged under Kabbalistic anagram grids (Gematria).",
    conceptIt: "Le lettere Voynich fungono da scheletro consonantico ebraico (abjad), da leggersi con vocalizzazione facoltativa o anagrammi cabalistici (Gematria).",
    plausibility: 55,
    exampleSubstitution: {
      "o": "aleph",
      "e": "he",
      "8": "daleth",
      "y": "yod",
      "t": "tav",
      "r": "resh",
      "c": "tsadi",
      "l": "lamed",
      "n": "nun",
      "d": "kaph",
      "a": "ayin"
    }
  },
  {
    id: "hoax_asemic",
    name: "Medieval Counterfeit / Asemic Art",
    nameIt: "Falso d'Autore / Scrittura Asemica",
    proponent: "Gordon Rugg, Herb Rydahl",
    description: "Suggests the manuscript possesses NO semantic meaning. It is an asexual or asemic masterpiece made using a Cardan Grille to generate random word structures, sold to Emperor Rudolf II as a premium mystic artifact.",
    descriptionIt: "Sostiene che il testo non contenga ALCUN messaggio reale. È una mirabile scrittura asemica, un falso capolavoro costruito tramite griglie di Cardano da falsari poliglotti (come Edward Kelley e John Dee) per spillare monete d'oro all'Imperatore Rodolfo II.",
    concept: "Substitution is meaningless as the letters were systematically combined to simulate a real syntax using pseudo-linguistic rules (low entropy).",
    conceptIt: "Ogni decodifica è illusoria: l'ordinamento matematico è un effetto collaterale di una stringa autogenerata tramite schemi cartacei prefissati.",
    plausibility: 80,
    exampleSubstitution: {}
  }
];

export const EVA_ALPHABET: LetterMap[] = [
  { eva: "o", char: "o", name: "El (o)", ipa: "o", approxSound: "Italian 'o' or Greek omicron" },
  { eva: "a", char: "a", name: "Al (a)", ipa: "a", approxSound: "Open front unrounded 'a'" },
  { eva: "e", char: "e", name: "Ee (e)", ipa: "e", approxSound: "Short vowel sound 'e'" },
  { eva: "y", char: "y", name: "Yod (y)", ipa: "i/j", approxSound: "Consonantal 'y' or final diphtong" },
  { eva: "t", char: "t", name: "Tall Gallows-T", ipa: "t", approxSound: "Crisp dental plosive 't' with loop" },
  { eva: "k", char: "k", name: "Tall Gallows-K", ipa: "k", approxSound: "Gallows 'k' with loop" },
  { eva: "p", char: "p", name: "Gallows-P", ipa: "p", approxSound: "Symmetric gallows 'p'" },
  { eva: "f", char: "f", name: "Gallows-F", ipa: "f", approxSound: "Symmetric gallows 'f'" },
  { eva: "8", char: "8", name: "Dai (8)", ipa: "d", approxSound: "Dental plosive or 'd' abbreviation" },
  { eva: "r", char: "r", name: "Ror (r)", ipa: "r", approxSound: "Trilled or flapped liquid 'r'" },
  { eva: "c", char: "c", name: "Chor (c)", ipa: "c", approxSound: "Sibilant glide or half-abbreviation" },
  { eva: "l", char: "l", name: "Lil (l)", ipa: "l", approxSound: "Lateral liquid 'l'" },
  { eva: "n", char: "n", name: "Nin (n)", ipa: "n", approxSound: "Nasal dental consonant 'n'" },
  { eva: "d", char: "d", name: "Du (d)", ipa: "d/ð", approxSound: "Glottal modifier or phonetic friction" }
];
