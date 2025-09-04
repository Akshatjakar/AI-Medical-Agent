import { openai } from "@/config/OpenAiModel";
import { NextRequest } from "next/server"

const  REPORT_GEN_PROMPT=`You are a professional assistant tasked with summarizing a user's session details into a structured JSON report.

Your output **MUST** be a JSON object and contain no other text.

The JSON object must strictly adhere to the following structure, extracting all relevant information from the provided notes:
{
  "sessionId": "A unique session ID string.",
  "agent": "The name or ID of the agent involved.",
  "user": "The name or ID of the user.",
  "timestamp": "The timestamp of the session.",
  "chiefComplaint": "A concise summary of the primary issue or complaint.",
  "summary": "A comprehensive summary of the entire session.",
  "symptoms": "A list of symptoms or key details mentioned.",
  "duration": "The duration of the session.",
  "severity": "The severity level of the issue (e.g., 'high', 'medium', 'low').",
  "recommendation": "The recommended next steps or solution."
}
  only include valif fields .

Ensure the content for each key is a string and is directly derived from the notes provided.`;
export async function POST(req: NextRequest) {
    const { sessionId, sessionDetails, messages } = await req.json();

    try {
        const UserInput="AI Doctor Info:"+JSON.stringify(sessionDetails)+",conversation:"+JSON.stringify(messages);
        const completion=await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: REPORT_GEN_PROMPT
                },
                {role:'user',content:UserInput}
            ]
        });
        const rawResp=completion.choices[0].message;

        //@ts-ignore
        const Resp=rawResp.content.trim().replace('```json','').resplace('```','');
        const JSONResp=JSON.parse(Resp);
    } catch (error) {
        
    }
    
}