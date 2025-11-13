'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  ChevronRight, 
  Home, 
  FolderOpen, 
  Music, 
  FileAudio, 
  Users, 
  FileText, 
  Calendar,
  BarChart,
  Settings,
  Search,
  MessageSquare,
  Download,
  Share2,
  Lock,
  Palette,
  Smartphone,
  Zap,
  HelpCircle,
  ArrowRight,
  CheckCircle,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@cronkwaters/ui';
import Link from 'next/link';

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  subsections?: {
    id: string;
    title: string;
    content: React.ReactNode;
  }[];
}

const sections: Section[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Home,
    subsections: [
      {
        id: 'welcome',
        title: 'Welcome to CronkWaters',
        content: (
          <div className="space-y-4">
            <p>CronkWaters is a collaborative music creation platform designed for musicians, producers, and creative teams. Our platform helps you manage projects, collaborate in real-time, track rights and royalties, and bring your musical ideas to life.</p>
            
            <div className="rounded-lg bg-brand-primary/10 p-4">
              <h4 className="font-semibold mb-2">Key Features:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Project management for albums, EPs, and singles</li>
                <li>• Real-time collaboration tools</li>
                <li>• Asset management and version control</li>
                <li>• Split sheets and rights management</li>
                <li>• Studio session scheduling</li>
                <li>• Analytics and insights</li>
              </ul>
            </div>
          </div>
        )
      },
      {
        id: 'first-login',
        title: 'Your First Login',
        content: (
          <div className="space-y-4">
            <p>When you first visit CronkWaters, you'll need to create an account or sign in:</p>
            
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-primary/20 rounded-full flex items-center justify-center text-sm">1</span>
                <div>
                  <strong>Click "Sign In"</strong> on the homepage or navigate to <code className="bg-muted px-2 py-1 rounded text-sm">/auth</code>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-primary/20 rounded-full flex items-center justify-center text-sm">2</span>
                <div>
                  <strong>Choose your sign-in method:</strong>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>• Email and password</li>
                    <li>• Google account (if configured)</li>
                    <li>• GitHub account (if configured)</li>
                  </ul>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-primary/20 rounded-full flex items-center justify-center text-sm">3</span>
                <div>
                  <strong>Create or join an organization</strong> - This is your workspace where all projects and collaborators live
                </div>
              </li>
            </ol>

            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm"><strong>Note:</strong> If you're invited to an existing organization, you'll receive an invite code to join.</p>
            </div>
          </div>
        )
      },
      {
        id: 'navigation',
        title: 'Navigating the Platform',
        content: (
          <div className="space-y-4">
            <p>CronkWaters uses a sidebar navigation system that's always accessible:</p>
            
            <div className="space-y-3">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Main Navigation Items:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <BarChart className="w-4 h-4 text-brand-primary" />
                    <strong>Dashboard</strong> - Your personal overview and recent activity
                  </li>
                  <li className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-brand-primary" />
                    <strong>Projects</strong> - All your music projects in one place
                  </li>
                  <li className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-primary" />
                    <strong>Sessions</strong> - Studio bookings and schedules
                  </li>
                  <li className="flex items-center gap-2">
                    <FileAudio className="w-4 h-4 text-brand-primary" />
                    <strong>Assets</strong> - File library and uploads
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand-primary" />
                    <strong>Splits</strong> - Rights and royalty management
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart className="w-4 h-4 text-brand-primary" />
                    <strong>Analytics</strong> - Insights and statistics
                  </li>
                  <li className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-brand-primary" />
                    <strong>Settings</strong> - Account and preferences
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-brand-primary/10 rounded-lg">
                <h4 className="font-semibold mb-2">Quick Actions:</h4>
                <p className="text-sm">Press <kbd className="px-2 py-1 bg-white dark:bg-black rounded">⌘K</kbd> (Mac) or <kbd className="px-2 py-1 bg-white dark:bg-black rounded">Ctrl+K</kbd> (PC) to open the command palette for quick navigation.</p>
              </div>
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: 'projects',
    title: 'Projects',
    icon: FolderOpen,
    subsections: [
      {
        id: 'creating-projects',
        title: 'Creating Your First Project',
        content: (
          <div className="space-y-4">
            <p>Projects are the heart of CronkWaters. Each project represents an album, EP, single, or any musical work.</p>
            
            <h4 className="font-semibold">To create a project:</h4>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-primary/20 rounded-full flex items-center justify-center text-sm">1</span>
                <div>
                  <strong>Click "New Project"</strong> on the Projects page or press <kbd className="px-2 py-1 bg-muted rounded text-sm">N</kbd> while on the Projects page
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-primary/20 rounded-full flex items-center justify-center text-sm">2</span>
                <div>
                  <strong>Enter project details:</strong>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>• <strong>Name</strong> - Your project title</li>
                    <li>• <strong>Description</strong> - Brief overview (optional)</li>
                    <li>• <strong>Cover Image</strong> - Visual identity (optional)</li>
                    <li>• <strong>Visibility</strong> - Private, Organization, or Public</li>
                  </ul>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-primary/20 rounded-full flex items-center justify-center text-sm">3</span>
                <div>
                  <strong>Click "Create Project"</strong> - You'll be taken to your new project dashboard
                </div>
              </li>
            </ol>

            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-semibold mb-2">✨ Success Celebration</h4>
              <p className="text-sm">When you create your first project, you'll see a confetti animation celebrating this milestone!</p>
            </div>
          </div>
        )
      },
      {
        id: 'project-dashboard',
        title: 'Project Dashboard',
        content: (
          <div className="space-y-4">
            <p>Each project has its own dashboard with multiple tabs:</p>
            
            <div className="space-y-3">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">Project Tabs:</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 font-medium">
                      <Music className="w-4 h-4" />
                      Songs Tab
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Manage all tracks in your project. Add new songs, set tempo/key, and track progress.</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 font-medium">
                      <FileAudio className="w-4 h-4" />
                      Assets Tab
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Upload and organize audio files, lyrics, artwork, and other project files.</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 font-medium">
                      <Users className="w-4 h-4" />
                      Splits Tab
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Define ownership percentages and manage royalty distributions.</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 font-medium">
                      <FileText className="w-4 h-4" />
                      Licenses Tab
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Create and manage licensing agreements for your music.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold mb-2">💡 Pro Tip</h4>
              <p className="text-sm">Use the activity feed on the right side to see recent changes and collaborator actions in real-time.</p>
            </div>
          </div>
        )
      },
      {
        id: 'managing-songs',
        title: 'Managing Songs',
        content: (
          <div className="space-y-4">
            <p>Songs are the individual tracks within your project. Here's how to manage them:</p>
            
            <h4 className="font-semibold">Adding a Song:</h4>
            <ol className="space-y-2 text-sm">
              <li>1. Go to your project's Songs tab</li>
              <li>2. Click "Add Song" or press <kbd className="px-2 py-1 bg-muted rounded">A</kbd></li>
              <li>3. Enter song details:
                <ul className="ml-4 mt-1 space-y-1 text-muted-foreground">
                  <li>• Title (required)</li>
                  <li>• Key (e.g., C major, A minor)</li>
                  <li>• Tempo (BPM)</li>
                  <li>• Time signature</li>
                </ul>
              </li>
              <li>4. Click "Create Song"</li>
            </ol>

            <h4 className="font-semibold mt-6">Song Actions:</h4>
            <ul className="space-y-2 text-sm">
              <li>• <strong>Edit Details</strong> - Update title, key, tempo</li>
              <li>• <strong>Upload Audio</strong> - Attach demo or final versions</li>
              <li>• <strong>Add Lyrics</strong> - Store song lyrics</li>
              <li>• <strong>Set Status</strong> - Track progress (Demo, Production, Mixed, Mastered)</li>
              <li>• <strong>Assign Splits</strong> - Define writer/producer percentages</li>
            </ul>
          </div>
        )
      }
    ]
  },
  {
    id: 'collaboration',
    title: 'Collaboration',
    icon: Users,
    subsections: [
      {
        id: 'inviting-collaborators',
        title: 'Inviting Collaborators',
        content: (
          <div className="space-y-4">
            <p>CronkWaters is built for collaboration. Here's how to work with others:</p>
            
            <h4 className="font-semibold">To invite collaborators:</h4>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-primary/20 rounded-full flex items-center justify-center text-sm">1</span>
                <div>
                  <strong>Organization Level:</strong>
                  <p className="text-sm text-muted-foreground mt-1">Go to Settings → Organization → Invite Members. Share the invite code with collaborators.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-primary/20 rounded-full flex items-center justify-center text-sm">2</span>
                <div>
                  <strong>Project Level:</strong>
                  <p className="text-sm text-muted-foreground mt-1">In your project settings, manage who has access and their permissions.</p>
                </div>
              </li>
            </ol>

            <div className="mt-4 p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Permission Levels:</h4>
              <ul className="space-y-2 text-sm">
                <li><strong>Owner</strong> - Full control, can delete project</li>
                <li><strong>Admin</strong> - Can edit everything except delete</li>
                <li><strong>Member</strong> - Can add/edit content</li>
                <li><strong>Viewer</strong> - Read-only access</li>
              </ul>
            </div>
          </div>
        )
      },
      {
        id: 'comments-feedback',
        title: 'Comments & Feedback',
        content: (
          <div className="space-y-4">
            <p>Communication is key to great collaboration. Use comments to provide feedback and discuss ideas:</p>
            
            <h4 className="font-semibold">Where to comment:</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 mt-0.5 text-brand-primary" />
                <div>
                  <strong>Project Comments</strong>
                  <p className="text-sm text-muted-foreground">General project discussions and updates</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 mt-0.5 text-brand-primary" />
                <div>
                  <strong>Song Comments</strong>
                  <p className="text-sm text-muted-foreground">Specific feedback on individual tracks</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 mt-0.5 text-brand-primary" />
                <div>
                  <strong>Asset Comments</strong>
                  <p className="text-sm text-muted-foreground">Discuss specific files or versions</p>
                </div>
              </li>
            </ul>

            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h4 className="font-semibold mb-2">Comment Features:</h4>
              <ul className="space-y-1 text-sm">
                <li>• @mention collaborators to notify them</li>
                <li>• Mark comments as resolved</li>
                <li>• Reply to create threaded discussions</li>
                <li>• Attach files or links</li>
              </ul>
            </div>
          </div>
        )
      },
      {
        id: 'real-time-activity',
        title: 'Real-time Activity',
        content: (
          <div className="space-y-4">
            <p>Stay updated with what's happening in your projects:</p>
            
            <h4 className="font-semibold">Activity Feed</h4>
            <p className="text-sm text-muted-foreground mb-4">The activity feed shows real-time updates from your organization:</p>
            
            <ul className="space-y-2 text-sm">
              <li>• New projects created</li>
              <li>• Songs added or updated</li>
              <li>• Files uploaded</li>
              <li>• Splits defined</li>
              <li>• Comments posted</li>
              <li>• Team members joined</li>
            </ul>

            <div className="mt-4 p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Notifications</h4>
              <p className="text-sm">You'll receive notifications for:</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• @mentions in comments</li>
                <li>• Changes to your splits</li>
                <li>• New collaborator invites</li>
                <li>• Project milestones</li>
              </ul>
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: 'assets',
    title: 'Assets & Files',
    icon: FileAudio,
    subsections: [
      {
        id: 'uploading-files',
        title: 'Uploading Files',
        content: (
          <div className="space-y-4">
            <p>CronkWaters supports various file types for your music projects:</p>
            
            <h4 className="font-semibold">Supported File Types:</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 border rounded-lg">
                <strong className="block mb-2">Audio</strong>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• WAV (recommended)</li>
                  <li>• MP3</li>
                  <li>• AIFF</li>
                  <li>• FLAC</li>
                </ul>
              </div>
              <div className="p-3 border rounded-lg">
                <strong className="block mb-2">Documents</strong>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• TXT (lyrics)</li>
                  <li>• PDF (contracts)</li>
                  <li>• Images (artwork)</li>
                  <li>• Videos</li>
                </ul>
              </div>
            </div>

            <h4 className="font-semibold mt-6">How to Upload:</h4>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-primary/20 rounded-full flex items-center justify-center text-sm">1</span>
                <div>
                  <strong>Drag & Drop</strong>
                  <p className="text-sm text-muted-foreground">Drag files directly onto the upload area</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-primary/20 rounded-full flex items-center justify-center text-sm">2</span>
                <div>
                  <strong>Click to Browse</strong>
                  <p className="text-sm text-muted-foreground">Click the upload area to select files from your computer</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-primary/20 rounded-full flex items-center justify-center text-sm">3</span>
                <div>
                  <strong>Batch Upload</strong>
                  <p className="text-sm text-muted-foreground">Upload up to 10 files at once</p>
                </div>
              </li>
            </ol>

            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-semibold mb-2">✅ Upload Features</h4>
              <ul className="space-y-1 text-sm">
                <li>• Automatic checksum generation for file integrity</li>
                <li>• Version control - upload new versions without losing old ones</li>
                <li>• Secure cloud storage</li>
                <li>• Preview before confirming upload</li>
              </ul>
            </div>
          </div>
        )
      },
      {
        id: 'managing-versions',
        title: 'Version Control',
        content: (
          <div className="space-y-4">
            <p>Keep track of different versions of your files:</p>
            
            <h4 className="font-semibold">Version Management:</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                <div>
                  <strong>Automatic Versioning</strong>
                  <p className="text-sm text-muted-foreground">Each upload creates a new version automatically</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                <div>
                  <strong>Version History</strong>
                  <p className="text-sm text-muted-foreground">View all previous versions of a file</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                <div>
                  <strong>Restore Previous Versions</strong>
                  <p className="text-sm text-muted-foreground">Rollback to any previous version if needed</p>
                </div>
              </li>
            </ul>

            <div className="mt-4 p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Version Naming:</h4>
              <p className="text-sm text-muted-foreground mb-2">Use descriptive names for versions:</p>
              <ul className="space-y-1 text-sm">
                <li>• "Demo_v1"</li>
                <li>• "Rough_Mix_2024-01-15"</li>
                <li>• "Final_Master_Approved"</li>
                <li>• "Radio_Edit"</li>
              </ul>
            </div>
          </div>
        )
      },
      {
        id: 'sharing-files',
        title: 'Sharing & Downloads',
        content: (
          <div className="space-y-4">
            <p>Share your music and collaborate effectively:</p>
            
            <h4 className="font-semibold">Sharing Options:</h4>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 font-medium mb-2">
                  <Share2 className="w-4 h-4" />
                  Private Share
                </div>
                <p className="text-sm text-muted-foreground">Share with specific team members only</p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 font-medium mb-2">
                  <Lock className="w-4 h-4" />
                  Time-limited Links
                </div>
                <p className="text-sm text-muted-foreground">Create links that expire after a set time</p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 font-medium mb-2">
                  <Download className="w-4 h-4" />
                  Bulk Download
                </div>
                <p className="text-sm text-muted-foreground">Download multiple files as a ZIP archive</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold mb-2">Security Note</h4>
              <p className="text-sm">All file transfers are encrypted and access is logged for security.</p>
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: 'splits-rights',
    title: 'Splits & Rights',
    icon: Users,
    subsections: [
      {
        id: 'understanding-splits',
        title: 'Understanding Split Sheets',
        content: (
          <div className="space-y-4">
            <p>Split sheets document who owns what percentage of a song. They're essential for proper royalty distribution.</p>
            
            <h4 className="font-semibold">What's in a Split Sheet:</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-brand-primary">•</span>
                <div>
                  <strong>Contributors</strong>
                  <p className="text-sm text-muted-foreground">Writers, producers, performers</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-primary">•</span>
                <div>
                  <strong>Ownership Percentages</strong>
                  <p className="text-sm text-muted-foreground">Must total exactly 100%</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-primary">•</span>
                <div>
                  <strong>Roles</strong>
                  <p className="text-sm text-muted-foreground">Lyricist, composer, producer, etc.</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-primary">•</span>
                <div>
                  <strong>Legal Information</strong>
                  <p className="text-sm text-muted-foreground">PRO affiliations, publisher info</p>
                </div>
              </li>
            </ul>

            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h4 className="font-semibold mb-2">⚠️ Important</h4>
              <p className="text-sm">Always create split sheets before releasing music to avoid disputes later.</p>
            </div>
          </div>
        )
      },
      {
        id: 'creating-splits',
        title: 'Creating Split Agreements',
        content: (
          <div className="space-y-4">
            <p>Here's how to create a split agreement in CronkWaters:</p>
            
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-primary/20 rounded-full flex items-center justify-center text-sm">1</span>
                <div>
                  <strong>Navigate to Splits</strong>
                  <p className="text-sm text-muted-foreground">Go to your project's Splits tab</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-primary/20 rounded-full flex items-center justify-center text-sm">2</span>
                <div>
                  <strong>Click "New Split Agreement"</strong>
                  <p className="text-sm text-muted-foreground">Select the song you're splitting</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-primary/20 rounded-full flex items-center justify-center text-sm">3</span>
                <div>
                  <strong>Add Contributors</strong>
                  <p className="text-sm text-muted-foreground">Add each person and their percentage</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-primary/20 rounded-full flex items-center justify-center text-sm">4</span>
                <div>
                  <strong>Send for Approval</strong>
                  <p className="text-sm text-muted-foreground">Each contributor must confirm their split</p>
                </div>
              </li>
            </ol>

            <div className="mt-4 p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Split Status:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  <strong>Draft</strong> - Still being edited
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  <strong>Pending</strong> - Waiting for confirmations
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <strong>Confirmed</strong> - All parties have agreed
                </li>
              </ul>
            </div>
          </div>
        )
      },
      {
        id: 'export-splits',
        title: 'Exporting for PROs',
        content: (
          <div className="space-y-4">
            <p>Export your splits for submission to Performing Rights Organizations (PROs):</p>
            
            <h4 className="font-semibold">Export Formats:</h4>
            <div className="space-y-2">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <strong>CSV Export</strong>
                  <span className="text-sm text-muted-foreground">For ASCAP, BMI, SESAC</span>
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <strong>PDF Export</strong>
                  <span className="text-sm text-muted-foreground">For legal records</span>
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <strong>JSON Export</strong>
                  <span className="text-sm text-muted-foreground">For technical integration</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-semibold mb-2">✅ Ready for Submission</h4>
              <p className="text-sm">Exports include all required fields for PRO registration including IPI numbers and publisher information.</p>
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: 'sessions',
    title: 'Studio Sessions',
    icon: Calendar,
    subsections: [
      {
        id: 'scheduling-sessions',
        title: 'Scheduling Sessions',
        content: (
          <div className="space-y-4">
            <p>Coordinate studio time and keep everyone on the same schedule:</p>
            
            <h4 className="font-semibold">Creating a Session:</h4>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-primary/20 rounded-full flex items-center justify-center text-sm">1</span>
                <div>
                  <strong>Go to Sessions</strong>
                  <p className="text-sm text-muted-foreground">Click "New Session" or press <kbd className="px-2 py-1 bg-muted rounded text-xs">S</kbd></p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-primary/20 rounded-full flex items-center justify-center text-sm">2</span>
                <div>
                  <strong>Fill in Details:</strong>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>• Session type (Writing, Recording, Meeting, Rehearsal)</li>
                    <li>• Date and time</li>
                    <li>• Location or video link</li>
                    <li>• Associated project</li>
                  </ul>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-primary/20 rounded-full flex items-center justify-center text-sm">3</span>
                <div>
                  <strong>Invite Attendees</strong>
                  <p className="text-sm text-muted-foreground">Add team members who should attend</p>
                </div>
              </li>
            </ol>

            <div className="mt-4 p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Session Types:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Music className="w-4 h-4 text-purple-600" />
                  </span>
                  <span>Writing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <FileAudio className="w-4 h-4 text-red-600" />
                  </span>
                  <span>Recording</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </span>
                  <span>Meeting</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Music className="w-4 h-4 text-green-600" />
                  </span>
                  <span>Rehearsal</span>
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'calendar-view',
        title: 'Calendar & Scheduling',
        content: (
          <div className="space-y-4">
            <p>The Sessions page provides multiple views to manage your schedule:</p>
            
            <h4 className="font-semibold">Calendar Features:</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                <div>
                  <strong>Week View</strong>
                  <p className="text-sm text-muted-foreground">See your entire week at a glance</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                <div>
                  <strong>Current Session Alert</strong>
                  <p className="text-sm text-muted-foreground">Highlights any active sessions</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                <div>
                  <strong>Upcoming Sessions</strong>
                  <p className="text-sm text-muted-foreground">List view of future sessions</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                <div>
                  <strong>Past Sessions</strong>
                  <p className="text-sm text-muted-foreground">Archive of completed sessions</p>
                </div>
              </li>
            </ul>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold mb-2">💡 Pro Tip</h4>
              <p className="text-sm">Add session notes and prep materials so everyone comes prepared.</p>
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: 'search-discovery',
    title: 'Search & Discovery',
    icon: Search,
    subsections: [
      {
        id: 'using-search',
        title: 'Using Search',
        content: (
          <div className="space-y-4">
            <p>Find anything in your workspace quickly:</p>
            
            <h4 className="font-semibold">Search Features:</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Search className="w-4 h-4 mt-0.5 text-brand-primary" />
                <div>
                  <strong>Global Search</strong>
                  <p className="text-sm text-muted-foreground">Search across all projects, songs, and assets</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Search className="w-4 h-4 mt-0.5 text-brand-primary" />
                <div>
                  <strong>Filters</strong>
                  <p className="text-sm text-muted-foreground">Filter by type: Projects, Songs, Assets</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Search className="w-4 h-4 mt-0.5 text-brand-primary" />
                <div>
                  <strong>Quick Access</strong>
                  <p className="text-sm text-muted-foreground">Press Enter to search from the header</p>
                </div>
              </li>
            </ul>

            <div className="mt-4 p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Search Tips:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Search by song title, project name, or file name</li>
                <li>• Use quotes for exact matches: "final mix"</li>
                <li>• Search by collaborator name</li>
                <li>• Filter results after searching</li>
              </ul>
            </div>
          </div>
        )
      },
      {
        id: 'command-palette',
        title: 'Command Palette',
        content: (
          <div className="space-y-4">
            <p>The command palette is your quick-access tool for navigation and actions:</p>
            
            <div className="p-4 bg-brand-primary/10 rounded-lg mb-4">
              <p className="font-semibold">Open with: <kbd className="px-2 py-1 bg-white dark:bg-black rounded ml-2">⌘K</kbd> (Mac) or <kbd className="px-2 py-1 bg-white dark:bg-black rounded ml-2">Ctrl+K</kbd> (PC)</p>
            </div>

            <h4 className="font-semibold">Available Commands:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <strong>Go to [page]</strong> - Navigate to any page
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <strong>New project</strong> - Create a project from anywhere
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <strong>New song</strong> - Add a song to current project
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <strong>Upload files</strong> - Jump to upload
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <strong>View help</strong> - Open help documentation
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <strong>Toggle theme</strong> - Switch between light/dark/warm
              </li>
            </ul>
          </div>
        )
      }
    ]
  },
  {
    id: 'customization',
    title: 'Customization',
    icon: Palette,
    subsections: [
      {
        id: 'themes',
        title: 'Themes & Appearance',
        content: (
          <div className="space-y-4">
            <p>Customize CronkWaters to match your style:</p>
            
            <h4 className="font-semibold">Available Themes:</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 border rounded-lg text-center">
                <div className="w-full h-12 bg-white rounded mb-2"></div>
                <strong className="text-sm">Light</strong>
                <p className="text-xs text-muted-foreground">Clean and bright</p>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <div className="w-full h-12 bg-black rounded mb-2"></div>
                <strong className="text-sm">Dark</strong>
                <p className="text-xs text-muted-foreground">Easy on the eyes</p>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <div className="w-full h-12 bg-orange-100 rounded mb-2"></div>
                <strong className="text-sm">Warm</strong>
                <p className="text-xs text-muted-foreground">Cozy and unique</p>
              </div>
            </div>

            <h4 className="font-semibold mt-6">How to Change Theme:</h4>
            <ul className="space-y-2 text-sm">
              <li>1. Click the theme toggle in the top navigation</li>
              <li>2. Or use <kbd className="px-2 py-1 bg-muted rounded">⌘K</kbd> → "Toggle theme"</li>
              <li>3. Theme preference is saved automatically</li>
            </ul>
          </div>
        )
      },
      {
        id: 'preferences',
        title: 'Settings & Preferences',
        content: (
          <div className="space-y-4">
            <p>Configure CronkWaters to work the way you want:</p>
            
            <h4 className="font-semibold">Account Settings:</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Settings className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <strong>Profile</strong>
                  <p className="text-sm text-muted-foreground">Update your name, email, and avatar</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Settings className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <strong>Notifications</strong>
                  <p className="text-sm text-muted-foreground">Choose what updates you receive</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Settings className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <strong>Privacy</strong>
                  <p className="text-sm text-muted-foreground">Control who can see your activity</p>
                </div>
              </li>
            </ul>

            <h4 className="font-semibold mt-6">Organization Settings:</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Users className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <strong>Team Management</strong>
                  <p className="text-sm text-muted-foreground">Invite members, manage roles</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Users className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <strong>Billing</strong>
                  <p className="text-sm text-muted-foreground">Subscription and payment methods</p>
                </div>
              </li>
            </ul>
          </div>
        )
      }
    ]
  },
  {
    id: 'mobile',
    title: 'Mobile Experience',
    icon: Smartphone,
    subsections: [
      {
        id: 'mobile-features',
        title: 'Mobile Features',
        content: (
          <div className="space-y-4">
            <p>CronkWaters is fully responsive and works great on mobile devices:</p>
            
            <h4 className="font-semibold">Mobile-Optimized Features:</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                <div>
                  <strong>Touch-Friendly Interface</strong>
                  <p className="text-sm text-muted-foreground">Large tap targets and swipe gestures</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                <div>
                  <strong>Mobile Navigation</strong>
                  <p className="text-sm text-muted-foreground">Slide-out menu for easy access</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                <div>
                  <strong>Offline Support</strong>
                  <p className="text-sm text-muted-foreground">View cached content without internet</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                <div>
                  <strong>PWA Support</strong>
                  <p className="text-sm text-muted-foreground">Install as an app on your phone</p>
                </div>
              </li>
            </ul>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold mb-2">💡 Mobile Tips:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Swipe left/right to navigate between project tabs</li>
                <li>• Long-press for context menus</li>
                <li>• Pull down to refresh content</li>
                <li>• Use landscape mode for better table views</li>
              </ul>
            </div>
          </div>
        )
      },
      {
        id: 'pwa-installation',
        title: 'Installing the App',
        content: (
          <div className="space-y-4">
            <p>Install CronkWaters as an app on your device:</p>
            
            <h4 className="font-semibold">iOS (iPhone/iPad):</h4>
            <ol className="space-y-2 text-sm">
              <li>1. Open CronkWaters in Safari</li>
              <li>2. Tap the share button (square with arrow)</li>
              <li>3. Scroll down and tap "Add to Home Screen"</li>
              <li>4. Give it a name and tap "Add"</li>
            </ol>

            <h4 className="font-semibold mt-6">Android:</h4>
            <ol className="space-y-2 text-sm">
              <li>1. Open CronkWaters in Chrome</li>
              <li>2. Tap the menu (three dots)</li>
              <li>3. Tap "Install app" or "Add to Home Screen"</li>
              <li>4. Follow the prompts</li>
            </ol>

            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-semibold mb-2">✅ App Benefits:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Full-screen experience</li>
                <li>• Works offline</li>
                <li>• Push notifications</li>
                <li>• Faster loading</li>
              </ul>
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: 'tips-tricks',
    title: 'Tips & Tricks',
    icon: Zap,
    subsections: [
      {
        id: 'keyboard-shortcuts',
        title: 'Keyboard Shortcuts',
        content: (
          <div className="space-y-4">
            <p>Work faster with keyboard shortcuts:</p>
            
            <h4 className="font-semibold">Essential Shortcuts:</h4>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span>Open command palette</span>
                <kbd className="px-2 py-1 bg-background rounded">⌘K</kbd>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span>New project</span>
                <kbd className="px-2 py-1 bg-background rounded">N</kbd>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span>Search</span>
                <kbd className="px-2 py-1 bg-background rounded">/</kbd>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span>Toggle theme</span>
                <kbd className="px-2 py-1 bg-background rounded">T</kbd>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span>Go to projects</span>
                <kbd className="px-2 py-1 bg-background rounded">G P</kbd>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span>Go to dashboard</span>
                <kbd className="px-2 py-1 bg-background rounded">G D</kbd>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-4">More shortcuts available in the command palette (⌘K)</p>
          </div>
        )
      },
      {
        id: 'best-practices',
        title: 'Best Practices',
        content: (
          <div className="space-y-4">
            <p>Get the most out of CronkWaters:</p>
            
            <h4 className="font-semibold">Project Organization:</h4>
            <ul className="space-y-2 text-sm">
              <li>✓ Use clear, descriptive project names</li>
              <li>✓ Add project descriptions for context</li>
              <li>✓ Upload cover images for visual organization</li>
              <li>✓ Archive completed projects to reduce clutter</li>
            </ul>

            <h4 className="font-semibold mt-6">File Management:</h4>
            <ul className="space-y-2 text-sm">
              <li>✓ Use consistent naming conventions</li>
              <li>✓ Include version numbers in filenames</li>
              <li>✓ Add descriptions to important files</li>
              <li>✓ Regularly clean up old versions</li>
            </ul>

            <h4 className="font-semibold mt-6">Collaboration:</h4>
            <ul className="space-y-2 text-sm">
              <li>✓ Set up splits early in the process</li>
              <li>✓ Use comments for feedback</li>
              <li>✓ Keep session notes updated</li>
              <li>✓ Notify team members of important changes</li>
            </ul>

            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-semibold mb-2">🌟 Golden Rule</h4>
              <p className="text-sm">Document everything! Future you (and your collaborators) will thank you.</p>
            </div>
          </div>
        )
      },
      {
        id: 'troubleshooting',
        title: 'Troubleshooting',
        content: (
          <div className="space-y-4">
            <p>Common issues and how to resolve them:</p>
            
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h5 className="font-semibold text-sm mb-1">Can't upload files?</h5>
                <p className="text-sm text-muted-foreground">Check file size (max 100MB) and format. Ensure you have a stable internet connection.</p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h5 className="font-semibold text-sm mb-1">Missing collaborator?</h5>
                <p className="text-sm text-muted-foreground">Make sure they've joined your organization using the invite code.</p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h5 className="font-semibold text-sm mb-1">Can't see a project?</h5>
                <p className="text-sm text-muted-foreground">Check your permissions - you may need to request access from the project owner.</p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h5 className="font-semibold text-sm mb-1">Split percentages don't add up?</h5>
                <p className="text-sm text-muted-foreground">Splits must total exactly 100%. Check for rounding errors.</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold mb-2">Need More Help?</h4>
              <p className="text-sm">Contact support at support@cronkwaters.com or use the in-app help (press <kbd className="px-2 py-1 bg-white dark:bg-black rounded">?</kbd>)</p>
            </div>
          </div>
        )
      }
    ]
  }
];

export function GuideContent() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [activeSubsection, setActiveSubsection] = useState('welcome');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentSection = sections.find(s => s.id === activeSection);
  const currentSubsection = currentSection?.subsections?.find(s => s.id === activeSubsection);

  // Auto-scroll to top when section changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [activeSection, activeSubsection]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-muted rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <h1 className="text-xl font-semibold">CronkWaters Guide</h1>
          </div>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Back to Home
          </Link>
        </div>
      </header>

      <div className="container flex">
        {/* Sidebar Navigation */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 bg-background border-r transition-transform lg:translate-x-0 lg:static lg:inset-auto lg:w-64",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <nav className="h-[calc(100vh-4rem)] overflow-y-auto p-4 lg:p-6">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = section.id === activeSection;
              
              return (
                <div key={section.id} className="mb-6">
                  <button
                    onClick={() => {
                      setActiveSection(section.id);
                      if (section.subsections) {
                        setActiveSubsection(section.subsections[0].id);
                      }
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-brand-primary/10 text-brand-primary" 
                        : "hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {section.title}
                  </button>
                  
                  {isActive && section.subsections && (
                    <div className="mt-2 ml-7 space-y-1">
                      {section.subsections.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setActiveSubsection(sub.id);
                            setMobileMenuOpen(false);
                          }}
                          className={cn(
                            "block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                            sub.id === activeSubsection
                              ? "bg-muted font-medium"
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          )}
                        >
                          {sub.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Help Section */}
            <div className="mt-8 rounded-lg border bg-muted/50 p-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-brand-primary mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Need Help?</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Press <kbd className="px-1 py-0.5 bg-background rounded text-xs">?</kbd> for help or contact support
                  </p>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <button
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape' || e.key === 'Enter') {
                setMobileMenuOpen(false);
              }
            }}
            aria-label="Close navigation menu"
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div 
            ref={contentRef}
            className="h-[calc(100vh-4rem)] overflow-y-auto p-6 lg:p-8"
          >
            <div className="mx-auto max-w-4xl">
              {/* Breadcrumb */}
              <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                <span>{currentSection?.title}</span>
                {currentSubsection && (
                  <>
                    <ChevronRight className="h-3 w-3" />
                    <span>{currentSubsection.title}</span>
                  </>
                )}
              </div>

              {/* Content */}
              <article className="prose prose-gray dark:prose-invert max-w-none">
                {currentSubsection && (
                  <>
                    <h2 className="text-2xl font-semibold mb-6">
                      {currentSubsection.title}
                    </h2>
                    {currentSubsection.content}
                  </>
                )}
              </article>

              {/* Navigation */}
              <div className="mt-12 flex items-center justify-between border-t pt-6">
                {/* Previous */}
                {(() => {
                  const currentSectionIndex = sections.findIndex(s => s.id === activeSection);
                  const currentSubIndex = currentSection?.subsections?.findIndex(s => s.id === activeSubsection) ?? 0;
                  
                  let prevSection = null;
                  let prevSubsection = null;
                  
                  if (currentSubIndex > 0 && currentSection?.subsections) {
                    prevSubsection = currentSection.subsections[currentSubIndex - 1];
                    prevSection = currentSection;
                  } else if (currentSectionIndex > 0) {
                    prevSection = sections[currentSectionIndex - 1];
                    if (prevSection.subsections) {
                      prevSubsection = prevSection.subsections[prevSection.subsections.length - 1];
                    }
                  }
                  
                  if (prevSection && prevSubsection) {
                    return (
                      <button
                        onClick={() => {
                          setActiveSection(prevSection.id);
                          setActiveSubsection(prevSubsection.id);
                        }}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <ChevronRight className="h-4 w-4 rotate-180" />
                        {prevSubsection.title}
                      </button>
                    );
                  }
                  return <div />;
                })()}

                {/* Next */}
                {(() => {
                  const currentSectionIndex = sections.findIndex(s => s.id === activeSection);
                  const currentSubIndex = currentSection?.subsections?.findIndex(s => s.id === activeSubsection) ?? 0;
                  
                  let nextSection = null;
                  let nextSubsection = null;
                  
                  if (currentSection?.subsections && currentSubIndex < currentSection.subsections.length - 1) {
                    nextSubsection = currentSection.subsections[currentSubIndex + 1];
                    nextSection = currentSection;
                  } else if (currentSectionIndex < sections.length - 1) {
                    nextSection = sections[currentSectionIndex + 1];
                    if (nextSection.subsections) {
                      nextSubsection = nextSection.subsections[0];
                    }
                  }
                  
                  if (nextSection && nextSubsection) {
                    return (
                      <button
                        onClick={() => {
                          setActiveSection(nextSection.id);
                          setActiveSubsection(nextSubsection.id);
                        }}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                      >
                        {nextSubsection.title}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    );
                  }
                  return <div />;
                })()}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
