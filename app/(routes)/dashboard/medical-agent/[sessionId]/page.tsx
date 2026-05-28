'use client'

import axios from 'axios';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Clock,
  MessageCircle,
  User,
  Heart
} from 'lucide-react';

import Image from 'next/image';
import { Button } from '@/components/ui/button';

import Vapi from '@vapi-ai/web';

type DoctorAgent = {
  specialist?: string;
  image: string;
};

type SessionDetails = {
  id: number;
  notes: string;
  sessionId: string;
  report: JSON;
  selectedDoctor: DoctorAgent;
  createdOn: string;
};

function MedicalVoiceAgent() {

  const { sessionId } = useParams();

  const [sessionDetails, setSessionDetails] =
    useState<SessionDetails>();

  const [callStarted, setCallStarted] =
    useState(false);

  const [isListening, setIsListening] =
    useState(false);

  const [callDuration, setCallDuration] =
    useState(0);

  const [vapiInstance, setVapiInstance] =
    useState<any>(null);

  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >([]);

  const [currentMessage, setCurrentMessage] =
    useState({
      assistant:
        "Hello! I'm your AI medical assistant. Please tell me your name and age.",
      user: ""
    });

  // -----------------------------------
  // GET SESSION DETAILS
  // -----------------------------------

  useEffect(() => {

    if (sessionId) {
      GetSessionDetails();
    }

  }, [sessionId]);

  const GetSessionDetails = async () => {

    try {

      const result = await axios.get(
        '/api/session-chat?sessionId=' + sessionId
      );

      setSessionDetails(result.data);

    } catch (error) {

      console.error(
        'Error fetching session details:',
        error
      );
    }
  };

  // -----------------------------------
  // CALL TIMER
  // -----------------------------------

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

  // -----------------------------------
  // FORMAT TIMER
  // -----------------------------------

  const formatDuration = (seconds: number) => {

    const mins = Math.floor(seconds / 60);

    const secs = seconds % 60;

    return `${mins
      .toString()
      .padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // -----------------------------------
  // START CALL
  // -----------------------------------

  const StartCall = async () => {

    try {

      // ENV VARIABLES

      const apiKey =
        process.env.NEXT_PUBLIC_VAPI_API_KEY;

      const assistantId =
        process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

      // CHECK ENV

      if (!apiKey || !assistantId) {

        alert(
          'Missing VAPI environment variables'
        );

        return;
      }

      // CLEAN PREVIOUS INSTANCE

      if (vapiInstance) {

        try {

          vapiInstance.stop();
          vapiInstance.removeAllListeners();

        } catch (e) {

          console.log('Cleanup error:', e);
        }
      }

      // CREATE NEW INSTANCE

      const vapi = new Vapi(apiKey);

      setVapiInstance(vapi);

      // -----------------------------------
      // EVENTS
      // -----------------------------------

      vapi.on('call-start', () => {

        console.log('Call started');

        setCallStarted(true);
        setCallDuration(0);
      });

      vapi.on('call-end', () => {

        console.log('Call ended');

        setCallStarted(false);
        setIsListening(false);
      });

      vapi.on('speech-start', () => {

        setIsListening(true);
      });

      vapi.on('speech-end', () => {

        setIsListening(false);
      });

      // -----------------------------------
      // MESSAGE EVENT
      // -----------------------------------

      vapi.on('message', async (message: any) => {

        console.log('MESSAGE:', message);

        if (message.type === 'transcript') {

          // SAVE MESSAGE

          try {

            await axios.post(
              '/api/session-messages',
              {
                sessionId,
                role: message.role,
                content: message.transcript
              }
            );

          } catch (e) {

            console.log('Save message error:', e);
          }

          // UPDATE UI

          setMessages(prev => [
            ...prev,
            {
              role: message.role,
              content: message.transcript
            }
          ]);

          // ASSISTANT MESSAGE

          if (message.role === 'assistant') {

            setCurrentMessage(prev => ({
              ...prev,
              assistant: message.transcript
            }));
          }

          // USER MESSAGE

          if (message.role === 'user') {

            setCurrentMessage(prev => ({
              ...prev,
              user: message.transcript
            }));
          }
        }
      });

      // -----------------------------------
      // ERROR EVENT
      // -----------------------------------

      vapi.on('error', (error: any) => {

        console.log('RAW ERROR =>', error);

        if (error?.error) {
          console.log('INNER ERROR =>', error.error);
        }

        if (error?.message) {
          console.log('MESSAGE =>', error.message);
        }

        setCallStarted(false);
        setIsListening(false);

        alert(
          error?.message ||
          error?.error?.message ||
          'Vapi error occurred'
        );
      });

      // -----------------------------------
      // START CALL
      // -----------------------------------

      await vapi.start(assistantId);

    } catch (error) {

      console.error(
        'StartCall Error:',
        error
      );

      alert('Failed to start call');
    }
  };

  // -----------------------------------
  // END CALL
  // -----------------------------------

  const EndCall = () => {

    try {

      if (vapiInstance) {

        vapiInstance.stop();

        vapiInstance.removeAllListeners();
      }

      setCallStarted(false);
      setIsListening(false);
      setCallDuration(0);

    } catch (error) {

      console.error(
        'EndCall Error:',
        error
      );
    }
  };

  // -----------------------------------
  // UI
  // -----------------------------------

  return (

    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8">

        {/* HEADER */}

        <div className="text-center">

          <Image
            src={
              sessionDetails?.selectedDoctor?.image ||
              '/doctor.png'
            }
            alt="doctor"
            width={120}
            height={120}
            className="rounded-full mx-auto"
          />

          <h1 className="text-3xl font-bold mt-4">

            {sessionDetails?.selectedDoctor
              ?.specialist || 'AI Doctor'}
          </h1>

          <p className="text-gray-500 mt-2">
            Medical Voice Consultation
          </p>
        </div>

        {/* TIMER */}

        <div className="flex justify-center mt-6">

          <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl">

            <Clock className="h-5 w-5" />

            <span className="font-semibold">
              {formatDuration(callDuration)}
            </span>
          </div>
        </div>

        {/* LISTENING STATUS */}

        <div className="flex justify-center mt-6">

          <div className="flex items-center gap-2">

            {isListening ? (
              <>
                <Mic className="text-green-500 animate-pulse" />
                <span>Listening...</span>
              </>
            ) : (
              <>
                <MicOff className="text-gray-400" />
                <span>Waiting...</span>
              </>
            )}
          </div>
        </div>

        {/* BUTTONS */}

        <div className="flex justify-center mt-8">

          {!callStarted ? (

            <Button
              onClick={StartCall}
              className="bg-green-600 hover:bg-green-700"
            >
              <PhoneCall className="mr-2 h-4 w-4" />
              Start Call
            </Button>

          ) : (

            <Button
              variant="destructive"
              onClick={EndCall}
            >
              <PhoneOff className="mr-2 h-4 w-4" />
              End Call
            </Button>
          )}
        </div>

        {/* CHAT */}

        <div className="mt-10 space-y-4">

          {/* ASSISTANT */}

          <div className="bg-blue-50 rounded-2xl p-4">

            <div className="flex items-center gap-2 mb-2">

              <Heart className="h-5 w-5 text-blue-600" />

              <span className="font-semibold text-blue-700">
                Assistant
              </span>
            </div>

            <p>{currentMessage.assistant}</p>
          </div>

          {/* USER */}

          {currentMessage.user && (

            <div className="bg-gray-100 rounded-2xl p-4">

              <div className="flex items-center gap-2 mb-2">

                <User className="h-5 w-5 text-gray-700" />

                <span className="font-semibold">
                  You
                </span>
              </div>

              <p>{currentMessage.user}</p>
            </div>
          )}
        </div>

        {/* MESSAGES */}

        {messages.length > 0 && (

          <div className="mt-8">

            <div className="flex items-center gap-2 mb-4">

              <MessageCircle className="h-5 w-5" />

              <h2 className="font-semibold">
                Conversation History
              </h2>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">

              {messages.map((msg, index) => (

                <div
                  key={index}
                  className={`p-3 rounded-xl ${
                    msg.role === 'assistant'
                      ? 'bg-blue-50'
                      : 'bg-gray-100'
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">
                    {msg.role === 'assistant'
                      ? 'Assistant'
                      : 'You'}
                  </div>

                  <p>{msg.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DEBUG */}

        <div className="mt-8 bg-black text-green-400 rounded-2xl p-4 text-sm">

          <p>
            API KEY:
            {process.env.NEXT_PUBLIC_VAPI_API_KEY
              ? ' ✅'
              : ' ❌'}
          </p>

          <p>
            ASSISTANT ID:
            {process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID
              ? ' ✅'
              : ' ❌'}
          </p>

          <p>
            CALL STATUS:
            {callStarted
              ? ' ACTIVE'
              : ' INACTIVE'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default MedicalVoiceAgent;