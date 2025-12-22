import { motion } from "framer-motion";

export interface ARLens {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

const AR_LENSES: ARLens[] = [
  { id: "sunglasses", name: "Cool Sunglasses", emoji: "😎", color: "#FFD700" },
  { id: "party-hat", name: "Party Hat", emoji: "🎉", color: "#FF69B4" },
  { id: "crown", name: "Crown", emoji: "👑", color: "#FFD700" },
  { id: "heart-eyes", name: "Heart Eyes", emoji: "😍", color: "#FF1493" },
  { id: "fire", name: "On Fire", emoji: "🔥", color: "#FF4500" },
  { id: "stars", name: "Starry", emoji: "✨", color: "#87CEEB" },
  { id: "rainbow", name: "Rainbow", emoji: "🌈", color: "#FF0000" },
  { id: "alien", name: "Alien", emoji: "👽", color: "#00FF00" },
  { id: "devil", name: "Devil", emoji: "😈", color: "#8B0000" },
  { id: "angel", name: "Angel", emoji: "😇", color: "#FFFFFF" },
  { id: "cat", name: "Cat Ears", emoji: "😺", color: "#FFA500" },
  { id: "dog", name: "Dog Filter", emoji: "🐶", color: "#8B4513" },
];

interface ARLensSelectorProps {
  selectedLens: ARLens | null;
  onSelectLens: (lens: ARLens | null) => void;
  onClose: () => void;
}

export const ARLensSelector = ({
  selectedLens,
  onSelectLens,
  onClose,
}: ARLensSelectorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="absolute bottom-24 left-0 right-0 px-4"
    >
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-sm">AR Lenses</h4>
          <button
            onClick={() => onSelectLens(null)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {AR_LENSES.map((lens, index) => (
            <motion.button
              key={lens.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectLens(lens)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors min-w-[60px] ${
                selectedLens?.id === lens.id
                  ? "bg-primary/20 ring-2 ring-primary"
                  : "hover:bg-muted"
              }`}
            >
              <span className="text-2xl">{lens.emoji}</span>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {lens.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
