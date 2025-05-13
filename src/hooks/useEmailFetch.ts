import { useState } from 'react';
import { Email } from '@/components/EmailList';
import { EmailConfig } from '@/components/EmailConnect';
import { toast } from 'sonner';

// Backend API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useEmailFetch = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const connectToEmail = async (config: EmailConfig): Promise<boolean> => {
    setIsConnecting(true);
    
    try {
      console.log("Connecting to email with config:", config);
      
      // Make API call to backend
      const response = await fetch(`${API_URL}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect to email server');
      }
      
      setIsConnected(true);
      setEmails(data.emails);
      
      return true;
    } catch (error) {
      console.error("Error connecting to email:", error);
      toast.error(error instanceof Error ? error.message : "Failed to connect to email server");
      return false;
    } finally {
      setIsConnecting(false);
    }
  };
  
  const fetchEmails = async () => {
    if (!isConnected) {
      toast.error("Please connect to your email first");
      return;
    }
    
    setIsFetching(true);
    
    try {
      // In a real app, we would make another API call here
      // For now, we'll just use the emails we already have
      toast.success("Successfully fetched emails");
    } catch (error) {
      console.error("Error fetching emails:", error);
      toast.error("Failed to fetch emails");
    } finally {
      setIsFetching(false);
    }
  };
  
  return {
    emails,
    isConnecting,
    isFetching,
    isConnected,
    connectToEmail,
    fetchEmails
  };
};




