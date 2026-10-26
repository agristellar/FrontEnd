export const usePlatform = () => {
  const { $api } = useNuxtApp();
  const { locale } = useI18n();
  const errors: Record<string, string> = {
    ORGANIZATION_REQUIRED: "Create or select an organization first.",
    MEMBERSHIP_REQUIRED: "You do not have access to this organization.",
    SCOPE_REQUIRED: "Your account does not have permission for this action.",
    ADMIN_REQUIRED: "This action requires an administrator.",
    ADMIN_SCOPE_REQUIRED:
      "Your administrator role does not include this permission.",
    WALLET_REQUIRED: "Connect and verify your wallet first.",
    WALLET_BUSY:
      "Another transaction is pending. Check Wallet before preparing a new action.",
    MONEYGRAM_NOT_CONFIGURED:
      "MoneyGram sandbox access has not been configured yet.",
    MODEL_DISABLED: "The model is disabled or has not been configured.",
    CHAT_DISABLED: "The website chat is paused. Existing conversations remain available.",
    CHAT_TOOL_DISABLED: "The administrator has disabled this chat lookup tool.",
    CHAT_HISTORY_LIMIT: "This conversation has reached its limit. Start a new conversation.",
    CHAT_SECRET_DETECTED: "Do not send Stellar secret keys in chat.",
    IDEMPOTENCY_CONFLICT: "This request key was already used for different content. Reload the conversation before retrying.",
    VERSION_CONFLICT: "This quote or contract changed. Reload it before retrying.",
    QUOTE_LINES_REQUIRED: "This RFQ requires a quote for its individual line items.",
    DUPLICATE_LINE: "A quote cannot repeat the same RFQ line.",
    UNKNOWN_LINE: "This quote line does not belong to the RFQ.",
    AMBIGUOUS_LINES: "Use either a line-item list or the single-item fields.",
    RFQ_UNAVAILABLE: "The RFQ is closed, expired, or no longer shared with your organization.",
    AI_NOT_CONFIGURED: "The language model provider has not been configured.",
    AGENT_POLICY_DENIED:
      "The agent is not authorized or its delegation has expired.",
    AGENT_BUDGET_EXCEEDED: "The agent budget is exhausted.",
    AGENT_DAILY_BUDGET_EXCEEDED: "The agent daily UTC budget is exhausted.",
    ORGANIZATION_DAILY_BUDGET_EXCEEDED:
      "The organization daily UTC budget is exhausted.",
    AGENT_RESERVATION_EXPIRED:
      "The budget reservation expired at the UTC day boundary. Create a new request.",
    COST_NOT_UNKNOWN: "Only unresolved provider charges may be reconciled.",
    COST_INVALID:
      "The charge must be a whole number within the reserved amount.",
    FEE_REQUIRED: "Pay the required contract fee under Billing first.",
    PLAN_REQUIRED: "An active service plan is required.",
    QR_PROVIDER_NOT_CONFIGURED:
      "The QR verification partner has not been configured.",
    INVALID_STATE: "This action is not available in the current state.",
    NOT_FOUND: "The requested record could not be found.",
    RESOURCE_DENIED: "You do not have access to this record.",
    WALLET_SIGNATURE_INVALID: "The wallet signature could not be verified.",
    APPROVAL_STALE: "The request has changed or has already been processed.",
    CONTACT_EXISTS:
      "This contact already exists. Unsubscribed contacts cannot be automatically enrolled again.",
    MAIL_NOT_CONFIGURED: "Email sending has not been configured.",
    BACKUP_NOT_CONFIGURED: "Encrypted backups have not been configured.",
    ESCROW_NOT_CONFIGURED: "The escrow contract has not been configured.",
    AUCTION_NOT_CONFIGURED: "The auction contract has not been configured.",
    REGISTRY_NOT_CONFIGURED: "The credential registry has not been configured.",
    ACCOUNT_NOT_ACTIVE:
      "Your account must be activated before making financial transactions.",
    PARTNER_TOKEN_REVOKED: "The partner token has expired or been revoked.",
  };
  const organizationId = useCookie<string | null>("agristellar_organization", {
    sameSite: "lax",
  });
  const organizations = useState<any[]>("platform-organizations", () => []);
  const request = async <T = any>(
    path: string,
    method = "GET",
    body?: any,
    extraHeaders?: Record<string, string>,
  ): Promise<T> => {
    try {
      const response = await $api<any>(path, {
        method: method as any,
        body,
        headers: {
          ...(organizationId.value
            ? { "X-Organization-Id": organizationId.value }
            : {}),
          ...extraHeaders,
        },
      });
      return response.data;
    } catch (err: any) {
      if (locale.value === "en" && err.data?.error) {
        const e = err.data.error;
        e.message =
          errors[e.code] ||
          (/[À-ỹĐđ]/.test(e.message || "")
            ? "This action could not be completed. Review the selected record and try again."
            : e.message);
      }
      throw err;
    }
  };
  const loadOrganizations = async () => {
    organizations.value = await request("/platform/organizations");
    if (!organizations.value.some((o) => o._id === organizationId.value))
      organizationId.value = organizations.value[0]?._id || null;
  };
  return {
    request,
    organizations,
    organizationId,
    loadOrganizations,
    organization: computed(() =>
      organizations.value.find((o) => o._id === organizationId.value),
    ),
  };
};
