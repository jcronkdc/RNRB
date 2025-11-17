"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Input,
  Label,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cronkwaters/ui";
import { Copy, CheckCircle, Link2, Globe, Lock, Clock } from "lucide-react";
import { generateShareLink } from "./actions";

export function ShareAssetDialog({ 
  children, 
  asset 
}: { 
  children: React.ReactNode;
  asset: any;
}) {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  
  // Share settings
  const [isPublic, setIsPublic] = useState(false);
  const [expiresIn, setExpiresIn] = useState("7days");
  const [allowDownload, setAllowDownload] = useState(true);

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    
    try {
      const result = await generateShareLink({
        assetId: asset.id,
        isPublic,
        expiresIn,
        allowDownload
      });
      
      if (result.success && result.shareUrl) {
        setShareLink(result.shareUrl);
      } else {
        alert(result.error || "Failed to generate share link");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setOpen(false);
    // Reset state after close
    setTimeout(() => {
      setShareLink("");
      setCopied(false);
      setIsPublic(false);
      setExpiresIn("7days");
      setAllowDownload(true);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Asset</DialogTitle>
          <DialogDescription>
            Generate a shareable link for "{asset.name}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {!shareLink ? (
            <>
              {/* Visibility Settings */}
              <div className="flex items-center justify-between">
                <Label htmlFor="public" className="flex items-center gap-2 cursor-pointer">
                  {isPublic ? (
                    <>
                      <Globe className="w-4 h-4" />
                      Public Link
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Private Link
                    </>
                  )}
                </Label>
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {isPublic 
                  ? "Anyone with the link can access this asset"
                  : "Only people you share this link with can access"}
              </p>

              {/* Expiration */}
              <div className="space-y-2">
                <Label htmlFor="expires">Link expires after</Label>
                <Select value={expiresIn} onValueChange={setExpiresIn}>
                  <SelectTrigger id="expires">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1hour">1 hour</SelectItem>
                    <SelectItem value="1day">1 day</SelectItem>
                    <SelectItem value="7days">7 days</SelectItem>
                    <SelectItem value="30days">30 days</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Download Permission */}
              <div className="flex items-center justify-between">
                <Label htmlFor="download" className="cursor-pointer">
                  Allow downloads
                </Label>
                <Switch
                  id="download"
                  checked={allowDownload}
                  onCheckedChange={setAllowDownload}
                />
              </div>

              {/* Generate Button */}
              <Button 
                onClick={handleGenerateLink}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 mr-2" />
                    Generate Share Link
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              {/* Share Link Display */}
              <div className="space-y-2">
                <Label>Share Link</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={shareLink}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Share Settings Summary */}
              <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {isPublic ? (
                    <Globe className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span>
                    {isPublic ? "Public access" : "Private access"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>
                    Expires {expiresIn === "never" ? "never" : `in ${expiresIn.replace(/(\d+)/, "$1 ")}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {allowDownload ? "✓" : "✗"}
                  <span>
                    {allowDownload ? "Downloads allowed" : "Downloads disabled"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShareLink("")}
                  className="flex-1"
                >
                  Generate New Link
                </Button>
                <Button
                  onClick={handleClose}
                  className="flex-1"
                >
                  Done
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
