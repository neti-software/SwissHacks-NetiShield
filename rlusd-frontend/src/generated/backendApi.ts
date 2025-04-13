/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface XrplLoginPayloadDto {
  /** Unique identifier for the login request */
  uuid: string;
  /** URL for the QR code to be scanned by Xaman wallet */
  qrUrl: string;
  /** WebSocket URL for real-time status updates */
  webSocketUrl: string;
}

export interface XrplLoginDto {
  /**
   * UUID of the XRPL login payload to verify
   * @example 5a8af3b5-4c1a-4b5a-b8d5-7c3f1d5f8a7c
   */
  uuid: string;
}

export interface LoginResponseDto {
  /**
   * Wallet address
   * @example rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh
   */
  walletAddress: string;
}

export interface LogoutResponseDto {
  /**
   * Success status of the logout operation
   * @example true
   */
  success: boolean;
}

export interface ConfigResponseDto {
  /**
   * The admin wallet address
   * @example rWsmTxAbgWLT8bgDN9WFtDPvuKLP1JzrM
   */
  adminAddress: string;
}

export interface TransactionStatusResponseDto {
  /**
   * The status of the XRPL transaction
   * @example SUCCESS
   */
  status: "PENDING" | "SUCCESS";
}

export interface TokenBalanceResponseDto {
  /**
   * Wallet address
   * @example rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh
   */
  address: string;
  /**
   * USDT balance
   * @example 1000.00
   */
  balance: string;
  /**
   * Whether the account has a trustline for USDT
   * @example true
   */
  hasTrustline: boolean;
}

export interface CreateTransactionDto {
  amount: number;
  recipientAddress: string;
  senderAddress: string;
  vendorIds: string[];
}

export interface TransactionResponseDto {
  transactionId?: string;
  signUrl: string;
  uuid: string;
}

export interface BuildTrustlineDto {
  account: string;
}

export interface TransactionActionDto {
  signer: string;
}

export interface VendorEntity {
  /**
   * Vendor name
   * @example Vendor 1
   */
  name: string;
  /**
   * Vendor description
   * @example Vendor 1 description
   */
  description: string | null;
  /**
   * Transaction amount
   * @example 100
   */
  active: boolean;
  /**
   * Creation timestamp
   * @format date-time
   * @example 2023-03-25T12:00:00Z
   */
  createdAt: string;
  /**
   * Last update timestamp
   * @format date-time
   * @example 2023-03-25T12:00:00Z
   */
  updatedAt: string | null;
  id: string;
}

export interface VendorVerificationStatusLogEntity {
  id: string;
  /**
   * Verification status
   * @example PENDING
   */
  status: "PENDING" | "APPROVED" | "REJECTED";
  /**
   * Creation timestamp
   * @format date-time
   * @example 2023-03-25T12:00:00Z
   */
  createdAt: string;
}

export interface VendorVerificationEntity {
  /**
   * Vendor verification ID
   * @example cbad99d7-3cce-4e9c-9d4d-099189441c99
   */
  id: string;
  /** Vendor that performed verification */
  vendor: VendorEntity;
  /** Current verification status */
  currentStatus: VendorVerificationStatusLogEntity | null;
  /** Verification status history */
  statusLog: VendorVerificationStatusLogEntity[];
  /**
   * Creation timestamp
   * @format date-time
   * @example 2023-03-25T12:00:00Z
   */
  createdAt: string;
  /**
   * Last update timestamp
   * @format date-time
   * @example 2023-03-25T12:00:00Z
   */
  updatedAt: string;
  /**
   * Subject address
   * @example rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV
   */
  subjectAddress: string;
}

export interface TransactionStatusLogEntity {
  id: string;
  status:
    | "PENDING_VERIFICATION"
    | "RECIPIENT_AND_SENDER_VERIFICATION_FAILED"
    | "RECIPIENT_VERIFICATION_FAILED"
    | "SENDER_VERIFICATION_FAILED"
    | "ESCROW_FUNDED"
    | "SENDER_APPROVED"
    | "RECIPIENT_APPROVED"
    | "ADMIN_APPROVED"
    | "SENDER_REJECTED"
    | "RECIPIENT_REJECTED"
    | "ADMIN_REJECTED"
    | "VERIFICATION_SUCCESS"
    | "REJECTED"
    | "SUCCESS"
    | "FAILED";
  /** @format date-time */
  createdAt: string;
}

