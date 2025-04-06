import React, { useEffect, useRef, useState } from "react";
import {
  SpeechTranslationConfig,
  TranslationRecognizer,
  AudioConfig,
  ResultReason,
} from "microsoft-cognitiveservices-speech-sdk";

const SpeechTranslator = () => {
  const [inputLang, setInputLang] = useState("en-US");
  const [outputLang, setOutputLang] = useState("gu");
  const [transcription, setTranscription] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const recognizerRef = useRef(null);

  const subscriptionKey = process.env.REACT_APP_subscriptionKey;
  const serviceRegion = process.env.REACT_APP_serviceRegion; // e.g., "eastus"

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
    { code: "hi", name: "Hindi" },
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
      setTranscription((prev) => `${prev}\n[Interim]: ${translation}`);
    };

    recognizer.recognized = (s, e) => {
      if (e.result.reason === ResultReason.TranslatedSpeech) {
        const translation = e.result.translations.get(outputLang);
        setTranscription((prev) => `${prev}\n${translation}`);
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
    initializeRecognizer();

    recognizerRef.current?.startContinuousRecognitionAsync();
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
      document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight
    } catch (error) {

    }
  }, [transcription])



  useEffect(() => {
    return () => {
      stopTranslation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Azure Speech Translator</h2>

      <div style={{ marginBottom: "10px" }}>
        <label>Input Language: </label>
        <select
          value={inputLang}
          onChange={(e) => setInputLang(e.target.value)}
          disabled={isTranslating}
        >
          <option key={''} value={''}>-- input language --</option>
          {languageOptions.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}

        </select>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Output Language: </label>
        <select
          value={outputLang}
          onChange={(e) => setOutputLang(e.target.value)}
          disabled={isTranslating}
        >
          <option key={''} value={''}>-- output language --</option>

          {languageOptions.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <button onClick={startTranslation} disabled={isTranslating}>
          Start Translation
        </button>
        <button onClick={stopTranslation} disabled={!isTranslating} style={{ marginLeft: "10px" }}>
          Stop Translation
        </button>
      </div>

      <textarea
        id='chat'
        value={transcription}
        readOnly
        style={{ width: "100%", height: "200px", resize: "none" }}
      />

    </div>
  );
};

export default SpeechTranslator;
