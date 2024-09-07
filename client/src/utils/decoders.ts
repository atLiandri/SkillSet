import { decodeAbiParameters } from 'viem';

/**
 * Helper function to decode attestation data
 * @param {string} data - ABI encoded attestation data
 * @returns {object} - Decoded values for addressIssuer, addressReceiver, level, maximumLevel, and info
 */
export const decodeAttestationData = (data) => {
  try {
    const decoded = decodeAbiParameters(
      [
        { name: "addressIssuer", type: "address" },
        { name: "addressReceiver", type: "address" },
        { name: "level", type: "uint256" },
        { name: "maximumLevel", type: "uint256" },
        { name: "info", type: "string" }
      ],
      data
    );

    // Map the decoded array to an object for easier access
    return {
      addressIssuer: decoded[0],
      addressReceiver: decoded[1],
      level: decoded[2],
      maximumLevel: decoded[3],
      info: decoded[4]
    };
  } catch (error) {
    console.error("Error decoding attestation data:", error);
    return null; // Handle error by returning null or any fallback value
  }
};
