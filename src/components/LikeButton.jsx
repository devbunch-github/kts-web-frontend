import { useState } from "react";

export default function LikeButton() {
  const [liked, setLiked] = useState(false);

  return (
    <button
      onClick={() => setLiked(!liked)}
      aria-label="Like"
      className="absolute top-3 right-3 flex items-center justify-center 
                 h-[32px] w-[32px] transition-transform duration-200 ease-out 
                 hover:scale-110 active:scale-95"
    >
      <img
        src={
          liked
            ? "/images/icons/like-icon-filled.png" // your new filled icon with built-in background
            : "/images/icons/like-icon.png"        // your default hollow icon with background
        }
        alt={liked ? 'Liked' : 'Like'}
        className="h-[32px] w-[32px] object-contain select-none pointer-events-none"
      />
    </button>
  );
}
