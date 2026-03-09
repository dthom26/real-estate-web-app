import styles from "./Reviews.module.css";
import { useNavigate } from "react-router-dom";
import { useReviews } from "../../hooks/useReviews";
import ConfirmDeleteModal from "../../components/ConfirmModal/ConfirmDelete/ConfirmDeleteModal";
import useConfirmDelete from "../../components/ConfirmModal/hooks/useConfirmDelete";

// Reviews page placeholder
export default function Reviews() {
  const navigate = useNavigate();
  const { reviews, loading, error, deleteReviewById } = useReviews();
  const { isOpen, itemToDelete, openModal, closeModal, confirmDelete } =
    useConfirmDelete(deleteReviewById);

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
      <div className={styles.tableWrap}>
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
                <td data-label="Name">{review.name}</td>
                <td data-label="Title">{review.title}</td>
                <td data-label="Rating">{review.rating}/5</td>
                <td data-label="Comment">
                  {review.comment.substring(0, 50)}
                  {review.comment.length > 50 ? "..." : ""}
                </td>
                <td data-label="Status">
                  <span className={styles[review.status]}>{review.status}</span>
                </td>
                <td>
                  <button
                    onClick={() =>
                      navigate(`/admin/reviews/${review._id}/edit`)
                    }
                  >
                    Edit
                  </button>
                  <button onClick={() => openModal(review)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDeleteModal
        isOpen={isOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
