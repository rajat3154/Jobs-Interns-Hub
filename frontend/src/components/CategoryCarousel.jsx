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
      <div className="container mx-auto text-center px-2 sm:px-4">
        <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold mb-4 sm:mb-8">Browse by Category</h2>

        <div className="w-full">
          <Carousel className="w-full max-w-full sm:max-w-3xl mx-auto">
            <CarouselContent>
              {category.map((cat, index) => (
                <CarouselItem
                  key={index}
                  className="basis-full xs:basis-2/3 sm:basis-1/2 lg:basis-1/3 px-1 xs:px-2 py-2 xs:py-4"
                >
                  <Button
                    variant="outline"
                    onClick={() => setQuery(cat)}
                    className="w-full py-2 xs:py-3 px-3 xs:px-6 text-base xs:text-lg rounded-full border-2 border-blue-500 text-white bg-black hover:bg-blue-500 hover:text-white transition-all cursor-pointer"
                  >
                    {cat}
                  </Button>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="absolute top-2 xs:top-4 transform -translate-y-1/2 left-[-10px] xs:left-[-20px] px-1 xs:px-2 cursor-pointer">
              <CarouselPrevious className="bg-blue-500 text-white p-2 xs:p-3 rounded-full cursor-pointer" />
            </div>

            <div className="absolute top-2 xs:top-5 transform -translate-y-1/2 right-0 px-1 xs:px-2 cursor-pointer">
              <CarouselNext className="bg-blue-500 text-white p-2 xs:p-3 rounded-full cursor-pointer" />
            </div>
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default CategoryCarousel;
