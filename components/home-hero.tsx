"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MicIcon, SendHorizontal, BrainCircuit } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import SleepSounds from "./sleep-sounds";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "./auth-provider";

export default function HomeHero() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [responses, setResponses] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showExamples, setShowExamples] = useState(true);
  const [loadingText, setLoadingText] = useState("");
  const [showCommands, setShowCommands] = useState(false);
  const [showSleepSounds, setShowSleepSounds] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const commands = [
    { name: "Sleep Sounds", description: "Play relaxing sleep sounds" },
    { name: "How are you?", description: "Ask Serenity about its day" },
    { name: "Tell me a joke", description: "Hear a light-hearted joke" },
    { name: "Breathing exercise", description: "Guide me through breathing" },
    { name: "Help me relax", description: "Get relaxation techniques" },
    { name: "Mental health tips", description: "Get mental health advice" },
  ];

  const examples = [
    "How can I deal with anxiety?",
    "I need help sleeping better",
    "Tell me a relaxation technique",
    "What are signs of burnout?",
  ];

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [responses, isProcessing]);

  const startListening = () => {
    if (errorMessage) setErrorMessage(null);

    try {
      // Check if browser supports SpeechRecognition
      // @ts-ignore: Ignoring because we'll check for browser support
      const SpeechRecognition =
        // @ts-ignore: Ignoring because we'll check for browser support
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setErrorMessage("Your browser doesn't support voice recognition.");
        return;
      }

      if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const result = event.results[current];
          const transcriptValue = result[0].transcript;
          setTranscript(transcriptValue);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          let message = "Voice recognition error. Please try again.";

          if (event.error === "not-allowed") {
            message = "Please allow microphone access to use voice features.";
          } else if (event.error === "network") {
            message = "Network error. Please check your connection.";
          }

          setErrorMessage(message);
          stopListening();
        };

        recognitionRef.current.onend = () => {
          if (isListening) {
            // If we're still supposed to be listening, restart
            recognitionRef.current.start();
          } else {
            // Otherwise process what we heard
            if (transcript) {
              processTranscript();
            }
          }
        };
      }

      recognitionRef.current.start();
      setIsListening(true);
      setShowExamples(false);
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      setErrorMessage(
        "Unable to start voice recognition. Please check your browser permissions."
      );
    }
  };

  const stopListening = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch (error) {
      console.error("Error stopping speech recognition:", error);
    }
    setIsListening(false);
  };

  const processTranscript = () => {
    if (!transcript.trim()) return;

    // Add user message to the conversation
    setResponses((prev) => [...prev, `You: ${transcript}`]);
    setIsProcessing(true);

    // Simulate loading with progress
    startProgressSimulation();

    // Check for commands
    const lowerTranscript = transcript.toLowerCase();

    if (
      lowerTranscript.includes("sleep sound") ||
      lowerTranscript.includes("play sound")
    ) {
      setLoadingText("Opening sleep sounds...");
      setTimeout(() => {
        setShowSleepSounds(true);
        setIsProcessing(false);
        stopProgressSimulation();
      }, 1000);
    } else {
      // Process the response (simulated AI response for now)
      generateResponse(transcript);
    }

    // Reset transcript
    setTranscript("");
  };

  const startProgressSimulation = () => {
    setProgress(0);
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          stopProgressSimulation();
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const stopProgressSimulation = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setProgress(100);
  };

  // Simulated response generation (this would be replaced with actual API call)
  const generateResponse = (query: string) => {
    const lowerQuery = query.toLowerCase();
    let responseTime = 1000 + Math.random() * 1000; // Between 1-2 seconds

    // Set context-sensitive loading text
    if (lowerQuery.includes("anxiety") || lowerQuery.includes("stress")) {
      setLoadingText("Finding anxiety management techniques...");
    } else if (lowerQuery.includes("sleep")) {
      setLoadingText("Researching sleep improvement methods...");
    } else if (
      lowerQuery.includes("meditat") ||
      lowerQuery.includes("breath")
    ) {
      setLoadingText("Preparing mindfulness recommendations...");
    } else {
      setLoadingText("Thinking about your question...");
    }

    setTimeout(() => {
      let response = "";

      // Simple pattern matching for demonstration
      if (lowerQuery.includes("hello") || lowerQuery.includes("hi")) {
        response =
          "Hello! How can I help you today with your mental wellbeing?";
      } else if (
        lowerQuery.includes("who are you") ||
        lowerQuery.includes("what are you")
      ) {
        response =
          "I'm Serenity, your mental health companion. I'm here to provide support, resources, and tools to help you manage your mental wellbeing.";
      } else if (lowerQuery.includes("help me")) {
        response =
          "I'd be happy to help. To support your mental wellbeing, I can guide you through breathing exercises, suggest relaxation techniques, or provide information about common mental health concerns. What would you like to focus on?";
      } else if (lowerQuery.includes("joke")) {
        response =
          "Why don't scientists trust atoms? Because they make up everything! Remember, a little laughter can be good for your mental health.";
      } else if (
        lowerQuery.includes("breathing") ||
        lowerQuery.includes("breath exercise")
      ) {
        response =
          "Let's try a simple breathing exercise: Breathe in slowly through your nose for 4 counts, hold for 2, then exhale through your mouth for 6 counts. Repeat this pattern 5 times. This can help reduce anxiety and promote relaxation.";
      } else if (
        lowerQuery.includes("anxiety") ||
        lowerQuery.includes("anxious")
      ) {
        response =
          "Anxiety can be challenging. Some helpful techniques include deep breathing, progressive muscle relaxation, and mindfulness. Regular exercise and limiting caffeine can also help. Would you like me to explain any of these techniques in more detail?";
      } else if (
        lowerQuery.includes("sleep") ||
        lowerQuery.includes("insomnia") ||
        lowerQuery.includes("trouble sleeping")
      ) {
        response =
          "For better sleep, try establishing a regular sleep schedule, creating a restful environment, limiting screen time before bed, and practicing relaxation techniques. Our sleep sounds feature might also help you fall asleep more easily.";
      } else if (lowerQuery.includes("meditat")) {
        response =
          "Meditation is a wonderful practice for mental wellbeing. A simple way to start is by sitting comfortably, focusing on your breath, and gently bringing your attention back whenever your mind wanders. Even 5 minutes daily can be beneficial.";
      } else if (lowerQuery.includes("depress")) {
        response =
          "Depression is a common but serious condition. Besides professional help, regular physical activity, maintaining social connections, and setting small achievable goals can help. Remember that seeking support is a sign of strength, not weakness.";
      } else if (lowerQuery.includes("stress")) {
        response =
          "Managing stress is important for mental health. Try identifying your stress triggers, practicing relaxation techniques, maintaining a healthy lifestyle, and setting boundaries. Regular physical activity and adequate rest are also essential.";
      } else if (lowerQuery.includes("thank")) {
        response =
          "You're welcome! I'm here to support you whenever you need it. Don't hesitate to reach out again.";
      } else if (lowerQuery.includes("how are you")) {
        response =
          "I'm functioning well, thank you for asking! More importantly, how are you feeling today? Is there anything specific I can help you with?";
      } else if (
        lowerQuery.includes("burnout") ||
        lowerQuery.includes("burnt out")
      ) {
        response =
          "Burnout can manifest as exhaustion, cynicism, and reduced effectiveness. Key strategies include setting boundaries, taking breaks, seeking social support, and focusing on self-care. It might also be helpful to reassess priorities and delegate tasks when possible.";
      } else {
        response =
          "That's an interesting question about mental wellbeing. While I'm still learning, I'd recommend exploring evidence-based techniques like mindfulness, regular exercise, maintaining social connections, and ensuring adequate sleep. Would you like more specific information?";
      }

      setResponses((prev) => [...prev, `Serenity: ${response}`]);
      setIsProcessing(false);
      stopProgressSimulation();
    }, responseTime);
  };

  // Handle text input
  const handleSendMessage = () => {
    if (!transcript.trim()) return;
    processTranscript();
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Conversation Interface */}
      <div className="bg-gradient-to-b from-purple-50 to-indigo-50 rounded-3xl shadow-lg p-5 md:p-8 min-h-[500px] mb-8 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-purple-800">
              Serenity Assistant
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCommands(true)}
            className="text-sm text-purple-600 border-purple-200 hover:bg-purple-100"
          >
            Commands
          </Button>
        </div>

        {/* Chat messages */}
        <div className="flex-grow overflow-y-auto mb-4 space-y-4">
          {responses.length === 0 && !isListening && !isProcessing && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <BrainCircuit className="h-12 w-12 text-purple-400 mb-3" />
              <h3 className="text-xl font-semibold text-purple-900 mb-2">
                How can I help your mental wellbeing today?
              </h3>
              <p className="text-purple-700 mb-6 max-w-md">
                Ask me anything about mental health, relaxation techniques, or
                how to manage stress.
              </p>

              {showExamples && (
                <div className="flex flex-wrap justify-center gap-2 max-w-md">
                  {examples.map((example, i) => (
                    <Badge
                      key={i}
                      className="bg-white hover:bg-purple-100 text-purple-800 cursor-pointer border border-purple-200 py-1.5 px-3"
                      onClick={() => {
                        setTranscript(example);
                        processTranscript();
                      }}
                    >
                      {example}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {responses.map((message, index) => {
            const isUser = message.startsWith("You: ");
            return (
              <div
                key={index}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    isUser
                      ? "bg-purple-600 text-white rounded-tr-none"
                      : "bg-white text-gray-800 rounded-tl-none border border-purple-100"
                  }`}
                >
                  {message.substring(message.indexOf(": ") + 2)}
                </div>
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white text-gray-800 rounded-tl-none border border-purple-100 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-150"></div>
                  <div className="w-3 h-3 bg-purple-300 rounded-full animate-pulse delay-300"></div>
                  <span className="text-sm text-purple-700">{loadingText}</span>
                </div>
                <Progress value={progress} className="h-1.5 w-full" />
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
              <p>⚠️ {errorMessage}</p>
              <p className="mt-1 text-xs">
                Try using the text input below instead.
              </p>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div className="mt-auto flex items-end gap-2">
          <div className="flex-grow relative">
            <input
              type="text"
              className="w-full rounded-full bg-white border border-purple-200 px-4 py-3 pr-12 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              placeholder="Type your message..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
            />
            <Button
              onClick={handleSendMessage}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 p-0 rounded-full bg-purple-100 hover:bg-purple-200"
              disabled={isProcessing || !transcript.trim()}
            >
              <SendHorizontal className="h-5 w-5 text-purple-700" />
            </Button>
          </div>
          <Button
            onClick={isListening ? stopListening : startListening}
            className={`h-12 w-12 p-0 rounded-full ${
              isListening
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            }`}
            disabled={isProcessing}
          >
            <MicIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Commands Dialog */}
      <Dialog open={showCommands} onOpenChange={setShowCommands}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Available Voice Commands</DialogTitle>
            <DialogDescription>
              Try these phrases to interact with Serenity
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 pt-2">
            {commands.map((command, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-100"
              >
                <div className="bg-purple-100 rounded-full p-1.5">
                  <MicIcon className="h-4 w-4 text-purple-700" />
                </div>
                <div>
                  <h4 className="font-medium text-purple-900">
                    "{command.name}"
                  </h4>
                  <p className="text-sm text-purple-700">
                    {command.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {showSleepSounds && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <SleepSounds onClose={() => setShowSleepSounds(false)} />
          </Card>
        </div>
      )}
    </div>
  );
}
