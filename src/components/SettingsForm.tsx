
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isOpenAIEnabled, setOpenAIEnabled } from "@/contexts/vocabUtils";
import { useEffect, useState } from "react";
import GoogleSheetsConfig from "./GoogleSheetsConfig";

const SettingsForm: React.FC = () => {
  const [apiKey, setApiKey] = useState("");
  const [openAIEnabled, setOpenAIEnabledState] = useState(isOpenAIEnabled());

  useEffect(() => {
    const storedApiKey = localStorage.getItem("openai-api-key") || "";
    setApiKey(storedApiKey);
  }, []);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  const saveApiKey = () => {
    localStorage.setItem("openai-api-key", apiKey);
    alert("API key saved successfully!");
  };

  const handleOpenAIToggle = () => {
    const newValue = !openAIEnabled;
    setOpenAIEnabledState(newValue);
    setOpenAIEnabled(newValue);
  };

  return (
    <Tabs defaultValue="openai" className="w-full">
      <TabsList className="grid grid-cols-2">
        <TabsTrigger value="openai">OpenAI Settings</TabsTrigger>
        <TabsTrigger value="googlesheets">Google Sheets</TabsTrigger>
      </TabsList>
      <TabsContent value="openai">
        <Card>
          <CardHeader>
            <CardTitle>OpenAI Integration</CardTitle>
            <CardDescription>
              Configure OpenAI to generate example sentences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch 
                id="openai-toggle" 
                checked={openAIEnabled}
                onCheckedChange={handleOpenAIToggle}
              />
              <Label htmlFor="openai-toggle">Enable OpenAI Integration</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apikey">OpenAI API Key</Label>
              <Input 
                id="apikey" 
                type="password" 
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder="sk-..." 
              />
            </div>
            
            <Button onClick={saveApiKey}>
              Save API Key
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="googlesheets">
        <GoogleSheetsConfig />
      </TabsContent>
    </Tabs>
  );
};

export default SettingsForm;
