'use client';

import { useState } from 'react';
import { 
  BookOpen,
  Video,
  Play,
  Clock,
  Star,
  Users,
  Award,
  FileText,
  Download,
  Lock
} from 'lucide-react';
import { Button } from '@cronkwater/ui';
import { Card } from '@cronkwater/ui';
import { Badge } from '@cronkwater/ui';
import { Progress } from '@cronkwater/ui';
import { PageHeader } from '@/components/app/PageHeader';

export function LearnPageClient() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'songwriting' | 'production' | 'instruments' | 'business'>('all');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  // Mock data for courses and tutorials
  const courses = [
    {
      id: '1',
      title: 'Songwriting Fundamentals',
      instructor: 'Sarah Chen',
      category: 'songwriting',
      level: 'beginner',
      duration: '4 hours',
      lessons: 12,
      students: 2341,
      rating: 4.8,
      price: 0,
      featured: true,
      description: 'Learn the basics of melody, harmony, and lyric writing from a Grammy-nominated songwriter.',
      thumbnail: '/course-songwriting.jpg',
    },
    {
      id: '2',
      title: 'Home Studio Production Masterclass',
      instructor: 'Marcus Johnson',
      category: 'production',
      level: 'intermediate',
      duration: '8 hours',
      lessons: 24,
      students: 1876,
      rating: 4.9,
      price: 49,
      featured: true,
      description: 'Transform your bedroom into a professional recording studio.',
      thumbnail: '/course-production.jpg',
    },
    {
      id: '3',
      title: 'Jazz Piano Techniques',
      instructor: 'Emily Watson',
      category: 'instruments',
      level: 'advanced',
      duration: '6 hours',
      lessons: 18,
      students: 567,
      rating: 4.7,
      price: 39,
      description: 'Master advanced jazz piano voicings and improvisation techniques.',
      thumbnail: '/course-piano.jpg',
    },
    {
      id: '4',
      title: 'Music Business 101',
      instructor: 'David Park',
      category: 'business',
      level: 'beginner',
      duration: '3 hours',
      lessons: 10,
      students: 3245,
      rating: 4.6,
      price: 0,
      description: 'Understanding contracts, royalties, and building your music career.',
      thumbnail: '/course-business.jpg',
    },
  ];

  const tutorials = [
    {
      id: '1',
      title: 'How to Write a Hit Chorus',
      author: 'Pro Songwriters Guild',
      duration: '15 min',
      views: 12453,
      category: 'songwriting',
      free: true,
    },
    {
      id: '2',
      title: 'EQ Basics for Beginners',
      author: 'Studio Masters',
      duration: '20 min',
      views: 8976,
      category: 'production',
      free: true,
    },
    {
      id: '3',
      title: 'Guitar Maintenance Guide',
      author: 'Guitar Central',
      duration: '12 min',
      views: 6543,
      category: 'instruments',
      free: false,
    },
  ];

  const resources = [
    {
      title: 'Chord Progression Cheat Sheet',
      type: 'PDF',
      downloads: 5432,
      category: 'songwriting',
    },
    {
      title: 'Mixing Template for Logic Pro',
      type: 'Project File',
      downloads: 3210,
      category: 'production',
    },
    {
      title: 'Music Industry Contracts Guide',
      type: 'PDF',
      downloads: 2876,
      category: 'business',
    },
  ];

  const filteredCourses = courses.filter(course => {
    const categoryMatch = selectedCategory === 'all' || course.category === selectedCategory;
    const levelMatch = selectedLevel === 'all' || course.level === selectedLevel;
    return categoryMatch && levelMatch;
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Learn & Grow"
        description="Master your craft with courses, tutorials, and resources from industry professionals"
        actions={
          <Button variant="outline">
            <Award className="mr-2 h-4 w-4" />
            My Certificates
          </Button>
        }
      />

      {/* Featured Section */}
      <div className="rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 p-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <Badge variant="success">Featured Course</Badge>
            <h2 className="text-3xl font-bold">Songwriting Fundamentals</h2>
            <p className="text-muted-foreground">
              Join Grammy-nominated songwriter Sarah Chen as she breaks down the art and science 
              of writing memorable songs that connect with audiences.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                4 hours
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                2,341 students
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                4.8
              </span>
            </div>
            <div className="flex gap-4">
              <Button size="lg">
                <Play className="mr-2 h-5 w-5" />
                Start Free Course
              </Button>
              <Button size="lg" variant="outline">
                View Curriculum
              </Button>
            </div>
          </div>
          <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          {(['all', 'songwriting', 'production', 'instruments', 'business'] as const).map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((level) => (
            <Button
              key={level}
              variant={selectedLevel === level ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLevel(level)}
            >
              {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Courses</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20" />
              <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <Badge variant="outline">{course.level}</Badge>
                  {course.price === 0 ? (
                    <Badge variant="success">Free</Badge>
                  ) : (
                    <span className="font-semibold">${course.price}</span>
                  )}
                </div>

                <h3 className="mb-2 text-lg font-semibold">{course.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{course.instructor}</p>

                <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {course.lessons} lessons
                  </span>
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{course.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{course.students.toLocaleString()} students</span>
                </div>

                <Button className="w-full">
                  {course.price === 0 ? 'Start Learning' : 'Enroll Now'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Tutorials */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Quick Tutorials</h2>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>
        <div className="grid gap-4">
          {tutorials.map((tutorial) => (
            <Card key={tutorial.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Video className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{tutorial.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {tutorial.author} • {tutorial.duration} • {tutorial.views.toLocaleString()} views
                    </p>
                  </div>
                </div>
                <Button variant={tutorial.free ? 'outline' : 'default'} size="sm">
                  {tutorial.free ? (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Watch Free
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Pro Only
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Downloadable Resources */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Resources & Downloads</h2>
          <Button variant="ghost" size="sm">
            Browse Library
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {resources.map((resource, index) => (
            <Card key={index} className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <FileText className="h-8 w-8 text-primary" />
                <Badge variant="outline">{resource.type}</Badge>
              </div>
              <h3 className="mb-2 font-medium">{resource.title}</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {resource.downloads.toLocaleString()} downloads
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Progress Tracking */}
      <Card className="p-8">
        <h2 className="mb-6 text-2xl font-bold">Your Learning Journey</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Songwriting Fundamentals</span>
              <span className="text-sm text-muted-foreground">75%</span>
            </div>
            <Progress value={75} className="h-2" />
            <p className="text-sm text-muted-foreground">9 of 12 lessons completed</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-2xl font-bold">14</p>
              <p className="text-sm text-muted-foreground">Courses Completed</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-2xl font-bold">42h</p>
              <p className="text-sm text-muted-foreground">Total Learning Time</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
