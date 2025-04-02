
import React from "react";
import Dashboard from "@/components/Dashboard";
import { VocabProvider } from "@/contexts/VocabContext";

const Index = () => {
  return (
    <VocabProvider>
      <div className="min-h-screen bg-gray-50">
        <Dashboard />
      </div>
    </VocabProvider>
  );
};

export default Index;
