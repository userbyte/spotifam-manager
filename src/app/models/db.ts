export type Member = {
  [key: string]: string | number | boolean | undefined;
  name: string;
  balance: number;
  passcode: string;
  admin: boolean;
};

export type Payment = {
  [key: string]: string | number | boolean | undefined;
  id: number;
  timestamp: number;
  member: string;
  amount: number;
  approved: boolean;
  processed: boolean;
};

export type Charge = {
  id: number;
  timestamp: number;
  amount: number;
};

export type Family = {
  name: string;
  family_code: string;
  plan_start: number;
  next_renewal: number;
  price: number;
  members: Array<Member>;
  payments: Array<Payment>;
  charges: Array<Charge>;
};

export type MemberStripped = {
  name: string;
  balance: number;
  admin: boolean;
};

export type FamilyStripped = {
  name: string;
  family_code: string;
  plan_start: number;
  next_renewal: number;
  price: number;
  members: Array<MemberStripped>;
  payments: Array<Payment>;
};
