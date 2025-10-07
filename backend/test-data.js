// Test data for Spice Express LR system
// This file contains sample data that matches the LR structure shown in the image

export const sampleLRData = {
  lrNumber: "2025071502",
  date: new Date("2025-07-15"),
  
  // Sender Information
  senderName: "TATA HITACHI CONSTRUCTIONS PRIVATE IND",
  senderAddress: "TATA HITACHI CENTRAL WEARHOUSE, SHWETAL LOGISTICS DHANBAD ROAD MANIKON",
  senderCity: "NAGPUR",
  senderCode: "100001",
  
  // Receiver Information
  receiverName: "ES INFRASERVE PVT LTD",
  receiverAddress: "Ring Road, Scheme No.94, EB-24",
  receiverCity: "Indore",
  receiverCode: "100154",
  
  // Origin and Destination
  origin: "NAGPUR",
  destination: "INDORE",
  
  // Packages and Weight
  packages: 1,
  actualWeight: 5.000,
  chargedWeight: 50.000,
  
  // Contents
  contents: "39127379",
  declaredValue: 4030.00,
  
  // Mode of Transport
  mode: "ROAD",
  
  // Customer Reference
  customerCode: "100001",
  
  // Additional fields
  bookingBasis: "FULL TRUCK LOAD",
  contractNo: "CON-2025-001",
  rate: 80.60,
  amount: 4030.00,
  
  // Status
  status: "pending"
};

export const sampleCustomerData = {
  code: "100001",
  name: "TATA HITACHI CONSTRUCTIONS PRIVATE IND",
  address: "TATA HITACHI CENTRAL WEARHOUSE, SHWETAL LOGISTICS DHANBAD ROAD MANIKON, NAGPUR",
  phone: "+91-712-1234567",
  gstNumber: "27AEMFS2408G1ZY"
};

export const sampleReceiverData = {
  code: "100154",
  name: "ES INFRASERVE PVT LTD",
  address: "Ring Road, Scheme No.94, EB-24, Indore",
  phone: "+91-731-9876543",
  gstNumber: "23AEMFS2408G1ZX"
};

// Helper function to generate LR number
export const generateLRNumber = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const count = Math.floor(Math.random() * 99) + 1;
  return `${year}${month}${day}${String(count).padStart(2, '0')}`;
};

// Helper function to calculate amount based on weight and rate
export const calculateAmount = (weight, rate) => {
  return weight * rate;
};

// Helper function to validate LR data
export const validateLRData = (lrData) => {
  const requiredFields = [
    'senderName', 'senderAddress', 'senderCity', 'senderCode',
    'receiverName', 'receiverAddress', 'receiverCity', 'receiverCode',
    'origin', 'destination', 'actualWeight', 'chargedWeight',
    'contents', 'declaredValue', 'customerCode'
    // senderProfileImage and receiverProfileImage are optional
  ];
  
  const missingFields = requiredFields.filter(field => !lrData[field]);
  
  if (missingFields.length > 0) {
    return {
      isValid: false,
      errors: `Missing required fields: ${missingFields.join(', ')}`
    };
  }
  
  if (lrData.actualWeight < 0 || lrData.chargedWeight < 0) {
    return {
      isValid: false,
      errors: 'Weight values must be positive'
    };
  }
  
  if (lrData.declaredValue < 0) {
    return {
      isValid: false,
      errors: 'Declared value must be positive'
    };
  }
  
  return {
    isValid: true,
    errors: null
  };
};
