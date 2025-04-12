import React, { useEffect, useRef, useState } from "react";
import {
  SpeechTranslationConfig,
  TranslationRecognizer,
  AudioConfig,
  ResultReason,
  SpeechConfig,
  SpeechSynthesizer,
  PropertyId
} from "microsoft-cognitiveservices-speech-sdk";

const SpeechTranslator = () => {
  const [inputLang, setInputLang] = useState("es-ES");
  const [outputLang, setOutputLang] = useState("hi");
  const [transcription, setTranscription] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [enableTTS, setEnableTTS] = useState(true);
  const [synthesisReady, setSynthesisReady] = useState(false);

  const recognizerRef = useRef(null);
  const synthesizersRef = useRef({});
  const speechConfigRef = useRef(null);
  const speechQueueRef = useRef([]);
  const isSpeakingRef = useRef(false);

  // const subscriptionKey = "DDTWptSXJ4jEwuXk74JiwzwuD0U6njbrNdB8cEQvdhUndeKTxY0zJQQJ99BDACGhslBXJ3w3AAAYACOGqo0X";//process.env.REACT_APP_subscriptionKey;
  // const serviceRegion = "centralindia";//process.env.REACT_APP_serviceRegion;

  const subscriptionKey = process.env.REACT_APP_subscriptionKey;
  const serviceRegion = process.env.REACT_APP_serviceRegion;


  // Map of language codes to voice names for TTS
  const voiceMap = {
    "en-US": "en-US-JennyNeural",
    "es": "es-ES-ElviraNeural",
    "fr": "fr-FR-DeniseNeural",
    "de": "de-DE-KatjaNeural",
    "it": "it-IT-ElsaNeural",
    "pt": "pt-BR-FranciscaNeural",
    "zh-Hans": "zh-CN-XiaoxiaoNeural",
    "ja": "ja-JP-NanamiNeural",
    "ko": "ko-KR-SunHiNeural",
    "ru": "ru-RU-SvetlanaNeural",
    "ar": "ar-SA-ZariyahNeural",
    "hi": "hi-IN-SwaraNeural",
    "gu": "gu-IN-DhwaniNeural",
    // Add more language-to-voice mappings as needed
  };

  const languageOptions = [
    { code: "af", name: "Afrikaans" },
    { code: "sq", name: "Albanian" },
    { code: "am", name: "Amharic" },
    { code: "ar", name: "Arabic" },
    { code: "hy", name: "Armenian" },
    { code: "as", name: "Assamese" },
    { code: "az", name: "Azerbaijani" },
    { code: "bn", name: "Bangla" },
    { code: "bs", name: "Bosnian (Latin)" },
    { code: "bg", name: "Bulgarian" },
    { code: "yue", name: "Cantonese (Traditional)" },
    { code: "ca", name: "Catalan" },
    { code: "lzh", name: "Chinese (Literary)" },
    { code: "zh-Hans", name: "Chinese Simplified" },
    { code: "zh-Hant", name: "Chinese Traditional" },
    { code: "hr", name: "Croatian" },
    { code: "cs", name: "Czech" },
    { code: "da", name: "Danish" },
    { code: "prs", name: "Dari" },
    { code: "nl", name: "Dutch" },
    { code: "en-US", name: "English" },
    { code: "et", name: "Estonian" },
    { code: "fj", name: "Fijian" },
    { code: "fil", name: "Filipino" },
    { code: "fi", name: "Finnish" },
    { code: "fr", name: "French" },
    { code: "fr-ca", name: "French (Canada)" },
    { code: "de", name: "German" },
    { code: "el", name: "Greek" },
    { code: "gu", name: "Gujarati" },
    { code: "ht", name: "Haitian Creole" },
    { code: "he", name: "Hebrew" },
    { code: "hi-IN", name: "Hindi" },
    { code: "mww", name: "Hmong Daw" },
    { code: "hu", name: "Hungarian" },
    { code: "is", name: "Icelandic" },
    { code: "id", name: "Indonesian" },
    { code: "iu", name: "Inuktitut" },
    { code: "ga", name: "Irish" },
    { code: "it", name: "Italian" },
    { code: "ja", name: "Japanese" },
    { code: "kn", name: "Kannada" },
    { code: "kk", name: "Kazakh" },
    { code: "km", name: "Khmer" },
    { code: "tlh-Latn", name: "Klingon" },
    { code: "tlh-Piqd", name: "Klingon (plqaD)" },
    { code: "ko", name: "Korean" },
    { code: "ku", name: "Kurdish (Central)" },
    { code: "kmr", name: "Kurdish (Northern)" },
    { code: "lo", name: "Lao" },
    { code: "lv", name: "Latvian" },
    { code: "lt", name: "Lithuanian" },
    { code: "mg", name: "Malagasy" },
    { code: "ms", name: "Malay" },
    { code: "ml", name: "Malayalam" },
    { code: "mt", name: "Maltese" },
    { code: "mi", name: "Maori" },
    { code: "mr", name: "Marathi" },
    { code: "my", name: "Myanmar" },
    { code: "ne", name: "Nepali" },
    { code: "nb", name: "Norwegian" },
    { code: "or", name: "Odia" },
    { code: "ps", name: "Pashto" },
    { code: "fa", name: "Persian" },
    { code: "pl", name: "Polish" },
    { code: "pt", name: "Portuguese (Brazil)" },
    { code: "pt-pt", name: "Portuguese (Portugal)" },
    { code: "pa", name: "Punjabi" },
    { code: "otq", name: "Queretaro Otomi" },
    { code: "ro", name: "Romanian" },
    { code: "ru", name: "Russian" },
    { code: "sm", name: "Samoan" },
    { code: "sr-Cyrl", name: "Serbian (Cyrillic)" },
    { code: "sr-Latn", name: "Serbian (Latin)" },
    { code: "sk", name: "Slovak" },
    { code: "sl", name: "Slovenian" },
    { code: "es", name: "Spanish" },
    { code: "sw", name: "Swahili" },
    { code: "sv", name: "Swedish" },
    { code: "ty", name: "Tahitian" },
    { code: "ta", name: "Tamil" },
    { code: "te", name: "Telugu" },
    { code: "th", name: "Thai" },
    { code: "ti", name: "Tigrinya" },
    { code: "to", name: "Tongan" },
    { code: "tr", name: "Turkish" },
    { code: "uk", name: "Ukrainian" },
    { code: "ur", name: "Urdu" },
    { code: "vi", name: "Vietnamese" },
    { code: "cy", name: "Welsh" },
    { code: "yua", name: "Yucatec Maya" },
  ];

  // Initialize speech config once
  useEffect(() => {
    if (!subscriptionKey || !serviceRegion) return;

    speechConfigRef.current = SpeechConfig.fromSubscription(
      subscriptionKey,
      serviceRegion
    );

    // Pre-initialize the synthesizer for the default output language
    initializeSynthesizer(outputLang).then(() => {
      setSynthesisReady(true);
    });

    return () => {
      // Clean up synthesizers when component unmounts
      cleanupSynthesizers();
    };
  }, [subscriptionKey, serviceRegion]);

  // Initialize synthesizer when output language changes
  useEffect(() => {
    if (!isTranslating && speechConfigRef.current) {
      initializeSynthesizer(outputLang).then(() => {
        setSynthesisReady(true);
      });
    }
  }, [outputLang, isTranslating]);

  // Process speech queue
  useEffect(() => {
    processSpeechQueue();
  }, [synthesisReady]);

  // Initialize synthesizer for a specific language and cache it
  const initializeSynthesizer = async (lang) => {
    if (synthesizersRef.current[lang]) return;

    try {
      const speechConfig = speechConfigRef.current.clone();


      // Configure silence timeout (in milliseconds)
      speechConfig.setProperty("Speech.SegmentationSilenceTimeoutMs", "1000");

      // Configure initial silence timeout
      speechConfig.setProperty(PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, "5000");

      // Configure endpoint detection settings
      speechConfig.setProperty(PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs, "1000");



      // Set the voice name based on the language or use a default
      const voiceName = voiceMap[lang] || `${lang}-Neural`;
      speechConfig.speechSynthesisVoiceName = voiceName;

      // Create the synthesizer
      const synthesizer = new SpeechSynthesizer(speechConfig);

      // Store it for reuse
      synthesizersRef.current[lang] = synthesizer;

      // Pre-synthesize a blank space to warm up the connection
      await new Promise((resolve, reject) => {
        synthesizer.speakTextAsync(
          " ",  // Just a space to warm up the connection
          result => {
            resolve(result);
          },
          error => {
            console.warn("Warm-up synthesis failed:", error);
            resolve(null); // Resolve anyway to continue
          }
        );
      });

      return synthesizer;
    } catch (error) {
      console.error(`Failed to initialize speech synthesis for ${lang}:`, error);
      return null;
    }
  };

  // Add text to speech queue
  const queueSpeechSynthesis = (text, lang) => {
    speechQueueRef.current.push({ text, lang });
    processSpeechQueue();
  };

  // Process the speech queue
  const processSpeechQueue = async () => {
    if (isSpeakingRef.current || speechQueueRef.current.length === 0 || !synthesisReady) {
      return;
    }

    isSpeakingRef.current = true;
    const { text, lang } = speechQueueRef.current.shift();

    try {
      // Get or create synthesizer
      let synthesizer = synthesizersRef.current[lang];
      if (!synthesizer) {
        synthesizer = await initializeSynthesizer(lang);
        if (!synthesizer) throw new Error("Could not initialize synthesizer");
      }

      // Speak the text
      await new Promise((resolve, reject) => {
        synthesizer.speakTextAsync(
          text,
          result => {
            resolve(result);
          },
          error => {
            console.error(`Error synthesizing speech: ${error}`);
            reject(error);
          }
        );
      });
    } catch (error) {
      console.error("Speech synthesis failed:", error);
    } finally {
      isSpeakingRef.current = false;
      // Process next item in queue
      setTimeout(processSpeechQueue, 50);
    }
  };

  // Function to speak the translated text
  const speakTranslation = (text, lang) => {
    if (!enableTTS || !text || text.trim().length === 0) return;
    queueSpeechSynthesis(text, lang);
  };

  // Clean up synthesizers
  const cleanupSynthesizers = () => {
    // Close all synthesizers
    Object.values(synthesizersRef.current).forEach(synthesizer => {
      try {
        synthesizer.close();
      } catch (e) {
        console.error("Error closing synthesizer:", e);
      }
    });
    synthesizersRef.current = {};
    speechQueueRef.current = [];
    isSpeakingRef.current = false;
  };

  const initializeRecognizer = () => {
    const translationConfig = SpeechTranslationConfig.fromSubscription(
      subscriptionKey,
      serviceRegion
    );

    translationConfig.speechRecognitionLanguage = inputLang;
    translationConfig.addTargetLanguage(outputLang);

    const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new TranslationRecognizer(translationConfig, audioConfig);

    recognizerRef.current = recognizer;

    recognizer.recognizing = (s, e) => {

      const translation = e.result.translations.get(outputLang);
      // const translation = e.result.text;
      console.log(e.result.text, translation)
      setTranscription((prev) => `${prev}\n[Interim]: ${translation}`);
    };

    recognizer.recognized = (s, e) => {
      if (e.result.reason === ResultReason.TranslatedSpeech) {
        const translation = e.result.translations.get(outputLang);
        setTranscription((prev) => `${prev}\n${translation}`);

        // Speak the translated text
        if (translation && translation.trim().length > 0) {
          speakTranslation(translation, outputLang);
        }
      } else if (e.result.reason === ResultReason.NoMatch) {
        setTranscription((prev) => `${prev}\n[No match]`);
      }
    };

    recognizer.canceled = (s, e) => {
      console.error("Canceled:", e.errorDetails);
      if (recognizerRef.current) stopTranslation();
    };

    recognizer.sessionStopped = (s, e) => {
      console.log("Session stopped.");
      if (recognizerRef.current) stopTranslation();
    };
  };

  const startTranslation = () => {
    setTranscription("");
    setIsTranslating(true);

    // Make sure we have a synthesizer ready for the current language
    initializeSynthesizer(outputLang).then(() => {
      setSynthesisReady(true);
      initializeRecognizer();
      recognizerRef.current?.startContinuousRecognitionAsync();
    });
  };

  const stopTranslation = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stopContinuousRecognitionAsync(
        () => {
          recognizerRef.current?.close();
          recognizerRef.current = null;
          setIsTranslating(false);
        },
        (err) => {
          console.error("Stop failed:", err);
          recognizerRef.current?.close();
          recognizerRef.current = null;
          setIsTranslating(false);
        }
      );
    }
  };

  useEffect(() => {
    try {
      document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
    } catch (error) {
      // Ignore scroll errors
    }
  }, [transcription]);

  return (
    <div className="p-6 font-sans max-w-lg mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Azure Speech Translator</h2>

      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Input Language: </label>
        <select
          value={inputLang}
          onChange={(e) => setInputLang(e.target.value)}
          disabled={isTranslating}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option value="">-- input language --</option>
          {languageOptions.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Output Language: </label>
        <select
          value={outputLang}
          onChange={(e) => setOutputLang(e.target.value)}
          disabled={isTranslating}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option value="">-- output language --</option>
          {languageOptions.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="flex items-center text-gray-700">
          <input
            type="checkbox"
            checked={enableTTS}
            onChange={(e) => setEnableTTS(e.target.checked)}
            disabled={isTranslating}
            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          Enable Text-to-Speech
        </label>
      </div>

      <div className="mb-4 flex space-x-3">
        <button
          onClick={startTranslation}
          disabled={isTranslating || !synthesisReady}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {synthesisReady ? "Start Translation" : "Initializing..."}
        </button>
        <button
          onClick={stopTranslation}
          disabled={!isTranslating}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Stop Translation
        </button>
      </div>

      <textarea
        id="chat"
        value={transcription}
        readOnly
        className="w-full h-48 p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
      />

      {!synthesisReady && (
        <div className="mt-3 text-gray-500 text-sm italic">
          Initializing speech synthesis...
        </div>
      )}
    </div>
  );
};

export default SpeechTranslator;