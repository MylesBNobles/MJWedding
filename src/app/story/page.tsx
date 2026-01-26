import StoryScroller from '@/components/StoryScroller';
import { storySlides } from '@/lib/mockData';

export default function StoryPage() {
  return <StoryScroller slides={storySlides} />;
}
