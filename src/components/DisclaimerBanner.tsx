import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export const DisclaimerBanner = () => {
  return (
    <Alert className="border-secondary bg-secondary/10">
      <AlertTriangle className="h-4 w-4 text-secondary" />
      <AlertDescription className="text-sm">
        <strong>Important Disclaimer:</strong> This application provides predictions for educational and entertainment purposes only. 
        Lottery draws are completely random events. Past results do not influence future outcomes. 
        Please play responsibly and within your means. This is not financial advice.
      </AlertDescription>
    </Alert>
  );
};
