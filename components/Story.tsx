"use client";

import { Story as StoryType } from "@/types/stories";
import { useEffect, useState } from "react";
import Image from "next/image";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { Card, CardContent } from "./ui/card";

interface Props {
  story: StoryType;
}

const Story = ({ story }: Props) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="">
      <div className="md:px-20">
        <Carousel setApi={setApi} className="w-full lg:w-4/5 h-56 mx-auto">
          <CarouselContent className="px-5">
            {story.pages.map((page, i) => (
              <CarouselItem key={i}>
                <Card className="p-5 md:p-10 border">
                  <h2 className="text-center text-gray-400">{story.story}</h2>
                  <CardContent className="p-5 xl:flex">
                    <Image
                      src={page.png}
                      alt={`Pages ${i + 1} image`}
                      width={500}
                      height={500}
                      className="w-80 h-80 xl:w-[500px] xl:h-[500px] rounded-3xl mx-auto float-right p-5 xl:order-last"
                    />
                    <p className="font-semibold text-xl first-letter:text-3xl whitespace-pre-wrap">
                      {page.txt}
                    </p>
                    <p className="text-center text-gray-400">
                      {" "}
                      Strona {current} z {count}
                    </p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
};

export default Story;
