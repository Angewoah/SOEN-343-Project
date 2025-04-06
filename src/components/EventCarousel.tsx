import { useRef } from "react";
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import EventCard, { EventWithDetails } from "./EventCard";

interface EventCarouselProps {
  title: string;
  description: string;
  events: EventWithDetails[];
  bookingInProgress: number | null;
  handleBookEvent: (id: number) => void;
  formatDate: (date?: string) => string;
  tagColor: string;
}

const EventCarousel = ({
  title,
  description,
  events,
  bookingInProgress,
  handleBookEvent,
  formatDate,
  tagColor,
}: EventCarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;

    const scrollAmount = 320; // Scroll by approximately one card width
    const currentScroll = carouselRef.current.scrollLeft;

    carouselRef.current.scrollTo({
      left:
        direction === "left"
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount,
      behavior: "smooth",
    });
  };

  if (events.length === 0) return null;

  return (
    <div className="mb-12 max-w-screen-xl mx-auto">
      <div className="flex items-center mb-4">
        <div className={`w-1 h-8 ${tagColor} mr-3`}></div>
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>

      <div className="relative">
        {events.length > 3 && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 bg-white rounded-full p-2 shadow-lg z-10 hover:bg-gray-100"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
        )}

        <div
          ref={carouselRef}
          className="flex overflow-x-auto pb-4 scrollbar-hide scroll-smooth gap-4"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollSnapType: "x mandatory",
          }}
        >
          {events.map((event) => (
            <div
              key={event.id}
              className="min-w-[300px] max-w-[300px] scroll-snap-align-start"
              style={{ scrollSnapAlign: "start" }}
            >
              <EventCard
                event={event}
                isBooking={bookingInProgress === event.id}
                onBookClick={() => handleBookEvent(event.id)}
                formatDate={formatDate}
              />
            </div>
          ))}
        </div>

        {events.length > 3 && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 bg-white rounded-full p-2 shadow-lg z-10 hover:bg-gray-100"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

// CSS to hide scrollbar
export const scrollbarStyle = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

export default EventCarousel;