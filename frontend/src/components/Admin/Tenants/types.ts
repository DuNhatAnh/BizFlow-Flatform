export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  durationMonths: number;
}

export interface User {
  id: string;
  username: string;
  fullname: string;
  role: string;
}

export interface Tenant {
  id: string;
  name: string;
  ownerName: string;
  ownerPhone?: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  isActive: boolean;
  isApproved?: boolean;
  createdAt: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  totalSpent?: number;
  subscriptionPlanId?: number;
  subscriptionPlan?: SubscriptionPlan;
  pendingSubscriptionPlanId?: number;
  pendingSubscriptionPlan?: SubscriptionPlan;
  users?: User[];
}
