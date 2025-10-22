import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Star, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface FavoriteNumber {
  id: string;
  number: string;
  label: string;
  addedAt: Date;
}

interface FavoritesManagerProps {
  currentNumber?: string;
  currentLabel?: string;
}

export const FavoritesManager = ({ currentNumber, currentLabel }: FavoritesManagerProps) => {
  const [favorites, setFavorites] = useState<FavoriteNumber[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("lottery_favorites");
    if (stored) {
      const parsed = JSON.parse(stored);
      setFavorites(parsed.map((f: any) => ({ ...f, addedAt: new Date(f.addedAt) })));
    }
  }, []);

  const saveFavorites = (newFavorites: FavoriteNumber[]) => {
    localStorage.setItem("lottery_favorites", JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  const addToFavorites = () => {
    if (!currentNumber) {
      toast.error("No number to save");
      return;
    }

    if (favorites.some(f => f.number === currentNumber)) {
      toast.error("This number is already in favorites");
      return;
    }

    const newFavorite: FavoriteNumber = {
      id: Date.now().toString(),
      number: currentNumber,
      label: currentLabel || "Prediction",
      addedAt: new Date(),
    };

    const updated = [...favorites, newFavorite];
    saveFavorites(updated);
    toast.success("Added to favorites");
  };

  const removeFromFavorites = (id: string) => {
    const updated = favorites.filter(f => f.id !== id);
    saveFavorites(updated);
    toast.success("Removed from favorites");
  };

  const copyToClipboard = (number: string) => {
    navigator.clipboard.writeText(number);
    toast.success("Number copied to clipboard");
  };

  const isFavorite = currentNumber && favorites.some(f => f.number === currentNumber);

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-secondary fill-secondary" />
              Favorite Numbers
            </CardTitle>
            <CardDescription>Save and manage your favorite predictions</CardDescription>
          </div>
          {currentNumber && (
            <Button
              onClick={addToFavorites}
              variant={isFavorite ? "secondary" : "outline"}
              size="sm"
              className="gap-2"
              disabled={isFavorite}
            >
              <Star className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
              {isFavorite ? "Saved" : "Save Current"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {favorites.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No favorites yet. Generate predictions and save your preferred numbers.
          </p>
        ) : (
          <div className="space-y-2">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-base">
                      {fav.number}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{fav.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Added {fav.addedAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(fav.number)}
                  >
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFromFavorites(fav.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
