import { hexlify, Signature } from 'ethers'
import nacl from 'tweetnacl'

export interface AegisClientConfig {
  endpoint: string
  signKeyPair: nacl.SignKeyPair
}

export interface EVMAccountsResponse {
  addresses: string[]
}

export interface EVMSignResponse {
  signature: string
}

export interface TONAccountsResponse {
  accounts: {
    address: string
    version: number
    public_key_hex: string
  }[]
}

export interface TONSignResponse {
  signature: string
}

export class AegisClient {
  private readonly signKeyPair: nacl.SignKeyPair
  private readonly endpoint: string

  constructor(config: AegisClientConfig) {
    this.signKeyPair = config.signKeyPair
    this.endpoint = config.endpoint
  }

  private async request<T>(path: string, body?: any): Promise<T> {
    const bodyJson = body ? JSON.stringify(body) : ''
    const msg = new TextEncoder().encode(bodyJson)
    const signature = nacl.sign.detached(msg, this.signKeyPair.secretKey)

    const signatureHex = hexlify(signature)
    const publicKeyHex = hexlify(this.signKeyPair.publicKey)

    const response = await fetch(this.endpoint + path, {
      method: 'POST',
      body: bodyJson,
      headers: {
        'Content-Type': 'application/json',
        'signature': signatureHex,
        'public_key': publicKeyHex,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json() as T
  }

  async ping(): Promise<string> {
    return this.request<string>('/ping')
  }

  // EVM 相关方法
  async addEVMAccounts(count = 1): Promise<EVMAccountsResponse> {
    return this.request<EVMAccountsResponse>('/evm/addAccounts', { count })
  }

  async getEVMAccounts(): Promise<EVMAccountsResponse> {
    return this.request<EVMAccountsResponse>('/evm/getAccounts')
  }

  async signEVM(address: string, message: string, passHexlify = false): Promise<Signature> {
    const response = await this.request<EVMSignResponse>('/evm/sign', {
      address,
      message_hex: passHexlify ? message : hexlify(message),
    })
    return Signature.from(`0x${response.signature}`)
  }

  // TON 相关方法
  async addTONAccounts(count = 1): Promise<TONAccountsResponse> {
    return this.request<TONAccountsResponse>('/ton/addAccounts', { count })
  }

  async getTONAccounts(): Promise<TONAccountsResponse> {
    return this.request<TONAccountsResponse>('/ton/getAccounts')
  }

  async signTON(address: string, message: string): Promise<TONSignResponse> {
    return this.request<TONSignResponse>('/ton/sign', {
      address,
      message,
    })
  }
}
