import styles from "./Services.module.css";
import { useNavigate } from "react-router-dom";
import { useServices } from "../../hooks/useServices";

export default function Services() {
  const navigate = useNavigate();
  const { services, loading, error, deleteServiceById } = useServices();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (services.length === 0) return <div>No services found.</div>;

  return (
    <div>
      <div className={styles.header}>
        <h1>Services List</h1>
        <button onClick={() => navigate("/admin/services/create")}>
          Add Service
        </button>
      </div>

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
                <button onClick={() => deleteServiceById(service._id)}>
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
