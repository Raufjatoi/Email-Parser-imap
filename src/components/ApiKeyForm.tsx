
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ApiKeyFormProps {
  onSave: (apiKey: string) => void;
  isLoading: boolean;
}

const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onSave, isLoading }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSave(apiKey.trim());
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Groq API Configuration</CardTitle>
        <CardDescription>
          Enter your Groq API key to enable email analysis
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Groq API Key</Label>
              <Input
                id="apiKey"
                placeholder="Enter your Groq API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                type="password"
              />
              <p className="text-xs text-muted-foreground">
                Your API key is stored locally and is never sent to our servers
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading || !apiKey.trim()} className="w-full">
            {isLoading ? "Saving..." : "Save API Key"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ApiKeyForm;
