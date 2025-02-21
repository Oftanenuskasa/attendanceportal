import React, { useState } from "react";

const AddressPopup = ({ show, onClose, onSave }) => {
  const [addressData, setAddressData] = useState({
    city: "",
    country: "",
    zone: "",
    region: "",
  });

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(addressData);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h3 className="text-lg font-semibold mb-4">Enter Address</h3>
        <div className="space-y-4">
          {['city', 'country', 'zone', 'region'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {field}
              </label>
              <input
                type="text"
                name={field}
                value={addressData[field]}
                onChange={handleAddressChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          ))}
          <div className="flex justify-end space-x-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white py-2 px-4 rounded-md"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="bg-blue-600 text-white py-2 px-4 rounded-md"
            >
              Save Address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressPopup;