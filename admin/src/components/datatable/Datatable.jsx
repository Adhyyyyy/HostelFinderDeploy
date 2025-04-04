import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import useFetch from "../../hooks/useFetch";
import axios from "../../axios";
import { userColumns, hostelColumns, roomColumns, restaurantColumns } from "../../datatablesource";

const Datatable = ({ columns }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname.split("/")[1];
  const [list, setList] = useState([]);
  const [selectedHostelId, setSelectedHostelId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { data, loading, error } = useFetch(`/${path}`);
  const [hostels, setHostels] = useState([]);

  // Fetch hostels when on rooms page
  useEffect(() => {
    const fetchHostels = async () => {
      if (path === "rooms") {
        try {
          const response = await axios.get("/hostel");
          setHostels(response.data);
        } catch (err) {
          console.error("Error fetching hostels:", err);
        }
      }
    };
    fetchHostels();
  }, [path]);

  useEffect(() => {
    const processData = async () => {
      if (data) {
        if (path === "hostel") {
          const hostelsWithHandler = data.map(hostel => ({
            ...hostel,
            onViewRooms: (hostelId) => {
              setSelectedHostelId(hostelId);
              navigate(`/rooms?hostelId=${hostelId}`);
            }
          }));
          setList(hostelsWithHandler);
        } else if (path === "rooms") {
          const roomsWithHandler = await Promise.all(data.map(async room => {
            try {
              const hostelResponse = await axios.get(`/hostel/find/${room.hostelID}`);
              const hostelData = hostelResponse.data;
              const hostelName = hostelData.name;
              
              return {
                ...room,
                hostelName: hostelName,
                onUpdateStatus: async (roomId, isAvailable) => {
                  try {
                    await axios.put(`/rooms/status/${roomId}`, { isAvailable });
                    setList(prevList => 
                      prevList.map(prevRoom => 
                        prevRoom._id === roomId 
                          ? { ...prevRoom, isAvailable, occupiedBeds: isAvailable ? 0 : prevRoom.occupiedBeds } 
                          : prevRoom
                      )
                    );
                  } catch (err) {
                    console.error("Error updating room status:", err);
                    alert("Failed to update room status");
                  }
                }
              };
            } catch (err) {
              console.error("Error fetching hostel details:", err);
              return {
                ...room,
                hostelName: "Unknown Hostel",
                onUpdateStatus: async (roomId, isAvailable) => {
                  try {
                    await axios.put(`/rooms/status/${roomId}`, { isAvailable });
                    setList(prevList => 
                      prevList.map(prevRoom => 
                        prevRoom._id === roomId 
                          ? { ...prevRoom, isAvailable, occupiedBeds: isAvailable ? 0 : prevRoom.occupiedBeds } 
                          : prevRoom
                      )
                    );
                  } catch (err) {
                    console.error("Error updating room status:", err);
                    alert("Failed to update room status");
                  }
                }
              };
            }
          }));

          const filteredRooms = selectedHostelId 
            ? roomsWithHandler.filter(room => room.hostelID === selectedHostelId)
            : roomsWithHandler;

          setList(filteredRooms);
        } else {
          setList(data);
        }
      }
    };

    processData();
  }, [data, path, selectedHostelId, navigate]);

  const filteredList = useMemo(() => {
    if (!searchQuery) return list;

    const query = searchQuery.toLowerCase();
    return list.filter(item => {
      switch (path) {
        case "hostel":
          return item.name.toLowerCase().includes(query);
        case "rooms":
          return item.roomNumber.toLowerCase().includes(query) || 
                 (item.hostelName && item.hostelName.toLowerCase().includes(query));
        case "users":
          return item.name.toLowerCase().includes(query);
        case "restaurants":
          return item.name.toLowerCase().includes(query);
        default:
          return true;
      }
    });
  }, [list, searchQuery, path]);

  const selectedColumns = useMemo(() => {
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
        return columns || [];
    }
  }, [path, columns]);

  const handleDelete = async (id, id2 = null) => {
    if (!id) {
      console.error("Invalid ID:", id);
      return;
    }

    try {
      let url = `/${path}/${id}`;
      if (id2 && path === "rooms") {
        url += `/${id2}`;
      }

      await axios.delete(url);
      setList((prevList) => (prevList ? prevList.filter((item) => item._id !== id) : []));
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 300,
      renderCell: (params) => (
        <div className="cellAction">
          <div
            className="updateButton"
            onClick={() => navigate(`/${path}/update/${params.row._id}`)}
          >
            Update
          </div>
          <div
            className="deleteButton"
            onClick={() => {
              if (path === "rooms") {
                handleDelete(params.row._id, params.row.hostelID);
              } else {
                handleDelete(params.row._id);
              }
            }}
          >
            Delete
          </div>
        </div>
      ),
    },
  ];

  const finalColumns = columns.concat(actionColumn);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data.</div>;

  return (
    <div className="datatable">
      <div className="datatableTitle">
        {path}
        <div className="titleActions">
          <div className="searchBox">
            <input
              type="text"
              placeholder={`Search ${path === "rooms" ? "room number or hostel name..." : path}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {path === "rooms" && (
            <div className="hostelFilter">
              <select
                value={selectedHostelId || ""}
                onChange={(e) => setSelectedHostelId(e.target.value || null)}
                className="hostelSelect"
              >
                <option value="">All Hostels</option>
                {hostels.map((hostel) => (
                  <option key={hostel._id} value={hostel._id}>
                    {hostel.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <Link to={`/${path}/new`} className="link">
            Add New
          </Link>
        </div>
      </div>

      <DataGrid
        className="datagrid"
        rows={filteredList}
        columns={finalColumns}
        pageSize={9}
        rowsPerPageOptions={[9]}
        checkboxSelection
        getRowId={(row) => row._id}
      />
    </div>
  );
};

export default Datatable;
