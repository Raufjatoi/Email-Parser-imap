import { useState } from 'react';
import { Email } from '@/components/EmailList';
import { toast } from 'sonner';

export const useEmailAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Use Groq API to analyze email content
  const analyzeEmail = async (email: Email): Promise<AnalysisResult | null> => {
    setIsAnalyzing(true);
    setSelectedEmail(email);
    setAnalysisResult(null);
    
    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      
      if (!apiKey) {
        throw new Error("Groq API key not found. Please check your .env file.");
      }
      
      console.log("Analyzing email:", email.id);
      
      // Prepare the prompt for Groq with explicit instructions to return JSON
      const prompt = `
        Analyze the following email:
        
        From: ${email.from}
        Subject: ${email.subject}
        Preview: ${email.preview}
        
        Provide the following analysis:
        1. A brief summary of the email content
        2. Key insights from the email
        3. Sentiment analysis (score from -1 to 1 and label)
        4. Entities mentioned in the email
        5. Action items that need to be addressed
        6. Topic classification
        
        IMPORTANT: You must respond ONLY with a valid JSON object using the following structure, with no additional text before or after:
        {
          "summary": "string",
          "keyInsights": [{"text": "string", "confidence": number}],
          "sentiment": {"score": number, "label": "Negative" | "Neutral" | "Positive"},
          "entities": [{"name": "string", "type": "string", "confidence": number}],
          "actionItems": [{"text": "string", "priority": "Low" | "Medium" | "High"}],
          "topicClassification": ["string"]
        }
      `;
      
      // Make API call to Groq
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "compound-beta",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that analyzes emails and returns ONLY valid JSON with no additional text."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1024,
          response_format: { type: "json_object" }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to analyze email");
      }
      
      const data = await response.json();
      const analysisText = data.choices[0].message.content;
      
      console.log("Raw Groq response:", analysisText);
      
      // Parse the JSON response
      try {
        // Try to extract JSON if it's wrapped in text
        let jsonStr = analysisText;
        
        // If response contains markdown code blocks, extract the JSON
        if (jsonStr.includes("```json")) {
          jsonStr = jsonStr.split("```json")[1].split("```")[0].trim();
        } else if (jsonStr.includes("```")) {
          jsonStr = jsonStr.split("```")[1].split("```")[0].trim();
        }
        
        // Create a default analysis result in case parsing fails
        const defaultAnalysis: AnalysisResult = {
          summary: "Unable to analyze email content.",
          keyInsights: [{ text: "Analysis failed", confidence: 0 }],
          sentiment: { score: 0, label: "Neutral" },
          entities: [],
          actionItems: [],
          topicClassification: ["Unknown"]
        };
        
        // Try to parse the JSON
        let analysisData: AnalysisResult;
        try {
          analysisData = JSON.parse(jsonStr);
        } catch (innerError) {
          console.warn("Failed to parse JSON, using default analysis:", innerError);
          analysisData = defaultAnalysis;
        }
        
        // Ensure all required fields exist
        analysisData = {
          summary: analysisData.summary || defaultAnalysis.summary,
          keyInsights: analysisData.keyInsights || defaultAnalysis.keyInsights,
          sentiment: analysisData.sentiment || defaultAnalysis.sentiment,
          entities: analysisData.entities || defaultAnalysis.entities,
          actionItems: analysisData.actionItems || defaultAnalysis.actionItems,
          topicClassification: analysisData.topicClassification || defaultAnalysis.topicClassification
        };
        
        setAnalysisResult(analysisData);
        return analysisData;
      } catch (parseError) {
        console.error("Error parsing Groq response:", parseError);
        throw new Error("Failed to parse analysis results");
      }
    } catch (error) {
      console.error("Error analyzing email:", error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze email");
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return {
    isAnalyzing,
    selectedEmail,
    analysisResult,
    analyzeEmail
  };
};

export interface KeyInsight {
  text: string;
  confidence: number;
}

export interface SentimentAnalysis {
  score: number; // -1 to 1, where -1 is very negative, 1 is very positive
  label: 'Negative' | 'Neutral' | 'Positive';
}

export interface EntityMention {
  name: string;
  type: string;
  confidence: number;
}

export interface ActionItem {
  text: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate?: string;
}

export interface AnalysisResult {
  summary: string;
  keyInsights: KeyInsight[];
  sentiment: SentimentAnalysis;
  entities: EntityMention[];
  actionItems: ActionItem[];
  topicClassification: string[];
}



