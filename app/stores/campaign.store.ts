import { defineStore } from 'pinia';

interface Campaign {
  _id: string;
  campaignCode: string;
  applicationId: any;
  fundingTarget: number;
  fundedAmount: number;
  expectedReturn: number;
  status: string;
  publishedAt: string;
  fundingDeadline: string;
  riskScore: string;
  milestones: any[];
  createdAt: string;
}

export const useCampaignStore = defineStore('campaign', {
  state: () => ({
    campaigns: [] as Campaign[],
    currentCampaign: null as Campaign | null,
    loading: false,
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  }),
  getters: {
    fundingProgress: (state) => {
      if (!state.currentCampaign) return 0;
      return Math.round((state.currentCampaign.fundedAmount / state.currentCampaign.fundingTarget) * 100);
    },
  },
  actions: {
    setCampaigns(campaigns: Campaign[], pagination: any) {
      this.campaigns = campaigns;
      if (pagination) this.pagination = pagination;
    },
    setCurrent(campaign: Campaign) {
      this.currentCampaign = campaign;
    },
    setLoading(loading: boolean) {
      this.loading = loading;
    },
  },
});
