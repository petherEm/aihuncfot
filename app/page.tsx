import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import StoryWriter from "@/components/StoryWriter";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      <section className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        <div className=" flex flex-col space-y-5 justify-center items-center order-1 lg:-order-1 pb-10">
          <Image
            src="/logo.webp"
            alt="EuroHuncfot AI StoryWriter"
            width={500}
            height={500}
          />
          <Button asChild className="px-20 bg-orange-500 p-10 text-xl">
            <Link href="/stories">Moja biblioteczka</Link>
          </Button>
        </div>

        <StoryWriter />
      </section>
    </main>
  );
}
