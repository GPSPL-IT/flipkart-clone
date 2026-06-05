/**
 * Utility functions for price and discount calculations
 */

/**
 * Calculates the Maximum Retail Price (MRP) from the selling price and discount percentage.
 * @param {number} price - The selling price
 * @param {number} discountPercentage - The discount percentage (0 to 100)
 * @returns {number} The calculated MRP
 */
export const calculateMrp = (price, discountPercentage = 0) => {
  if (discountPercentage <= 0) return price;
  return price / (1 - discountPercentage / 100);
};

/**
 * Formats a number as Indian Rupees currency (e.g., 1,500)
 * @param {number} amount - The numeric amount
 * @returns {string} Formatted currency string without currency symbol
 */
export const formatIndianCurrency = (amount) => {
  return Math.round(amount).toLocaleString('en-IN');
};
