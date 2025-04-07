
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useGoogleSheets } from "@/hooks/useGoogleSheets";

const GoogleSheetsConfig: React.FC = () => {
  const { isConfigured, configureGoogleSheets, getConfig } = useGoogleSheets();
  const [deploymentUrl, setDeploymentUrl] = useState("");
  const [sheetName, setSheetName] = useState("");

  useEffect(() => {
    const config = getConfig();
    if (config) {
      setDeploymentUrl(config.deploymentUrl);
      setSheetName(config.sheetName);
    }
  }, [getConfig]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    configureGoogleSheets(deploymentUrl, sheetName);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Google Sheets Integration</CardTitle>
        <CardDescription>
          Configure your Google Apps Script deployment to save quiz results
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSave}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deploymentUrl">Google Apps Script Deployment URL</Label>
            <Input
              id="deploymentUrl"
              placeholder="https://script.google.com/macros/s/..."
              value={deploymentUrl}
              onChange={(e) => setDeploymentUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Your script must be deployed as a web app with "Anyone" access
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sheetName">Default Sheet Name</Label>
            <Input
              id="sheetName"
              placeholder="e.g., word 0403"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The sheet name to save results to (can be changed for each submission)
            </p>
          </div>
          <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-900 border border-amber-200">
            <h4 className="font-semibold">Google Apps Script Setup:</h4>
            <ol className="list-decimal list-outside ml-5 mt-2 space-y-1">
              <li>Create a new Google Apps Script in your Google Drive</li>
              <li>Copy the Apps Script code provided in the documentation</li>
              <li>Deploy as web app with "Anyone, even anonymous" access</li>
              <li>Copy the deployment URL and paste it here</li>
            </ol>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">
            {isConfigured ? "Update Configuration" : "Save Configuration"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default GoogleSheetsConfig;
