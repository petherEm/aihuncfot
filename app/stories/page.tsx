import { getAllStories } from "@/lib/stories";
import { Story } from "@/types/stories";
import { BookOpen } from "lucide-react";

import Image from "next/image";
import Link from "next/link";

// server side rendered this page
export const revalidate = 0;

const Stories = () => {
  const stories: Story[] = getAllStories();

  return (
    <div className="p-10">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {stories.map((story) => (
          <Link
            href={`/stories/${story.story}`}
            key={story.story}
            className="border rounded-lg cursor-pointer hover:shadow-lg hover:border-orange-500 transition-all duration-300 ease-in-out"
          >
            <div className="relative">
              <p className="absolute flex items-center top-0 right-0 bg-white text-orange-500 font-bold p-3 rounded-lg m-2 ease-in-out">
                <BookOpen className="w-4 h-4 mr-1" />
                {story.pages.length === 1
                  ? `${story.pages.length} page`
                  : `${story.pages.length} pages`}
              </p>
              <Image
                src={story.pages[0].png}
                alt={story.story}
                width={300}
                height={300}
                className="w-full object-contain rounded-t-lg"
              />
            </div>
            <h2 className="text-lg p-5 first-letter:text-3xl font-light text-center">
              {story.story}
            </h2>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Stories;
