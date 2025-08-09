import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, ThumbsUp } from "lucide-react";

const mockReviews = [
  {
    id: 1,
    author: "Sarah M.",
    rating: 5,
    date: "2024-01-15",
    comment: "Absolutely beautiful calendar! The print quality is exceptional and the customization options made it perfect for our family photos.",
    helpful: 12,
    verified: true
  },
  {
    id: 2,
    author: "Mike R.",
    rating: 4,
    date: "2024-01-10",
    comment: "Great product overall. Easy to customize and fast delivery. Only minor issue was the packaging could be better.",
    helpful: 8,
    verified: true
  },
  {
    id: 3,
    author: "Lisa K.",
    rating: 5,
    date: "2024-01-05",
    comment: "This is my third order from Impress Calendars. Consistently high quality and excellent customer service.",
    helpful: 15,
    verified: true
  }
];

const ProductReviews = () => {
  const averageRating = 4.6;
  const totalReviews = 47;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Customer Reviews</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < Math.floor(averageRating) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
                />
              ))}
            </div>
            <span className="font-semibold">{averageRating}</span>
            <span className="text-muted-foreground">({totalReviews} reviews)</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {mockReviews.map((review) => (
          <div key={review.id} className="border-b border-border pb-6 last:border-b-0">
            <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{review.author}</span>
                    {review.verified && (
                      <Badge variant="secondary" className="text-xs">
                        Verified Purchase
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">{review.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-3 w-3 ${i < review.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed">{review.comment}</p>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-auto p-1 text-xs">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    Helpful ({review.helpful})
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full">
          View All Reviews
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductReviews;