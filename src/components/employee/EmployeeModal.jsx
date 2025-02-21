const EmployeeModal = ({ employee, onClose }) => {
    if (!employee) return null;
  
    const formatDate = (dateString) => {
      if (!dateString) return "Not available";
      return new Date(dateString).toLocaleDateString();
    };
  
    const formatAddress = (addressJson) => {
      if (!addressJson) return "Not available";
      try {
        const address = typeof addressJson === 'string' ? JSON.parse(addressJson) : addressJson;
        return `Zone: <b>${address.zone || 'N/A'}</b>, City: <b>${address.city || 'N/A'}</b>, Region: <b>${address.region || 'N/A'}</b>, Country: <b>${address.country || 'N/A'}</b>`;
      } catch (e) {
        return String(addressJson);
      }
  };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto rounded-lg">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl m-4 text-black">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold font-serif justify-center text-center">
              {isTeacher ? "Teacher Details" : "Staff Details"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-xl font-semibold mb-2 font-serif">Personal Information</h3>
            </div>
  
            <div>
              <label className="font-semibold block font-serif">Full Name:</label>
              <p>{`${staff.firstName || ''} ${staff.middleName || ''} ${staff.lastName || ''}`}</p>
            </div>
  
            <div>
              <label className="font-semibold block font-serif">Email:</label>
              <p>{staff.email || 'Not available'}</p>
            </div>
  
            <div>
              <label className="font-semibold block font-serif">Username:</label>
              <p>{staff.username || 'Not available'}</p>
            </div>
  
            <div>
              <label className="font-semibold block font-serif">Phone:</label>
              <p>{staff.phoneNumber || 'Not available'}</p>
            </div>
  
            <div>
              <label className="font-semibold block font-serif">Date of Birth:</label>
              <p>{formatDate(staff.dob)}</p>
            </div>
  
            <div>
              <label className="font-semibold block font-serif">Gender:</label>
              <p>{staff.gender || 'Not available'}</p>
            </div>
  
            <div>
              <label className="font-semibold block font-serif">Date of Joining:</label>
              <p>{formatDate(staff.dateOfJoining)}</p>
            </div>
  
            <div>
              <label className="font-semibold block font-serif">Status:</label>
              <p className={`inline-block px-2 py-1 rounded-full ${
                staff.status === 'PRESENT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {staff.status || 'Not available'}
              </p>
            </div>
  
            <div className="col-span-1 md:col-span-2">
              <label className="font-semibold block font-serif">Address:</label>
              <p dangerouslySetInnerHTML={{ __html: formatAddress(staff.addressJson) }} />
            </div>
  
            <div className="col-span-1 md:col-span-2">
              <label className="font-semibold block font-serif">Photo:</label>
              {staff.photo ? (
                <img
                  src={`data:image/jpeg;base64,${staff.photo}`}
                  alt="Staff Photo"
                  className="w-32 h-32 object-cover rounded-full"
                />
              ) : (
                <p>No photo available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default EmployeeModal;