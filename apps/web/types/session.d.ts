export interface OrgAwareSession {
  user: {
    id: string;
    email: string;
    name: string;
  };
  organization: {
    id: string;
  };
}
