
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface EmailConnectProps {
  onConnect: (config: EmailConfig) => Promise<boolean>;
  isConnecting: boolean;
}

export interface EmailConfig {
  email: string;
  password: string;
  imapHost: string;
  imapPort: number;
  useSSL: boolean;
}

const COMMON_PROVIDERS = [
  { name: "Gmail", host: "imap.gmail.com", port: 993, ssl: true },
  { name: "Outlook", host: "outlook.office365.com", port: 993, ssl: true },
  { name: "Yahoo", host: "imap.mail.yahoo.com", port: 993, ssl: true },
  { name: "Custom", host: "", port: 993, ssl: true }
];

const EmailConnect: React.FC<EmailConnectProps> = ({ onConnect, isConnecting }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedProvider, setSelectedProvider] = useState("Gmail");
  const [imapHost, setImapHost] = useState(COMMON_PROVIDERS[0].host);
  const [imapPort, setImapPort] = useState(COMMON_PROVIDERS[0].port.toString());
  const [useSSL, setUseSSL] = useState(COMMON_PROVIDERS[0].ssl);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleProviderChange = (providerName: string) => {
    setSelectedProvider(providerName);
    const provider = COMMON_PROVIDERS.find(p => p.name === providerName);
    if (provider) {
      setImapHost(provider.host);
      setImapPort(provider.port.toString());
      setUseSSL(provider.ssl);
      if (providerName === "Custom") {
        setShowAdvanced(true);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !imapHost || !imapPort) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const config: EmailConfig = {
        email,
        password,
        imapHost,
        imapPort: parseInt(imapPort, 10),
        useSSL
      };
      const success = await onConnect(config);
      if (success) {
        toast.success("Successfully connected to email account");
      }
    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Failed to connect to email account");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Connect Your Email</CardTitle>
        <CardDescription>
          Enter your email credentials to start analyzing your inbox
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                placeholder="your.email@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                placeholder="Your email password or app password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                For Gmail, you may need to use an App Password instead of your regular password.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="provider">Email Provider</Label>
              <Select value={selectedProvider} onValueChange={handleProviderChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_PROVIDERS.map((provider) => (
                    <SelectItem key={provider.name} value={provider.name}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {(showAdvanced || selectedProvider === "Custom") && (
              <div className="space-y-4 pt-2 border-t">
                <div className="space-y-2">
                  <Label htmlFor="imapHost">IMAP Host</Label>
                  <Input
                    id="imapHost"
                    placeholder="imap.example.com"
                    value={imapHost}
                    onChange={(e) => setImapHost(e.target.value)}
                    required={selectedProvider === "Custom"}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="imapPort">IMAP Port</Label>
                  <Input
                    id="imapPort"
                    placeholder="993"
                    value={imapPort}
                    onChange={(e) => setImapPort(e.target.value)}
                    required={selectedProvider === "Custom"}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button type="submit" disabled={isConnecting} className="w-full">
            {isConnecting ? "Connecting..." : "Connect to Email"}
          </Button>
          
          {selectedProvider !== "Custom" && (
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full text-xs"
            >
              {showAdvanced ? "Hide Advanced Settings" : "Show Advanced Settings"}
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
};

export default EmailConnect;
