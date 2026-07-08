
import { GoogleGenAI } from "@google/genai";
import { AttendanceRecord, DashboardStats } from "../types";

// In a real app, strict env check. For demo, we assume the key is present or we handle the error gracefully.
const apiKey = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey });

export const GeminiService = {
  /**
   * Generates a natural language report summarizing the attendance trends.
   */
  generateWeeklyReport: async (stats: DashboardStats, recentRecords: AttendanceRecord[]): Promise<string> => {
    if (!apiKey) return "API Key not configured. Please add your Gemini API Key to use AI features.";

    try {
      const prompt = `
        Act as a school administrator assistant. Analyze the following attendance data and provide a brief, professional 1-paragraph summary of the week's performance. 
        Identify any trends (e.g., high absenteeism on Mondays).
        
        Data:
        Total Students: ${stats.totalStudents}
        Attendance Rate Today: ${stats.attendanceRate}%
        Recent Records Sample: ${JSON.stringify(recentRecords.slice(0, 10))}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || "No report generated.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Unable to generate AI report at this time.";
    }
  },

  /**
   * Generates a personalized email for parents of absent students.
   */
  generateParentNotification: async (studentName: string, date: string): Promise<string> => {
    if (!apiKey) return "API Key missing. Cannot generate email draft.";

    try {
      const prompt = `
        Draft a polite, professional, and concise email to the parents of ${studentName} informing them that their child was marked absent on ${date}.
        Ask them to provide a reason if possible. Do not include subject line, just the body.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || "Draft generation failed.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Error generating notification.";
    }
  },

  /**
   * Generates a performance or update email for a student.
   */
  generateStudentEmail: async (studentName: string, topic: string): Promise<{subject: string, body: string}> => {
    if (!apiKey) return { subject: "Update", body: "Please configure API Key for AI features." };

    try {
      const prompt = `
        Draft a short, encouraging email to a student named ${studentName} about the following topic: "${topic}".
        Return the result in JSON format with keys: "subject" and "body".
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const text = response.text;
      if (text) {
        return JSON.parse(text);
      }
      throw new Error("Empty response");
    } catch (error) {
      console.error("Gemini Error:", error);
      return { subject: `Update regarding ${topic}`, body: `Dear ${studentName},\n\nI wanted to reach out regarding ${topic}.\n\nBest regards,\nYour Teacher` };
    }
  }
};
