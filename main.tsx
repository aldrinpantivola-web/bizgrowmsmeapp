/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { BusinessState } from "../types";

export async function getBusinessAdvice(state: BusinessState): Promise<string> {
  const apiKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined;
  if (!apiKey) return "Tip: Maintaining positive cash flow is the most important rule for MSMEs!";

  const genAI = new GoogleGenAI({ apiKey });
  
  const prompt = `
    You are an expert MSME business strategist. 
    Analyze the current state of a small business and give a 1-sentence tip.
    
    Current State:
    Day: ${state.day}
    Cash: $${state.cash.toFixed(2)}
    Inventory: ${state.inventory}/${state.maxInventory}
    Reputation: ${state.reputation}/100
    Product Price: $${state.productPrice}
    Marketing Level: ${state.marketingLevel}
    
    Provide a concise, strategic tip for the business owner.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Tip: Balance your price with your reputation to keep customers coming back.";
  }
}
