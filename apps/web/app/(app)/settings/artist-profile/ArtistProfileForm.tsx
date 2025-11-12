'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  Plus, 
  X, 
  Music, 
  Users, 
  Award, 
  Globe,
  Instagram,
  Twitter,
  Youtube,
  Link2
} from 'lucide-react';
import { Button } from '@songforge/ui';
import { Input } from '@songforge/ui';
import { Textarea } from '@songforge/ui';
import { Label } from '@songforge/ui';
import { Card } from '@songforge/ui';
import { Badge } from '@songforge/ui';
import { useToast } from '@songforge/ui';
import { updateOrgProfileAction } from '@/lib/actions/artistProfile';
import type { Org, BandMember, Award } from '@prisma/client';

interface ArtistProfileFormProps {
  org: Org & {
    bandMembers: BandMember[];
    awards: Award[];
  };
}

export function ArtistProfileForm({ org }: ArtistProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    bio: org.bio || '',
    location: org.location || '',
    genre: org.genre || [],
    influences: org.influences || [],
    founded: org.founded || '',
    contactEmail: org.contactEmail || '',
    bookingEmail: org.bookingEmail || '',
    website: org.website || '',
    socialLinks: (org.socialLinks as Record<string, string>) || {},
    spotifyArtistId: org.spotifyArtistId || '',
    appleMusicId: org.appleMusicId || '',
  });

  const [genreInput, setGenreInput] = useState('');
  const [influenceInput, setInfluenceInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataObj = new FormData();
      
      // Add all fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formDataObj.append(key, JSON.stringify(value));
        } else if (typeof value === 'object') {
          formDataObj.append(key, JSON.stringify(value));
        } else {
          formDataObj.append(key, String(value));
        }
      });

      await updateOrgProfileAction(formDataObj);
      
      toast({
        title: 'Profile updated!',
        description: 'Your artist profile has been saved.',
      });

      router.refresh();
    } catch (error) {
      toast({
        title: 'Error updating profile',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addGenre = () => {
    if (genreInput.trim() && !formData.genre.includes(genreInput.trim())) {
      setFormData(prev => ({
        ...prev,
        genre: [...prev.genre, genreInput.trim()],
      }));
      setGenreInput('');
    }
  };

  const removeGenre = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genre: prev.genre.filter(g => g !== genre),
    }));
  };

  const addInfluence = () => {
    if (influenceInput.trim() && !formData.influences.includes(influenceInput.trim())) {
      setFormData(prev => ({
        ...prev,
        influences: [...prev.influences, influenceInput.trim()],
      }));
      setInfluenceInput('');
    }
  };

  const removeInfluence = (influence: string) => {
    setFormData(prev => ({
      ...prev,
      influences: prev.influences.filter(i => i !== influence),
    }));
  };

  const updateSocialLink = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card className="p-6">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
          <Music className="h-5 w-5" />
          Basic Information
        </h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="bio">Biography</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={6}
              placeholder="Tell your story..."
              className="mt-2"
            />
            <p className="mt-1 text-sm text-muted-foreground">
              A compelling bio helps fans and industry professionals understand your journey
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Los Angeles, CA"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="founded">Year Founded</Label>
              <Input
                id="founded"
                type="number"
                value={formData.founded}
                onChange={(e) => setFormData(prev => ({ ...prev, founded: e.target.value }))}
                placeholder="2020"
                min="1900"
                max={new Date().getFullYear()}
                className="mt-2"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Genres & Influences */}
      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold">Genres & Influences</h2>

        <div className="space-y-4">
          <div>
            <Label>Musical Genres</Label>
            <div className="mt-2 flex gap-2">
              <Input
                value={genreInput}
                onChange={(e) => setGenreInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGenre())}
                placeholder="Add a genre"
              />
              <Button type="button" onClick={addGenre} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.genre.map((genre) => (
                <Badge key={genre} variant="outline" className="gap-1 pl-3">
                  {genre}
                  <button
                    type="button"
                    onClick={() => removeGenre(genre)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Musical Influences</Label>
            <div className="mt-2 flex gap-2">
              <Input
                value={influenceInput}
                onChange={(e) => setInfluenceInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInfluence())}
                placeholder="Add an influence"
              />
              <Button type="button" onClick={addInfluence} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.influences.map((influence) => (
                <Badge key={influence} variant="outline" className="gap-1 pl-3">
                  {influence}
                  <button
                    type="button"
                    onClick={() => removeInfluence(influence)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Contact Information */}
      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold">Contact Information</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="contactEmail">General Contact Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
              placeholder="contact@band.com"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="bookingEmail">Booking Email</Label>
            <Input
              id="bookingEmail"
              type="email"
              value={formData.bookingEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, bookingEmail: e.target.value }))}
              placeholder="booking@band.com"
              className="mt-2"
            />
          </div>
        </div>
      </Card>

      {/* Social Links & Streaming */}
      <Card className="p-6">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
          <Globe className="h-5 w-5" />
          Online Presence
        </h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://yourband.com"
              className="mt-2"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="instagram">
                <Instagram className="mr-2 inline h-4 w-4" />
                Instagram
              </Label>
              <Input
                id="instagram"
                value={formData.socialLinks.instagram || ''}
                onChange={(e) => updateSocialLink('instagram', e.target.value)}
                placeholder="@yourbandname"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="twitter">
                <Twitter className="mr-2 inline h-4 w-4" />
                Twitter
              </Label>
              <Input
                id="twitter"
                value={formData.socialLinks.twitter || ''}
                onChange={(e) => updateSocialLink('twitter', e.target.value)}
                placeholder="@yourbandname"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="youtube">
                <Youtube className="mr-2 inline h-4 w-4" />
                YouTube
              </Label>
              <Input
                id="youtube"
                value={formData.socialLinks.youtube || ''}
                onChange={(e) => updateSocialLink('youtube', e.target.value)}
                placeholder="youtube.com/c/yourband"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="tiktok">
                <Link2 className="mr-2 inline h-4 w-4" />
                TikTok
              </Label>
              <Input
                id="tiktok"
                value={formData.socialLinks.tiktok || ''}
                onChange={(e) => updateSocialLink('tiktok', e.target.value)}
                placeholder="@yourbandname"
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="spotify">Spotify Artist ID</Label>
              <Input
                id="spotify"
                value={formData.spotifyArtistId}
                onChange={(e) => setFormData(prev => ({ ...prev, spotifyArtistId: e.target.value }))}
                placeholder="22bE4uQ6baNwSHPVcDxLCa"
                className="mt-2"
              />
              <p className="mt-1 text-sm text-muted-foreground">
                Found in your Spotify artist URL
              </p>
            </div>

            <div>
              <Label htmlFor="appleMusic">Apple Music ID</Label>
              <Input
                id="appleMusic"
                value={formData.appleMusicId}
                onChange={(e) => setFormData(prev => ({ ...prev, appleMusicId: e.target.value }))}
                placeholder="1234567890"
                className="mt-2"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Band Members */}
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Users className="h-5 w-5" />
            Band Members
          </h2>
          <Button type="button" variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>

        {org.bandMembers.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No band members added yet
          </p>
        ) : (
          <div className="space-y-3">
            {org.bandMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <h4 className="font-medium">{member.name}</h4>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
                <Button type="button" variant="ghost" size="sm">
                  Edit
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Awards & Recognition */}
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Award className="h-5 w-5" />
            Awards & Recognition
          </h2>
          <Button type="button" variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Award
          </Button>
        </div>

        {org.awards.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No awards added yet
          </p>
        ) : (
          <div className="space-y-3">
            {org.awards.map((award) => (
              <div
                key={award.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <h4 className="font-medium">{award.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {award.organization} • {award.year}
                  </p>
                </div>
                <Button type="button" variant="ghost" size="sm">
                  Edit
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
}
