"use client";

interface ReviewsListProps {
  hotelId: string;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ hotelId }) => {
  // TODO: Fetch reviews from API
  return (
    <div className="stay-reviews box-style mb-4">
      <div className="box-title">
        <h4>Guest Reviews</h4>
        <p>What guests are saying about this property</p>
      </div>

      <div className="alert alert-info">
        <i className="ri-information-line me-2"></i>
        Reviews coming soon. Be the first to review this hotel!
      </div>
    </div>
  );
};

export default ReviewsList;
