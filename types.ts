/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BusinessState {
  cash: number;
  inventory: number;
  maxInventory: number;
  reputation: number; // 0 to 100
  day: number;
  dailyRent: number;
  dailyStaffCost: number;
  productPrice: number;
  marketingLevel: number;
  qualityLevel: number;
  isGameOver: boolean;
  history: { day: number; cash: number; sales: number }[];
  logs: string[];
}

export interface InventoryItem {
  name: string;
  cost: number;
  stock: number;
}
