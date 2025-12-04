const API_BASE = "https://agent.kith.build";
const AUTH_TOKEN = "Bearer sk-Fk4pFP8EAJphzi3aG3rDoy8gDVUPlIkTDzIMA6966uE";
const AGENT_UUID = "f1fea9d9-2b20-4a85-bf47-88df0a083b13";

export interface ProfileSetupVariables {
  user_input: string;
  climate_concerns: string;
  geographic_focus: string;
  interest_categories: string;
  conversation_history: string;
}

export interface ArticleAnalysisVariables {
  user_concerns: string;
  article_content: string;
  user_categories: string;
  user_geographic_focus: string;
}

export interface ApiResponse<T = string> {
  success: boolean;
  response: T;
  error?: string;
  agent_name: string;
  prompt_name: string;
  prompt_id: string;
  session_id?: string;
}

export interface AnalysisResponse {
  personalized_highlights: {
    key_points: string[];
    relevance_explanation: string;
  };
  risk_assessment: {
    risk_level: string;
    explanation: string;
  };
  plain_language_summary: string;
  why_this_matters_to_you: string;
  key_terms_explained: Record<string, string>;
  sentiment_analysis: {
    tone: string;
    emotional_impact: string;
  };
}

// Helper function for normalizing response field
export const normalizeResponseField = <T>(responseField: T | string): T => {
  if (typeof responseField === "string") {
    try {
      return JSON.parse(responseField) as T;
    } catch {
      return responseField as T;
    }
  }
  return responseField;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function profileSetup(
  variables: ProfileSetupVariables,
  sessionId?: string
): Promise<ApiResponse<string>> {
  const response = await fetch(`${API_BASE}/prompt/8778afa8-3b47-4db5-acaa-d645c2d011a5`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: AUTH_TOKEN,
    },
    body: JSON.stringify({
      agent_uuid: AGENT_UUID,
      variables,
      session_id: sessionId || crypto.randomUUID(),
    }),
  });

  if (!response.ok) {
    if (response.status === 402) {
      throw new ApiError(
        "You've reached the Kith API usage limit. Please upgrade your plan to continue.",
        402
      );
    }
    throw new ApiError(`API request failed: ${response.statusText}`, response.status);
  }

  return response.json();
}

export async function articleAnalysis(
  variables: ArticleAnalysisVariables
): Promise<ApiResponse<AnalysisResponse>> {
  const response = await fetch(`${API_BASE}/prompt/664c3747-bae1-47f1-8afa-38e3297e68d2`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: AUTH_TOKEN,
    },
    body: JSON.stringify({
      agent_uuid: AGENT_UUID,
      variables,
    }),
  });

  if (!response.ok) {
    if (response.status === 402) {
      throw new ApiError(
        "You've reached the Kith API usage limit. Please upgrade your plan to continue.",
        402
      );
    }
    throw new ApiError(`API request failed: ${response.statusText}`, response.status);
  }

  return response.json();
}
