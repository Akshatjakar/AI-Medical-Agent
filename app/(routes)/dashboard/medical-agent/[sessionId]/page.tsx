'use client'

import axios from 'axios';
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { DoctorAgent } from '../../_components/DoctorAgentCard';
import { Circle, PhoneCall, PhoneOff, Mic, MicOff, Activity, Clock, User, MessageCircle, Stethoscope, Heart } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Vapi from '@vapi-ai/web';

type sessionDetails = {
  id: number,
  notes: string,
  sessionId: string,
  report: JSON,
  selectedDoctor: DoctorAgent,
  createdOn: string
}

function MedicalVoiceAgent() {
  const { sessionId } = useParams();
  const [callStarted, setCallStarted] = useState(false);
  const [sessionDetails, setSessionDetails] = useState<sessionDetails>();
  const [vapiInstance, setVapiInstance] = useState<any>();
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [callDuration, setCallDuration] = useState(0);
  const [conversationStage, setConversationStage] = useState<'greeting' | 'collecting_info' | 'health_issues' | 'detailed_symptoms'>('greeting');
  const [currentMessage, setCurrentMessage] = useState<{assistant: string, user: string}>({
    assistant: "Hello! I'm your AI medical assistant. Please tell me your name and age to get started.",
    user: ""
  });
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    if (sessionId) GetSessionDetails();
  }, [sessionId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStarted) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStarted]);

  // Simulate audio level animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening) {
      interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 150);
    } else {
      setAudioLevel(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const GetSessionDetails = async () => {
    try {
      const result = await axios.get('/api/session-chat?sessionId=' + sessionId);
      console.log(result.data);
      setSessionDetails(result.data);
    } catch (error) {
      console.error('Error fetching session details:', error);
    }
  }

  const StartCall = async () => {
    if (!sessionDetails) return;

    try {
      // Check if environment variables are set
      const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
      const assistantId = process.env.NEXT_PUBLIC_VAPI_YOUR_ASSISTANT_ID;

      if (!apiKey || !assistantId) {
        console.error('Vapi API key or Assistant ID not configured');
        alert('Please configure VAPI_API_KEY and VAPI_ASSISTANT_ID environment variables');
        return;
      }

      // Clean up any existing instance
      if (vapiInstance) {
        try {
          vapiInstance.stop();
          vapiInstance.removeAllListeners();
        } catch (error) {
          console.error('Error cleaning up previous instance:', error);
        }
      }

      // 1️⃣ Create new Vapi instance
      const vapi = new Vapi(apiKey);
      setVapiInstance(vapi);

      // 2️⃣ Set up event listeners BEFORE starting the call
      vapi.on('call-start', () => {
        console.log('Call started');
        setCallStarted(true);
        setCallDuration(0);
      });

      vapi.on('call-end', () => {
        console.log('Call ended');
        setCallStarted(false);
        setCallDuration(0);
        setIsListening(false);
      });

      vapi.on('speech-start', () => {
        console.log('User started speaking');
        setIsListening(true);
      });

      vapi.on('speech-end', () => {
        console.log('User stopped speaking');
        setIsListening(false);
      });

      vapi.on('message', async (message) => {
  console.log('Received message:', message);

  if (message.type === 'transcript') {
    // ✅ Save every message to DB
    try {
      await axios.post('/api/session-messages', {
        sessionId, // make sure sessionId is available in this component
        role: message.role,
        content: message.transcript,
      });
    } catch (e) {
      console.error("Failed to save message:", e);
    }

    // ✅ Track conversation progress
    if (message.role === 'assistant') {
      const content = message.transcript.toLowerCase();
      if (
        content.includes('what medical concerns') ||
        content.includes('symptoms brought you')
      ) {
        setConversationStage('health_issues');
      } else if (content.includes('when did') || content.includes('how long')) {
        setConversationStage('detailed_symptoms');
      }

      setCurrentMessage((prev) => ({
        ...prev,
        assistant: message.transcript,
      }));
    } else if (message.role === 'user') {
      const content = message.transcript.toLowerCase();

      // Check if user provided name and age
      if (
        conversationStage === 'greeting' &&
        (content.includes('my name is') ||
          content.includes("i'm ") ||
          /\d+/.test(content))
      ) {
        setConversationStage('collecting_info');
      }

      setCurrentMessage((prev) => ({
        ...prev,
        user: message.transcript,
      }));
    }

    // ✅ Keep local state updated for live UI
    setMessages((prev) => [
      ...prev,
      { role: message.role, content: message.transcript },
    ]);
  }
});


      vapi.on('error', (error) => {
        console.error('Vapi error:', error);
        setCallStarted(false);
        setIsListening(false);
        
        // Handle specific error types
        if (error.error?.message?.includes('Meeting has ended')) {
          console.log('Call session ended normally');
        } else if (error.type === 'daily-call-join-error') {
          alert('Failed to join call. Please check your internet connection and try again.');
        } else if (error.type === 'start-method-error') {
          alert('Failed to start call. Please check your assistant configuration.');
        } else {
          alert('Call error: ' + (error.error?.message || error.errorMsg || 'Unknown error'));
        }
      });

      // 3️⃣ Create assistant configuration with detailed medical consultation flow
      const assistantConfig = {
        model: {
          provider: "openai",
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a professional medical AI assistant specializing in ${sessionDetails.selectedDoctor.specialist || 'general medicine'}. 

CONVERSATION FLOW:
1. GREETING: Start by asking for the patient's name and age
2. BASIC INFO: Once you have name and age, immediately ask: "Thank you [name]. Now, what medical concerns or symptoms brought you here today?"
3. HEALTH ISSUES: Listen to their main complaint and ask follow-up questions about:
   - When did the symptoms start?
   - How severe are they (1-10 scale)?
   - What makes them better or worse?
   - Any other associated symptoms?
4. DETAILED ASSESSMENT: Based on their responses, ask relevant medical history questions
5. GUIDANCE: Provide preliminary guidance while emphasizing the need for professional medical consultation

IMPORTANT RULES:
- Always be empathetic and professional
- After getting name and age, IMMEDIATELY transition to asking about health concerns
- Don't get stuck on basic information - move the conversation forward
- Ask one question at a time
- Keep responses concise and conversational
- Always remind patients this is for informational purposes only

Current patient context: This is a consultation session. The patient has specifically chosen to speak with a ${sessionDetails.selectedDoctor.specialist || 'medical'} specialist.

Start the conversation now by asking for their name and age.`
            }
          ]
        },
        voice: {
          provider: "playht",
          voiceId: "jennifer" as const
        },
        firstMessage: "Hello! I'm your AI medical assistant. I'm here to help you with your health concerns. Could you please tell me your name and age to get started?",
        transcriber: {
          provider: "deepgram" as const,
          model: "nova-2" as const,
          language: "en-US" as const
        }
      };

      // Start the call with assistant configuration
      await vapi.start(assistantId, assistantConfig);

    } catch (error) {
      console.error('Error starting call:', error);
      setCallStarted(false);
      alert('Failed to start call. Please check your configuration.');
    }
  }

  const EndCall = () => {
    if (!vapiInstance) return;

    try {
      vapiInstance.stop();
      
      // Remove all event listeners
      vapiInstance.removeAllListeners();

      setCallStarted(false);
      setVapiInstance(null);
      setCallDuration(0);
      setConversationStage('greeting');
      setMessages([]);
      setIsListening(false);
      setCurrentMessage({
        assistant: "Hello! I'm your AI medical assistant. Please tell me your name and age to get started.",
        user: ""
      });
      
    } catch (error) {
      console.error('Error ending call:', error);
    }
  }

  const getStageProgress = () => {
    const stages = ['greeting', 'collecting_info', 'health_issues', 'detailed_symptoms'];
    return stages.indexOf(conversationStage) + 1;
  };

  const getStageLabel = () => {
    switch (conversationStage) {
      case 'greeting': return 'Initial Contact';
      case 'collecting_info': return 'Information Gathering';
      case 'health_issues': return 'Health Assessment';
      case 'detailed_symptoms': return 'Detailed Analysis';
      default: return 'Consultation';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className={`relative p-3 rounded-2xl transition-all duration-300 ${
                callStarted 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/25' 
                  : 'bg-gradient-to-r from-gray-400 to-gray-500'
              }`}>
                <Circle className={`h-5 w-5 text-white ${callStarted ? 'animate-pulse' : ''}`} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">
                  {callStarted ? 'Connected to AI Assistant' : 'Ready to Connect'}
                </h2>
                <p className="text-sm text-gray-500">Medical Voice Consultation</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="font-mono text-lg font-semibold text-gray-800">
                  {formatDuration(callDuration)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {sessionDetails && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Doctor Info & Controls */}
            <div className="lg:col-span-1 space-y-6">
              {/* Doctor Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse ${callStarted ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}></div>
                    <Image
                      src={sessionDetails.selectedDoctor.image}
                      alt={sessionDetails.selectedDoctor.specialist ?? "Doctor"}
                      width={120}
                      height={120}
                      className="relative h-24 w-24 object-cover rounded-full border-4 border-white shadow-lg"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-4 border-white shadow-lg transition-all duration-300 ${
                      callStarted ? 'bg-green-500' : 'bg-gray-400'
                    }`}>
                      <div className={`w-full h-full rounded-full ${callStarted ? 'animate-pulse bg-green-400' : ''}`}></div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {sessionDetails.selectedDoctor.specialist}
                  </h3>
                  <p className="text-gray-600 mb-4">AI Medical Assistant</p>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
                    <Stethoscope className="h-4 w-4" />
                    <span>Specialized Healthcare AI</span>
                  </div>
                </div>

                {/* Call Controls */}
                <div className="space-y-4">
                  {!callStarted ? (
                    <Button 
                      className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                      onClick={StartCall}
                      disabled={!sessionDetails}
                    >
                      <PhoneCall className="mr-3 h-5 w-5" />
                      Start Consultation
                    </Button>
                  ) : (
                    <Button 
                      variant="destructive"
                      className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25 transition-all duration-300 transform hover:scale-105"
                      onClick={EndCall}
                    >
                      <PhoneOff className="mr-3 h-5 w-5" />
                      End Consultation
                    </Button>
                  )}

                  {/* Audio Visualization */}
                  {callStarted && (
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        {isListening ? (
                          <Mic className="h-5 w-5 text-green-500 animate-pulse" />
                        ) : (
                          <MicOff className="h-5 w-5 text-gray-400" />
                        )}
                        <span className="text-sm font-medium text-gray-700">
                          {isListening ? 'Listening...' : 'Waiting for speech'}
                        </span>
                      </div>
                      
                      {/* Audio Level Bars */}
                      <div className="flex items-center justify-center gap-1 h-8">
                        {[...Array(12)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 bg-gradient-to-t from-blue-500 to-indigo-500 rounded-full transition-all duration-150 ${
                              isListening && audioLevel > (i * 8) ? 'opacity-100' : 'opacity-20'
                            }`}
                            style={{
                              height: isListening && audioLevel > (i * 8) 
                                ? `${Math.min(32, 8 + (audioLevel - i * 8) / 3)}px` 
                                : '4px'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-800">Consultation Progress</h4>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{getStageLabel()}</span>
                    <span className="text-sm text-gray-500">{getStageProgress()}/4</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(getStageProgress() / 4) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {['Initial', 'Info', 'Health', 'Analysis'].map((stage, index) => (
                      <div
                        key={stage}
                        className={`text-center p-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                          index < getStageProgress()
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {stage}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Conversation */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-800">Live Conversation</h3>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {/* Current Assistant Message */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <Heart className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-blue-700">AI Assistant</span>
                      {callStarted && (
                        <div className="ml-auto flex gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-800 leading-relaxed">{currentMessage.assistant}</p>
                  </div>

                  {/* Current User Message */}
                  {currentMessage.user && (
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">You</span>
                      </div>
                      <p className="text-gray-800 leading-relaxed">{currentMessage.user}</p>
                    </div>
                  )}

                  {/* Conversation History */}
                  {messages.length > 2 && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Previous Messages
                      </h4>
                      <div className="space-y-3 max-h-40 overflow-y-auto">
                        {messages.slice(0, -2).map((msg, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-xl text-sm transition-all duration-200 hover:shadow-md ${
                              msg.role === 'assistant'
                                ? 'bg-blue-50 border border-blue-100 text-blue-900'
                                : 'bg-gray-50 border border-gray-200 text-gray-800'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-xs uppercase tracking-wide">
                                {msg.role === 'assistant' ? 'AI' : 'You'}
                              </span>
                            </div>
                            <p className="leading-relaxed">{msg.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Empty State */}
                {!callStarted && messages.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="h-8 w-8 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Ready for Consultation</h4>
                    <p className="text-gray-600">Click "Start Consultation" to begin your medical voice session</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 bg-gray-900 text-white rounded-2xl p-4 text-sm font-mono">
            <h4 className="font-semibold mb-2">Debug Information</h4>
            <div className="space-y-1">
              <p>API Key: {process.env.NEXT_PUBLIC_VAPI_API_KEY ? '✅ Configured' : '❌ Missing'}</p>
              <p>Assistant ID: {process.env.NEXT_PUBLIC_VAPI_YOUR_ASSISTANT_ID ? '✅ Configured' : '❌ Missing'}</p>
              <p>Call Status: {callStarted ? '🟢 Active' : '🔴 Inactive'}</p>
              <p>Listening: {isListening ? '🎤 Yes' : '🔇 No'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MedicalVoiceAgent;