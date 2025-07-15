// CategoryCarousel.jsx
import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Button } from "./ui/button";

const category = [
  "Frontend Developer",
  "Backend Developer",
  "Fullstack Developer",
  "Data Science",
  "Graphic Designer",
];

const CategoryCarousel = ({ setQuery }) => {
  return (
    <div className="bg-black text-white text-center ">
      <div className="container mx-auto text-center px-1 sm:px-4">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Browse by Category</h2>

        <div className="w-full overflow-x-auto">
          <Carousel className="w-full max-w-full sm:max-w-3xl mx-auto relative">
            <CarouselContent>
              {category.map((cat, index) => (
                <CarouselItem
                  key={index}
                  className="box-border basis-full sm:basis-1/3 px-2 py-2 sm:px-3 sm:py-4"
                >
                  <Button
                    variant="outline"
                    onClick={() => setQuery(cat)}
                    className="w-full py-2 sm:py-3 px-2 sm:px-6 text-base sm:text-lg rounded-full border-2 border-blue-500 text-white bg-black hover:bg-blue-500 hover:text-white transition-all cursor-pointer"
                  >
                    {cat}
                  </Button>
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* Show navigation buttons only on mobile (sm and below) */}
            <div className="absolute top-1/2 left-[-10px] -translate-y-1/2 px-1 cursor-pointer z-10 sm:hidden">
              <CarouselPrevious className="bg-blue-500 text-white p-2 rounded-full cursor-pointer" />
            </div>

            <div className="absolute top-1/2 right-0 -translate-y-1/2 px-1 cursor-pointer z-10 sm:hidden">
              <CarouselNext className="bg-blue-500 text-white p-2 rounded-full cursor-pointer" />
            </div>
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default CategoryCarousel;
