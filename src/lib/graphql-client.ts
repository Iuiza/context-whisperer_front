import type { ArtifactType } from "@/lib/types";

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "/api/graphql";
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
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
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
