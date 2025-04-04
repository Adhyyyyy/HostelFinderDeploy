import useFetch from "../../hooks/useFetch";
import "./propertyList.css";

const PropertyList = () => {
  const { data, loading } = useFetch("/hostel/countByCategory");


  const images = [
    "happy-couple-arriving-at-a-hotel-and-checking-in-at-the-front-desk.jpeg",
    "san-martin-de-laspra-pilgrim-hostel-and-church-at-sunset.jpeg",
  ];

  return (
    <div className="pList">
      {loading ? (
        "Loading..."
      ) : (
        <>
          {data && data.length > 0 ? (
            data.map((category, i) => (
              <div className="pListItem" key={i}>
                <img src={images[i % images.length]} alt={category.type} className="pListImg" />
                <div className="pListTitles">
                  <h1>{category.type || "Unknown"}</h1>
                  <h2>{category.count || 0} properties</h2>
                </div>
              </div>
            ))
          ) : (
            <p>No categories found</p>
          )}
        </>
      )}
    </div>
  );
};

export default PropertyList;
