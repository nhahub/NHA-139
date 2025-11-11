
import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,

} from "@/components/ui/card"
import { Link } from "react-router-dom"
import img from '../assets/Cardimg.png'
import axios from "axios";
import { Star, MapPin, Phone, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

//npm install lucide-react


interface Restaurant {
  id: number;
  name: string;
  image?: string;
  category?: string;
  cuisine?: string;
  rating?: number;
  phone?: string;
}

const Listings: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isFavorite, setIsFavorite] = useState<Record<number, boolean>>({});
  const [sortOption, setSortOption] = useState<string>("default");
  const [viewType, setViewType] = useState<string>("grid");


  useEffect(() => {
    axios
      .get("https://dummyjson.com/recipes")
      .then((res) => res.data)
      .then((data) => setRestaurants(data.recipes))
      .catch((err) => console.log("Error:", err))
  }, [])

  const togglefavorite = (id: number) => {
    setIsFavorite(
      (prev) => (
        { ...prev, [id]: !prev[id] }
      ));
  }

  const handleSort = (option: string) => {
    setSortOption(option);
    let sorted = [...restaurants];

    if (option === "nearest") {
      sorted.sort(() => Math.random() - 0.5);
    } else if (option === "highRating") {
      sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else {
      sorted = [...restaurants];
    }

    setRestaurants(sorted);
  };

  return (
    <>
 <Header/>
      <div className="flex flex-col w-full h-[132px] bg-gray-100 ">
       
        <div className="container mx-auto">
          <h2 className='text-black font-bold text-4xl mt-5 ml-20'>All Listings</h2>
          <span className='text-gray-400  text-2xl mt-2 ml-15'>Showing All results</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 mt-7">
        {/* Dropdown */}
        <select
          className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ef4343]"
          value={sortOption}
          onChange={(e) => handleSort(e.target.value)}
        >
          <option value="default">Default</option>
          <option value="nearest">Nearest</option>
          <option value="highRating">Highest Rating</option>
        </select>

        {/* View toggle buttons */}
        <div className="flex gap-2">
          {/* Grid View Button */}
          <button
            onClick={() => setViewType("grid")}
            className={`p-3 rounded-xl shadow-md transition-all duration-200 cursor-pointer
      ${viewType === "grid"
                ? "bg-[#ef4343] text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-[#ffe1e1] hover:text-[#ef4343]"
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
              fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 6h4V4H4v2zm6 0h4V4h-4v2zm6 0h4V4h-4v2zM4 12h4v-2H4v2zm6 0h4v-2h-4v2zm6 0h4v-2h-4v2zM4 18h4v-2H4v2zm6 0h4v-2h-4v2zm6 0h4v-2h-4v2z" />
            </svg>
          </button>

          {/* List View Button */}
          <button
            onClick={() => setViewType("list")}
            className={`p-3 rounded-xl shadow-md transition-all duration-200 cursor-pointer
      ${viewType === "list"
                ? "bg-[#ef4343] text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-[#ffe1e1] hover:text-[#ef4343]"
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
              fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

      </div>

      <div
        className={
          viewType === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-6"
            : "grid grid-cols-1 gap-6 p-15"
        }
      >

        {restaurants.map((item) => (
          <Link key={item.id} to={`/Listing/${item.id}`}>
            <Card className="group overflow-hidden transition-all hover:shadow-lg border-none p-0 pb-5">
              <CardContent className="p-0">
                <div className="relative aspect-4/3 overflow-hidden">
                  <img
                    src={item.image || img}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-110"
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-3 right-3 h-9 w-9 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => {
                      e.preventDefault();
                      togglefavorite(item.id);
                    }}
                  >
                    <Heart
                      className={`h-5 w-5 transition-colors ${isFavorite[item.id]
                        ? "fill-red-600 text-red-600"
                        : "fill-none text-gray-100"
                        }`}
                    />
                  </Button>
                </div>
              </CardContent>

              <CardHeader>
                <CardTitle>
                  <div className="flex justify-between items-center ">
                    <div className="hover:text-[#ef4343]">
                      {item.name}
                    </div>

                    <span className="inline-block border border-gray-400 text-gray-700 text-sm font-medium px-1  rounded-full">
                      {item.category ? item.category : "Not Found"}
                    </span>
                  </div>
                </CardTitle>
                <CardDescription className="text-gray-500">{item.cuisine}</CardDescription>
              </CardHeader>

              <CardFooter>
                <div className="flex flex-col">
                  <h5 className="text-gray-500">Lorem ipsum dolor sit amet consectetur adipisicing elit. Saepe quod, iure minima numquam nemo quo!</h5>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4  text-[#ef4343]" stroke="currentColor" fill="currentColor" />
                      <span className="font-semibold">{item.rating}</span>
                    </div>
                    <div className="text-lg font-bold text-gray-500 ">
                      Price Level ↑:
                      <span className='text-[#ef4343]'>50</span>
                    </div>
                  </div>

                  {item.phone ? (
                    <div className="mt-3 flex items-center space-x-2 text-sm  text-gray-500">
                      <Phone className="h-3 w-3" />
                      <span>{item.phone}</span>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center space-x-2 text-sm  text-gray-500">
                      <Phone className="h-3 w-3" />
                      <span>+20  01257942674</span>
                    </div>
                  )}

                </div>

              </CardFooter>
            </Card>
          </Link>

        ))}
       
      </div>
 <Footer/>
    </>
  )
}

export default Listings
