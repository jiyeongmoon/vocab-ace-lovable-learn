
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const QuizCardEmpty: React.FC = () => {
  return (
    <Card className="w-full h-64 flex items-center justify-center">
      <CardContent className="text-center p-6">
        <h3 className="text-xl font-semibold mb-4">All Done! 🎉</h3>
        <p className="text-gray-600 mb-6">
          You've completed all your vocabulary cards.
        </p>
      </CardContent>
    </Card>
  );
};

export default QuizCardEmpty;
