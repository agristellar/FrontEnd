import { defineStore } from 'pinia';

interface SupplierProfile {
  _id: string;
  userId: string;
  legalName: string;
  taxId: string;
  representativeName: string;
  productTypes: string[];
  growingArea: string;
  areaSize: number;
  estimatedCapacity: number;
  season: string;
  certificates: any[];
  capabilityScore: number;
  verificationStatus: string;
}

export const useSupplierStore = defineStore('supplier', {
  state: () => ({
    profile: null as SupplierProfile | null,
    applications: [] as any[],
    loading: false,
  }),
  getters: {
    isVerified: (state) => state.profile?.verificationStatus === 'Verified',
    isPending: (state) => state.profile?.verificationStatus === 'Pending',
  },
  actions: {
    setProfile(profile: SupplierProfile) {
      this.profile = profile;
    },
    setApplications(applications: any[]) {
      this.applications = applications;
    },
    setLoading(loading: boolean) {
      this.loading = loading;
    },
  },
});
