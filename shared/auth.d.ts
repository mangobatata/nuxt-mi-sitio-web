declare module "#auth-utils" {
  interface User {
    id: number;
    email: string;
    name: string;
    roles: string[];
  }
}

export {};
