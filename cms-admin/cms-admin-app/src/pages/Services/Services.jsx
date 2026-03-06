import styles from "./Services.module.css";
import { useNavigate } from "react-router-dom";
import { useServices } from "../../hooks/useServices";
import ConfirmDeleteModal from "../../components/ConfirmModal/ConfirmDelete/ConfirmDeleteModal";
import useConfirmDelete from "../../components/ConfirmModal/hooks/useConfirmDelete";

export default function Services() {
  const navigate = useNavigate();
  const { services, loading, error, deleteServiceById } = useServices();
  const { isOpen, itemToDelete, openModal, closeModal, confirmDelete } =
    useConfirmDelete(deleteServiceById);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className={styles.header}>
        <h1>Services List</h1>
        <button onClick={() => navigate("/admin/services/create")}>
          Add Service
        </button>
      </div>
      {services.length === 0 && <div>No services found.</div>}

      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service._id}>
              <td>
                <img src={service.image} alt={service.title} />
              </td>
              <td>{service.title}</td>
              <td>
                {service.description.substring(0, 50)}
                {service.description.length > 50 ? "..." : ""}
              </td>
              <td>
                <span className={styles[service.status]}>{service.status}</span>
              </td>
              <td>
                <button
                  onClick={() =>
                    navigate(`/admin/services/${service._id}/edit`)
                  }
                >
                  Edit
                </button>
                <button onClick={() => openModal(service._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ConfirmDeleteModal
        isOpen={isOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
