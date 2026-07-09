import { defineStore } from 'pinia';

interface Portfolio {
  totalInvested: number;
  totalPayout: number;
  activeNotes: number;
  activeCampaigns: any[];
}

interface HarvestNote {
  _id: string;
  noteCode: string;
  campaignId: any;
  principalAmount: number;
  expectedPayout: number;
  status: string;
  issuedAt: string;
}

export const useInvestorStore = defineStore('investor', {
  state: () => ({
    portfolio: null as Portfolio | null,
    harvestNotes: [] as HarvestNote[],
    payouts: [] as any[],
    loading: false,
  }),
  getters: {
    totalReturn: (state) => {
      if (!state.portfolio) return 0;
      const { totalPayout, totalInvested } = state.portfolio;
      if (totalInvested === 0) return 0;
      return ((totalPayout - totalInvested) / totalInvested * 100).toFixed(2);
    },
  },
  actions: {
    setPortfolio(portfolio: Portfolio) {
      this.portfolio = portfolio;
    },
    setHarvestNotes(notes: HarvestNote[]) {
      this.harvestNotes = notes;
    },
    setPayouts(payouts: any[]) {
      this.payouts = payouts;
    },
    setLoading(loading: boolean) {
      this.loading = loading;
    },
  },
});
