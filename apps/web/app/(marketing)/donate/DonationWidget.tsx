"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@cronkwaters/ui/button";
import { Input } from "@cronkwaters/ui/input";
import { Label } from "@cronkwaters/ui/label";
import { RadioGroup, RadioGroupItem } from "@cronkwaters/ui/radio-group";
import { Checkbox } from "@cronkwaters/ui/checkbox";
import { Textarea } from "@cronkwaters/ui/textarea";
import { CreditCard, Heart, Lock, CheckCircle } from "lucide-react";
import { processDonation } from "./actions";

const PRESET_AMOUNTS = [25, 50, 100, 250, 500, 1000];

interface DonationWidgetProps {
  userId?: string;
}

export function DonationWidget({ userId }: DonationWidgetProps) {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [frequency, setFrequency] = useState<"once" | "monthly">("once");
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [coverFees, setCoverFees] = useState(true);

  // Form fields
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState("");

  const finalAmount = customAmount ? parseInt(customAmount) : amount;
  const feeAmount = coverFees ? Math.ceil(finalAmount * 0.029 + 0.30) : 0;
  const totalAmount = finalAmount + feeAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name || finalAmount < 1) {
      alert("Please fill in all required fields");
      return;
    }

    setIsProcessing(true);

    try {
      const result = await processDonation({
        amount: totalAmount * 100, // Convert to cents
        frequency,
        email,
        name,
        anonymous,
        message,
        coverFees,
        userId
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.refresh();
        }, 3000);
      } else {
        alert(result.error || "Donation failed");
      }
    } catch (error) {
      alert("An error occurred processing your donation");
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold mb-2">Thank you for your donation!</h3>
        <p className="text-muted-foreground">
          Your support means the world to us and the artists we serve.
        </p>
      </div>
    );
  }

  return (
    <form id="donation-form" onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* Frequency Selection */}
      <div>
        <Label className="text-base mb-3">How often would you like to give?</Label>
        <RadioGroup value={frequency} onValueChange={(v) => setFrequency(v as "once" | "monthly")}>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <label 
              className={`flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                frequency === "once" ? "border-purple-500 bg-purple-50" : "border-gray-200"
              }`}
            >
              <RadioGroupItem value="once" className="sr-only" />
              <span className="font-medium">One time</span>
            </label>
            <label 
              className={`flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                frequency === "monthly" ? "border-purple-500 bg-purple-50" : "border-gray-200"
              }`}
            >
              <RadioGroupItem value="monthly" className="sr-only" />
              <span className="font-medium">Monthly</span>
            </label>
          </div>
        </RadioGroup>
      </div>

      {/* Amount Selection */}
      <div>
        <Label className="text-base mb-3">Select or enter amount</Label>
        <div className="grid grid-cols-3 gap-3">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setAmount(preset);
                setCustomAmount("");
              }}
              className={`p-4 rounded-lg border-2 font-medium transition-colors ${
                amount === preset && !customAmount
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              ${preset}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <Label htmlFor="custom-amount" className="sr-only">Custom amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <Input
              id="custom-amount"
              type="number"
              min="1"
              placeholder="Enter custom amount"
              className="pl-8"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Cover Fees */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
        <Checkbox
          id="cover-fees"
          checked={coverFees}
          onCheckedChange={(checked) => setCoverFees(checked as boolean)}
        />
        <div className="flex-1">
          <Label htmlFor="cover-fees" className="font-medium cursor-pointer">
            I'd like to cover the transaction fees
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            Add ${feeAmount.toFixed(2)} to help cover processing fees so 100% of your donation goes to the foundation.
          </p>
        </div>
      </div>

      {/* Donor Information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email address *</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
          />
        </div>
        
        <div>
          <Label htmlFor="name">Full name *</Label>
          <Input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
          />
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            id="anonymous"
            checked={anonymous}
            onCheckedChange={(checked) => setAnonymous(checked as boolean)}
          />
          <Label htmlFor="anonymous" className="cursor-pointer">
            Make my donation anonymous
          </Label>
        </div>

        <div>
          <Label htmlFor="message">Leave a message (optional)</Label>
          <Textarea
            id="message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share why you're supporting CronkWaters Foundation..."
          />
        </div>
      </div>

      {/* Summary */}
      <div className="border-t pt-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Donation amount</span>
            <span className="font-medium">${finalAmount.toFixed(2)}</span>
          </div>
          {coverFees && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction fees</span>
              <span className="font-medium">${feeAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold pt-2 border-t">
            <span>Total</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
          {frequency === "monthly" && (
            <p className="text-xs text-muted-foreground pt-2">
              You will be charged ${totalAmount.toFixed(2)} every month
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isProcessing || finalAmount < 1}
      >
        {isProcessing ? (
          <>Processing...</>
        ) : (
          <>
            <Heart className="w-4 h-4 mr-2" />
            Donate ${totalAmount.toFixed(2)} {frequency === "monthly" ? "monthly" : "now"}
          </>
        )}
      </Button>

      {/* Security Notice */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Lock className="w-3 h-3" />
        <span>Your payment information is secure and encrypted</span>
      </div>
    </form>
  );
}
