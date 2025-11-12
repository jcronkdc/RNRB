"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@cronkwaters/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@cronkwaters/ui/dialog";
import { Label } from "@cronkwaters/ui/label";
import { Input } from "@cronkwaters/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@cronkwaters/ui/select";
import { Textarea } from "@cronkwaters/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { createSplitAction } from "./actions";

interface SplitContributor {
  email: string;
  percentage: number;
  role: string;
}

export function NewSplitDialog({ 
  children, 
  orgId 
}: { 
  children: React.ReactNode;
  orgId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [songId, setSongId] = useState("");
  const [contributors, setContributors] = useState<SplitContributor[]>([
    { email: "", percentage: 100, role: "Writer" }
  ]);

  const handleAddContributor = () => {
    const remainingPercentage = 100 - contributors.reduce((sum, c) => sum + c.percentage, 0);
    setContributors([
      ...contributors,
      { email: "", percentage: remainingPercentage > 0 ? remainingPercentage : 0, role: "Writer" }
    ]);
  };

  const handleRemoveContributor = (index: number) => {
    setContributors(contributors.filter((_, i) => i !== index));
  };

  const handleContributorChange = (index: number, field: keyof SplitContributor, value: string | number) => {
    const updated = [...contributors];
    updated[index] = { ...updated[index]!, [field]: value };
    setContributors(updated);
  };

  const totalPercentage = contributors.reduce((sum, c) => sum + c.percentage, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (totalPercentage !== 100) {
      alert("Split percentages must total 100%");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await createSplitAction({
        songId,
        contributors
      });
      
      if (result.success) {
        setOpen(false);
        router.refresh();
      } else {
        alert(result.error || "Failed to create split");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Split Agreement</DialogTitle>
            <DialogDescription>
              Define ownership percentages and roles for this song
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="songId">Song</Label>
              <Input
                id="songId"
                placeholder="Enter song ID or select from list"
                value={songId}
                onChange={(e) => setSongId(e.target.value)}
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Contributors</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddContributor}
                  disabled={contributors.length >= 10}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Contributor
                </Button>
              </div>

              <div className="space-y-3">
                {contributors.map((contributor, index) => (
                  <div key={index} className="grid grid-cols-[1fr,100px,120px,40px] gap-2 items-center">
                    <Input
                      placeholder="Email address"
                      type="email"
                      value={contributor.email}
                      onChange={(e) => handleContributorChange(index, "email", e.target.value)}
                      required
                    />
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="%"
                      value={contributor.percentage}
                      onChange={(e) => handleContributorChange(index, "percentage", parseInt(e.target.value) || 0)}
                      required
                    />
                    <Select
                      value={contributor.role}
                      onValueChange={(value) => handleContributorChange(index, "role", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Writer">Writer</SelectItem>
                        <SelectItem value="Producer">Producer</SelectItem>
                        <SelectItem value="Performer">Performer</SelectItem>
                        <SelectItem value="Publisher">Publisher</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveContributor(index)}
                      disabled={contributors.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Total Allocation</span>
                <span className={`text-sm font-bold ${totalPercentage === 100 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalPercentage}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about this split agreement"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || totalPercentage !== 100}
            >
              {isSubmitting ? "Creating..." : "Create Split Agreement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
