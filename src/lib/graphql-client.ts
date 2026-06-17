import type { AgentEvent, ArtifactType } from "@/lib/types";
import { createClient } from "graphql-ws";

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "https://context-whisperer-production.up.railway.app/api/graphql";
const WS_GRAPHQL_ENDPOINT = GRAPHQL_ENDPOINT.replace(/^http/, "ws");
const ACCESS_TOKEN_KEY = "context-whisperer:access-token";

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

function getAccessToken() {
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imx1aXphMTZAZXhhbXBsZS5jb20iLCJzdWIiOiJhZjVhYzIxOS1hMWQ4LTQzYjctYjQ5YS0xZTM0ODE4YWZmYmYiLCJpYXQiOjE3ODE2NjE3OTIsImV4cCI6MTc4MjI2NjU5Mn0.pTiLvK1mazknlc2HsB6SV8P6GL5exLI5wt8ifcyE240";
}

export function setAccessToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}

const wsClient =
  typeof window !== "undefined"
    ? createClient({
        url: WS_GRAPHQL_ENDPOINT,
        connectionParams: () => {
          const token = getAccessToken();
          return token ? { authorization: `Bearer ${token}` } : {};
        },
      })
    : null;

export function subscribeToAgentEvents(userId: string, onEvent: (event: AgentEvent) => void) {
  if (!wsClient) return () => {};

  return wsClient.subscribe(
    {
      query: `
        subscription OnAgentEvents($userId: String!) {
          agentEvents(userId: $userId) {
            id
            contentMd
          }
        }
      `,
      variables: { userId },
    },
    {
      next: (data) => {
        const event = (data.data as { agentEvents: AgentEvent }).agentEvents;
        onEvent(event);
      },
      error: (err) => console.error("Subscription error:", err),
      complete: () => console.log("Subscription complete"),
    },
  );
}

async function graphqlRequest<
  TData,
  TVariables extends Record<string, unknown> = Record<string, never>,
>(query: string, variables?: TVariables): Promise<TData> {
  const token = getAccessToken();
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed with HTTP ${response.status}`);
  }

  const payload = (await response.json()) as GraphQLResponse<TData>;
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join("\n"));
  }
  if (!payload.data) {
    throw new Error("GraphQL response did not include data.");
  }

  return payload.data;
}

export async function createProjectOnBackend(input: {
  name: string;
  prompt: string;
  artifacts: ArtifactType[];
}) {
  const data = await graphqlRequest<
    { createProject: string },
    { input: { name: string; prompt: string; artifacts: ArtifactType[] } }
  >(
    `mutation CreateProject($input: CreateProjectInput!) {
      createProject(input: $input)
    }`,
    { input },
  );

  return data.createProject;
}

export async function login(input: { email: string; password: string }) {
  const data = await graphqlRequest<{ login: AuthResponse }, { loginInput: typeof input }>(
    `mutation Login($loginInput: LoginInput!) {
      login(loginInput: $loginInput) {
        accessToken
        user {
          id
          email
          name
          role
          createdAt
        }
      }
    }`,
    { loginInput: input },
  );
  setAccessToken(data.login.accessToken);
  return data.login;
}

export async function signup(input: { email: string; name: string; password: string }) {
  const data = await graphqlRequest<{ signup: AuthResponse }, { signupInput: typeof input }>(
    `mutation Signup($signupInput: SignupInput!) {
      signup(signupInput: $signupInput) {
        accessToken
        user {
          id
          email
          name
          role
          createdAt
        }
      }
    }`,
    { signupInput: input },
  );
  setAccessToken(data.signup.accessToken);
  return data.signup;
}

export async function fetchMe() {
  const data = await graphqlRequest<{ me: User }>(
    `query Me {
      me {
        id
        email
        name
        role
        createdAt
      }
    }`,
  );
  return data.me;
}
