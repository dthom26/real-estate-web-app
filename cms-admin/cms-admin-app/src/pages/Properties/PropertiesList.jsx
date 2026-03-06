import styles from "./PropertiesList.module.css";
import { useProperties } from "../../hooks/useProperties";
import { useNavigate } from "react-router-dom";
import ConfirmDeleteModal from "../../components/ConfirmModal/ConfirmDelete/ConfirmDeleteModal";
import useConfirmDelete from "../../components/ConfirmModal/hooks/useConfirmDelete";
// PropertiesList page placeholder
export default function PropertiesList() {
  const { properties, loading, error, deletePropertyById } = useProperties();
  const { isOpen, itemToDelete, openModal, closeModal, confirmDelete } =
    useConfirmDelete(deletePropertyById);

  const navigate = useNavigate();

  // run conditional to check
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (properties.length === 0)
    return (
      <div>
        No properties found.{" "}
        <button onClick={() => navigate("/admin/properties/create")}>
          Add one?
        </button>
      </div>
    );

  return (
    <div>
      <div className={styles.header}>
        <h1>Properties List</h1>
        <button onClick={() => navigate("/admin/properties/create")}>
          Add Property
        </button>
      </div>
      {/* Table of properties will go here */}
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Address</th>
            <th>Beds</th>
            <th>Baths</th>
            <th>Sqft</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* this will map over the properties array in the db and display that info*/}
          {properties.map((property) => (
            <tr key={property._id}>
              <td>
                <img src={property.image} alt={property.address} />
              </td>
              <td>{property.address}</td>
              <td>{property.beds}</td>
              <td>{property.baths}</td>
              <td>{property.sqft}</td>
              <td>${property.price}</td>
              <td>
                <button
                  onClick={() =>
                    navigate(`/admin/properties/${property._id}/edit`)
                  }
                >
                  Edit
                </button>
                <button onClick={() => openModal(property._id)}>Delete</button>
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
