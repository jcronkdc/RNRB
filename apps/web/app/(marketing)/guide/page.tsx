import { Metadata } from 'next';
import { GuideContent } from './GuideContent';

export const metadata: Metadata = {
  title: 'Complete Guide - CronkWaters',
  description: 'Everything you need to know about using CronkWaters - from creating your first project to advanced collaboration features.',
};

// eslint-disable-next-line import/no-default-export
export default function GuidePage() {
  return <GuideContent />;
}
