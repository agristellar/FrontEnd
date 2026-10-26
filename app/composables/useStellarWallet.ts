let kitPromise: Promise<any> | undefined;
export const useStellarWallet = () => {
  const { ui } = useWorkspaceText();
  const { request } = usePlatform();
  const configuration = useState<any>("stellar-config", () => null);
  const address = useState<string>("stellar-address", () => "");
  const load = async () => {
    configuration.value = await request("/finance/configuration");
    return configuration.value;
  };
  const passphrase = () =>
    configuration.value?.network === "mainnet"
      ? "Public Global Stellar Network ; September 2015"
      : "Test SDF Network ; September 2015";
  const kit = async () => {
    if (!import.meta.client)
      throw new Error(ui("Kết nối ví trong trình duyệt"));
    if (!configuration.value) await load();
    if (!kitPromise)
      kitPromise = (async () => {
        const { StellarWalletsKit } =
          await import("@creit.tech/stellar-wallets-kit/sdk");
        const { FreighterAccessModule } =
          await import("~/lib/freighter-access");
        const { xBullModule } =
          await import("@creit.tech/stellar-wallets-kit/modules/xbull");
        StellarWalletsKit.init({
          modules: [new FreighterAccessModule(), new xBullModule()],
          network: passphrase() as any,
        });
        return StellarWalletsKit;
      })();
    return kitPromise;
  };
  const connect = async () => {
    const k = await kit();
    const result = await k.authModal();
    address.value = result.address;
    const network = await k.getNetwork();
    if (network.networkPassphrase !== passphrase())
      throw new Error(
        ui("Chọn mạng ") + configuration.value.network + ui(" trong ví"),
      );
    const c = await request("/finance/wallet/challenge", "POST", {
      address: address.value,
    });
    const signed = await k.signTransaction(c.xdr, {
      networkPassphrase: c.networkPassphrase,
      address: address.value,
    });
    await request("/finance/wallet/verify", "POST", {
      challenge: c.id,
      signedXdr: signed.signedTxXdr,
    });
    return address.value;
  };
  const sign = async (intent: any) => {
    const k = await kit();
    const selected = await k.authModal();
    const bound = await request("/finance/wallet");
    if (selected.address !== bound.wallet?.address)
      throw new Error(ui("Địa chỉ đang chọn không trùng ví đã xác minh"));
    const network = await k.getNetwork();
    if (network.networkPassphrase !== passphrase())
      throw new Error(ui("Ví đang chọn sai mạng"));
    const signed = await k.signTransaction(intent.unsignedXdr, {
      networkPassphrase: passphrase(),
      address: selected.address,
    });
    return request(`/finance/intents/${intent._id}/submit`, "POST", {
      signedXdr: signed.signedTxXdr,
    });
  };
  const signAuthorization = async (intent: any) => {
    const k = await kit();
    const selected = await k.authModal();
    const network = await k.getNetwork();
    if (network.networkPassphrase !== passphrase())
      throw new Error(ui("Ví đang chọn sai mạng"));
    const authorization = intent.authorizations.find(
      (a: any) => a.address === selected.address && !a.signedEntry,
    );
    if (!authorization)
      throw new Error(ui("Không có yêu cầu chữ ký cho địa chỉ ví đang chọn"));
    const sdk = await import("@stellar/stellar-sdk");
    const rpc = new sdk.rpc.Server(
      configuration.value?.network === "mainnet"
        ? "https://soroban-rpc.mainnet.stellar.gateway.fm"
        : "https://soroban-testnet.stellar.org",
    );
    const ledger = await rpc.getLatestLedger();
    const entry = sdk.xdr.SorobanAuthorizationEntry.fromXDR(
      authorization.entry,
      "base64",
    );
    const signed = await sdk.authorizeEntry(
      entry,
      async (preimage: any) => {
        const result = await k.signAuthEntry(preimage.toXDR("base64"), {
          networkPassphrase: passphrase(),
          address: selected.address,
        });
        return {
          signature: Uint8Array.from(atob(result.signedAuthEntry), (c) =>
            c.charCodeAt(0),
          ),
          publicKey: selected.address,
        };
      },
      ledger.sequence + 100,
      passphrase(),
    );
    return request(`/finance/intents/${intent._id}/authorize`, "POST", {
      signedEntry: signed.toXDR("base64"),
    });
  };
  const walletRequest = async <T>(fn: () => Promise<T>): Promise<T> => {
    try {
      return await fn();
    } catch (error: any) {
      if (
        error?.code === -4 ||
        error?.message === "The user rejected this request." ||
        error?.message === "The user closed the modal."
      )
        throw new Error(ui("Bạn đã hủy yêu cầu trong ví."));
      if (error?.code === "FREIGHTER_ADDRESS_UNAVAILABLE")
        throw new Error(
          ui("Ví chưa trả địa chỉ được cấp quyền. Thử kết nối lại."),
        );
      if (error?.code === "FREIGHTER_CONNECTION_UNAVAILABLE" || error?.message === "Freighter connection did not respond")
        throw new Error(
          ui("Chưa nhận được phản hồi từ Freighter. Mở khóa ví rồi thử lại."),
        );
      throw error;
    }
  };
  return {
    configuration,
    address,
    load,
    connect: () => walletRequest(connect),
    sign: (intent: any) => walletRequest(() => sign(intent)),
    signAuthorization: (intent: any) =>
      walletRequest(() => signAuthorization(intent)),
  };
};