export interface TransactionEntity {
  /**
   * Address of the transaction recipient
   * @example 0x123...
   */
  recipientAddress: string;
  /**
   * Address of the transaction sender
   * @example 0x456...
   */
  senderAddress: string;
  /**
   * Transaction amount
   * @example 100
   */
  amount: number;
  /**
   * Escrow transaction ID (hash)
   * @example 1234567890ABCDEF...
   */
  escrowTransactionHash: string | null;
  /**
   * Transfer transaction IDs (hashes)
   * @example ["1234567890ABCDEF...","1234567890ABCDEF..."]
   */
  recipientTransferHash: string[] | null;
  /**
   * Sender transfer transaction ID (hash)
   * @example 1234567890ABCDEF...
   */
  senderTransferHash: string | null;
  /**
   * Admin transfer transaction ID (hash)
   * @example 1234567890ABCDEF...
   */
  adminTransferHash: string | null;
  /**
   * Escrow wallet address
   * @example 0x123...
   */
  escrowWalletAddress: string | null;
  /** Vendor verifications for this transaction */
  vendorVerifications: VendorVerificationEntity[];
  /** Current transaction status */
  currentStatus: TransactionStatusLogEntity | null;
  /** Transaction status history */
  statusLog: TransactionStatusLogEntity[];
  /**
   * Creation timestamp
   * @format date-time
   * @example 2023-03-25T12:00:00Z
   */
  createdAt: string;
  /**
   * Last update timestamp
   * @format date-time
   * @example 2023-03-25T12:00:00Z
   */
  updatedAt: string | null;
  id: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => "undefined" !== typeof query[key]);
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string") ? JSON.stringify(input) : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
            ? JSON.stringify(property)
            : `${property}`
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(`${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`, {
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
      },
      signal: cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal,
      body: typeof body === "undefined" || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title RLUSD API
 * @version 1.0
 * @contact
 *
 * The RLUSD API description
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  auth = {
    /**
     * No description
     *
     * @tags auth
     * @name AuthControllerCreateXrplLogin
     * @summary Create an XRPL login request for Xaman wallet
     * @request POST:/auth/login/xrpl/create
     */
    authControllerCreateXrplLogin: (params: RequestParams = {}) =>
      this.request<XrplLoginPayloadDto, any>({
        path: `/auth/login/xrpl/create`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthControllerLoginWithXrpl
     * @summary Verify an XRPL login request
     * @request POST:/auth/login/xrpl/verify
     */
    authControllerLoginWithXrpl: (data: XrplLoginDto, params: RequestParams = {}) =>
      this.request<LoginResponseDto, void>({
        path: `/auth/login/xrpl/verify`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthControllerLogout
     * @summary Logout current user
     * @request POST:/auth/logout
     */
    authControllerLogout: (params: RequestParams = {}) =>
      this.request<LogoutResponseDto, any>({
        path: `/auth/logout`,
        method: "POST",
        format: "json",
        ...params,
      }),
  };
  xrpl = {
    /**
     * No description
     *
     * @tags xrpl
     * @name XrplControllerGetConfig
     * @summary Get application configuration including admin address
     * @request GET:/xrpl/config
     */
    xrplControllerGetConfig: (params: RequestParams = {}) =>
      this.request<ConfigResponseDto, any>({
        path: `/xrpl/config`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags xrpl
     * @name XrplControllerGetTransactionStatus
     * @summary Get XRPL transaction status by UUID
     * @request GET:/xrpl/{uuid}
     */
    xrplControllerGetTransactionStatus: (uuid: string, params: RequestParams = {}) =>
      this.request<TransactionStatusResponseDto, void>({
        path: `/xrpl/${uuid}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags xrpl
     * @name XrplControllerGetTokenBalance
     * @summary Get token balances for authenticated user
     * @request GET:/xrpl/balance/{address}
     */
    xrplControllerGetTokenBalance: (address: string, params: RequestParams = {}) =>
      this.request<TokenBalanceResponseDto, any>({
        path: `/xrpl/balance/${address}`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
  transactions = {
    /**
     * No description
     *
     * @tags transactions
     * @name TransactionsControllerCreate
     * @summary Create a new transaction
     * @request POST:/transactions
     */
    transactionsControllerCreate: (data: CreateTransactionDto, params: RequestParams = {}) =>
      this.request<TransactionResponseDto, void>({
        path: `/transactions`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags transactions
     * @name TransactionsControllerFindAll
     * @summary Find all transactions
     * @request GET:/transactions
     */
    transactionsControllerFindAll: (
      query?: {
        /** Filter by sender address */
        senderAddress?: string;
        /** Filter by recipient address */
        recipientAddress?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<TransactionEntity[], any>({
        path: `/transactions`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags transactions
     * @name TransactionsControllerCreateTrustline
     * @request POST:/transactions/trustline
     */
    transactionsControllerCreateTrustline: (data: BuildTrustlineDto, params: RequestParams = {}) =>
      this.request<TransactionResponseDto, any>({
        path: `/transactions/trustline`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags transactions
     * @name TransactionsControllerApproveTransaction
     * @summary Approve a transaction
     * @request PATCH:/transactions/{id}/approve
     */
    transactionsControllerApproveTransaction: (id: string, data: TransactionActionDto, params: RequestParams = {}) =>
      this.request<TransactionResponseDto, void>({
        path: `/transactions/${id}/approve`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags transactions
     * @name TransactionsControllerRejectTransaction
     * @summary Reject a transaction
     * @request PATCH:/transactions/{id}/reject
     */
    transactionsControllerRejectTransaction: (id: string, data: TransactionActionDto, params: RequestParams = {}) =>
      this.request<TransactionResponseDto, void>({
        path: `/transactions/${id}/reject`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags transactions
     * @name TransactionsControllerFindOne
     * @summary Find transaction by id
     * @request GET:/transactions/{id}
     */
    transactionsControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<TransactionEntity, void>({
        path: `/transactions/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
  vendors = {
    /**
     * No description
     *
     * @tags vendors
     * @name VendorsControllerGetAllVendors
     * @summary Get all active vendors
     * @request GET:/vendors
     */
    vendorsControllerGetAllVendors: (params: RequestParams = {}) =>
      this.request<VendorEntity[], any>({
        path: `/vendors`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
}
