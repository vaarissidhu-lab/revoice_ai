import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Mic, Square, Play, Pause, Volume2, ExternalLink, Hand, Cpu } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const API_BASE = "http://localhost:8787";

const Demo = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl font-bold text-foreground mb-4">
            ReVoice Demo
          </h1>
          <p className="text-lg text-muted-foreground">
            Try both classic text-to-speech and our new voice cloning technology
          </p>
        </div>

        <Tabs defaultValue="classic" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="classic" className="text-base">
              Classic TTS
            </TabsTrigger>
            <TabsTrigger value="clone" className="text-base">
              Voice Cloning
            </TabsTrigger>
            <TabsTrigger value="sign" className="text-base">
              Sign Language
            </TabsTrigger>
            <TabsTrigger value="hardware" className="text-base">
              Hardware
            </TabsTrigger>
          </TabsList>

          <TabsContent value="classic">
            <ClassicTTSDemo />
          </TabsContent>

          <TabsContent value="clone">
            <VoiceCloneRedirect />
          </TabsContent>

          <TabsContent value="sign">
            <SignLanguageRedirect />
          </TabsContent>

          <TabsContent value="hardware">
            <HardwareRedirect />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const ClassicTTSDemo = () => {
  const [selectedLang, setSelectedLang] = useState("en");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [text, setText] = useState("Thank you so much.");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const synth = window.speechSynthesis;

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);
      
      // Auto-select first voice for selected language
      const langVoices = availableVoices.filter(v => 
        v.lang.toLowerCase().startsWith(selectedLang)
      );
      if (langVoices.length > 0) {
        setSelectedVoice(langVoices[0].name);
      } else if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }
  }, [selectedLang, synth]);

  const speak = () => {
    if (!text.trim()) {
      toast({
        title: "No text to speak",
        description: "Please enter some text first.",
        variant: "destructive"
      });
      return;
    }

    synth.cancel(); // Stop any current speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.name === selectedVoice);
    
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.lang = voice?.lang || (selectedLang === 'hi' ? 'hi-IN' : 'en-US');
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast({
        title: "Speech error",
        description: "Failed to generate speech. Please try again.",
        variant: "destructive"
      });
    };
    
    synth.speak(utterance);
  };

  const stopSpeaking = () => {
    synth.cancel();
    setIsSpeaking(false);
  };

  const samplePhrases = [
    "Thank you so much.",
    "I'm feeling fine today.",
    "Could you please help me?",
    "I need assistance.",
    "How are you doing?",
    "I understand."
  ];

  const filteredVoices = voices.filter(v => 
    v.lang.toLowerCase().startsWith(selectedLang)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Classic Text-to-Speech
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="en">English</option>
              
            </select>
          </div>

          <div>
            <Label htmlFor="voice">Voice</Label>
            <select
              id="voice"
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
            >
              {filteredVoices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rate">Rate: {rate.toFixed(2)}</Label>
            <input
              id="rate"
              type="range"
              min="0.8"
              max="1.2"
              step="0.05"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full mt-1"
            />
          </div>

          <div>
            <Label htmlFor="pitch">Pitch: {pitch.toFixed(1)}</Label>
            <input
              id="pitch"
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="text">Text to speak</Label>
          <Textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type something..."
            className="mt-1"
            rows={4}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {samplePhrases.map((phrase, index) => (
            <button
              key={index}
              onClick={() => setText(phrase)}
              className="chip"
            >
              {phrase}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={speak} 
            disabled={isSpeaking}
            className="flex-1"
          >
            {isSpeaking ? (
              <>
                <Volume2 className="w-4 h-4 mr-2 animate-pulse" />
                Speaking...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Speak
              </>
            )}
          </Button>
          
          {isSpeaking && (
            <Button variant="outline" onClick={stopSpeaking}>
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> Available voices depend on your operating system and browser.
        </p>
      </CardContent>
    </Card>
  );
};

const VoiceCloneDemo = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [cloneText, setCloneText] = useState("Hi, this is my voice!");
  const [consent, setConsent] = useState(false);
  const [showFallbackBanner, setShowFallbackBanner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordedAudioRef = useRef<HTMLAudioElement>(null);
  const outputAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Check if backend is available
    fetch(`${API_BASE}/health`)
      .catch(() => setShowFallbackBanner(true));
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        if (recordedAudioRef.current) {
          recordedAudioRef.current.src = URL.createObjectURL(blob);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Speak clearly for 5-10 seconds for best results."
      });
    } catch (error) {
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record your voice.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const enrollVoice = async () => {
    if (!recordedBlob) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('audio', recordedBlob, 'enroll.webm');

    try {
      const response = await fetch(`${API_BASE}/api/enroll`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setIsEnrolled(true);
        toast({
          title: "Voice enrolled successfully!",
          description: "You can now synthesize speech in your voice."
        });
      } else {
        throw new Error('Enrollment failed');
      }
    } catch (error) {
      setShowFallbackBanner(true);
      setIsEnrolled(true); // Allow demo to continue in fallback mode
      toast({
        title: "Using mock voice",
        description: "Backend unavailable. Demo will use stylized TTS.",
        variant: "default"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const synthesizeInMyVoice = async () => {
    if (!cloneText.trim()) {
      toast({
        title: "No text to synthesize",
        description: "Please enter some text first.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(`${API_BASE}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cloneText })
      });

      if (response.ok) {
        const blob = await response.blob();
        if (outputAudioRef.current) {
          outputAudioRef.current.src = URL.createObjectURL(blob);
          outputAudioRef.current.play();
        }
        toast({
          title: "Speech generated!",
          description: "Playing your personalized voice."
        });
      } else {
        throw new Error('TTS failed');
      }
    } catch (error) {
      // Fallback to browser TTS with modified parameters
      const utterance = new SpeechSynthesisUtterance(cloneText);
      utterance.rate = 0.95;
      utterance.pitch = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      
      toast({
        title: "Using mock voice",
        description: "Backend unavailable. Using stylized browser TTS.",
        variant: "default"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5" />
          New Mode — Record & Clone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {showFallbackBanner && (
          <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
            <div className="flex items-center gap-2 text-warning-foreground">
              <AlertTriangle className="w-5 h-5" />
              <strong>Demo mode (mock voice)</strong>
            </div>
            <p className="text-sm mt-1 text-warning-foreground/80">
              Connect real clone backend to enable personalization.
            </p>
          </div>
        )}

        {/* Recording Section */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={startRecording}
              disabled={isRecording}
              variant={isRecording ? "secondary" : "default"}
              className={isRecording ? "recording-pulse" : ""}
            >
              <Mic className="w-4 h-4 mr-2" />
              {isRecording ? "Recording..." : "● Record"}
            </Button>
            
            <Button
              onClick={stopRecording}
              disabled={!isRecording}
              variant="outline"
            >
              <Square className="w-4 h-4 mr-2" />
              ■ Stop
            </Button>
          </div>

          {recordedBlob && (
            <div>
              <Label>Your recording</Label>
              <audio
                ref={recordedAudioRef}
                controls
                className="w-full mt-2"
              />
            </div>
          )}
        </div>

        {/* Enrollment Section */}
        <div className="space-y-4">
          <Button
            onClick={enrollVoice}
            disabled={!recordedBlob || isEnrolled || isProcessing}
            className="w-full"
          >
            {isProcessing ? "Processing..." : "Enroll my voice"}
          </Button>
          
          {isEnrolled && (
            <Badge variant="secondary" className="w-fit">
              ✓ Voice enrolled
            </Badge>
          )}
        </div>

        {/* Synthesis Section */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="clone-text">Text to speak in my voice</Label>
            <Textarea
              id="clone-text"
              value={cloneText}
              onChange={(e) => setCloneText(e.target.value)}
              placeholder="Hi, this is my voice!"
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="rounded border-border"
            />
            <Label htmlFor="consent" className="text-sm">
              I consent to generating my voice
            </Label>
          </div>

          <Button
            onClick={synthesizeInMyVoice}
            disabled={!isEnrolled || !consent || isProcessing}
            className="w-full"
          >
            {isProcessing ? "Generating..." : "Speak in my voice"}
          </Button>

          <audio
            ref={outputAudioRef}
            controls
            className="w-full"
          />
        </div>

        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <Badge variant="outline">Prototype</Badge>
            <span>Do not misuse</span>
          </div>
          <p className="text-sm text-muted-foreground">
            This is a research prototype. Do not use someone else's voice without explicit consent. 
            Voice data is processed locally and temporarily for this demo session only.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const VoiceCloneRedirect = () => {
  const handleRedirect = () => {
    window.open('https://huggingface.co/spaces/vaarissidhu/E2-F5-TTS', '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5" />
          Voice Cloning Technology
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Experience our advanced voice cloning technology that can learn and replicate your unique voice patterns.
          </p>
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Features:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Record your voice in just a few seconds</li>
              <li>• AI learns your speech patterns</li>
              <li>• Generate speech in your voice from any text</li>
              <li>• High-quality audio output</li>
            </ul>
          </div>
          <Button 
            onClick={handleRedirect}
            className="w-full"
            size="lg"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Try Voice Cloning Demo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const SignLanguageRedirect = () => {
  const handleRedirect = () => {
    window.open('https://huggingface.co/spaces/vaarissidhu/ASL_Sign_Lang', '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hand className="w-5 h-5" />
          Sign Language to Text
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Convert sign language gestures into text using computer vision and machine learning.
          </p>
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Features:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Real-time hand gesture recognition</li>
              <li>• Support for multiple sign languages</li>
              <li>• Accurate text conversion</li>
              <li>• Webcam-based detection</li>
            </ul>
          </div>
          <Button 
            onClick={handleRedirect}
            className="w-full"
            size="lg"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Try Sign Language Demo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const HardwareRedirect = () => {
  const handleRedirect = () => {
    window.open('#', '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="w-5 h-5" />
          Hardware Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Connect with ESP32-based hardware devices for IoT voice control and automation.
          </p>
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Features:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• ESP32 microcontroller integration</li>
              <li>• Wireless voice commands</li>
              <li>• Real-time hardware control</li>
              <li>• IoT device automation</li>
            </ul>
          </div>
          <Button 
            onClick={handleRedirect}
            className="w-full"
            size="lg"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Try Hardware Demo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Demo;
