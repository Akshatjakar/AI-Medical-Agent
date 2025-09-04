'use client'

import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import Image from 'next/image'

type DoctorAgent = {
  id: number
  specialist: string
  description?: string
  image: string
}

type Message = {
  role: "assistant" | "user"
  content: string
  createdOn?: string
}

type Session = {
  id: number
  sessionId: string
  notes: string
  selectedDoctor: DoctorAgent | null
  createdOn: string
}

export default function SessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [messages, setMessages] = useState<Message[]>([])
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) return

    const fetchData = async () => {
      try {
        // 1️⃣ Fetch session details (doctor + notes)
        const sessionRes = await axios.get(`/api/session-chat?sessionId=${sessionId}`)
        setSession(sessionRes.data)

        // 2️⃣ Fetch all chat messages
        const msgsRes = await axios.get(`/api/session-messages?sessionId=${sessionId}`)
        setMessages(msgsRes.data || [])
      } catch (err) {
        console.error("Error fetching session:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [sessionId])

  if (loading) return <p className="p-6">Loading consultation...</p>

  if (!session) return <p className="p-6 text-red-600">Session not found.</p>

  const doctor = session.selectedDoctor

  return (
    <div className="p-6 flex flex-col h-screen space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-3">
        <h2 className="text-xl font-bold">Consultation Details</h2>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Doctor Info */}
      <div className="flex items-center gap-4 bg-white shadow rounded-xl p-4">
        {doctor?.image ? (
          <Image
            src={doctor.image}
            alt={doctor.specialist}
            width={70}
            height={70}
            className="rounded-full border"
          />
        ) : (
          <div className="w-[70px] h-[70px] rounded-full border flex items-center justify-center bg-gray-100 text-gray-400">
            👨‍⚕️
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-800">{doctor?.specialist ?? "General Practitioner"}</h3>
          <p className="text-gray-500 text-sm">{doctor?.description ?? "No description available"}</p>
          <p className="text-xs text-gray-400">Started: {new Date(session.createdOn).toLocaleString()}</p>
        </div>
      </div>

      {/* Notes / Symptoms */}
      <div className="bg-white shadow rounded-xl p-4">
        <h3 className="font-semibold text-gray-800">Patient Symptoms / Notes</h3>
        <p className="text-gray-600 mt-2">{session.notes || "No notes provided."}</p>
      </div>

      {/* Full Chat */}
      <div className="flex-1 bg-white shadow rounded-xl p-4 overflow-y-auto">
        <h3 className="font-semibold text-gray-800 mb-3">Conversation</h3>
        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-gray-500 italic">No conversation found.</p>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl max-w-[75%] ${
                  msg.role === "user"
                    ? "bg-blue-100 ml-auto text-right"
                    : "bg-gray-100 mr-auto text-left"
                }`}
              >
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {msg.role === "user" ? "You" : "AI"}
                </p>
                <p>{msg.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
