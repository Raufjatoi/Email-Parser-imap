
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Email } from './EmailList';
import { AnalysisResult } from '@/hooks/useEmailAnalysis';

interface EmailAnalyticsProps {
  emails: Email[];
  analysisResults?: AnalysisResult[];
  isLoading: boolean;
}

interface EmailCategoryStat {
  name: string;
  value: number;
}

interface ImportanceBucket {
  name: string;
  count: number;
}

const EmailAnalytics: React.FC<EmailAnalyticsProps> = ({ 
  emails, 
  analysisResults = [],
  isLoading 
}) => {
  // If loading or no emails, show loading state
  if (isLoading || emails.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="w-full animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mt-1"></div>
            </CardHeader>
            <CardContent>
              <div className="h-40 bg-gray-100 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Process email data for charts
  const categoryStats = useMemo(() => {
    const categories = emails
      .flatMap(email => email.categories)
      .reduce((acc, category) => {
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});
    
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [emails]);

  // Create importance buckets
  const importanceBuckets = useMemo(() => {
    const buckets = [
      { name: 'High', count: 0 },
      { name: 'Medium', count: 0 },
      { name: 'Low', count: 0 }
    ];

    emails.forEach(email => {
      if (email.importance >= 70) buckets[0].count++;
      else if (email.importance >= 40) buckets[1].count++;
      else buckets[2].count++;
    });
    
    return buckets;
  }, [emails]);

  // Calculate sentiment distribution from analysis results
  const sentimentDistribution = useMemo(() => {
    const distribution = {
      Positive: 0,
      Neutral: 0,
      Negative: 0
    };
    
    analysisResults.forEach(result => {
      if (result.sentiment) {
        distribution[result.sentiment.label]++;
      }
    });
    
    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value }));
  }, [analysisResults]);

  // Generate data for sender frequency
  const senderFrequency = 
    Object.entries(emails
      .reduce((acc: Record<string, number>, email) => {
        const sender = email.from.split('@')[1] || email.from;
        acc[sender] = (acc[sender] || 0) + 1;
        return acc;
      }, {}))
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

  // Calculate average importance by time of day
  const timeOfDay = ['Morning', 'Afternoon', 'Evening', 'Night'];
  const importanceByTime = timeOfDay.map(time => {
    let totalImportance = 0;
    let count = 0;
    
    // In a real app, we would categorize by actual timestamp
    // Here we're just simulating with random distribution
    emails.forEach((email, index) => {
      if (index % 4 === timeOfDay.indexOf(time)) {
        totalImportance += email.importance;
        count++;
      }
    });
    
    return {
      name: time,
      average: count ? Math.round(totalImportance / count) : 0
    };
  });

  // Colors
  const COLORS = ['#8B0000', '#B22222', '#DC143C', '#FF0000', '#FF4500'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Email Categories</CardTitle>
          <CardDescription>Distribution of emails by category</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8B0000"
                dataKey="value"
              >
                {categoryStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Email Importance</CardTitle>
          <CardDescription>Distribution by importance level</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={importanceBuckets}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" name="Emails" fill="#8B0000" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Top Senders</CardTitle>
          <CardDescription>Most frequent email senders</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={senderFrequency} layout="vertical">
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={80} />
              <Tooltip />
              <Bar dataKey="value" name="Emails" fill="#8B0000" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Importance by Time</CardTitle>
          <CardDescription>Average importance score by time of day</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={importanceByTime}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="average" name="Avg. Importance" fill="#8B0000" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Email Sentiment</CardTitle>
          <CardDescription>Distribution of email sentiment</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sentimentDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8B0000"
                dataKey="value"
              >
                {sentimentDistribution.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.name === 'Positive' ? '#4CAF50' : entry.name === 'Negative' ? '#F44336' : '#FFC107'} 
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailAnalytics;

