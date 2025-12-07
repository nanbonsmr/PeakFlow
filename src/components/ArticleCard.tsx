import { ArrowUpRight } from "lucide-react";

interface ArticleCardProps {
  id: string;
  title: string;
  category: string;
  date: string;
  image: string;
  size?: "small" | "large";
}

const ArticleCard = ({ id, title, category, date, image, size = "small" }: ArticleCardProps) => {
  const getCategoryClass = (cat: string) => {
    const normalized = cat.toLowerCase();
    if (normalized.includes("financ")) return "tag-financing";
    if (normalized.includes("lifestyle")) return "tag-lifestyle";
    if (normalized.includes("community")) return "tag-community";
    if (normalized.includes("wellness")) return "tag-wellness";
    if (normalized.includes("travel")) return "tag-travel";
    if (normalized.includes("creativ")) return "tag-creativity";
    if (normalized.includes("growth")) return "tag-growth";
    return "tag-lifestyle";
  };

  return (
    <a
      href={`/article/${id}`}
      className={`group relative block rounded-[2.5rem] overflow-hidden card-hover ${
        size === "large" ? "col-span-1 md:col-span-2 row-span-2" : ""
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted rounded-[2.5rem]">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 group-hover:from-black/70" />
        
        {/* Content overlay */}
        <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between">
          {/* Top section - Category and Date */}
          <div className="flex items-start justify-between gap-2">
            <span className={`px-4 py-1.5 rounded-full text-xs font-medium backdrop-blur-md ${getCategoryClass(category)} bg-opacity-80 transition-transform duration-300 group-hover:scale-105`}>
              {category}
            </span>
            <span className="px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium text-white border border-white/20 transition-all duration-300 group-hover:bg-white/25">
              {date}
            </span>
          </div>

          {/* Bottom section - Title and Arrow */}
          <div className="flex items-end justify-between gap-4">
            <div className="flex-1">
              <span className="text-white/40 text-xs font-medium tracking-widest block mb-2 uppercase">{id}</span>
              <h3 className="text-white text-xl md:text-2xl lg:text-3xl font-bold leading-tight tracking-tight transition-transform duration-300 group-hover:translate-x-1">
                {title}
              </h3>
            </div>
          </div>
        </div>

        {/* Floating circular arrow button */}
        <div className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-primary shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-white group-hover:shadow-xl group-hover:-translate-y-1">
          <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </a>
  );
};

export default ArticleCard;
