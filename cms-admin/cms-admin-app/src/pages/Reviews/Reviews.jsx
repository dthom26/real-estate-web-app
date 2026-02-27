import styles from "./Reviews.module.css";
import { useNavigate } from "react-router-dom";
import { useReviews } from "../../hooks/useReviews";

// Reviews page placeholder
export default function Reviews() {
  const navigate = useNavigate();
  const { reviews, loading, error, deleteReviewById } = useReviews();

  // run conditional to check
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (reviews.length === 0) return <div>No reviews found.</div>;

  return (
    <div>
      <div className={styles.header}>
        <h1>Reviews List</h1>
        <button onClick={() => navigate("/admin/reviews/create")}>
          Add Review
        </button>
      </div>
      {/* Table of reviews will go here */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Title</th>
            <th>Rating</th>
            <th>Comment</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* this will map over the reviews array in the db and display that info*/}
          {reviews.map((review) => (
            <tr key={review._id}>
              <td>{review.name}</td>
              <td>{review.title}</td>
              <td>{review.rating}/5</td>
              <td>
                {review.comment.substring(0, 50)}
                {review.comment.length > 50 ? "..." : ""}
              </td>
              <td>
                <span className={styles[review.status]}>{review.status}</span>
              </td>
              <td>
                <button
                  onClick={() => navigate(`/admin/reviews/${review._id}/edit`)}
                >
                  Edit
                </button>
                <button onClick={() => deleteReviewById(review._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
