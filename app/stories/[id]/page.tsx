import Story from "@/components/Story";
import { getAllStories, getStory } from "@/lib/stories";
import { notFound } from "next/navigation";

interface StoryPageProps {
  params: {
    id: string;
  };
}

const StoryPage = ({ params: { id } }: StoryPageProps) => {
  // Explanation: The id is URL encoded, so we need to decode it before we can use it. This fixes the issue where the story is not found when the id contains special characters such as %20 for spaces.

  const decodedId = decodeURIComponent(id);

  const story = getStory(decodedId);

  if (!story) {
    return notFound();
  }

  return <Story story={story} />;
};

export default StoryPage;

export async function generateStaticParams() {
  const stories = getAllStories();

  // Explanation: We need to return an array of objects with the id property set to the story id. This will generate a static page for each story.
  const paths = stories.map((story) => ({
    id: story.story,
  }));

  return paths;
}
