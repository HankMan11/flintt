
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReport: (reason: string, details: string) => void;
  type: "post" | "user";
}

export function ReportDialog({ open, onOpenChange, onReport, type }: ReportDialogProps) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = () => {
    if (!reason) return;
    onReport(reason, details);
    onOpenChange(false);
    setReason("");
    setDetails("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report {type}</DialogTitle>
          <DialogDescription>
            Please provide details about why you're reporting this {type}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <RadioGroup value={reason} onValueChange={setReason}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="harassment" id="harassment" />
              <Label htmlFor="harassment">Harassment or bullying</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="spam" id="spam" />
              <Label htmlFor="spam">Spam or misleading</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="inappropriate" id="inappropriate" />
              <Label htmlFor="inappropriate">Inappropriate content</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other">Other</Label>
            </div>
          </RadioGroup>
          <Textarea
            placeholder="Additional details..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!reason}>
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
