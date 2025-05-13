
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export interface Email {
  id: string;
  from: string;
  subject: string;
  date: string;
  preview: string;
  importance: number; // 0-100
  readStatus: boolean;
  categories: string[];
}

interface EmailListProps {
  emails: Email[];
  onSelectEmail: (email: Email) => void;
  selectedEmailId: string | null;
  isLoading: boolean;
}

const EmailList: React.FC<EmailListProps> = ({ emails, onSelectEmail, selectedEmailId, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredEmails = emails.filter(email => 
    email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.preview.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getImportanceClass = (importance: number) => {
    if (importance >= 70) return 'importance-high';
    if (importance >= 40) return 'importance-medium';
    return 'importance-low';
  };
  
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center mb-2">
          <CardTitle>Emails</CardTitle>
          <Badge variant="outline">{emails.length}</Badge>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search emails..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto p-0">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? "No emails match your search" : "No emails to display"}
          </div>
        ) : (
          <div className="divide-y">
            {filteredEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => onSelectEmail(email)}
                className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                  selectedEmailId === email.id ? 'bg-accent' : ''
                } ${!email.readStatus ? 'font-medium' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="text-sm font-medium truncate w-3/4">{email.from}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(email.date).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="text-sm font-medium truncate mb-1">{email.subject}</div>
                
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground truncate w-3/4">
                    {email.preview}
                  </div>
                  <Badge className={getImportanceClass(email.importance)}>
                    {email.importance}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailList;
