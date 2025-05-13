
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import EmailConnect from '@/components/EmailConnect';
import EmailList, { Email } from '@/components/EmailList';
import EmailAnalytics from '@/components/EmailAnalytics';
import Footer from '@/components/Footer';
import { useEmailFetch } from '@/hooks/useEmailFetch';
import { useEmailAnalysis, AnalysisResult } from '@/hooks/useEmailAnalysis';
import { Mail, Info, Calendar, Clock } from "lucide-react";

const Index = () => {
  // Assume API key will be provided through environment variables
  const [activeTab, setActiveTab] = useState<string>("emails");
  const [allAnalysisResults, setAllAnalysisResults] = useState<AnalysisResult[]>([]);

  // Initialize hooks with API key from environment
  const { 
    emails, 
    isConnecting, 
    isFetching, 
    isConnected, 
    connectToEmail 
  } = useEmailFetch();
  
  const { 
    isAnalyzing, 
    selectedEmail, 
    analysisResult, 
    analyzeEmail 
  } = useEmailAnalysis();

  const handleEmailSelect = (email: Email) => {
    analyzeEmail(email).then(result => {
      if (result) {
        setAllAnalysisResults(prev => {
          // Remove any existing analysis for this email
          const filtered = prev.filter(r => r.emailId !== email.id);
          // Add the new analysis with the email ID
          return [...filtered, { ...result, emailId: email.id }];
        });
      }
    });
  };
  
  // Get sentiment badge color
  const getSentimentBadge = (sentiment: AnalysisResult['sentiment']) => {
    if (sentiment.label === 'Positive') {
      return <Badge className="bg-green-600">Positive</Badge>;
    } else if (sentiment.label === 'Negative') {
      return <Badge variant="destructive">Negative</Badge>;
    } else {
      return <Badge variant="outline">Neutral</Badge>;
    }
  };
  
  // Get priority badge color
  const getPriorityBadge = (priority: 'Low' | 'Medium' | 'High') => {
    if (priority === 'High') {
      return <Badge className="bg-darkRed-700">High</Badge>;
    } else if (priority === 'Medium') {
      return <Badge className="bg-darkRed-400">Medium</Badge>;
    } else {
      return <Badge className="bg-darkRed-100 text-darkRed-700">Low</Badge>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="container py-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Email Parsing</h1>
              <p className="text-muted-foreground">Using IMAP for emails</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Email Connection & List Panel */}
              <div className="lg:col-span-1 space-y-6">
                {/* Email Connection Panel */}
                {!isConnected && (
                  <EmailConnect 
                    onConnect={connectToEmail} 
                    isConnecting={isConnecting}
                  />
                )}
                
                {/* Email List Panel */}
                {isConnected && (
                  <EmailList 
                    emails={emails} 
                    onSelectEmail={handleEmailSelect}
                    selectedEmailId={selectedEmail?.id || null}
                    isLoading={isFetching}
                  />
                )}
              </div>
              
              {/* Main Content Panel */}
              <div className="lg:col-span-2 space-y-6">
                {isConnected ? (
                  <>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid grid-cols-2">
                        <TabsTrigger value="emails">Email Analysis</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="emails" className="space-y-6 mt-6">
                        {selectedEmail ? (
                          <Card>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle>{selectedEmail.subject}</CardTitle>
                                  <CardDescription className="mt-1">
                                    From: {selectedEmail.from}
                                  </CardDescription>
                                </div>
                                <Badge 
                                  className={`importance-${selectedEmail.importance >= 70 ? 'high' : selectedEmail.importance >= 40 ? 'medium' : 'low'}`}
                                >
                                  {selectedEmail.importance}% Important
                                </Badge>
                              </div>
                            </CardHeader>
                            
                            <CardContent>
                              {isAnalyzing ? (
                                <div className="space-y-4 animate-pulse">
                                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                </div>
                              ) : analysisResult ? (
                                <div className="space-y-6">
                                  {/* Summary */}
                                  <div>
                                    <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                                      <Info className="h-5 w-5 text-darkRed-700" />
                                      <span>Summary</span>
                                    </h3>
                                    <p className="text-muted-foreground">
                                      {analysisResult.summary}
                                    </p>
                                  </div>
                                  
                                  <Separator />
                                  
                                  {/* Key Insights */}
                                  <div>
                                    <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                                      <Mail className="h-5 w-5 text-darkRed-700" />
                                      <span>Key Insights</span>
                                    </h3>
                                    <ul className="space-y-2">
                                      {analysisResult.keyInsights.map((insight, i) => (
                                        <li key={i} className="flex items-center justify-between">
                                          <span>{insight.text}</span>
                                          <Badge variant="outline">
                                            {insight.confidence}% confident
                                          </Badge>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  
                                  <Separator />
                                  
                                  {/* Sentiment & Topics */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h3 className="text-lg font-medium mb-2">Sentiment</h3>
                                      <div className="flex items-center gap-2">
                                        {getSentimentBadge(analysisResult.sentiment)}
                                        <span className="text-sm text-muted-foreground">
                                          Score: {analysisResult.sentiment.score}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h3 className="text-lg font-medium mb-2">Topics</h3>
                                      <div className="flex flex-wrap gap-2">
                                        {analysisResult.topicClassification.map((topic, i) => (
                                          <Badge key={i} variant="outline">{topic}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <Separator />
                                  
                                  {/* Action Items */}
                                  {analysisResult.actionItems.length > 0 && (
                                    <div>
                                      <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                                        <Calendar className="h-5 w-5 text-darkRed-700" />
                                        <span>Action Items</span>
                                      </h3>
                                      <ul className="space-y-2">
                                        {analysisResult.actionItems.map((item, i) => (
                                          <li key={i} className="flex items-center justify-between">
                                            <span>{item.text}</span>
                                            {getPriorityBadge(item.priority)}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  <Separator />
                                  
                                  {/* Entities */}
                                  <div>
                                    <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                                      <Clock className="h-5 w-5 text-darkRed-700" />
                                      <span>Entities Mentioned</span>
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {analysisResult.entities.map((entity, i) => (
                                        <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                          <span className="font-medium">{entity.name}</span>
                                          <Badge variant="outline" className="text-xs">
                                            {entity.type}
                                          </Badge>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-12">
                                  <p className="text-muted-foreground">
                                    Select an email from the list to see its analysis
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ) : (
                          <div className="flex items-center justify-center h-64">
                            <div className="text-center space-y-3">
                              <Mail className="h-12 w-12 mx-auto text-muted-foreground" />
                              <h3 className="text-lg font-medium">No Email Selected</h3>
                              <p className="text-muted-foreground">
                                Select an email from the list to view its analysis
                              </p>
                            </div>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="analytics" className="mt-6">
                        <EmailAnalytics 
                          emails={emails}
                          analysisResults={allAnalysisResults}
                          isLoading={isFetching}
                        />
                      </TabsContent>
                    </Tabs>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center space-y-3">
                      <Mail className="h-12 w-12 mx-auto text-muted-foreground" />
                      <h3 className="text-lg font-medium">Connect Your Email</h3>
                      <p className="text-muted-foreground">
                        Connect your email account to start analyzing your inbox
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;

