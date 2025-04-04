import "./list.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Datatable from "../../components/datatable/Datatable";
import { useLocation } from "react-router-dom";
import { 
  userColumns, 
  hostelColumns, 
  roomColumns,
  restaurantColumns 
} from "../../datatablesource";

const List = () => {
  const location = useLocation();
  const path = location.pathname.split("/")[1];

  const getColumns = () => {
    switch (path) {
      case "users":
        return userColumns;
      case "hostel":
        return hostelColumns;
      case "rooms":
        return roomColumns;
      case "restaurants":
        return restaurantColumns;
      default:
        return [];
    }
  };

  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <Datatable columns={getColumns()} />
      </div>
    </div>
  );
};

export default List;
